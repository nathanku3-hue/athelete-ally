# 基础设施服务状态检查脚本 (PowerShell版本)
# 用于Windows本地开发环境
#
# 功能:
# - 显示 Docker Compose 服务状态
# - 检查端口使用情况 (5432, 6379, 4222)
# - 显示 Docker 系统信息
#
# 使用方法:
#   npm run infra:status
#   或
#   powershell -ExecutionPolicy Bypass -File ./scripts/infra-status.ps1

Write-Host "📊 Infrastructure Service Status:" -ForegroundColor Yellow
docker compose -f ./preview.compose.yaml ps

Write-Host "`n🔍 Port Usage:" -ForegroundColor Yellow
try {
    $connections = Get-NetTCPConnection -LocalPort 5432,6379,4222 -ErrorAction SilentlyContinue
    if ($connections) {
        $connections | Select-Object LocalAddress,LocalPort,State | Format-Table
    } else {
        Write-Host "No ports in use" -ForegroundColor Green
    }
} catch {
    Write-Host "Could not check port usage: $_" -ForegroundColor Red
}

Write-Host "`n🐳 Docker System Info:" -ForegroundColor Yellow
docker system df
