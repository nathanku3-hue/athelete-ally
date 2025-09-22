# Planning Engine Service

## 概述
Planning Engine 是 Athlete Ally 的核心服务，负责训练计划的生成、优化和管理。

## 项目结构

```
planning-engine/
├── src/                    # 源代码
│   ├── events/            # 事件处理
│   ├── optimization/      # 优化算法
│   ├── cache/            # 缓存管理
│   ├── config/           # 配置管理
│   ├── middleware/       # 中间件
│   └── routes/           # API路由
├── elk/                  # ELK Stack配置
│   ├── docker-compose.yml
│   ├── filebeat/
│   ├── logstash/
│   └── kibana/
├── monitoring/           # 监控配置
├── security/            # 安全配置
├── scripts/             # 工具脚本
├── tests/               # 测试文件
├── docs/                # 文档
├── prisma/              # 数据库配置
├── dist/                # 编译输出
└── package.json
```

## 快速启动

### 开发环境
```bash
npm install
npm run dev
```

### ELK Stack
```bash
cd elk
docker compose up -d
```

### 生产部署
```bash
docker build -t planning-engine .
docker run -p 4102:4102 planning-engine
```

## 核心功能

- **训练计划生成**: AI驱动的个性化训练计划
- **性能优化**: 基于用户数据的计划调整
- **日志管理**: 完整的ELK Stack集成
- **安全防护**: 企业级安全配置
- **监控告警**: 实时系统监控

## API文档

- **健康检查**: `GET /health`
- **训练计划**: `GET /api/plans`
- **计划生成**: `POST /api/plans/generate`

## 环境变量

```bash
NODE_ENV=production
PLANNING_DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NATS_URL=nats://...
OPENAI_API_KEY=...
```

## 监控

- **Kibana**: http://localhost:5601
- **Elasticsearch**: http://localhost:9200
- **健康检查**: http://localhost:4102/health
