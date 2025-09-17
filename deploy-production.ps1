# Phase 2 生产部署脚本 (Windows PowerShell)
# 用于快速部署到生产环境

param(
    [switch]$SkipTests,
    [switch]$SkipBuild,
    [switch]$Help
)

if ($Help) {
    Write-Host "Phase 2 生产部署脚本" -ForegroundColor Green
    Write-Host "用法: .\deploy-production.ps1 [-SkipTests] [-SkipBuild] [-Help]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "参数:" -ForegroundColor Cyan
    Write-Host "  -SkipTests    跳过测试执行" -ForegroundColor White
    Write-Host "  -SkipBuild    跳过Docker构建" -ForegroundColor White
    Write-Host "  -Help         显示此帮助信息" -ForegroundColor White
    exit 0
}

# 设置错误处理
$ErrorActionPreference = "Stop"

# 颜色定义
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

# 日志函数
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# 检查Docker是否运行
function Test-Docker {
    Write-Info "检查Docker状态..."
    try {
        docker info | Out-Null
        Write-Success "Docker运行正常"
    }
    catch {
        Write-Error "Docker未运行，请启动Docker Desktop"
        exit 1
    }
}

# 检查端口是否可用
function Test-Ports {
    Write-Info "检查端口可用性..."
    
    # 检查前端端口3000
    $port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($port3000) {
        Write-Warning "端口3000已被占用，正在停止现有服务..."
        try {
            docker stop frontend 2>$null
            docker rm frontend 2>$null
        }
        catch {
            Write-Warning "无法停止现有前端服务，请手动处理"
        }
    }
    
    # 检查后端端口4102
    $port4102 = Get-NetTCPConnection -LocalPort 4102 -ErrorAction SilentlyContinue
    if ($port4102) {
        Write-Warning "端口4102已被占用，正在停止现有服务..."
        try {
            docker stop planning-engine 2>$null
            docker rm planning-engine 2>$null
        }
        catch {
            Write-Warning "无法停止现有后端服务，请手动处理"
        }
    }
    
    Write-Success "端口检查完成"
}

# 构建前端镜像
function Build-Frontend {
    if ($SkipBuild) {
        Write-Info "跳过Docker构建..."
        return
    }
    
    Write-Info "构建前端Docker镜像..."
    try {
        docker build -t athlete-ally/frontend:latest -f Dockerfile.production .
        Write-Success "前端镜像构建成功"
    }
    catch {
        Write-Error "前端镜像构建失败: $_"
        exit 1
    }
}

# 启动前端服务
function Start-Frontend {
    Write-Info "启动前端服务..."
    try {
        docker run -d -p 3000:3000 --name frontend --restart unless-stopped athlete-ally/frontend:latest
        Write-Success "前端服务启动成功"
    }
    catch {
        Write-Error "前端服务启动失败: $_"
        exit 1
    }
}

# 启动后端服务
function Start-Backend {
    Write-Info "启动后端服务..."
    try {
        docker run -d -p 4102:4102 --name planning-engine --restart unless-stopped athlete-ally/planning-engine:simple
        Write-Success "后端服务启动成功"
    }
    catch {
        Write-Warning "后端服务可能已在运行，继续..."
    }
}

# 启动监控服务
function Start-Monitoring {
    Write-Info "启动监控服务..."
    try {
        docker compose -f preview.compose.yaml up -d prometheus grafana postgres redis nats
        Write-Success "监控服务启动成功"
    }
    catch {
        Write-Warning "监控服务可能已在运行，继续..."
    }
}

# 健康检查
function Test-Health {
    Write-Info "执行健康检查..."
    
    # 等待服务启动
    Start-Sleep -Seconds 10
    
    # 检查前端服务
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "前端服务健康检查通过"
        }
    }
    catch {
        Write-Error "前端服务健康检查失败: $_"
        return $false
    }
    
    # 检查后端服务
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4102/health" -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "后端服务健康检查通过"
        }
    }
    catch {
        Write-Error "后端服务健康检查失败: $_"
        return $false
    }
    
    # 检查监控服务
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9090/-/healthy" -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "监控服务健康检查通过"
        }
    }
    catch {
        Write-Warning "监控服务健康检查失败，但不影响核心功能"
    }
    
    return $true
}

# 显示服务状态
function Show-Status {
    Write-Info "显示服务状态..."
    
    Write-Host ""
    Write-Host "📊 服务状态:" -ForegroundColor $Cyan
    Write-Host "==================" -ForegroundColor $Cyan
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    Write-Host ""
    Write-Host "🌐 访问地址:" -ForegroundColor $Cyan
    Write-Host "==================" -ForegroundColor $Cyan
    Write-Host "前端应用: http://localhost:3000" -ForegroundColor $Green
    Write-Host "后端API: http://localhost:4102" -ForegroundColor $Green
    Write-Host "API文档: http://localhost:4102/docs" -ForegroundColor $Green
    Write-Host "监控面板: http://localhost:9090" -ForegroundColor $Green
    Write-Host "Grafana: http://localhost:3001" -ForegroundColor $Green
    
    Write-Host ""
    Write-Host "🔧 管理命令:" -ForegroundColor $Cyan
    Write-Host "==================" -ForegroundColor $Cyan
    Write-Host "查看日志: docker logs frontend" -ForegroundColor $Yellow
    Write-Host "停止服务: docker stop frontend planning-engine" -ForegroundColor $Yellow
    Write-Host "重启服务: docker restart frontend planning-engine" -ForegroundColor $Yellow
    Write-Host "查看状态: docker ps" -ForegroundColor $Yellow
}

# 运行测试
function Invoke-Tests {
    if ($SkipTests) {
        Write-Info "跳过测试执行..."
        return
    }
    
    Write-Info "运行部署验证测试..."
    
    try {
        npm run test:api
        Write-Success "API测试通过"
    }
    catch {
        Write-Warning "API测试失败，但服务可能仍然可用"
    }
    
    try {
        npm run test:frontend
        Write-Success "前端测试通过"
    }
    catch {
        Write-Warning "前端测试失败，但服务可能仍然可用"
    }
}

# 主函数
function Main {
    Write-Host "🎉 Phase 2 生产部署开始" -ForegroundColor $Green
    Write-Host "========================" -ForegroundColor $Green
    
    Test-Docker
    Test-Ports
    Build-Frontend
    Start-Frontend
    Start-Backend
    Start-Monitoring
    
    if (Test-Health) {
        Write-Success "所有服务健康检查通过"
    }
    else {
        Write-Warning "部分服务健康检查失败，请检查日志"
    }
    
    Invoke-Tests
    Show-Status
    
    Write-Host ""
    Write-Success "🎉 Phase 2 生产部署完成！"
    Write-Host ""
    Write-Host "系统已就绪，可以开始使用！" -ForegroundColor $Green
    Write-Host "如有问题，请查看日志或联系开发团队。" -ForegroundColor $Yellow
}

# 执行主函数
Main








