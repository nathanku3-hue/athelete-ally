#!/bin/bash
# 启动基础设施服务脚本 (Bash版本)
# 用于Linux/macOS本地开发环境
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
#   ./scripts/infra-up.sh

set -e  # 遇到错误时退出

echo "🚀 Starting infrastructure services..."

# 检查端口可用性
echo "🔍 Checking port availability..."
if ! npm run check-ports 5432 6379 4222; then
  echo "❌ Port check failed. Trying alternative ports..."
  if ! npm run check-ports 5433 6380 4222; then
    echo "❌ Alternative ports also failed."
    echo "💡 Manual steps required:"
    echo "   1. Project-scoped cleanup:"
    echo "      docker compose -f ./preview.compose.yaml down -v --remove-orphans"
    echo "   2. Use alternative ports:"
    echo "      POSTGRES_PORT=5434 REDIS_PORT=6381 npm run infra:up"
    echo "   3. Check system services (last resort):"
    echo "      systemctl status postgresql redis"
    echo "   4. Manual process termination (last resort):"
    echo "      sudo kill -9 <process_id>"
    exit 1
  else
    echo "✅ Using alternative ports: 5433, 6380, 4222"
    export POSTGRES_PORT=5433
    export REDIS_PORT=6380
    export NATS_PORT=4222
  fi
fi

# 启动服务
./scripts/docker-utils.sh start

echo "✅ Infrastructure services started"
echo "📊 Service status:"
./scripts/docker-utils.sh status
