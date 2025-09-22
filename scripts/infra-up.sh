#!/bin/bash
# 启动基础设施服务脚本
# 用于本地开发环境

set -e  # 遇到错误时退出

echo "🚀 Starting infrastructure services..."

# 检查端口可用性
echo "🔍 Checking port availability..."
if ! npm run check-ports 5432 6379 4222; then
  echo "❌ Port check failed. Please resolve port conflicts first."
  exit 1
fi

# 启动服务
./scripts/docker-utils.sh start

echo "✅ Infrastructure services started"
echo "📊 Service status:"
./scripts/docker-utils.sh status
