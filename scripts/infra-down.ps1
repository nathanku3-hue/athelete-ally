# 停止基础设施服务脚本 (PowerShell版本)
# 用于Windows本地开发环境
#
# 功能:
# - 停止并清理 PostgreSQL, Redis, NATS 服务
# - 删除相关容器、网络和卷
#
# 使用方法:
#   npm run infra:down
#   或
#   powershell -ExecutionPolicy Bypass -File ./scripts/infra-down.ps1

Write-Host "🛑 Stopping infrastructure services..." -ForegroundColor Yellow

try {
    docker compose -f ./preview.compose.yaml down -v --remove-orphans
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Infrastructure services stopped" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to stop services" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error stopping services: $_" -ForegroundColor Red
    exit 1
}
