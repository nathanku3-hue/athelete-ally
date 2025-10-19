# Stream5 Time Crunch Mode - Grafana Dashboard Deployment Script (PowerShell)
# Usage: .\deploy-dashboard.ps1 [staging|production]

param(
    [Parameter(Position=0)]
    [ValidateSet("staging", "production")]
    [string]$Environment = "staging"
)

$ErrorActionPreference = "Stop"

$DashboardFile = "infrastructure\monitoring\grafana\dashboards\stream5-time-crunch-dashboard.json"

# Configuration based on environment
switch ($Environment) {
    "staging" {
        $GrafanaUrl = "https://nkgss.grafana.net"
        $ApiKey = $env:STAGING_GRAFANA_API_KEY
    }
    "production" {
        $GrafanaUrl = "https://grafana.athlete-ally.com"
        $ApiKey = $env:PRODUCTION_GRAFANA_API_KEY
    }
}

# Validate required environment variables
if (-not $ApiKey) {
    Write-Error "Error: $($Environment.ToUpper())_GRAFANA_API_KEY environment variable not set"
    exit 1
}

# Check if dashboard file exists
if (-not (Test-Path $DashboardFile)) {
    Write-Error "Error: Dashboard file not found: $DashboardFile"
    exit 1
}

Write-Host "Deploying Stream5 Time Crunch Dashboard to $Environment..." -ForegroundColor Green
Write-Host "Grafana URL: $GrafanaUrl"

# Test Grafana connectivity
Write-Host "Testing Grafana connectivity..."
try {
    $Headers = @{
        "Authorization" = "Bearer $ApiKey"
    }
    $Response = Invoke-RestMethod -Uri "$GrafanaUrl/api/health" -Headers $Headers -Method Get
    Write-Host "✅ Grafana connectivity confirmed" -ForegroundColor Green
} catch {
    Write-Error "Error: Cannot connect to Grafana at $GrafanaUrl"
    exit 1
}

# Deploy dashboard
Write-Host "Deploying dashboard..."
try {
    $DashboardContent = Get-Content $DashboardFile -Raw
    $Headers = @{
        "Authorization" = "Bearer $ApiKey"
        "Content-Type" = "application/json"
    }
    $Response = Invoke-RestMethod -Uri "$GrafanaUrl/api/dashboards/db" -Headers $Headers -Method Post -Body $DashboardContent
    
    Write-Host "✅ Dashboard deployed successfully!" -ForegroundColor Green
    
    # Extract dashboard URL
    if ($Response.url) {
        $DashboardUrl = "$GrafanaUrl$($Response.url)"
        Write-Host "Dashboard URL: $DashboardUrl"
    }
    
    # Set dashboard as favorite
    if ($Response.id) {
        Write-Host "Setting dashboard as favorite..."
        try {
            Invoke-RestMethod -Uri "$GrafanaUrl/api/user/stars/dashboard/$($Response.id)" -Headers $Headers -Method Post | Out-Null
            Write-Host "✅ Dashboard marked as favorite" -ForegroundColor Green
        } catch {
            Write-Warning "⚠️  Could not set dashboard as favorite"
        }
    }
    
} catch {
    Write-Error "❌ Dashboard deployment failed!"
    Write-Error $_.Exception.Message
    exit 1
}

# Verify dashboard is accessible
Write-Host "Verifying dashboard accessibility..."
try {
    $Response = Invoke-RestMethod -Uri "$GrafanaUrl/api/dashboards/uid/stream5-time-crunch" -Headers $Headers -Method Get
    Write-Host "✅ Dashboard verification successful!" -ForegroundColor Green
} catch {
    Write-Warning "⚠️  Dashboard deployed but verification failed"
}

Write-Host ""
Write-Host "🎉 Stream5 Time Crunch Dashboard deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Enable feature flag in $Environment"
Write-Host "2. Start monitoring dashboard metrics"
Write-Host "3. Begin staging validation process"
Write-Host ""
Write-Host "Dashboard URL: $GrafanaUrl/d/stream5-time-crunch" -ForegroundColor Cyan
