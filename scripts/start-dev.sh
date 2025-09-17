#!/bin/bash

# 🚀 Athlete Ally 开发环境启动脚本
# 作者: 后端团队
# 版本: 1.0.0

set -e  # 遇到错误立即退出

echo "🏃‍♂️ 启动 Athlete Ally 开发环境..."
echo "=================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查Node版本
echo -e "${BLUE}📋 检查环境要求...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装${NC}"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js 版本: $NODE_VERSION${NC}"

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose 未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker 环境就绪${NC}"

# 1. 检查端口冲突
echo -e "${BLUE}🔍 检查端口冲突...${NC}"
npm run check-ports || {
    echo -e "${YELLOW}⚠️  端口检查失败，继续启动...${NC}"
}

# 2. 安装依赖
echo -e "${BLUE}📦 安装项目依赖...${NC}"
npm install

# 3. 启动基础设施服务
echo -e "${BLUE}🐳 启动基础设施服务...${NC}"
docker-compose -f preview.compose.yaml up -d postgres redis nats

# 4. 等待基础设施就绪
echo -e "${BLUE}⏳ 等待基础设施启动...${NC}"
sleep 15

# 检查PostgreSQL连接
echo -e "${BLUE}🔗 检查数据库连接...${NC}"
until docker-compose -f preview.compose.yaml exec postgres pg_isready -U athlete -d athlete; do
    echo -e "${YELLOW}⏳ 等待PostgreSQL启动...${NC}"
    sleep 2
done
echo -e "${GREEN}✅ PostgreSQL 就绪${NC}"

# 检查Redis连接
echo -e "${BLUE}🔗 检查Redis连接...${NC}"
until docker-compose -f preview.compose.yaml exec redis redis-cli ping; do
    echo -e "${YELLOW}⏳ 等待Redis启动...${NC}"
    sleep 2
done
echo -e "${GREEN}✅ Redis 就绪${NC}"

# 5. 生成Prisma客户端
echo -e "${BLUE}🔧 生成Prisma客户端...${NC}"
npm run db:generate || {
    echo -e "${YELLOW}⚠️  Prisma客户端生成失败，继续启动...${NC}"
}

# 6. 启动微服务
echo -e "${BLUE}🚀 启动微服务...${NC}"
echo -e "${GREEN}✅ 环境启动完成！${NC}"
echo -e "${BLUE}📱 前端: http://localhost:3000${NC}"
echo -e "${BLUE}🔌 网关: http://localhost:4000${NC}"
echo -e "${BLUE}📊 监控: http://localhost:9090 (Prometheus)${NC}"
echo -e "${BLUE}📈 仪表板: http://localhost:3001 (Grafana)${NC}"

# 启动所有服务
docker-compose -f preview.compose.yaml up --build
