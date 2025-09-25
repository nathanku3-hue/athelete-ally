#!/bin/bash

# 数据库部署脚本
# 用于部署生产级数据库和RLS策略

set -e

echo "🗄️ 开始部署数据库基础设施..."

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 检查 PostgreSQL 是否运行
if ! docker ps | grep -q postgres; then
    echo "🐳 启动 PostgreSQL 数据库..."
    docker-compose -f ../preview.compose.yaml up -d postgres
    sleep 10
fi

# 等待数据库启动
echo "⏳ 等待数据库启动..."
until docker exec postgres pg_isready -U athlete -d athlete; do
  echo "等待数据库启动..."
  sleep 2
done

echo "✅ 数据库已启动"

# 创建数据库
echo "📁 创建数据库..."
docker exec postgres psql -U athlete -d athlete -c "
CREATE DATABASE IF NOT EXISTS athlete_ally_main;
CREATE DATABASE IF NOT EXISTS athlete_ally_config;
CREATE DATABASE IF NOT EXISTS athlete_ally_profiles;
CREATE DATABASE IF NOT EXISTS athlete_ally_plans;
CREATE DATABASE IF NOT EXISTS athlete_ally_fatigue;
CREATE DATABASE IF NOT EXISTS athlete_ally_notifications;
"

# 应用 RLS 策略
echo "🔒 应用 RLS 策略..."
docker exec -i postgres psql -U athlete -d athlete_ally_main < rls-policies.sql

# 创建数据库用户
echo "👤 创建数据库用户..."
docker exec postgres psql -U athlete -d athlete_ally_main -c "
CREATE USER IF NOT EXISTS athlete_ally_user WITH PASSWORD 'athlete_ally_password';
GRANT ALL PRIVILEGES ON DATABASE athlete_ally_main TO athlete_ally_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO athlete_ally_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO athlete_ally_user;
"

# 运行数据库迁移
echo "🔄 运行数据库迁移..."
if [ -f "../prisma/schema.prisma" ]; then
    echo "运行 Prisma 迁移..."
    npx prisma migrate deploy
fi

# 创建数据库备份
echo "💾 创建数据库备份..."
docker exec postgres pg_dump -U athlete -d athlete_ally_main > database-backup-$(date +%Y%m%d-%H%M%S).sql

# 显示数据库信息
echo ""
echo "📋 数据库连接信息："
echo "   主机: localhost"
echo "   端口: 5432"
echo "   用户: athlete_ally_user"
echo "   密码: athlete_ally_password"
echo "   数据库: athlete_ally_main"
echo ""

# 显示 RLS 状态
echo "🔒 RLS 策略状态："
docker exec postgres psql -U athlete -d athlete_ally_main -c "SELECT * FROM check_rls_status();"

# 运行权限测试
echo "🧪 运行权限测试..."
docker exec postgres psql -U athlete -d athlete_ally_main -c "
SELECT set_config('app.current_user_id', '11111111-1111-1111-1111-111111111111', true);
SELECT * FROM user_permissions LIMIT 5;
"

echo ""
echo "🎉 数据库部署完成！"
echo "💡 提示：请将数据库连接信息提供给工程师 A"
