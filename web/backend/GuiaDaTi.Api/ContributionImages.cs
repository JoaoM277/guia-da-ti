using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Antiforgery;

public sealed class ContributionImages(IWebHostEnvironment environment, IConfiguration config)
{
    public const int MaximumBytes = 2 * 1024 * 1024;
    private readonly string directory = Path.GetFullPath(config["CONTRIBUTION_IMAGES_PATH"]
        ?? Path.Combine(environment.ContentRootPath, "App_Data", "contribution-images"));
    public static string Extension(byte[] bytes)
    {
        if (bytes.Length >= 24 && bytes.AsSpan(0, 8).SequenceEqual(new byte[] {137,80,78,71,13,10,26,10}) && bytes.AsSpan(12,4).SequenceEqual("IHDR"u8)) return "png";
        if (bytes.Length >= 4 && bytes[0] == 255 && bytes[1] == 216 && bytes[2] == 255) return "jpg";
        if (bytes.Length >= 16 && bytes.AsSpan(0,4).SequenceEqual("RIFF"u8) && bytes.AsSpan(8,4).SequenceEqual("WEBP"u8)) return "webp";
        throw new ContributionRejectedException("Escolha uma imagem PNG, JPG ou WebP de até 2 MB.");
    }
    public string PathFor(string id)
    {
        if (!Regex.IsMatch(id, @"^[a-f0-9]{32}\.(png|jpg|webp)$")) throw new ContributionRejectedException("A imagem não foi encontrada. Envie o arquivo novamente.");
        return Path.Combine(directory, id);
    }
    public void Require(string id) { if (!File.Exists(PathFor(id))) throw new ContributionRejectedException("A imagem não foi encontrada. Envie o arquivo novamente."); }
    public async Task<string> Save(byte[] bytes, CancellationToken cancellation)
    {
        if (bytes.Length is 0 or > MaximumBytes) throw new ContributionRejectedException("Escolha uma imagem PNG, JPG ou WebP de até 2 MB.");
        var id = $"{Guid.NewGuid():N}.{Extension(bytes)}";
        Directory.CreateDirectory(directory);
        await File.WriteAllBytesAsync(PathFor(id), bytes, cancellation);
        return id;
    }
    public async Task<ContributionResource> Publish(HttpClient client, string target, string upstream, string branch, string baseBranch, ContributionResource resource, CancellationToken cancellation)
    {
        if (resource.ImageUploadId is not { } id) return resource;
        Require(id);
        var bytes = await File.ReadAllBytesAsync(PathFor(id), cancellation);
        var path = $"assets/images/{resource.Slug}-{id}";
        using var result = await client.PutAsJsonAsync(new Uri($"https://api.github.com/repos/{target}/contents/{path}"), new {message=$"catalog: add image for {resource.Slug}", content=Convert.ToBase64String(bytes), branch}, cancellation);
        result.EnsureSuccessStatusCode();
        return resource with {ImageUploadId=null, ImageUrl=$"https://raw.githubusercontent.com/{upstream}/{Uri.EscapeDataString(baseBranch)}/{path}"};
    }
}

public static class ContributionImageEndpoints
{
    public static void MapContributionImages(this WebApplication app)
    {
        app.MapGet("/api/contributions/images/{id}", (string id, ContributionImages images) => {
            try {
                images.Require(id);
                var mime = Path.GetExtension(id) switch {".png" => "image/png", ".jpg" => "image/jpeg", _ => "image/webp"};
                return Results.File(images.PathFor(id), mime);
            } catch (ContributionRejectedException) { return Results.NotFound(); }
        });
        app.MapPost("/api/contributions/images", async (HttpContext context, IAntiforgery csrf, ContributionImages images) => {
            if (context.User.Identity?.IsAuthenticated != true) return Results.Unauthorized();
            try { await csrf.ValidateRequestAsync(context); } catch (AntiforgeryValidationException) { return Results.BadRequest(new {error="Atualize a página e tente novamente."}); }
            if (!context.Request.HasFormContentType) return Results.BadRequest(new {error="Selecione uma imagem para enviar."});
            var form = await context.Request.ReadFormAsync(context.RequestAborted);
            var file = form.Files.GetFile("image");
            if (file is null || file.Length is 0 or > ContributionImages.MaximumBytes) return Results.BadRequest(new {error="Escolha uma imagem PNG, JPG ou WebP de até 2 MB."});
            using var buffer = new MemoryStream();
            await file.CopyToAsync(buffer, context.RequestAborted);
            try { var id = await images.Save(buffer.ToArray(), context.RequestAborted); return Results.Ok(new {id}); }
            catch (ContributionRejectedException error) { return Results.BadRequest(new {error=error.Message}); }
        }).WithMetadata(new Microsoft.AspNetCore.Mvc.RequestSizeLimitAttribute(ContributionImages.MaximumBytes + 65536));
    }
}
