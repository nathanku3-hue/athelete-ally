# 🏥 健康检查系统文档

## 概述

planning-engine 服务现在包含一个完整的健康检查系统，提供全面的服务状态监控、依赖检查、性能指标收集和API限流功能。

## 功能特性

### ✅ 已实现功能

1. **多维度健康检查**
   - 数据库连接检查
   - Redis缓存检查
   - NATS消息队列检查
   - OpenAI API检查
   - 内存使用检查
   - 磁盘空间检查
   - 缓存系统检查
   - 限流系统检查

2. **Redis缓存系统**
   - 高性能缓存管理
   - 自动序列化/反序列化
   - TTL支持
   - 批量操作
   - 错误处理和降级

3. **API限流中间件**
   - 多维度限流策略
   - Redis分布式限流
   - 灵活配置
   - 详细响应头
   - 错误处理

4. **健康检查端点**
   - 基础健康检查
   - 详细健康检查
   - 就绪检查
   - 存活检查
   - 缓存状态检查
   - 限流状态检查
   - 系统信息检查

## API端点

### 健康检查端点

| 端点 | 方法 | 描述 | 状态码 |
|------|------|------|--------|
| `/health` | GET | 基础健康检查 | 200/503 |
| `/health/detailed` | GET | 详细健康检查 | 200/503 |
| `/health/ready` | GET | 就绪检查 | 200/503 |
| `/health/live` | GET | 存活检查 | 200 |
| `/health/cache` | GET | 缓存状态检查 | 200/503 |
| `/health/rate-limit` | GET | 限流状态检查 | 200/503 |
| `/health/system` | GET | 系统信息检查 | 200/503 |

### 限流端点

| 端点 | 方法 | 描述 | 状态码 |
|------|------|------|--------|
| `/rate-limit/status` | GET | 获取限流状态 | 200 |
| `/rate-limit/reset` | POST | 重置限流计数 | 200/403 |

### 指标端点

| 端点 | 方法 | 描述 | 状态码 |
|------|------|------|--------|
| `/metrics` | GET | Prometheus指标 | 200 |

## 使用示例

### 1. 基础健康检查

```bash
curl http://localhost:4102/health
```

响应示例：
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "checks": {
    "database": { "status": "healthy", "responseTime": 15 },
    "redis": { "status": "healthy", "responseTime": 5 },
    "nats": { "status": "healthy", "responseTime": 2 },
    "llm": { "status": "healthy", "responseTime": 1 },
    "memory": { "status": "healthy" },
    "disk": { "status": "healthy" },
    "openai": { "status": "healthy", "responseTime": 1200 },
    "cache": { "status": "healthy", "responseTime": 3 },
    "rateLimit": { "status": "healthy", "responseTime": 1 }
  },
  "summary": {
    "total": 9,
    "healthy": 9,
    "unhealthy": 0,
    "degraded": 0
  },
  "metrics": {
    "responseTime": 0,
    "requestCount": 150,
    "errorCount": 2,
    "activeConnections": 5
  }
}
```

### 2. 详细健康检查

```bash
curl http://localhost:4102/health/detailed
```

### 3. 就绪检查（Kubernetes）

```bash
curl http://localhost:4102/health/ready
```

### 4. 存活检查（Kubernetes）

```bash
curl http://localhost:4102/health/live
```

### 5. 缓存状态检查

```bash
curl http://localhost:4102/health/cache
```

### 6. 限流状态检查

```bash
curl http://localhost:4102/health/rate-limit
```

### 7. 系统信息检查

```bash
curl http://localhost:4102/health/system
```

## 配置

### 环境变量

```bash
# 数据库配置
PLANNING_DATABASE_URL=postgresql://user:password@localhost:5432/planning_db

# Redis配置
REDIS_URL=redis://localhost:6379

# OpenAI配置
OPENAI_API_KEY=your_openai_api_key

# NATS配置
NATS_URL=nats://localhost:4223

# 缓存配置
PLAN_CACHE_TTL_SECONDS=3600

# 限流配置
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### 限流配置

系统支持多种限流策略：

1. **IP限流**: 每个IP每分钟100个请求
2. **端点限流**: 每个端点每分钟50个请求
3. **用户限流**: 每个用户每分钟20个请求
4. **特殊端点限流**: 计划生成端点每5分钟3次

