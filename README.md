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

## NATS JetStream 配置

### Stream Mode 配置
Athlete Ally 支持两种流模式：

- **Single Mode** (`EVENT_STREAM_MODE=single`): 使用传统单流拓扑 `ATHLETE_ALLY_EVENTS`
- **Multi Mode** (`EVENT_STREAM_MODE=multi`): 使用现代多流拓扑，首选 `AA_CORE_HOT`，回退到 `ATHLETE_ALLY_EVENTS`

### 流候选表
| Mode | 首选流 | 回退流 |
|------|--------|--------|
| single | `ATHLETE_ALLY_EVENTS` | - |
| multi | `AA_CORE_HOT` | `ATHLETE_ALLY_EVENTS` |

### 服务管理标志
- `FEATURE_SERVICE_MANAGES_STREAMS`: 服务是否管理流创建（默认: true）
- `FEATURE_SERVICE_MANAGES_CONSUMERS`: 服务是否管理消费者创建（默认: true）

### 诊断工具
- `scripts/nats/stream-info.js`: 流和消费者信息诊断
- `scripts/test-multi-mode-fallback.js`: 多模式回退验证

### DLQ 配置
详见 `services/normalize-service/src/__tests__/dlq.test.ts` 和相关 runbook。

### Multi-Mode Fallback 验证（无需创建流）

验证多模式回退行为，无需创建新流：

```bash
# 测试单模式
EVENT_STREAM_MODE=single node scripts/test-multi-mode-fallback.js

# 测试多模式回退
EVENT_STREAM_MODE=multi node scripts/test-multi-mode-fallback.js
```

**预期日志**：
- 单模式：直接绑定到 `ATHLETE_ALLY_EVENTS`
- 多模式：尝试 `AA_CORE_HOT` → 回退到 `ATHLETE_ALLY_EVENTS`

**故障排查**：
- 确保 NATS 运行在 `nats://localhost:4223`
- 检查 `ATHLETE_ALLY_EVENTS` 流是否存在
- 验证消费者 `normalize-hrv-durable` 状态

## 快速启动

### 环境要求
- Node.js 20.18.0 LTS
- npm 10.9.3
- Docker & Docker Compose

### Docker Compose 配置
- **本地开发**: 使用 [`docker-compose/preview.yml`](docker-compose/preview.yml) 进行端口绑定，支持环境变量端口重映射
- **CI环境**: 使用 [`docker-compose/ci-standalone.yml`](docker-compose/ci-standalone.yml) 进行完全隔离，无端口绑定
- **未来计划**: 将迁移到Docker Compose profiles方案（local vs ci）

### 环境变量
- `POSTGRES_PORT`: PostgreSQL端口（默认5432）
- `REDIS_PORT`: Redis端口（默认6379）
- `NATS_PORT`: NATS端口（默认4222）

### CI/CD 工作流程
- **V3 Test**: 验证核心功能，使用独立CI Compose
- **Deploy**: 生产环境部署，Node 20 + npm ci
- **Action Lint**: 工作流程质量检查，阻止@master使用
- 工作流目录一览: `.github/workflows/`（查看 `deploy.yml`, `v3-test-first.yml`, `backend-deploy.yml`）

### 测试框架

#### Jest配置
- 使用Jest 29.7.0作为唯一测试框架
- jsdom环境用于前端组件测试
- Node环境用于后端服务测试
- 导入Jest API：`import { describe, it, expect, jest } from '@jest/globals'`

#### 运行测试
```bash
# 所有测试
npm run test

# 特定服务
npm run test -- services/planning-engine/

# 前端测试
npm run test -- apps/frontend/tests/
```

#### ESLint规则
- 禁止在测试文件中导入vitest
- 使用@jest/globals替代全局类型

#### 统一别名策略
- tsconfig.base.json作为路径解析的唯一来源
- Jest moduleNameMapper从tsconfig.base.json派生

### Git Hooks（开发者体验）
- 仓库已提供自定义Git Hooks目录：`.githooks/`（本仓库`core.hooksPath = .githooks`）
- 启用命令：`npm run hooks:enable`
- 本地启用（如未启用）：
  - `npm run hooks:enable`
  - 或手动：`git config core.hooksPath .githooks`
- 预提交（pre-commit）会阻止将构建产物（如 `.next/`、`dist/`、`coverage/` 等）提交到仓库。

### 重要说明
- 不要提交 `.env*` 文件到版本控制
- CI环境使用独立网络，无主机端口绑定
- 本地开发可以通过环境变量重映射端口
- 所有Docker Compose操作使用项目级隔离

### 开发环境
```bash
# 安装依赖
npm install

# 检查端口可用性
npm run check-ports

# 启动基础设施服务
npm run infra:up

# 启动开发环境
npm run dev

# 停止基础设施服务
npm run infra:down
```

### 基础设施管理
```bash
# 启动基础设施服务 (PostgreSQL, Redis, NATS)
npm run infra:up

# 停止基础设施服务
npm run infra:down

# 检查端口可用性
npm run check-ports 5432 6379 4222

# 清理基础设施服务 (仅开发环境，会删除所有数据)
npm run infra:clean
```

### 环境变量配置
复制 `env.example` 为 `.env` 并配置关键变量：
- `POSTGRES_PORT`: PostgreSQL端口（默认5432）
- `REDIS_PORT`: Redis端口（默认6379）
- `NATS_PORT`: NATS端口（默认4222）
- `SNYK_TOKEN`: Snyk安全扫描令牌（可选）

### 生产部署
```bash
# 构建所有服务
npm run build:all

# 启动生产环境
docker compose -f docker-compose/preview.yml up -d
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

- [文档索引 (Docs Index)](docs/README.md)
- [用户指南](docs/USER_GUIDE.md)
- [技术文档](docs/TECHNICAL_DOCS.md)
- [Phase 3 计划](docs/PHASE_3_PLAN.md)
- [Planning Engine 文档](services/planning-engine/README.md)

## Developer Guides & Decisions

- Prisma Engines Mirror (CI Reliability): docs/ci/prisma-engines-mirror.md
- RFC: Monorepo Tooling Upgrade (Turbo-first, Nx evaluation): docs/rfcs/2025-09-monorepo-tooling-upgrade.md

### Phase 2: Multi-Stream NATS Migration

**Full Runbook**: [docs/PHASE2_RUNBOOK.md](docs/PHASE2_RUNBOOK.md)

**Environment Variables**:
- `EVENT_STREAM_MODE`: Controls stream topology (`single` = ATHLETE_ALLY_EVENTS, `multi` = 3-stream architecture)
- `AA_STREAM_CANDIDATES`: Comma-separated stream names for consumer binding fallback (e.g., `AA_CORE_HOT,ATHLETE_ALLY_EVENTS`)
- `HRV_DURABLE`: Durable consumer name for HRV processing (default: `normalize-hrv-durable`)

**Dead Letter Queue**: Failed messages route to `dlq.normalize.hrv.raw-received.*` subjects on `AA_DLQ` stream.

**Metrics Labels**: All counters include `{stream, durable, subject, result}` for observability during migration.

## 开发指南

### 代码规范
- 使用 TypeScript
- 遵循 ESLint 配置
- 编写单元测试
- 提交前运行 `npm run lint`

### 数据库迁移
```bash
# 生成Prisma客户端
npx turbo run db:generate

# 运行数据库迁移
npx turbo run db:migrate
```

## 许可证

MIT License
# Test trigger
# Trigger lockfile rehydrate
