# Athlete Ally 监控和可观测性

这个目录包含了 Athlete Ally 应用的完整监控和可观测性基础设施。

## 🏗️ 架构概览

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Gateway BFF   │    │ Profile Service │    │ Planning Engine │
│   (Port 4000)   │    │   (Port 4101)   │    │   (Port 4102)   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │                           │
            ┌───────▼───────┐         ┌────────▼────────┐
            │    Jaeger     │         │   Prometheus    │
            │  (Port 16686) │         │   (Port 9090)   │
            └───────────────┘         └─────────────────┘
                                              │
                                    ┌────────▼────────┐
                                    │    Grafana      │
                                    │   (Port 3000)   │
                                    └─────────────────┘
```

## 🚀 快速开始

### 1. 启动监控服务

```bash
# Windows
.\scripts\start-monitoring.ps1

# Linux/Mac
./scripts/start-monitoring.sh
```

### 2. 启动应用服务

```bash
# 在项目根目录
npm run dev
```

### 3. 运行测试

```bash
node scripts/test-tracing.js
```

## 📊 监控服务

### Jaeger - 分布式追踪
- **URL**: http://localhost:16686
- **用途**: 查看请求链路追踪
- **关键功能**:
  - 端到端请求追踪
  - 服务间调用关系
  - 性能瓶颈识别
  - 错误根因分析

### Prometheus - 指标收集
- **URL**: http://localhost:9090
- **用途**: 指标存储和查询
- **关键指标**:
  - `onboarding_requests_total` - 引导请求总数
  - `plan_generation_duration_seconds` - 计划生成耗时
  - `api_response_time_seconds` - API响应时间
  - `llm_response_time_seconds` - LLM响应时间

### Grafana - 可视化仪表板
- **URL**: http://localhost:3000
- **用户名**: admin
- **密码**: admin
- **用途**: 指标可视化和告警

## 🔍 追踪功能

### 业务追踪点

#### 1. 用户引导追踪
```typescript
// 追踪用户引导步骤
const span = traceOnboardingStep('purpose_selection', userId, {
  purpose: 'sport_performance',
  proficiency: 'intermediate'
});
```

#### 2. 计划生成追踪
```typescript
// 追踪计划生成过程
const span = tracePlanGeneration(userId, {
  complexity: 'standard',
  equipmentCount: 5,
  availabilityDays: 3
});
```

#### 3. LLM调用追踪
```typescript
// 追踪LLM调用
const span = traceLLMCall('gpt-4', promptLength, userId);
```

#### 4. 数据库操作追踪
```typescript
// 追踪数据库操作
const span = traceDatabaseOperation('create', 'plans', userId);
```

### 业务指标

#### 用户引导指标
- `onboarding_requests_total` - 引导请求总数
- `onboarding_completions_total` - 引导完成总数
- `onboarding_step_duration_seconds` - 各步骤耗时

#### 计划生成指标
- `plan_generation_requests_total` - 计划生成请求总数
- `plan_generation_duration_seconds` - 计划生成耗时
- `plan_generation_success_total` - 成功生成总数
- `plan_generation_failures_total` - 失败生成总数

#### API指标
- `api_requests_total` - API请求总数
- `api_response_time_seconds` - API响应时间
- `api_errors_total` - API错误总数

#### LLM指标
- `llm_requests_total` - LLM请求总数
- `llm_response_time_seconds` - LLM响应时间
- `llm_tokens_used_total` - 使用的Token总数

#### 数据库指标
- `database_queries_total` - 数据库查询总数
- `database_query_duration_seconds` - 数据库查询耗时

## 🚨 告警规则

### 业务告警
- **引导完成率低**: 完成率低于80%时告警
- **计划生成失败率高**: 失败率高于5%时告警
- **计划生成慢**: 95分位数超过30秒时告警

### 技术告警
- **API错误率高**: 错误率高于1%时告警
- **API响应慢**: 95分位数超过2秒时告警
- **LLM响应慢**: 95分位数超过10秒时告警
- **数据库查询慢**: 95分位数超过1秒时告警

### 系统告警
- **服务宕机**: 服务不可用时告警
- **内存使用高**: 内存使用超过1GB时告警
- **CPU使用高**: CPU使用率超过80%时告警

## 🔧 配置

### 环境变量

```bash
# Jaeger配置
JAEGER_ENDPOINT=http://localhost:14268/api/traces

# 服务端口
GATEWAY_BFF_PORT=4000
PROFILE_ONBOARDING_PORT=4101
PLANNING_ENGINE_PORT=4102

# 指标端口
GATEWAY_BFF_METRICS_PORT=9464
PROFILE_ONBOARDING_METRICS_PORT=9465
PLANNING_ENGINE_METRICS_PORT=9466
```

### 自定义追踪

```typescript
import { createBusinessSpan } from './telemetry';

// 创建自定义业务追踪
const span = createBusinessSpan('custom_business_operation', {
  'operation.type': 'data_processing',
  'user.id': userId,
  'data.size': dataSize
});

