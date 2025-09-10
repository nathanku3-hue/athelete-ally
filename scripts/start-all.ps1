# 启动所有 Athlete Ally 服务
Write-Host "🚀 启动 Athlete Ally 完整系统..." -ForegroundColor Green

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

# 启动监控服务
Write-Host "📊 启动监控服务..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\monitoring"
docker-compose up -d

# 等待监控服务启动
Write-Host "⏳ 等待监控服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 回到项目根目录
Set-Location "$PSScriptRoot\.."

# 启动后端服务
Write-Host "🔧 启动后端服务..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd '$PSScriptRoot\..\apps\gateway-bff'; npm run dev" -WindowStyle Minimized
Start-Process powershell -ArgumentList "-Command", "cd '$PSScriptRoot\..\services\profile-onboarding'; npm run dev" -WindowStyle Minimized
Start-Process powershell -ArgumentList "-Command", "cd '$PSScriptRoot\..\services\planning-engine'; npm run dev" -WindowStyle Minimized

# 等待后端服务启动
Write-Host "⏳ 等待后端服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 启动前端服务
Write-Host "🌐 启动前端服务..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd '$PSScriptRoot\..'; npm run dev" -WindowStyle Normal

# 等待前端服务启动
Write-Host "⏳ 等待前端服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 显示访问信息
Write-Host ""
Write-Host "✅ 所有服务已启动！" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 前端应用:" -ForegroundColor Cyan
Write-Host "  - 主应用: http://localhost:3000" -ForegroundColor White
Write-Host "  - 引导流程: http://localhost:3000/onboarding/purpose" -ForegroundColor White
Write-Host ""
Write-Host "🔧 后端API:" -ForegroundColor Cyan
Write-Host "  - Gateway BFF: http://localhost:4000" -ForegroundColor White
Write-Host "  - API文档: http://localhost:4000/docs" -ForegroundColor White
Write-Host "  - Profile服务: http://localhost:4101" -ForegroundColor White
Write-Host "  - Planning服务: http://localhost:4102" -ForegroundColor White
Write-Host ""
Write-Host "📊 监控系统:" -ForegroundColor Cyan
Write-Host "  - Jaeger UI: http://localhost:16686" -ForegroundColor White
Write-Host "  - Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "  - Grafana: http://localhost:3000 (admin/admin)" -ForegroundColor White
Write-Host ""
Write-Host "🧪 测试命令:" -ForegroundColor Cyan
Write-Host "  - 端到端测试: node scripts/test-end-to-end.js" -ForegroundColor White
Write-Host "  - 追踪测试: node scripts/test-tracing.js" -ForegroundColor White
Write-Host ""
Write-Host "🛑 停止服务:" -ForegroundColor Cyan
Write-Host "  - 停止监控: docker-compose down (在monitoring目录)" -ForegroundColor White
Write-Host "  - 停止应用: 关闭所有PowerShell窗口" -ForegroundColor White
Write-Host ""
Write-Host "🎉 您的"汽车工厂"已经全速运转！开始生产"汽车"吧！" -ForegroundColor Green

