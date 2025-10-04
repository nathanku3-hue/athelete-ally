#!/bin/bash
# 🚀 生产环境部署脚本
# 用于部署Planning Engine到生产环境

echo "🚀 Starting production deployment for Planning Engine..."

# 检查必需的环境变量
required_vars=("OPENAI_API_KEY" "DB_PASSWORD" "JWT_SECRET" "CORS_ORIGIN")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var environment variable is required"
        exit 1
    fi
done

# 设置生产环境
export NODE_ENV=production

# 创建必要的目录
mkdir -p logs
mkdir -p backups

# 构建Docker镜像
echo "🔨 Building production Docker image..."
docker build -t athlete-ally/planning-engine:latest -f Dockerfile.optimized .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

# 停止现有容器
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.production.yml down

# 启动生产服务
echo "▶️ Starting production services..."
docker-compose -f docker-compose.production.yml up -d

# 等待服务启动
echo "⏳ Waiting for services to start..."
sleep 60

# 健康检查
echo "🏥 Performing health checks..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:4102/health > /dev/null 2>&1; then
        echo "✅ Planning Engine is healthy"
        break
    else
        echo "⏳ Attempt $attempt/$max_attempts: Waiting for Planning Engine to be ready..."
        sleep 10
        ((attempt++))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ Planning Engine health check failed after $max_attempts attempts"
    echo "📋 Checking container logs..."
    docker-compose -f docker-compose.production.yml logs planning-engine
    exit 1
fi

# 运行数据库迁移
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.production.yml exec -T planning-engine npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "❌ Database migration failed"
    exit 1
fi

# 验证部署
echo "✅ Verifying deployment..."

# 测试健康检查端点
if curl -f http://localhost:4102/health > /dev/null 2>&1; then
    echo "✅ Health check endpoint working"
else
    echo "❌ Health check endpoint failed"
    exit 1
fi

# 测试详细健康检查端点
if curl -f http://localhost:4102/health/detailed > /dev/null 2>&1; then
    echo "✅ Detailed health check endpoint working"
else
    echo "❌ Detailed health check endpoint failed"
    exit 1
fi

# 测试指标端点
if curl -f http://localhost:4102/metrics > /dev/null 2>&1; then
    echo "✅ Metrics endpoint working"
else
    echo "❌ Metrics endpoint failed"
    exit 1
fi

# 测试API文档端点
if curl -f http://localhost:4102/api/docs > /dev/null 2>&1; then
    echo "✅ API docs endpoint working"
else
    echo "❌ API docs endpoint failed"
    exit 1
fi

# 显示服务状态
echo "📊 Service Status:"
docker-compose -f docker-compose.production.yml ps

echo ""
echo "🎉 Production deployment completed successfully!"
echo ""
echo "🔗 Service URLs:"
echo "   Health Check: http://localhost:4102/health"
echo "   Detailed Health: http://localhost:4102/health/detailed"
echo "   API Docs: http://localhost:4102/api/docs"
echo "   Metrics: http://localhost:4102/metrics"
echo "   Prometheus: http://localhost:9090"
echo "   Grafana: http://localhost:3000"
echo ""
echo "📋 Useful Commands:"
echo "   View logs: docker-compose -f docker-compose.production.yml logs -f"
echo "   Stop services: docker-compose -f docker-compose.production.yml down"
echo "   Restart services: docker-compose -f docker-compose.production.yml restart"
echo "   Scale planning-engine: docker-compose -f docker-compose.production.yml up -d --scale planning-engine=3"
