#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Monitor Time Crunch Mode production deployment

.DESCRIPTION
    Runs health checks and collects metrics every 30 minutes for 4 hours
    Use during Phase 1 rollout (10% traffic)

.PARAMETER ProductionUrl
    The Railway production URL (e.g., https://planning-engine-production.up.railway.app)

.PARAMETER Duration
    Monitoring duration in hours (default: 4)

.PARAMETER Interval
    Check interval in minutes (default: 30)

.EXAMPLE
    .\monitor-production.ps1 -ProductionUrl "https://your-app.up.railway.app"

.EXAMPLE
    .\monitor-production.ps1 -ProductionUrl "https://your-app.up.railway.app" -Duration 2 -Interval 15
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$ProductionUrl,
    
    [Parameter(Mandatory=$false)]
    [int]$Duration = 4,
    
    [Parameter(Mandatory=$false)]
    [int]$Interval = 30
)

# Colors
$script:Green = "Green"
$script:Red = "Red"
$script:Yellow = "Yellow"
$script:Cyan = "Cyan"

# Thresholds
$script:SuccessRateThreshold = 95
$script:RollbackSuccessRateThreshold = 90
$script:ErrorRateThreshold = 1
$script:RollbackErrorRateThreshold = 2
$script:ResponseTimeThreshold = 5000  # milliseconds
$script:RollbackResponseTimeThreshold = 7000  # milliseconds

# Results tracking
$script:MonitoringResults = @()

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-ColorOutput "═══════════════════════════════════════════════" $Cyan
    Write-ColorOutput " $Title" $Cyan
    Write-ColorOutput "═══════════════════════════════════════════════" $Cyan
    Write-Host ""
}

function Test-HealthCheck {
    param([string]$Url)
    
    try {
        $response = Invoke-WebRequest -Uri "$Url/health" -Method GET -TimeoutSec 10 -UseBasicParsing
        return @{
            Success = $response.StatusCode -eq 200
            StatusCode = $response.StatusCode
            ResponseTime = $response.Headers['X-Response-Time']
        }
    }
    catch {
        return @{
            Success = $false
            StatusCode = $_.Exception.Response.StatusCode.value__
            Error = $_.Exception.Message
        }
    }
}

