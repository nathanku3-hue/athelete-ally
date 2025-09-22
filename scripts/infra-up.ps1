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
                Write-Host "❌ Alternative ports also failed. Please resolve port conflicts manually." -ForegroundColor Red
                Write-Host "💡 Try: `$env:POSTGRES_PORT='5433'; `$env:REDIS_PORT='6380'; npm run infra:up" -ForegroundColor Yellow
                exit 1
            } else {
                Write-Host "✅ Using alternative ports: 5433, 6380, 4222" -ForegroundColor Green
                $env:POSTGRES_PORT = "5433"
                $env:REDIS_PORT = "6380"
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