## 监控和告警

### Prometheus指标

服务暴露Prometheus指标在 `/metrics` 端点：

- `http_requests_total`: HTTP请求总数
- `http_request_duration_seconds`: HTTP请求持续时间
- `health_check_duration_seconds`: 健康检查持续时间
- `rate_limit_requests_total`: 限流请求总数
- `cache_operations_total`: 缓存操作总数

### 健康检查状态

- **healthy**: 所有检查通过
- **degraded**: 部分检查失败但不影响核心功能
- **unhealthy**: 关键检查失败，服务不可用

### 响应头

限流响应包含以下头信息：

- `X-RateLimit-Limit`: 限制数量
- `X-RateLimit-Remaining`: 剩余数量
- `X-RateLimit-Reset`: 重置时间戳
- `Retry-After`: 重试等待时间（秒）

## 测试

### 运行健康检查测试

```bash
cd services/planning-engine
node test-health-check.js
```

### 手动测试

```bash
# 测试基础健康检查
curl -v http://localhost:4102/health

# 测试限流功能
for i in {1..10}; do curl http://localhost:4102/health; done

# 测试就绪检查
curl http://localhost:4102/health/ready

# 测试存活检查
curl http://localhost:4102/health/live
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `PLANNING_DATABASE_URL` 配置
   - 确认数据库服务运行状态
   - 检查网络连接

2. **Redis连接失败**
   - 检查 `REDIS_URL` 配置
   - 确认Redis服务运行状态
   - 检查Redis密码配置

3. **OpenAI API失败**
   - 检查 `OPENAI_API_KEY` 配置
   - 确认API密钥有效性
   - 检查网络连接和防火墙

4. **限流过于严格**
   - 调整限流配置参数
   - 检查Redis连接状态
   - 使用管理员权限重置限流

### 日志查看

```bash
# 查看服务日志
docker logs planning-engine

# 查看健康检查日志
grep "health" /var/log/planning-engine.log

# 查看限流日志
grep "rate_limit" /var/log/planning-engine.log
```

## 部署建议

### Kubernetes配置

```yaml
apiVersion: v1
kind: Service
metadata:
  name: planning-engine
spec:
  ports:
  - port: 4102
    targetPort: 4102
  selector:
    app: planning-engine
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: planning-engine
spec:
  replicas: 3
  selector:
    matchLabels:
      app: planning-engine
  template:
    metadata:
      labels:
        app: planning-engine
    spec:
      containers:
      - name: planning-engine
        image: planning-engine:latest
        ports:
        - containerPort: 4102
        livenessProbe:
          httpGet:
            path: /health/live
            port: 4102
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 4102
          initialDelaySeconds: 5
          periodSeconds: 5
        env:
        - name: PLANNING_DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: planning-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: planning-secrets
              key: redis-url
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: planning-secrets
              key: openai-api-key
```

## 性能优化

### 缓存优化

- 合理设置TTL值
- 使用批量操作
- 监控缓存命中率
- 定期清理过期数据

### 限流优化

- 根据实际负载调整限流参数
- 使用滑动窗口算法
- 实现令牌桶算法
- 监控限流效果

### 健康检查优化

- 设置合理的超时时间
- 使用并发检查
- 缓存检查结果
- 实现降级策略

## 安全考虑

1. **认证和授权**
   - 健康检查端点通常不需要认证
   - 敏感端点需要适当的权限控制
   - 使用HTTPS传输

2. **信息泄露**
   - 避免在响应中暴露敏感信息
   - 限制错误信息的详细程度
   - 使用适当的日志级别

3. **限流保护**
   - 防止API滥用
   - 实现IP白名单
   - 监控异常流量

## 更新日志

### v2.0.0 (2024-01-15)
- ✅ 增强健康检查系统
- ✅ 实现Redis缓存系统
- ✅ 实现API限流中间件
- ✅ 添加磁盘空间检查
- ✅ 添加OpenAI API检查
- ✅ 集成到服务器
- ✅ 添加测试脚本
- ✅ 完善文档

---

## 联系信息

如有问题或建议，请联系后端团队。

**作者**: 后端团队  
**版本**: 2.0.0  
**最后更新**: 2024-01-15

