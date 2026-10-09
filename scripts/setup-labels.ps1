# Setup BugBot Labels for smoothapi
param (
    [Parameter(Mandatory=$false)]
    [string]$Repo = "aryanSharma48/smoothapi",

    [Parameter(Mandatory=$false)]
    [string]$Token = $env:GITHUB_TOKEN
)

if (-not $Token) {
    Write-Host "Warning: GITHUB_TOKEN environment variable not set. Authenticated token required for creating labels." -ForegroundColor Yellow
    $Token = Read-Host "Please enter your GitHub Personal Access Token"
}

$headers = @{
    "Authorization" = "Bearer $Token"
    "Accept" = "application/vnd.github+json"
    "User-Agent" = "BugBot-Setup"
}

$labels = @(
    @{ name = "reported"; color = "1d76db"; description = "Filed by VoiceBugBot" },
    @{ name = "WIP"; color = "fbca04"; description = "Automated fix in progress" },
    @{ name = "needs-review"; color = "0e8a16"; description = "PR open, human review needed" },
    @{ name = "fix-failed"; color = "d93f0b"; description = "Automated fix failed" },
    @{ name = "sev:low"; color = "c2e0c6"; description = "Low severity" },
    @{ name = "sev:medium"; color = "fef2c0"; description = "Medium severity" },
    @{ name = "sev:high"; color = "ff9f1c"; description = "High severity" },
    @{ name = "sev:critical"; color = "b60205"; description = "Critical severity" },
    @{ name = "comp:typescript"; color = "ededed"; description = "TypeScript SDK" },
    @{ name = "comp:python"; color = "ededed"; description = "Python SDK" },
    @{ name = "comp:docs"; color = "ededed"; description = "Documentation" }
)

Write-Host "Creating BugBot labels in repository: $Repo ..." -ForegroundColor Cyan

foreach ($label in $labels) {
    $body = @{
        name = $label.name
        color = $label.color
        description = $label.description
    } | ConvertTo-Json

    try {
        $res = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/labels" -Method Post -Headers $headers -Body $body -ContentType "application/json"
        Write-Host "Created label: $($label.name)" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 422) {
            Write-Host "Label already exists: $($label.name)" -ForegroundColor DarkGray
        } else {
            Write-Host "Failed to create label: $($label.name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "Label setup completed." -ForegroundColor Cyan
