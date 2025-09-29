#!/bin/bash
# Kibana仪表板导入脚本

echo "📊 开始导入Kibana仪表板..."

# 等待Kibana启动
echo "⏳ 等待Kibana启动..."
until curl -s http://localhost:5601/api/status; do
  echo "等待Kibana启动..."
  sleep 5
done

echo "✅ Kibana已启动"

# 导入索引模式
echo "📋 导入索引模式..."
curl -X POST "http://localhost:5601/api/saved_objects/_import" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  --data-binary @dashboards/index-patterns.json

# 导入搜索配置
echo "🔍 导入搜索配置..."
curl -X POST "http://localhost:5601/api/saved_objects/_import" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  --data-binary @dashboards/searches.json

# 导入可视化图表
echo "📈 导入可视化图表..."
curl -X POST "http://localhost:5601/api/saved_objects/_import" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  --data-binary @dashboards/visualizations.json

# 导入仪表板
echo "📊 导入仪表板..."
curl -X POST "http://localhost:5601/api/saved_objects/_import" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  --data-binary @dashboards/planning-engine-dashboard.json

curl -X POST "http://localhost:5601/api/saved_objects/_import" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  --data-binary @dashboards/monitoring-dashboard.json

curl -X POST "http://localhost:5601/api/saved_objects/_import" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  --data-binary @dashboards/security-dashboard.json

echo "✅ Kibana仪表板导入完成！"
echo "📊 访问地址: http://localhost:5601"
