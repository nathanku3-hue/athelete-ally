# Athlete Ally

## 概述
Athlete Ally 是一个AI驱动的运动训练平台，提供个性化的训练计划生成、优化和管理服务。

## 项目结构

```
athlete-ally/
├── apps/                    # 前端应用
│   └── gateway-bff/        # API网关
├── services/               # 后端服务
│   ├── planning-engine/    # 训练计划引擎
│   ├── profile-onboarding/ # 用户档案
│   ├── exercises/          # 运动数据库
│   └── fatigue/            # 疲劳管理
├── packages/               # 共享包
│   ├── shared/            # 共享工具
│   ├── contracts/         # API合约
│   └── protocol-types/    # 协议类型
├── monitoring/             # 监控配置
├── docs/                   # 项目文档
└── infrastructure/         # 基础设施
```

## 快速启动

### 开发环境
```bash
# 安装依赖
npm install

# 启动开发环境
npm run dev

# 启动ELK Stack
cd services/planning-engine/elk
docker compose up -d
```

### 生产部署
```bash
# 构建所有服务
npm run build:all

# 启动生产环境
docker compose -f docker-compose.production.yml up -d
```

## 核心功能

- **训练计划生成**: AI驱动的个性化训练计划
- **用户档案管理**: 完整的用户信息和偏好设置
- **运动数据库**: 丰富的运动动作库
- **疲劳管理**: 智能的疲劳监测和恢复建议
- **日志监控**: 完整的ELK Stack日志管理
- **安全防护**: 企业级安全配置

## 技术栈

- **前端**: Next.js, React, TypeScript, Tailwind CSS
- **后端**: Node.js, Express, TypeScript
- **数据库**: PostgreSQL, Redis
- **消息队列**: NATS
- **监控**: ELK Stack, Prometheus, Grafana
- **容器化**: Docker, Docker Compose

## 访问地址

- **前端应用**: http://localhost:3000
- **API网关**: http://localhost:3001
- **Planning Engine**: http://localhost:4102
- **Kibana**: http://localhost:5601
- **Elasticsearch**: http://localhost:9200

## 文档

- [Phase 2 交付文档](docs/PHASE_2_DELIVERY.md)
- [用户指南](docs/USER_GUIDE.md)
- [技术文档](docs/TECHNICAL_DOCS.md)
- [Planning Engine 文档](services/planning-engine/README.md)

## 开发指南

### 代码规范
- 使用 TypeScript
- 遵循 ESLint 配置
- 编写单元测试
- 提交前运行 `npm run lint`

### 环境变量
复制 `env.example` 到 `.env` 并配置必要的环境变量。

### 数据库迁移
```bash
# 生成Prisma客户端
npx turbo run db:generate

# 运行数据库迁移
npx turbo run db:migrate
```

## 许可证

MIT License