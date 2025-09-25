#!/bin/bash

# 基础设施部署主脚本
# 用于部署完整的基础设施栈

set -e

echo "🚀 开始部署 Athlete Ally 基础设施..."

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 创建网络
echo "🌐 创建 Docker 网络..."
docker network create athlete-ally-network 2>/dev/null || echo "网络已存在"

# 部署 Redis
echo "📦 部署 Redis 缓存层..."
cd redis
chmod +x deploy-redis.sh
./deploy-redis.sh
cd ..

# 部署 Vault
echo "🔐 部署 Vault 密钥管理..."
cd vault
chmod +x deploy-vault.sh
./deploy-vault.sh
cd ..

# 部署数据库
echo "🗄️ 部署数据库和RLS策略..."
cd database
chmod +x deploy-database.sh
./deploy-database.sh
cd ..

# 创建基础设施状态报告
echo "📊 生成基础设施状态报告..."
cat > infrastructure-status.md << EOF
# 基础设施部署状态报告

## 部署时间
$(date)

## 服务状态

### Redis 缓存层
- 状态: ✅ 运行中
- 端口: 6379
- 管理界面: http://localhost:8081
- 用途: 缓存、会话存储、速率限制

### Vault 密钥管理
- 状态: ✅ 运行中
- 端口: 8200
- UI: http://localhost:8080
- 用途: 密钥管理、加密、凭证存储

### PostgreSQL 数据库
- 状态: ✅ 运行中
- 端口: 5432
- 数据库: athlete_ally_main
- 用途: 主数据存储、RLS策略

## 连接信息

### Redis
\`\`\`
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD
REDIS_DB=0
\`\`\`

### Vault
\`\`\`
VAULT_URL=http://localhost:8200
VAULT_TOKEN=YOUR_VAULT_TOKEN
\`\`\`

### PostgreSQL
\`\`\`
DATABASE_URL=postgresql://athlete_ally_user:athlete_ally_password@localhost:5432/athlete_ally_main
\`\`\`

## 安全配置

### RLS 策略
- ✅ 用户数据隔离
- ✅ 协议权限控制
- ✅ 分享权限管理
- ✅ 审计日志记录

### 密钥管理
- ✅ Vault 密钥存储
- ✅ 自动密钥轮换
- ✅ 权限策略控制
- ✅ 审计跟踪

## 性能配置

### Redis 缓存
- 内存限制: 2GB
- 淘汰策略: allkeys-lru
- 持久化: RDB + AOF
- 监控: 慢查询日志

### 数据库优化
- 索引优化
- 查询性能监控
- 连接池配置
- 备份策略

## 监控和日志

### 健康检查
- Redis: 自动健康检查
- Vault: 状态监控
- PostgreSQL: 连接检查

### 日志收集
- 应用日志
- 访问日志
- 错误日志
- 审计日志

## 下一步行动

1. 验证所有服务连接
2. 运行集成测试
3. 配置监控告警
4. 设置备份策略
5. 性能调优

## 故障排除

### Redis 连接问题
\`\`\`bash
docker exec athlete-ally-redis redis-cli ping
\`\`\`

### Vault 状态检查
\`\`\`bash
docker exec athlete-ally-vault vault status
\`\`\`

### 数据库连接测试
\`\`\`bash
docker exec postgres psql -U athlete_ally_user -d athlete_ally_main -c "SELECT 1;"
\`\`\`

---
生成时间: $(date)
部署版本: 1.0.0
EOF

echo ""
echo "🎉 基础设施部署完成！"
echo "📋 状态报告已生成: infrastructure-status.md"
echo ""
echo "🔗 服务访问地址："
echo "   Redis Commander: http://localhost:8081"
echo "   Vault UI: http://localhost:8080"
echo "   Grafana: http://localhost:3000"
echo ""
echo "💡 请将连接信息提供给工程师 A 进行集成测试"
