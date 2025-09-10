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

