#!/bin/bash

# 启动监控服务
echo "🚀 启动 Athlete Ally 监控服务..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 进入监控目录
cd "$(dirname "$0")/../monitoring"

# 启动监控服务
echo "📊 启动 Prometheus, Jaeger, Grafana..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

# 显示访问信息
echo ""
echo "✅ 监控服务已启动！"
echo ""
echo "📊 访问地址："
echo "  - Jaeger UI: http://localhost:16686"
echo "  - Prometheus: http://localhost:9090"
echo "  - Grafana: http://localhost:3000 (admin/admin)"
echo ""
echo "🔧 服务端口："
echo "  - Jaeger Collector: localhost:14268"
echo "  - Prometheus: localhost:9090"
echo "  - Grafana: localhost:3000"
echo "  - Redis: localhost:6379"
echo "  - PostgreSQL: localhost:5432"
echo ""
echo "📝 使用说明："
echo "  1. 启动应用服务后，追踪数据会自动发送到 Jaeger"
echo "  2. 指标数据会自动发送到 Prometheus"
echo "  3. 在 Grafana 中查看可视化仪表板"
echo ""
echo "🛑 停止服务："
echo "  docker-compose down"

