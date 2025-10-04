# Start All Services Script v3 for Windows
# This script starts all microservices including the new Workouts service and UI components

Write-Host "🚀 Starting Athlete Ally - All Services v3 (Training Logs + Progress Dashboard)" -ForegroundColor Green

# Check if Docker is running
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Start monitoring stack
Write-Host "📊 Starting monitoring stack..." -ForegroundColor Yellow
Set-Location monitoring
docker compose up -d
Set-Location ..

# Wait for monitoring services to be ready
Write-Host "⏳ Waiting for monitoring services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start Gateway BFF
Write-Host "🌐 Starting Gateway BFF..." -ForegroundColor Yellow
Set-Location apps/gateway-bff
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
Set-Location ../..

# Start Profile Onboarding Service
Write-Host "👤 Starting Profile Onboarding Service..." -ForegroundColor Yellow
Set-Location services/profile-onboarding
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
Set-Location ../..

# Start Planning Engine Service
Write-Host "🧠 Starting Planning Engine Service..." -ForegroundColor Yellow
Set-Location services/planning-engine
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
Set-Location ../..

# Start Exercises Service
Write-Host "💪 Starting Exercises Service..." -ForegroundColor Yellow
Set-Location services/exercises
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
Set-Location ../..

# Start Fatigue Service
Write-Host "⚡ Starting Fatigue Service..." -ForegroundColor Yellow
Set-Location services/fatigue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
Set-Location ../..

# Start Workouts Service
Write-Host "📝 Starting Workouts Service..." -ForegroundColor Yellow
Set-Location services/workouts
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
Set-Location ../..

# Start Frontend
Write-Host "🎨 Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Service URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Gateway BFF: http://localhost:4000" -ForegroundColor White
Write-Host "  API Docs: http://localhost:4000/documentation" -ForegroundColor White
Write-Host "  Jaeger: http://localhost:16686" -ForegroundColor White
Write-Host "  Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "  Grafana: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Ready to train, track, and grow!" -ForegroundColor Green
Write-Host "💡 New Features:" -ForegroundColor Cyan
Write-Host "  📝 Training Logs - Record every rep, set, and session" -ForegroundColor White
Write-Host "  🏆 Personal Records - Automatic PR detection" -ForegroundColor White
Write-Host "  📊 Progress Dashboard - Visualize your growth" -ForegroundColor White
Write-Host "  ⚡ Smart Adjustments - Based on fatigue and performance" -ForegroundColor White
Write-Host "  🎨 Training Cockpit - Real-time workout interface" -ForegroundColor White
Write-Host "  📈 Growth Mirror - See your progress over time" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Phase 3A Complete: Training Logs + Progress Dashboard!" -ForegroundColor Green

