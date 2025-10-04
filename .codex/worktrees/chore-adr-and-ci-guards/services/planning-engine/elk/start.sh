#!/bin/bash
# ELK Stack 启动脚本

echo "🚀 启动ELK Stack..."

# 创建日志目录
mkdir -p /var/log/planning-engine
mkdir -p /var/log/monitoring

# 启动ELK Stack
cd elk
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

# 创建索引
echo "📊 创建Elasticsearch索引..."
curl -X PUT "localhost:9200/planning-engine" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "refresh_interval": "5s"
  }
}'

curl -X PUT "localhost:9200/monitoring" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "refresh_interval": "1s"
  }
}'

echo "✅ ELK Stack 启动完成！"
echo "📊 Kibana: http://localhost:5601"
echo "🔍 Elasticsearch: http://localhost:9200"
