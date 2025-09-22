#!/bin/bash
# scripts/verify-ci-config.sh - CI配置验证脚本

echo "🔍 Verifying CI configuration..."

# 渲染最终配置
docker compose -f ./preview.compose.yaml -f ./docker-compose.ci.yml config > final-config.yml

# 检查端口配置
if grep -q '^\s*ports:' final-config.yml; then
  echo "❌ Ports still present in CI config:"
  grep -n '^\s*ports:' final-config.yml
  exit 1
else
  echo "✅ No ports found in CI config - isolation working"
fi

# 测试CI环境隔离
echo "🧪 Testing CI environment isolation..."
docker compose -p test_ci_12345 -f ./preview.compose.yaml -f ./docker-compose.ci.yml up -d postgres redis nats

# 检查服务状态
docker compose -p test_ci_12345 -f ./preview.compose.yaml ps

# 测试服务连通性
docker compose -p test_ci_12345 -f ./preview.compose.yaml exec redis redis-cli ping
docker compose -p test_ci_12345 -f ./preview.compose.yaml exec postgres pg_isready -U athlete

# 清理测试环境
docker compose -p test_ci_12345 -f ./preview.compose.yaml down -v --remove-orphans

echo "✅ CI configuration verification complete"
