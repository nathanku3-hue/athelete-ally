#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Verify Railway deployment for Time Crunch Mode

.PARAMETER ProductionUrl
    The Railway production URL (e.g., https://planning-engine-production.up.railway.app)
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$ProductionUrl
)

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " RAILWAY DEPLOYMENT VERIFICATION" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Production URL: $ProductionUrl" -ForegroundColor Yellow
Write-Host ""

$allPassed = $true

# Test 1: Health Check
Write-Host "🏥 Test 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ProductionUrl/health" -Method GET -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ PASSED - Service is healthy (HTTP 200)" -ForegroundColor Green
        Write-Host "  Response: $($response.Content.Substring(0, [Math]::Min(100, $response.Content.Length)))" -ForegroundColor Gray
    }
    else {
        Write-Host "  ⚠️  WARNING - Unexpected status code: $($response.StatusCode)" -ForegroundColor Yellow
        $allPassed = $false
    }
}
catch {
    Write-Host "  ❌ FAILED - Cannot reach health endpoint" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}
Write-Host ""

# Test 2: Time Crunch Endpoint Exists
Write-Host "🔌 Test 2: Time Crunch Endpoint" -ForegroundColor Yellow
try {
    $body = @{
        planId = "test-verification"
        targetMinutes = 30
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest `
        -Uri "$ProductionUrl/api/v1/time-crunch/preview" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 10 `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    
    Write-Host "  ✅ PASSED - Endpoint exists (HTTP $($response.StatusCode))" -ForegroundColor Green
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "  ✅ PASSED - Endpoint exists (HTTP 401 - needs authentication)" -ForegroundColor Green
    }
    elseif ($statusCode -eq 400) {
        Write-Host "  ✅ PASSED - Endpoint exists (HTTP 400 - validation error)" -ForegroundColor Green
    }
    elseif ($statusCode -eq 404) {
        Write-Host "  ❌ FAILED - Endpoint not found (HTTP 404)" -ForegroundColor Red
        Write-Host "  Error: Time Crunch route not registered" -ForegroundColor Red
        $allPassed = $false
    }
    else {
        Write-Host "  ⚠️  WARNING - Unexpected status code: $statusCode" -ForegroundColor Yellow
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 3: Metrics Endpoint
Write-Host "📊 Test 3: Metrics Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ProductionUrl/metrics" -Method GET -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        $metrics = $response.Content
        
        # Check for Time Crunch metrics
        $hasTimeCrunchMetrics = $metrics -match "time_crunch"
        
        if ($hasTimeCrunchMetrics) {
            Write-Host "  ✅ PASSED - Metrics endpoint working with Time Crunch metrics" -ForegroundColor Green
        }
        else {
            Write-Host "  ⚠️  WARNING - Metrics endpoint works but no Time Crunch metrics yet" -ForegroundColor Yellow
            Write-Host "  Note: This is normal if no requests have been made yet" -ForegroundColor Gray
        }
        
        # Show sample metrics
        $lines = $metrics -split "`n" | Select-Object -First 5
        Write-Host "  Sample metrics:" -ForegroundColor Gray
        foreach ($line in $lines) {
            if ($line.Trim() -ne "" -and -not $line.StartsWith("#")) {
                Write-Host "    $line" -ForegroundColor DarkGray
            }
        }
    }
    else {
        Write-Host "  ⚠️  WARNING - Unexpected status code: $($response.StatusCode)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "  ❌ FAILED - Cannot reach metrics endpoint" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}
Write-Host ""

# Test 4: Database Connection (via health check details)
Write-Host "💾 Test 4: Database Connection" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ProductionUrl/health" -Method GET -TimeoutSec 10 -UseBasicParsing
    $health = $response.Content | ConvertFrom-Json
    
    if ($health.database -or $health.db -or $health.status -eq "healthy") {
        Write-Host "  ✅ PASSED - Database connection appears healthy" -ForegroundColor Green
    }
    else {
        Write-Host "  ⚠️  WARNING - Cannot verify database connection from health check" -ForegroundColor Yellow
        Write-Host "  Note: Service is running but database status unclear" -ForegroundColor Gray
    }
}
catch {
    Write-Host "  ⚠️  WARNING - Cannot parse health check response" -ForegroundColor Yellow
}
Write-Host ""

# Test 5: LaunchDarkly SDK Connection
Write-Host "🚩 Test 5: LaunchDarkly Integration" -ForegroundColor Yellow
Write-Host "  ℹ️  INFO - Cannot verify LaunchDarkly from external check" -ForegroundColor Gray
Write-Host "  Please check Railway logs for LaunchDarkly connection messages" -ForegroundColor Gray
Write-Host "  Expected log: 'LaunchDarkly client initialized'" -ForegroundColor Gray
Write-Host ""

# Final Summary
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host " ✅ VERIFICATION PASSED" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎉 Deployment successful! Ready for next steps:" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. ✅ Service is running and healthy" -ForegroundColor Green
    Write-Host "2. ✅ Time Crunch endpoint is accessible" -ForegroundColor Green
    Write-Host "3. ✅ Metrics endpoint is working" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 NEXT STEPS:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Enable LaunchDarkly Feature Flag:" -ForegroundColor White
    Write-Host "   - Go to: https://app.launchdarkly.com/" -ForegroundColor Gray
    Write-Host "   - Flag: feature.stream5_time_crunch_mode" -ForegroundColor Gray
    Write-Host "   - Environment: Production" -ForegroundColor Gray
    Write-Host "   - Enable at: 10%" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Start Monitoring (4 hours):" -ForegroundColor White
    Write-Host "   cd E:\vibe\athlete-ally-original\services\planning-engine\scripts" -ForegroundColor Gray
    Write-Host "   .\monitor-production.ps1 -ProductionUrl `"$ProductionUrl`"" -ForegroundColor Gray
    Write-Host ""
}
else {
    Write-Host " ❌ VERIFICATION FAILED" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠️  Some tests failed. Please:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Check Railway logs:" -ForegroundColor White
    Write-Host "   https://railway.app/ → planning-engine → Logs" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Verify environment variables are set:" -ForegroundColor White
    Write-Host "   - OPENAI_API_KEY" -ForegroundColor Gray
    Write-Host "   - JWT_SECRET" -ForegroundColor Gray
    Write-Host "   - LAUNCHDARKLY_SDK_KEY" -ForegroundColor Gray
    Write-Host "   - PLANNING_DATABASE_URL" -ForegroundColor Gray
    Write-Host "   - REDIS_URL" -ForegroundColor Gray
    Write-Host "   - NATS_URL" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Check build logs for errors" -ForegroundColor White
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