try {
  // 执行业务逻辑
  await processData();
  span.setStatus({ code: 1, message: 'Success' });
} catch (error) {
  span.setStatus({ code: 2, message: error.message });
  throw error;
} finally {
  span.end();
}
```

## 📈 性能优化

### 追踪性能
- 使用采样率控制追踪数据量
- 异步发送追踪数据
- 批量发送减少网络开销

### 指标性能
- 使用Histogram记录耗时分布
- 使用Counter记录计数
- 合理设置指标标签

## 🛠️ 故障排查

### 常见问题

1. **追踪数据不显示**
   - 检查Jaeger服务是否运行
   - 检查服务配置中的Jaeger端点
   - 查看服务日志中的追踪错误

2. **指标数据不显示**
   - 检查Prometheus服务是否运行
   - 检查服务指标端点是否可访问
   - 查看Prometheus配置中的服务地址

3. **告警不触发**
   - 检查告警规则配置
   - 查看Prometheus中的指标数据
   - 检查告警阈值设置

### 调试命令

```bash
# 检查服务状态
docker-compose ps

# 查看服务日志
docker-compose logs jaeger
docker-compose logs prometheus
docker-compose logs grafana

# 重启服务
docker-compose restart
```

## 📚 参考资料

- [OpenTelemetry文档](https://opentelemetry.io/docs/)
- [Jaeger文档](https://www.jaegertracing.io/docs/)
- [Prometheus文档](https://prometheus.io/docs/)
- [Grafana文档](https://grafana.com/docs/)

---

## 🧭 监控运行手册（Runbook）

面向值班工程师的标准操作流程，用于在开发/预览环境快速定位并恢复监控与核心业务指标。

### 1) 启动/停止
- 启动（推荐脚本）
  - Windows: `scripts/start-monitoring.ps1`
  - Unix: `scripts/start-monitoring.sh`
- 通过 preview.compose.yaml 启动（包含 Prometheus/Grafana/Jaeger）
  - `docker compose -f preview.compose.yaml up -d prometheus grafana jaeger`
- 停止/清理
  - `docker compose -f preview.compose.yaml down -v`

### 2) 健康检查与端点
- 服务健康：`GET /health`（各服务）
- 指标抓取：`GET /metrics`
- BFF 健康：`curl http://localhost:4000/api/health`
- 规划引擎健康：`curl http://localhost:4102/health`
- 事件总线（NATS）管理 UI（如已打开 8222）：`http://localhost:8222`

### 3) Prometheus Targets 验证
1. 打开 Prometheus: `http://localhost:9090/targets`
2. 确认以下端点为 UP：
   - gateway-bff: `http://gateway-bff:9464/metrics` 或本地 `http://localhost:9464/metrics`
   - planning-engine: `http://planning-engine:9466/metrics`
   - profile-onboarding: `http://profile-onboarding:9465/metrics`
3. 若为 DOWN：
   - 确认服务在运行（容器/进程）
   - 在服务日志中搜索 OpenTelemetry/metrics exporter 错误
   - 检查 monitoring/prometheus.yml 中 job 地址是否与端口一致

### 4) Jaeger/Tracing 验证
1. 打开 Jaeger: `http://localhost:16686`
2. 选择服务：gateway-bff / planning-engine / profile-onboarding
3. 触发一次端到端流：
   - 提交 `/api/v1/onboarding`（带 Authorization）
   - 触发 `/api/v1/plans/generate` 并通过 `/api/v1/plans/status?jobId=...` 轮询
4. 在 Jaeger 中检索最近 15 分钟的 Trace，确认包含 API → NATS → Planning Engine 的链路

### 5) 常见告警与排障
- 计划生成失败率高
  - 看 planning-engine 日志（LLM/DB/NATS 错误）
  - 查看 NATS 状态、重试与 DLQ（若配置）
- API 错误率高
  - 在 BFF 日志定位具体路由与上游依赖
  - 检查 CORS、Auth header 传递与下游 5xx
- 指标/追踪缺失
  - 检查 SDK 初始化（端口/endpoint 变量）
  - 检查容器网络、端口映射与 scrape 配置

### 6) 仪表板与值班检查单
- Grafana 登录：`http://localhost:3001`（或 `http://localhost:3000`，取决于 env）
  - 用户：admin / 密码：见 `.env` 中 `GF_SECURITY_ADMIN_PASSWORD`
- 仪表板建议：
  - 平台总览（请求率、错误率、P95 延迟）
  - 业务看板（onboarding 请求、plan generation duration 成功/失败、队列长度）
  - 事件总线（发布/消费速率、NAK/ACK 比例）
- 值班检查（每次发布后）
  - Prometheus Targets 全部 UP
  - BFF/Planning Engine 健康端点 200
  - Jaeger 可见端到端 Trace
  - 关键业务指标有数据（非 0）

### 7) 常见故障快速恢复
- CORS 拒绝 → 确认 BFF `CORS_ALLOWED_ORIGINS` 是否包含前端地址
- 429 过多 → 调整 BFF 速率限制环境变量或检查突发流量源
- NATS 连接失败 → 重启 NATS 容器，确认 `NATS_URL`
- 指标不采集 → 重启受影响服务并观察 `/metrics`，确认端口与监控配置一致

### 8) 参考命令
```bash
# 查看 Prometheus scrape 错误
docker compose -f preview.compose.yaml logs prometheus | rg scrape

# 检查 BFF 指标端点
curl -s http://localhost:9464/metrics | head -n 20

# 检查规划引擎队列/并发状态（自带端点）
curl -s http://localhost:4102/queue/status | jq
curl -s http://localhost:4102/concurrency/status | jq
```


