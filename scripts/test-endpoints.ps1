# Test BugBot n8n Webhook Endpoints
param (
    [string]$BaseUrl = "http://localhost:5678/webhook/bugbot",
    [string]$Secret = "your_shared_secret"
)

$headers = @{
    "x-bugbot-secret" = $Secret
    "Content-Type" = "application/json"
}

Write-Host "--- Testing BugBot Endpoints at: $BaseUrl ---" -ForegroundColor Cyan

function Test-Endpoint {
    param($Name, $Path, $Body)
    Write-Host "`n[Testing $Name] -> $Path" -ForegroundColor Yellow
    try {
        $jsonBody = $Body | ConvertTo-Json -Depth 5
        $res = Invoke-RestMethod -Uri "$BaseUrl/$Path" -Method Post -Headers $headers -Body $jsonBody
        Write-Host "Response received:" -ForegroundColor Green
        $res | Format-List
    } catch {
        Write-Host "Error calling $Name : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 1. Test list-issues
Test-Endpoint -Name "list-issues" -Path "list-issues" -Body @{ status = "open"; limit = 5 }

# 2. Test create-issue (confirmation check)
Test-Endpoint -Name "create-issue (unconfirmed)" -Path "create-issue" -Body @{
    title = "Test Bug"
    description = "Test description"
    confirmed = $false
}

# 3. Test get-status
Test-Endpoint -Name "get-status" -Path "get-status" -Body @{ issue_number = 1 }
