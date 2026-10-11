using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

static class DiscussionChangeChecks
{
    public static async Task Run()
    {
        var folder = Path.Combine(Path.GetTempPath(), "guia-discussion-edit-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(folder);
        var fake = new WriteGitHub();
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions { EnvironmentName = "Development", ContentRootPath = folder });
        builder.Configuration.Sources.Clear();
        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?> {
            ["AUTH_STORAGE_PATH"] = Path.Combine(folder, "auth"), ["COMMUNITY_USERS_PATH"] = Path.Combine(folder, "users.json"),
            ["DISCUSSIONS_REPOSITORY"] = "example/community", ["DISCUSSIONS_TOKEN"] = "read-only-test-token"
        });
        builder.Logging.ClearProviders();
        builder.AddCommunityAuth();
        builder.Services.AddSingleton<IHttpClientFactory>(new WriteFactory(fake));
        builder.Services.AddSingleton<DiscussionWriter>(); builder.Services.AddSingleton<DiscussionsClient>();
        builder.WebHost.UseSetting("urls", "http://127.0.0.1:0");
        await using var app = builder.Build();
        app.UseAuthentication(); app.MapCommunityAuth(); app.MapDiscussionWrites();
        app.MapGet("/test/login/{id}", async (string id, HttpContext context) => {
            var properties = new AuthenticationProperties();
            properties.StoreTokens([new AuthenticationToken { Name = "access_token", Value = "user-token" }]);
            await context.SignInAsync(new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, id), new Claim(ClaimTypes.Name, "visitor")], CookieAuthenticationDefaults.AuthenticationScheme)), properties);
        });
        await app.StartAsync();
        try {
            using var client = new HttpClient(new HttpClientHandler { CookieContainer = new CookieContainer() }) { BaseAddress = new Uri(app.Urls.Single()) };
            Check((await client.PutAsJsonAsync("/api/discussions/7", new DiscussionEdit("body", "title"))).StatusCode == HttpStatusCode.Unauthorized, "Anonymous edit rejected");
            Check((await client.DeleteAsync("/api/discussions/7")).StatusCode == HttpStatusCode.Unauthorized, "Anonymous deletion rejected");
            (await client.GetAsync("/test/login/777")).EnsureSuccessStatusCode();
            Check((await client.PutAsJsonAsync("/api/discussions/7", new DiscussionEdit("body", "title"))).StatusCode == HttpStatusCode.BadRequest, "Authenticated edits require CSRF");
            await Csrf(client);
            var original = (await client.GetFromJsonAsync<OwnedPublication>("/api/discussions/7/editable?commentId=comment-1"))!;
            Check(original.Body == "**Original** [link](https://example.com)", "Editor receives original Markdown without stripping links or formatting");
            (await client.PutAsJsonAsync("/api/discussions/7", new DiscussionEdit("body", "title"))).EnsureSuccessStatusCode();
            (await client.PutAsJsonAsync("/api/discussions/7/comments/comment-1", new DiscussionEdit("comment"))).EnsureSuccessStatusCode();
            (await client.DeleteAsync("/api/discussions/7/comments/comment-1")).EnsureSuccessStatusCode();
            (await client.DeleteAsync("/api/discussions/7")).EnsureSuccessStatusCode();
            Check((await client.PutAsJsonAsync("/api/discussions/7", new DiscussionEdit(" ", "title"))).StatusCode == HttpStatusCode.BadRequest, "Empty edits rejected");
            fake.Mode = "foreign-reply";
            Check((await client.DeleteAsync("/api/discussions/7/comments/comment-1")).StatusCode == HttpStatusCode.Forbidden, "Foreign discussion comment deletion rejected");
            fake.Mode = "ready";
            (await client.GetAsync("/test/login/888")).EnsureSuccessStatusCode();
            await Csrf(client);
            var before = fake.Mutations;
            Check((await client.DeleteAsync("/api/discussions/7")).StatusCode == HttpStatusCode.Forbidden, "Other authors cannot delete topics");
            Check((await client.PutAsJsonAsync("/api/discussions/7/comments/comment-1", new DiscussionEdit("hijack"))).StatusCode == HttpStatusCode.Forbidden, "Other authors cannot edit comments");
            Check((await client.GetAsync("/api/discussions/7/editable?commentId=comment-1")).StatusCode == HttpStatusCode.Forbidden, "Original text endpoint also verifies authorship");
            Check(fake.Mutations == before && fake.UserTokenOnly, "Rejected changes never mutate and all changes use visitor tokens");
            Console.WriteLine("Discussion changes OK: HTTP authentication, CSRF, edits and deletions, authorship, repository boundaries and visitor credentials.");
        }
        finally {
            await app.StopAsync();
            if (!Path.GetFullPath(folder).StartsWith(Path.GetFullPath(Path.GetTempPath()), StringComparison.OrdinalIgnoreCase)) throw new InvalidOperationException("Invalid test cleanup path.");
            Directory.Delete(folder, true);
        }
    }
    static async Task Csrf(HttpClient client) {
        using var session = JsonDocument.Parse(await client.GetStringAsync("/api/auth/session"));
        client.DefaultRequestHeaders.Remove("X-CSRF-Token");
        client.DefaultRequestHeaders.Add("X-CSRF-Token", session.RootElement.GetProperty("csrfToken").GetString());
    }
    static void Check(bool value, string message) { if (!value) throw new Exception(message); }
}
