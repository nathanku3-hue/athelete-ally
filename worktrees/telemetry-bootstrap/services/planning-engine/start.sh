#!/bin/bash
# 启动脚本

set -e

echo "🚀 Starting Athlete Ally Planning Engine..."

# 检查环境变量
if [ -z "$OPENAI_API_KEY" ] && [ "$NODE_ENV" = "production" ]; then
    echo "❌ Error: OPENAI_API_KEY environment variable is required for production"
    exit 1
fi

# 检查依赖服务
echo "🔍 Checking dependencies..."

# 检查PostgreSQL
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL is not running. Starting with Docker Compose..."
    docker-compose up -d postgres redis nats
    sleep 10
fi

# 运行数据库迁移
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# 启动服务
echo "▶️  Starting Planning Engine..."
if [ "$NODE_ENV" = "production" ]; then
    npm run build
    npm start
else
    npm run dev:full
fi