function Get-PrometheusMetrics {
    param([string]$Url)
    
    try {
        $response = Invoke-WebRequest -Uri "$Url/metrics" -Method GET -TimeoutSec 10 -UseBasicParsing
        $metrics = $response.Content
        
        # Parse time_crunch metrics
        $timeCrunchRequests = [regex]::Matches($metrics, 'time_crunch_requests_total\{status="([^"]+)"\}\s+(\d+)')
        $timeCrunchDuration = [regex]::Matches($metrics, 'time_crunch_duration_seconds\{quantile="0\.95"\}\s+([0-9.]+)')
        
        $result = @{
            Success = $true
            TotalRequests = 0
            SuccessfulRequests = 0
            FailedRequests = 0
            P95ResponseTime = 0
        }
        
        foreach ($match in $timeCrunchRequests) {
            $status = $match.Groups[1].Value
            $count = [int]$match.Groups[2].Value
            
            $result.TotalRequests += $count
            
            if ($status -eq "success") {
                $result.SuccessfulRequests = $count
            }
            else {
                $result.FailedRequests += $count
            }
        }
        
        if ($timeCrunchDuration.Count -gt 0) {
            $result.P95ResponseTime = [double]$timeCrunchDuration[0].Groups[1].Value * 1000  # Convert to ms
        }
        
        return $result
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

function Test-TimeCrunchEndpoint {
    param([string]$Url)
    
    try {
        $body = @{
            planId = "test-monitor"
            targetMinutes = 30
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest `
            -Uri "$Url/api/v1/time-crunch/preview" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -TimeoutSec 10 `
            -UseBasicParsing `
            -ErrorAction SilentlyContinue
        
        return @{
            EndpointExists = $true
            StatusCode = $response.StatusCode
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        # 401/400 means endpoint exists but needs auth or has validation errors
        return @{
            EndpointExists = ($statusCode -eq 401 -or $statusCode -eq 400)
            StatusCode = $statusCode
        }
    }
}

function Invoke-MonitoringCheck {
    param([string]$Url, [int]$CheckNumber)
    
    Write-Header "Check #$CheckNumber - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    
    $checkResult = @{
        Timestamp = Get-Date
        CheckNumber = $CheckNumber
        HealthCheck = $null
        Metrics = $null
        EndpointCheck = $null
        Overall = "UNKNOWN"
        ShouldRollback = $false
        Warnings = @()
    }
    
    # Health Check
    Write-ColorOutput "🏥 Health Check..." $Yellow
    $health = Test-HealthCheck -Url $Url
    $checkResult.HealthCheck = $health
    
    if ($health.Success) {
        Write-ColorOutput "  ✅ Service is healthy (HTTP $($health.StatusCode))" $Green
    }
    else {
        Write-ColorOutput "  ❌ Health check failed: $($health.Error)" $Red
        $checkResult.Overall = "FAILED"
        $checkResult.ShouldRollback = $true
        return $checkResult
    }
    
    # Endpoint Check
    Write-ColorOutput "🔌 Time Crunch Endpoint Check..." $Yellow
    $endpoint = Test-TimeCrunchEndpoint -Url $Url
    $checkResult.EndpointCheck = $endpoint
    
    if ($endpoint.EndpointExists) {
        Write-ColorOutput "  ✅ Endpoint exists (HTTP $($endpoint.StatusCode))" $Green
    }
    else {
        Write-ColorOutput "  ❌ Endpoint not found (HTTP $($endpoint.StatusCode))" $Red
        $checkResult.Warnings += "Time Crunch endpoint not accessible"
    }
    
    # Metrics Check
    Write-ColorOutput "📊 Metrics Analysis..." $Yellow
    $metrics = Get-PrometheusMetrics -Url $Url
    $checkResult.Metrics = $metrics
    
    if ($metrics.Success) {
        if ($metrics.TotalRequests -eq 0) {
            Write-ColorOutput "  ⚠️  No Time Crunch requests yet (this is normal initially)" $Yellow
            $checkResult.Overall = "HEALTHY"
        }
        else {
            $successRate = ($metrics.SuccessfulRequests / $metrics.TotalRequests) * 100
            $errorRate = ($metrics.FailedRequests / $metrics.TotalRequests) * 100
            $p95 = $metrics.P95ResponseTime
            
            Write-Host ""
            Write-Host "  Total Requests: $($metrics.TotalRequests)"
            Write-Host "  Successful: $($metrics.SuccessfulRequests)"
            Write-Host "  Failed: $($metrics.FailedRequests)"
            Write-Host ""
            
            # Success Rate
            if ($successRate -ge $SuccessRateThreshold) {
                Write-ColorOutput "  ✅ Success Rate: $($successRate.ToString('F2'))% (Target: >$SuccessRateThreshold%)" $Green
            }
            elseif ($successRate -ge $RollbackSuccessRateThreshold) {
                Write-ColorOutput "  ⚠️  Success Rate: $($successRate.ToString('F2'))% (Warning: <$SuccessRateThreshold%)" $Yellow
                $checkResult.Warnings += "Success rate below target"
            }
            else {
                Write-ColorOutput "  ❌ Success Rate: $($successRate.ToString('F2'))% (CRITICAL: <$RollbackSuccessRateThreshold%)" $Red
                $checkResult.ShouldRollback = $true
            }
            
            # Error Rate
            if ($errorRate -le $ErrorRateThreshold) {
                Write-ColorOutput "  ✅ Error Rate: $($errorRate.ToString('F2'))% (Target: <$ErrorRateThreshold%)" $Green
            }
            elseif ($errorRate -le $RollbackErrorRateThreshold) {
                Write-ColorOutput "  ⚠️  Error Rate: $($errorRate.ToString('F2'))% (Warning: >$ErrorRateThreshold%)" $Yellow
                $checkResult.Warnings += "Error rate above target"
            }
            else {
                Write-ColorOutput "  ❌ Error Rate: $($errorRate.ToString('F2'))% (CRITICAL: >$RollbackErrorRateThreshold%)" $Red
                $checkResult.ShouldRollback = $true
            }
            
            # Response Time
            if ($p95 -le $ResponseTimeThreshold) {
                Write-ColorOutput "  ✅ Response Time (p95): $($p95.ToString('F0'))ms (Target: <${ResponseTimeThreshold}ms)" $Green
            }
            elseif ($p95 -le $RollbackResponseTimeThreshold) {
                Write-ColorOutput "  ⚠️  Response Time (p95): $($p95.ToString('F0'))ms (Warning: >${ResponseTimeThreshold}ms)" $Yellow
                $checkResult.Warnings += "Response time above target"
            }
            else {
                Write-ColorOutput "  ❌ Response Time (p95): $($p95.ToString('F0'))ms (CRITICAL: >${RollbackResponseTimeThreshold}ms)" $Red
                $checkResult.ShouldRollback = $true
            }
            
            # Overall Status
            if ($checkResult.ShouldRollback) {
                $checkResult.Overall = "ROLLBACK_REQUIRED"
            }
            elseif ($checkResult.Warnings.Count -gt 0) {
                $checkResult.Overall = "WARNING"
            }
            else {
                $checkResult.Overall = "HEALTHY"
            }
        }
    }
    else {
        Write-ColorOutput "  ❌ Failed to fetch metrics: $($metrics.Error)" $Red
        $checkResult.Warnings += "Metrics unavailable"
        $checkResult.Overall = "WARNING"
    }
    
    # Summary
    Write-Host ""
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" $Cyan
    
    switch ($checkResult.Overall) {
        "HEALTHY" {
            Write-ColorOutput "  ✅ Overall Status: HEALTHY" $Green
        }
        "WARNING" {
            Write-ColorOutput "  ⚠️  Overall Status: WARNING" $Yellow
            foreach ($warning in $checkResult.Warnings) {
                Write-ColorOutput "     - $warning" $Yellow
            }
        }
        "ROLLBACK_REQUIRED" {
            Write-ColorOutput "  ❌ Overall Status: ROLLBACK REQUIRED" $Red
            Write-ColorOutput "" $Red
            Write-ColorOutput "  🚨 ACTION REQUIRED: Disable feature flag immediately!" $Red
            Write-ColorOutput "  🔗 https://app.launchdarkly.com/" $Red
            Write-ColorOutput "  🎯 Flag: feature.stream5_time_crunch_mode → OFF" $Red
        }
        "FAILED" {
            Write-ColorOutput "  ❌ Overall Status: FAILED" $Red
        }
    }
    
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" $Cyan
    Write-Host ""
    
    return $checkResult
}

function Export-MonitoringReport {
    param([array]$Results, [string]$Url)
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $reportPath = "monitoring-report-$timestamp.json"
    
    $report = @{
        ProductionUrl = $Url
        StartTime = $Results[0].Timestamp
        EndTime = $Results[-1].Timestamp
        TotalChecks = $Results.Count
        Results = $Results
        Summary = @{
            Healthy = ($Results | Where-Object { $_.Overall -eq "HEALTHY" }).Count
            Warning = ($Results | Where-Object { $_.Overall -eq "WARNING" }).Count
            Failed = ($Results | Where-Object { $_.Overall -in @("FAILED", "ROLLBACK_REQUIRED") }).Count
        }
    }
    
    $report | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8
    
    Write-ColorOutput "📄 Monitoring report saved to: $reportPath" $Cyan
}

# Main execution
Write-Header "TIME CRUNCH MODE - PRODUCTION MONITORING"

Write-Host "Production URL: $ProductionUrl"
Write-Host "Duration: $Duration hours"
Write-Host "Check Interval: $Interval minutes"
Write-Host "Total Checks: $([Math]::Floor($Duration * 60 / $Interval) + 1)"
Write-Host ""

$totalChecks = [Math]::Floor($Duration * 60 / $Interval) + 1
$checkNumber = 1

# Run initial check immediately
$result = Invoke-MonitoringCheck -Url $ProductionUrl -CheckNumber $checkNumber
$MonitoringResults += $result

if ($result.ShouldRollback) {
    Write-ColorOutput "🚨 CRITICAL: Rollback required after first check!" $Red
    Export-MonitoringReport -Results $MonitoringResults -Url $ProductionUrl
    exit 1
}

$checkNumber++

# Run subsequent checks
while ($checkNumber -le $totalChecks) {
    $nextCheckTime = (Get-Date).AddMinutes($Interval)
    Write-ColorOutput "⏰ Next check at: $($nextCheckTime.ToString('HH:mm:ss'))" $Yellow
    Write-Host "   Waiting $Interval minutes..."
    Write-Host ""
    
    Start-Sleep -Seconds ($Interval * 60)
    
    $result = Invoke-MonitoringCheck -Url $ProductionUrl -CheckNumber $checkNumber
    $MonitoringResults += $result
    
    if ($result.ShouldRollback) {
        Write-ColorOutput "🚨 CRITICAL: Rollback required!" $Red
        Export-MonitoringReport -Results $MonitoringResults -Url $ProductionUrl
        exit 1
    }
    
    $checkNumber++
}

# Final summary
Write-Header "MONITORING COMPLETE"

Write-Host "Total Duration: $Duration hours"
Write-Host "Total Checks: $($MonitoringResults.Count)"
Write-Host ""

$healthy = ($MonitoringResults | Where-Object { $_.Overall -eq "HEALTHY" }).Count
$warning = ($MonitoringResults | Where-Object { $_.Overall -eq "WARNING" }).Count
$failed = ($MonitoringResults | Where-Object { $_.Overall -in @("FAILED", "ROLLBACK_REQUIRED") }).Count

Write-ColorOutput "✅ Healthy: $healthy" $Green
Write-ColorOutput "⚠️  Warning: $warning" $Yellow
Write-ColorOutput "❌ Failed: $failed" $Red
Write-Host ""

Export-MonitoringReport -Results $MonitoringResults -Url $ProductionUrl

if ($failed -eq 0) {
    Write-ColorOutput "🎉 SUCCESS! All checks passed. Ready for Phase 2 (25% rollout)." $Green
    exit 0
}
else {
    Write-ColorOutput "❌ Monitoring completed with failures. Review before proceeding." $Red
    exit 1
}
