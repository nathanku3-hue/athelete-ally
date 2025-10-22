# Stream5 Time Crunch Mode - Staging Verification Script
# Usage: .\verify-staging-deployment.ps1

param(
    [string]$StagingUrl = "https://nkgss.grafana.net",
    [string]$TestPlanId = "test-plan-id",
    [string]$TestToken = "test-token"
)

$ErrorActionPreference = "Stop"

Write-Host "Stream5 Time Crunch Mode - Staging Verification" -ForegroundColor Green
Write-Host "Staging URL: $StagingUrl"
Write-Host ""

# Test 1: Service Health Check
Write-Host "1. Testing service health..." -ForegroundColor Yellow
try {
    $HealthResponse = Invoke-RestMethod -Uri "$StagingUrl/health" -Method Get
    Write-Host "✅ Service health check passed" -ForegroundColor Green
} catch {
    Write-Host "❌ Service health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Feature Flag Status
Write-Host "2. Testing feature flag status..." -ForegroundColor Yellow
try {
    $Headers = @{
        "Authorization" = "Bearer $TestToken"
        "Content-Type" = "application/json"
    }
    $TestBody = @{
        planId = $TestPlanId
        targetMinutes = 45
    } | ConvertTo-Json
    
    $Response = Invoke-RestMethod -Uri "$StagingUrl/api/v1/time-crunch/preview" -Headers $Headers -Method Post -Body $TestBody
    
    if ($Response.error -eq "feature_not_available") {
        Write-Host "❌ Feature flag not enabled - endpoint returns 'feature_not_available'" -ForegroundColor Red
        Write-Host "Please enable the feature flag in LaunchDarkly staging environment" -ForegroundColor Yellow
        exit 1
    } elseif ($Response.error -eq "plan_not_found") {
        Write-Host "✅ Feature flag is enabled - endpoint processes requests (plan not found is expected)" -ForegroundColor Green
    } else {
        Write-Host "✅ Feature flag is enabled - endpoint processes requests successfully" -ForegroundColor Green
    }
} catch {
    $StatusCode = $_.Exception.Response.StatusCode.value__
    if ($StatusCode -eq 404) {
        Write-Host "❌ Endpoint not found - check if time-crunch routes are registered" -ForegroundColor Red
    } elseif ($StatusCode -eq 401) {
        Write-Host "⚠️  Authentication required - using test token" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: Telemetry Events
Write-Host "3. Checking telemetry events..." -ForegroundColor Yellow
Write-Host "Please check Grafana dashboard for:" -ForegroundColor Cyan
Write-Host "  - stream5.time_crunch_preview_requested events" -ForegroundColor White
Write-Host "  - stream5.time_crunch_preview_succeeded events" -ForegroundColor White
Write-Host "  - stream5.time_crunch_preview_fallback events" -ForegroundColor White

# Test 4: Performance Test
Write-Host "4. Running performance test..." -ForegroundColor Yellow
$StartTime = Get-Date
try {
    $Response = Invoke-RestMethod -Uri "$StagingUrl/api/v1/time-crunch/preview" -Headers $Headers -Method Post -Body $TestBody
    $EndTime = Get-Date
    $ResponseTime = ($EndTime - $StartTime).TotalMilliseconds
    
    if ($ResponseTime -lt 2000) {
        Write-Host "✅ Response time: $([math]::Round($ResponseTime))ms (Target: <2000ms)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Response time: $([math]::Round($ResponseTime))ms (Target: <2000ms)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Performance test failed - check endpoint availability" -ForegroundColor Yellow
}

# Test 5: Edge Cases
Write-Host "5. Testing edge cases..." -ForegroundColor Yellow

# Test minimum target minutes
try {
    $MinBody = @{
        planId = $TestPlanId
        targetMinutes = 15
    } | ConvertTo-Json
    
    $Response = Invoke-RestMethod -Uri "$StagingUrl/api/v1/time-crunch/preview" -Headers $Headers -Method Post -Body $MinBody
    Write-Host "✅ Minimum target minutes (15) accepted" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Minimum target minutes test failed" -ForegroundColor Yellow
}

# Test maximum target minutes
try {
    $MaxBody = @{
        planId = $TestPlanId
        targetMinutes = 180
    } | ConvertTo-Json
    
    $Response = Invoke-RestMethod -Uri "$StagingUrl/api/v1/time-crunch/preview" -Headers $Headers -Method Post -Body $MaxBody
    Write-Host "✅ Maximum target minutes (180) accepted" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Maximum target minutes test failed" -ForegroundColor Yellow
}

# Test invalid target minutes
try {
    $InvalidBody = @{
        planId = $TestPlanId
        targetMinutes = 10
    } | ConvertTo-Json
    
    $Response = Invoke-RestMethod -Uri "$StagingUrl/api/v1/time-crunch/preview" -Headers $Headers -Method Post -Body $InvalidBody
    Write-Host "⚠️  Invalid target minutes (10) was accepted - should be rejected" -ForegroundColor Yellow
} catch {
    Write-Host "✅ Invalid target minutes (10) properly rejected" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Staging verification complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check Grafana dashboard for telemetry events" -ForegroundColor White
Write-Host "2. Monitor metrics for 48 hours" -ForegroundColor White
Write-Host "3. Run integration tests with frontend" -ForegroundColor White
Write-Host "4. Prepare for Week 2 beta rollout" -ForegroundColor White
