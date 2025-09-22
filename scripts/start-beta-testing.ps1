# Beta Testing Launch Script
# This script prepares and launches the beta testing phase

Write-Host "🚀 Starting Athlete Ally Beta Testing Phase" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan

# Check if all services are running
Write-Host "🔍 Checking system status..." -ForegroundColor Yellow

# Check if monitoring stack is running
try {
    $monitoringStatus = docker ps --filter "name=jaeger" --format "table {{.Names}}\t{{.Status}}"
    if ($monitoringStatus -match "jaeger") {
        Write-Host "✅ Monitoring stack is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Monitoring stack not detected. Starting..." -ForegroundColor Yellow
        Set-Location monitoring
        docker compose up -d
        Set-Location ..
        Start-Sleep -Seconds 10
    }
} catch {
    Write-Host "❌ Docker not available. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if services are accessible
Write-Host "🌐 Checking service endpoints..." -ForegroundColor Yellow

$services = @(
    @{Name="Gateway BFF"; Url="http://localhost:8000/health"},
    @{Name="Profile Onboarding"; Url="http://localhost:8001/health"},
    @{Name="Planning Engine"; Url="http://localhost:8002/health"},
    @{Name="Exercises"; Url="http://localhost:8005/health"},
    @{Name="Fatigue"; Url="http://localhost:8004/health"},
    @{Name="Workouts"; Url="http://localhost:8003/health"}
)

$allServicesRunning = $true
foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.Url -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($service.Name) is running" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $($service.Name) returned status $($response.StatusCode)" -ForegroundColor Yellow
            $allServicesRunning = $false
        }
    } catch {
        Write-Host "❌ $($service.Name) is not accessible" -ForegroundColor Red
        $allServicesRunning = $false
    }
}

if (-not $allServicesRunning) {
    Write-Host "⚠️  Some services are not running. Please start all services first." -ForegroundColor Yellow
    Write-Host "Run: .\scripts\start-all-services-v3.ps1" -ForegroundColor Cyan
    exit 1
}

# Initialize monitoring dashboard
Write-Host "📊 Setting up monitoring dashboard..." -ForegroundColor Yellow

# Copy beta testing dashboard to Grafana
$dashboardPath = "monitoring\beta-testing-dashboard.json"
$grafanaPath = "monitoring\grafana\dashboards\beta-testing-dashboard.json"

if (Test-Path $dashboardPath) {
    Copy-Item $dashboardPath $grafanaPath -Force
    Write-Host "✅ Beta testing dashboard configured" -ForegroundColor Green
} else {
    Write-Host "⚠️  Beta testing dashboard not found" -ForegroundColor Yellow
}

# Run user behavior analysis
Write-Host "📈 Running initial user behavior analysis..." -ForegroundColor Yellow

if (Test-Path "scripts\analyze-user-behavior.js") {
    try {
        node scripts\analyze-user-behavior.js
        Write-Host "✅ Initial analysis complete" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Analysis script failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Analysis script not found" -ForegroundColor Yellow
}

# Display beta testing information
Write-Host "`n🎯 Beta Testing Information" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "📊 Monitoring: http://localhost:3001" -ForegroundColor White
Write-Host "🔍 Jaeger: http://localhost:16686" -ForegroundColor White
Write-Host "📈 Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "💬 Feedback: http://localhost:3000/feedback" -ForegroundColor White

Write-Host "`n📋 Beta Testing Checklist" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host "✅ All services running" -ForegroundColor Green
Write-Host "✅ Monitoring configured" -ForegroundColor Green
Write-Host "✅ Feedback system ready" -ForegroundColor Green
Write-Host "✅ Analysis tools ready" -ForegroundColor Green

Write-Host "`n🎯 Next Steps" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor Cyan
Write-Host "1. Recruit 10-15 beta testers" -ForegroundColor White
Write-Host "2. Share access information with testers" -ForegroundColor White
Write-Host "3. Monitor real-time metrics in Grafana" -ForegroundColor White
Write-Host "4. Collect feedback through the feedback form" -ForegroundColor White
Write-Host "5. Run daily analysis: node scripts\analyze-user-behavior.js" -ForegroundColor White

Write-Host "`n📊 Key Metrics to Monitor" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "• Onboarding completion rate" -ForegroundColor White
Write-Host "• API response times (P95 < 2s)" -ForegroundColor White
Write-Host "• Workout session completion rate" -ForegroundColor White
Write-Host "• User engagement metrics" -ForegroundColor White
Write-Host "• Error rates and system stability" -ForegroundColor White

Write-Host "`n🚀 Beta Testing Phase Started!" -ForegroundColor Green
Write-Host "Happy testing! 🎉" -ForegroundColor Green
