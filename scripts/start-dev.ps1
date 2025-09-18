# 🚀 Athlete Ally 开发环境启动脚本 (PowerShell版本)
# 作者: 后端团队
# 版本: 1.0.0

param(
    [switch]$SkipChecks,
    [switch]$BuildOnly
)

# 设置错误处理
$ErrorActionPreference = "Stop"

Write-Host "🏃‍♂️ 启动 Athlete Ally 开发环境..." -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue

# 检查Node版本
Write-Host "📋 检查环境要求..." -ForegroundColor Blue
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js 未安装" -ForegroundColor Red
    exit 1
}

# 检查Docker
try {
    docker --version | Out-Null
    docker-compose --version | Out-Null
    Write-Host "✅ Docker 环境就绪" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker 或 Docker Compose 未安装" -ForegroundColor Red
    exit 1
}

# 1. 检查端口冲突
if (-not $SkipChecks) {
    Write-Host "🔍 检查端口冲突..." -ForegroundColor Blue
    try {
        npm run check-ports
    } catch {
        Write-Host "⚠️  端口检查失败，继续启动..." -ForegroundColor Yellow
    }
}

# 2. 安装依赖
Write-Host "📦 安装项目依赖..." -ForegroundColor Blue
npm install

# 3. 启动基础设施服务
Write-Host "🐳 启动基础设施服务..." -ForegroundColor Blue
docker-compose -f preview.compose.yaml up -d postgres redis nats

# 4. 等待基础设施就绪
Write-Host "⏳ 等待基础设施启动..." -ForegroundColor Blue
Start-Sleep -Seconds 15

# 检查PostgreSQL连接
Write-Host "🔗 检查数据库连接..." -ForegroundColor Blue
$maxRetries = 30
$retryCount = 0
do {
    try {
        docker-compose -f preview.compose.yaml exec postgres pg_isready -U athlete -d athlete | Out-Null
        Write-Host "✅ PostgreSQL 就绪" -ForegroundColor Green
        break
    } catch {
        $retryCount++
        if ($retryCount -ge $maxRetries) {
            Write-Host "❌ PostgreSQL 启动超时" -ForegroundColor Red
            exit 1
        }
        Write-Host "⏳ 等待PostgreSQL启动... ($retryCount/$maxRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
} while ($retryCount -lt $maxRetries)

# 检查Redis连接
Write-Host "🔗 检查Redis连接..." -ForegroundColor Blue
$retryCount = 0
do {
    try {
        docker-compose -f preview.compose.yaml exec redis redis-cli ping | Out-Null
        Write-Host "✅ Redis 就绪" -ForegroundColor Green
        break
    } catch {
        $retryCount++
        if ($retryCount -ge $maxRetries) {
            Write-Host "❌ Redis 启动超时" -ForegroundColor Red
            exit 1
        }
        Write-Host "⏳ 等待Redis启动... ($retryCount/$maxRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
} while ($retryCount -lt $maxRetries)

# 5. 生成Prisma客户端
Write-Host "🔧 生成Prisma客户端..." -ForegroundColor Blue
try {
    npm run db:generate
} catch {
    Write-Host "⚠️  Prisma客户端生成失败，继续启动..." -ForegroundColor Yellow
}

# 6. 启动微服务
if ($BuildOnly) {
    Write-Host "🔨 仅构建服务..." -ForegroundColor Blue
    docker-compose -f preview.compose.yaml build
} else {
    Write-Host "🚀 启动微服务..." -ForegroundColor Blue
    Write-Host "✅ 环境启动完成！" -ForegroundColor Green
    Write-Host "📱 前端: http://localhost:3000" -ForegroundColor Blue
    Write-Host "🔌 网关: http://localhost:4000" -ForegroundColor Blue
    Write-Host "📊 监控: http://localhost:9090 (Prometheus)" -ForegroundColor Blue
    Write-Host "📈 仪表板: http://localhost:3001 (Grafana)" -ForegroundColor Blue
    
    # 启动所有服务
    docker-compose -f preview.compose.yaml up --build
}
