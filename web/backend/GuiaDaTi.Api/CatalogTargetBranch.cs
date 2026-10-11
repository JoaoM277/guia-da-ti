using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;

public static class CatalogTargetBranch
{
    public const string Default = "catalog-review";

    public static string Resolve(IConfiguration configuration, string repositoryDefaultBranch)
    {
        var branch = configuration["CATALOG_TARGET_BRANCH"]?.Trim();
        if (string.IsNullOrEmpty(branch)) branch = Default;
        var valid = Regex.IsMatch(branch, @"^[A-Za-z0-9][A-Za-z0-9._/-]*$")
            && !branch.Contains("..", StringComparison.Ordinal)
            && !branch.Contains("//", StringComparison.Ordinal)
            && !branch.Contains("@{", StringComparison.Ordinal)
            && !branch.StartsWith('/') && !branch.EndsWith('/') && !branch.EndsWith('.')
            && !branch.Split('/').Any(part => part.StartsWith('.') || part.EndsWith(".lock", StringComparison.OrdinalIgnoreCase));
        if (!valid || string.Equals(branch, "main", StringComparison.OrdinalIgnoreCase)
            || string.Equals(branch, repositoryDefaultBranch, StringComparison.OrdinalIgnoreCase))
            throw new ContributionRejectedException("A branch de revisão do catálogo precisa existir e ser diferente da branch principal.");
        return branch;
    }

    public static string ApiRef(string branch) => Uri.EscapeDataString(branch).Replace("%2F", "/", StringComparison.OrdinalIgnoreCase);
}
