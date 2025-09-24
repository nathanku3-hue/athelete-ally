# 启动监控服务
Write-Host "🚀 启动 Athlete Ally 监控服务..." -ForegroundColor Green

# 检查Docker是否运行
try {
    docker info | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
} catch {
    Write-Host "❌ Docker 未运行，请先启动 Docker" -ForegroundColor Red
    exit 1
}

# 进入监控目录
Set-Location "$PSScriptRoot\..\monitoring"

# 启动监控服务
Write-Host "📊 启动 Prometheus, Jaeger, Grafana..." -ForegroundColor Yellow
docker compose up -d

# 等待服务启动
Write-Host "⏳ 等待服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 检查服务状态
Write-Host "🔍 检查服务状态..." -ForegroundColor Yellow
docker compose ps

# 显示访问信息
Write-Host ""
Write-Host "✅ 监控服务已启动！" -ForegroundColor Green
Write-Host ""
Write-Host "📊 访问地址：" -ForegroundColor Cyan
Write-Host "  - Jaeger UI: http://localhost:16686" -ForegroundColor White
Write-Host "  - Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "  - Grafana: http://localhost:3000 (admin/admin)" -ForegroundColor White
Write-Host ""
Write-Host "🔧 服务端口：" -ForegroundColor Cyan
Write-Host "  - Jaeger Collector: localhost:14268" -ForegroundColor White
Write-Host "  - Prometheus: localhost:9090" -ForegroundColor White
Write-Host "  - Grafana: localhost:3000" -ForegroundColor White
Write-Host "  - Redis: localhost:6379" -ForegroundColor White
Write-Host "  - PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "📝 使用说明：" -ForegroundColor Cyan
Write-Host "  1. 启动应用服务后，追踪数据会自动发送到 Jaeger" -ForegroundColor White
Write-Host "  2. 指标数据会自动发送到 Prometheus" -ForegroundColor White
Write-Host "  3. 在 Grafana 中查看可视化仪表板" -ForegroundColor White
Write-Host ""
Write-Host "🛑 停止服务：" -ForegroundColor Cyan
Write-Host "  docker compose down" -ForegroundColor White

