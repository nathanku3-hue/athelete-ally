#!/bin/bash

# Redis 部署脚本
# 用于部署生产级 Redis 缓存层

set -e

echo "🚀 开始部署 Redis 缓存层..."

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 创建必要的目录
echo "📁 创建 Redis 数据目录..."
mkdir -p ./data/redis
mkdir -p ./logs/redis

# 设置权限
chmod 755 ./data/redis
chmod 755 ./logs/redis

# 生成 Redis 密码
if [ -z "$REDIS_PASSWORD" ]; then
    REDIS_PASSWORD=$(openssl rand -base64 32)
    echo "🔐 生成 Redis 密码: $REDIS_PASSWORD"
    echo "REDIS_PASSWORD=$REDIS_PASSWORD" > .env.redis
fi

# 更新配置文件中的密码
sed -i "s/YOUR_REDIS_PASSWORD/$REDIS_PASSWORD/g" redis.conf
sed -i "s/YOUR_REDIS_PASSWORD/$REDIS_PASSWORD/g" docker-compose.redis.yml

# 停止现有容器
echo "🛑 停止现有 Redis 容器..."
docker-compose -f docker-compose.redis.yml down || true

# 启动 Redis 服务
echo "🐳 启动 Redis 服务..."
docker-compose -f docker-compose.redis.yml up -d

# 等待 Redis 启动
echo "⏳ 等待 Redis 启动..."
sleep 10

# 检查 Redis 健康状态
echo "🔍 检查 Redis 健康状态..."
if docker exec athlete-ally-redis redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis 启动成功！"
else
    echo "❌ Redis 启动失败！"
    exit 1
fi

# 显示连接信息
echo ""
echo "📋 Redis 连接信息："
echo "   主机: localhost"
echo "   端口: 6379"
echo "   密码: $REDIS_PASSWORD"
echo "   数据库: 0"
echo ""
echo "🌐 Redis Commander (管理界面):"
echo "   URL: http://localhost:8081"
echo "   用户名: admin"
echo "   密码: admin"
echo ""

# 运行 Redis 基准测试
echo "🧪 运行 Redis 基准测试..."
docker exec athlete-ally-redis redis-cli --latency-history -i 1 > /dev/null 2>&1 &
BENCHMARK_PID=$!
sleep 5
kill $BENCHMARK_PID 2>/dev/null || true

# 显示 Redis 信息
echo "📊 Redis 服务器信息："
docker exec athlete-ally-redis redis-cli info server | head -10

echo ""
echo "🎉 Redis 部署完成！"
echo "💡 提示：请将 Redis 连接信息提供给工程师 A"
