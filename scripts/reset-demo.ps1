# Reset BugBot Demo State
param (
    [int]$IssueNumber = 1,
    [string]$Repo = "aryanSharma48/smoothapi",
    [string]$Token = $env:GITHUB_TOKEN
)

if (-not $Token) {
    $Token = Read-Host "Please enter your GitHub Personal Access Token"
}

$headers = @{
    "Authorization" = "Bearer $Token"
    "Accept" = "application/vnd.github+json"
    "User-Agent" = "BugBot-Reset"
}

Write-Host "Resetting issue #$IssueNumber in $Repo..." -ForegroundColor Cyan

# 1. Reset labels back to 'reported'
$labelBody = @{
    labels = @("reported", "sev:high", "comp:typescript")
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/issues/$IssueNumber/labels" -Method Put -Headers $headers -Body $labelBody -ContentType "application/json" | Out-Null
    Write-Host "Reset issue labels to: reported, sev:high, comp:typescript" -ForegroundColor Green
} catch {
    Write-Host "Failed to reset labels: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Find and close any open PR on fix/issue-$IssueNumber
try {
    $pulls = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/pulls?state=open" -Method Get -Headers $headers
    $targetPr = $pulls | Where-Object { $_.head.ref -eq "fix/issue-$IssueNumber" }

    if ($targetPr) {
        $closeBody = @{ state = "closed" } | ConvertTo-Json
        Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/pulls/$($targetPr.number)" -Method Patch -Headers $headers -Body $closeBody -ContentType "application/json" | Out-Null
        Write-Host "Closed active PR #$($targetPr.number)" -ForegroundColor Green

        # Delete the branch
        Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/git/refs/heads/fix/issue-$IssueNumber" -Method Delete -Headers $headers | Out-Null
        Write-Host "Deleted branch fix/issue-$IssueNumber" -ForegroundColor Green
    } else {
        Write-Host "No open PR found on fix/issue-$IssueNumber." -ForegroundColor Gray
    }
} catch {
    Write-Host "Error closing PR or deleting branch: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Reset complete. Ready for next rehearsal." -ForegroundColor Cyan
