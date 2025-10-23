# Monitor Railway Deployment
# Run this while waiting for deployment to complete

$url = "https://planning-engine-production.up.railway.app"
$maxAttempts = 30  # Check for ~15 minutes (30 attempts x 30 sec)
$attempt = 0

Write-Host "🔍 Monitoring Railway Deployment..." -ForegroundColor Cyan
Write-Host "URL: $url/health" -ForegroundColor Gray
Write-Host "Checking every 30 seconds..." -ForegroundColor Gray
Write-Host ""

while ($attempt -lt $maxAttempts) {
    $attempt++
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    Write-Host "[$timestamp] Attempt $attempt/$maxAttempts - " -NoNewline
    
    try {
        $response = Invoke-RestMethod -Uri "$url/health" -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.status -eq "healthy") {
            Write-Host "✅ SUCCESS!" -ForegroundColor Green
            Write-Host ""
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
            Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
            Write-Host ""
            Write-Host "Health Status:" -ForegroundColor Cyan
            $response | ConvertTo-Json -Depth 5
            Write-Host ""
            Write-Host "✅ Database: $($response.checks.database.status)" -ForegroundColor Green
            Write-Host "✅ Redis: $($response.checks.redis.status)" -ForegroundColor Green
            Write-Host "⏱️  Uptime: $($response.uptime) seconds" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
            Write-Host "1. Monitor for 30-60 minutes" -ForegroundColor White
            Write-Host "2. Enable LaunchDarkly flag at 10%" -ForegroundColor White
            Write-Host "3. Follow PHASE1_GUARDRAILS_IMPLEMENTATION_PLAN.md" -ForegroundColor White
            exit 0
        } else {
            Write-Host "⚠️  Service responding but status: $($response.status)" -ForegroundColor Yellow
        }
    } catch {
        $errorMessage = $_.Exception.Message
        if ($errorMessage -like "*404*" -or $errorMessage -like "*Application not found*") {
            Write-Host "⏳ Still building..." -ForegroundColor Yellow
        } elseif ($errorMessage -like "*503*") {
            Write-Host "⏳ Service starting..." -ForegroundColor Yellow
        } elseif ($errorMessage -like "*timeout*") {
            Write-Host "⏳ Timeout (service may be starting)" -ForegroundColor Yellow
        } else {
            Write-Host "❌ Error: $errorMessage" -ForegroundColor Red
        }
    }
    
    if ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 30
    }
}

Write-Host ""
Write-Host "⏱️  Timeout reached after $maxAttempts attempts" -ForegroundColor Yellow
Write-Host "Check Railway dashboard for deployment status" -ForegroundColor Yellow
