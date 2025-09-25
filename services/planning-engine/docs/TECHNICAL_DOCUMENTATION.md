# Athlete Ally - Planning Engine 技术文档

## 📋 目录

1. [系统架构](#系统架构)
2. [API文档](#api文档)
3. [数据库设计](#数据库设计)
4. [部署指南](#部署指南)
5. [监控配置](#监控配置)
6. [安全配置](#安全配置)
7. [性能优化](#性能优化)
8. [故障排除](#故障排除)
9. [开发指南](#开发指南)

## 🏗️ 系统架构

### 微服务架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │  Planning Engine│
│   (React)       │◄──►│   (Fastify)     │◄──►│   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   PostgreSQL    │    │     Redis       │
                       │   (Database)    │    │    (Cache)      │
                       └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Prometheus    │    │     Grafana     │
                       │  (Monitoring)   │    │ (Visualization) │
                       └─────────────────┘    └─────────────────┘
```

### 技术栈

- **后端**: Node.js 18, Express.js, TypeScript
- **数据库**: PostgreSQL 15, Redis 7
- **消息队列**: NATS
- **监控**: Prometheus, Grafana
- **容器化**: Docker, Docker Compose
- **ORM**: Prisma

## 🔌 API文档

### 基础信息

- **Base URL**: `http://localhost:4102`
- **API版本**: v1
- **认证**: JWT Token
- **内容类型**: `application/json`

### 端点列表

#### 1. 健康检查
```http
GET /health
```

**响应示例**:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-16T06:08:11.078Z",
  "uptime": 6.001142348,
  "version": "1.0.0",
  "service": "planning-engine"
}
```

#### 2. 训练计划生成
```http
POST /api/v1/plans/generate
```

**请求体**:
```json
{
  "userId": "uuid",
  "preferences": {
    "goals": ["strength", "endurance"],
    "experience": "intermediate",
    "timeConstraints": {
      "sessionDuration": 60,
      "sessionsPerWeek": 3
    }
  }
}
```

**响应示例**:
```json
{
  "planId": "uuid",
  "status": "generated",
  "plan": {
    "duration": 8,
    "microcycles": [...]
  }
}
```

#### 3. RPE反馈提交
```http
POST /api/v1/feedback/rpe
```

**请求体**:
```json
{
  "userId": "uuid",
  "sessionId": "uuid",
  "rpeScore": 7,
  "notes": "Felt good today"
}
```

#### 4. 性能指标记录
```http
POST /api/v1/metrics/performance
```

**请求体**:
```json
{
  "userId": "uuid",
  "sessionId": "uuid",
  "metrics": {
    "weight": 75.5,
    "reps": 12,
    "sets": 3
  }
}
```

### 错误处理

所有API端点都遵循统一的错误响应格式：

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "userId",
      "reason": "Required field is missing"
    }
  },
  "timestamp": "2025-09-16T06:08:11.078Z",
  "requestId": "uuid"
}
```

## 🗄️ 数据库设计

### 核心表结构

#### 1. 训练计划表 (plans)
```sql
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. 微周期表 (microcycles)
```sql
CREATE TABLE microcycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES plans(id),
    week_number INTEGER NOT NULL,
    focus VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. 训练会话表 (sessions)
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    microcycle_id UUID REFERENCES microcycles(id),
    day_of_week INTEGER NOT NULL,
    session_type VARCHAR(50),
    duration_minutes INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. 练习表 (exercises)
```sql
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id),
    exercise_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    sets INTEGER,
    reps VARCHAR(50),
    weight VARCHAR(100),
    rest_time INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. RPE反馈表 (rpe_feedback)
```sql
CREATE TABLE rpe_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_id UUID REFERENCES sessions(id),
    rpe_score INTEGER NOT NULL CHECK (rpe_score >= 1 AND rpe_score <= 10),
    notes TEXT,
    submitted_at TIMESTAMP DEFAULT NOW()
);
```

### 索引优化

```sql
-- 性能关键索引
CREATE INDEX idx_plans_user_id ON plans(user_id);
CREATE INDEX idx_microcycles_plan_id ON microcycles(plan_id);
CREATE INDEX idx_sessions_microcycle_id ON sessions(microcycle_id);
CREATE INDEX idx_exercises_session_id ON exercises(session_id);
CREATE INDEX idx_rpe_feedback_user_id ON rpe_feedback(user_id);
```

## 🚀 部署指南

### Docker部署

#### 1. 构建镜像
```bash
docker build -f Dockerfile.optimized -t athlete-ally/planning-engine:latest .
```

#### 2. 运行容器
```bash
docker run -d \
  --name planning-engine \
  -p 4102:4102 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e REDIS_URL=redis://host:6379 \
  athlete-ally/planning-engine:latest
```

#### 3. Docker Compose部署
```bash
docker-compose -f docker-compose.production.yml up -d
```

### 环境变量

| 变量名 | 描述 | 默认值 | 必需 |
|--------|------|--------|------|
| `NODE_ENV` | 运行环境 | `development` | 是 |
| `PORT` | 服务端口 | `4102` | 否 |
| `DATABASE_URL` | 数据库连接 | - | 是 |
| `REDIS_URL` | Redis连接 | - | 是 |
| `JWT_SECRET` | JWT密钥 | - | 是 |
| `CORS_ORIGIN` | CORS源 | `*` | 否 |

## 📊 监控配置

### Prometheus配置

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'planning-engine'
    static_configs:
      - targets: ['planning-engine:4102']
    metrics_path: '/metrics'
```

### Grafana仪表板

访问地址: `http://localhost:3001`

**关键指标**:
- 服务健康状态
- API响应时间
- 请求率
- 错误率
- 系统资源使用

### 告警规则

```yaml
groups:
  - name: planning-engine-alerts
    rules:
      - alert: PlanningEngineDown
        expr: up{job="planning-engine"} == 0
        for: 1m
        labels:
          severity: critical
```

## 🔒 安全配置

### 安全头配置

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"]
    }
  }
}));
```

### 速率限制

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  message: 'Too many requests from this IP'
});
```

### 输入验证

```javascript
const validateInput = (data, schema) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error);
  }
  return result.data;
};
```

## ⚡ 性能优化

### 数据库优化

1. **连接池配置**
```javascript
const poolConfig = {
  max: 20,
  min: 5,
  acquireTimeoutMillis: 30000,
  idleTimeoutMillis: 30000
};
```

2. **查询优化**
- 使用索引
- 避免N+1查询
- 使用分页
- 缓存常用查询

### 缓存策略

1. **Redis配置**
```javascript
const redisConfig = {
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: 3,
  lazyConnect: true
};
```

2. **缓存策略**
- 用户数据: 1小时TTL
- 训练计划: 30分钟TTL
- 练习数据: 2小时TTL

### API优化

1. **响应压缩**
```javascript
app.use(compression());
```

2. **请求大小限制**
```javascript
app.use(express.json({ limit: '10mb' }));
```

## 🔧 故障排除

### 常见问题

#### 1. 服务无法启动
**症状**: 容器启动失败
**解决方案**:
```bash
# 检查日志
docker logs planning-engine

# 检查端口占用
netstat -tulpn | grep 4102

# 检查环境变量
docker exec planning-engine env
```

#### 2. 数据库连接失败
**症状**: 数据库连接错误
**解决方案**:
```bash
# 检查数据库状态
docker ps | grep postgres

# 测试连接
docker exec planning-engine npm run test:db

# 检查连接字符串
echo $DATABASE_URL
```

#### 3. 性能问题
**症状**: 响应时间过长
**解决方案**:
```bash
# 检查系统资源
docker stats planning-engine

# 检查数据库性能
docker exec postgres psql -c "SELECT * FROM pg_stat_activity;"

# 检查缓存状态
docker exec redis redis-cli info memory
```

### 日志分析

#### 1. 应用日志
```bash
# 查看实时日志
docker logs -f planning-engine

# 查看错误日志
docker logs planning-engine 2>&1 | grep ERROR
```

#### 2. 系统日志
```bash
# 查看系统资源
docker exec planning-engine top

# 查看网络连接
docker exec planning-engine netstat -tulpn
```

## 👨‍💻 开发指南

### 本地开发

#### 1. 环境设置
```bash
# 安装依赖
npm install

# 设置环境变量
cp .env.example .env

# 启动数据库
docker-compose up -d postgres redis

# 运行迁移
npm run db:migrate

# 启动开发服务器
npm run dev
```

#### 2. 代码规范

**TypeScript配置**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**ESLint配置**:
```json
{
  "extends": ["@typescript-eslint/recommended"],
  "rules": {
    "no-console": "warn",
    "prefer-const": "error"
  }
}
```

#### 3. 测试

```bash
# 运行单元测试
npm run test

# 运行集成测试
npm run test:integration

# 运行性能测试
npm run test:performance
```

### 贡献指南

1. **分支策略**
   - `main`: 生产分支
   - `develop`: 开发分支
   - `feature/*`: 功能分支

2. **提交规范**
   ```
   feat: 新功能
   fix: 修复bug
   docs: 文档更新
   style: 代码格式
   refactor: 重构
   test: 测试
   chore: 构建过程
   ```

3. **代码审查**
   - 所有代码必须经过审查
   - 测试覆盖率必须 > 80%
   - 无ESLint错误

## 📞 支持

### 联系方式

- **技术文档**: [内部文档系统]
- **问题报告**: [GitHub Issues]
- **紧急联系**: [团队Slack频道]

### 更新日志

#### v1.0.0 (2025-09-16)
- 初始版本发布
- 完整的训练计划生成功能
- RPE反馈系统
- 性能指标跟踪
- 监控和告警系统

---

**文档版本**: v1.0.0  
**最后更新**: 2025-09-16  
**维护团队**: Athlete Ally Backend Team

