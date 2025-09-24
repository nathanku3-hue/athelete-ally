#!/bin/bash
# 清理基础设施服务脚本 (仅开发使用)
# ⚠️  警告: 此脚本会删除所有Docker数据，仅用于开发环境
# ⚠️  警告: 不要在CI或共享运行器上运行此脚本

echo "🧹 Cleaning infrastructure services (DEV ONLY)..."
echo "⚠️  This will remove all Docker data!"

# 确认操作
read -p "Are you sure you want to clean all Docker data? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled"
    exit 1
fi

# 停止并删除容器
./scripts/docker-utils.sh stop

# 清理Docker系统 (仅开发环境)
docker system prune -f

echo "✅ Infrastructure services cleaned"
echo "💡 Run 'npm run infra:up' to restart services"
