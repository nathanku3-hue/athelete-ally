# 启动基础设施服务脚本 (PowerShell版本)
# 用于Windows本地开发环境
# 
# 功能:
# - 检查端口可用性 (5432, 6379, 4222)
# - 如果端口被占用，自动尝试替代端口 (5433, 6380, 4222)
# - 启动 PostgreSQL, Redis, NATS 服务
# - 显示服务状态
#
# 使用方法:
#   npm run infra:up
#   或
#   powershell -ExecutionPolicy Bypass -File ./scripts/infra-up.ps1

Write-Host "🚀 Starting infrastructure services..." -ForegroundColor Green

# 检查端口可用性
Write-Host "🔍 Checking port availability..." -ForegroundColor Yellow
try {
    $portCheck = npm run check-ports 5432 6379 4222
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Port check failed. Trying alternative ports..." -ForegroundColor Red
        try {
            $altCheck = npm run check-ports "5433" "6380" "4222"
            if ($LASTEXITCODE -ne 0) {
                Write-Host "❌ Alternative ports also failed." -ForegroundColor Red
                Write-Host "💡 Manual steps required:" -ForegroundColor Yellow
                Write-Host "   1. Project-scoped cleanup:" -ForegroundColor Cyan
                Write-Host "      docker compose -f ./preview.compose.yaml down -v --remove-orphans" -ForegroundColor Cyan
                Write-Host "   2. Use alternative ports:" -ForegroundColor Cyan
                Write-Host "      POSTGRES_PORT=5434 REDIS_PORT=6381 npm run infra:up" -ForegroundColor Cyan
                Write-Host "   3. Check system services (last resort):" -ForegroundColor Cyan
                Write-Host "      Get-Service | Where-Object {`$_.Name -like '*postgres*' -or `$_.Name -like '*redis*'}" -ForegroundColor Cyan
                Write-Host "   4. Manual process termination (last resort):" -ForegroundColor Cyan
                Write-Host "      taskkill /f /im <process_name>.exe" -ForegroundColor Cyan
                exit 1
            } else {
                Write-Host "✅ Using alternative ports: 5433, 6380, 4222" -ForegroundColor Green
                $env:POSTGRES_PORT = "5433"
                $env:REDIS_PORT = "6380"
                $env:NATS_PORT = "4222"
            }
        } catch {
            Write-Host "❌ Alternative port check failed: $_" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "❌ Port check failed: $_" -ForegroundColor Red
    exit 1
}

# 启动服务
Write-Host "🐳 Starting Docker services..." -ForegroundColor Blue
Write-Host "   PostgreSQL: $(if ($env:POSTGRES_PORT) { $env:POSTGRES_PORT } else { '5432' })" -ForegroundColor Cyan
Write-Host "   Redis: $(if ($env:REDIS_PORT) { $env:REDIS_PORT } else { '6379' })" -ForegroundColor Cyan
Write-Host "   NATS: $(if ($env:NATS_PORT) { $env:NATS_PORT } else { '4222' })" -ForegroundColor Cyan

try {
    docker compose -f ./preview.compose.yaml up -d postgres redis nats
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Infrastructure services started" -ForegroundColor Green
        Write-Host "📊 Service status:" -ForegroundColor Yellow
        docker compose -f ./preview.compose.yaml ps
    } else {
        Write-Host "❌ Failed to start services" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error starting services: $_" -ForegroundColor Red
    exit 1
}
