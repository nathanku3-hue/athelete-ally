# 技术文档

## 系统架构

### 前端架构
- Next.js 15 + TypeScript
- Tailwind CSS + Radix UI
- Zustand + React Query
- PWA支持

### 后端架构
- Express.js + Node.js
- PostgreSQL + Redis + NATS
- Prometheus + Grafana
- Docker容器化

## API文档

### 健康检查
- GET /api/health - 系统健康状态

### 训练计划
- GET /api/v1/plans/current - 获取当前计划
- POST /api/v1/plans/generate - 生成新计划

### 疲劳度评估
- GET /api/v1/fatigue/status - 获取疲劳状态
- POST /api/v1/fatigue/assess - 提交评估

## 部署指南

### 开发环境
```bash
npm run dev
```

### 生产环境
```bash
docker compose -f preview.compose.yaml up -d
```

### 监控
- Grafana: http://localhost:3001
- Prometheus: http://localhost:9090
