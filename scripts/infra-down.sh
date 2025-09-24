#!/bin/bash
# 停止基础设施服务脚本
# 用于本地开发环境

set -e  # 遇到错误时退出

echo "🛑 Stopping infrastructure services..."

./scripts/docker-utils.sh stop

echo "✅ Infrastructure services stopped"
