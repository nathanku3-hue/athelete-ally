import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace, metrics } from '@opentelemetry/api';

// 创建自定义资源信息
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'planning-engine',
  [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: process.env.HOSTNAME || 'planning-engine-1',
});

// 创建追踪器
const tracer = trace.getTracer('planning-engine', '1.0.0');

// 创建指标
const meter = metrics.getMeter('planning-engine', '1.0.0');

// 业务指标定义
export const businessMetrics = {
  // 计划生成相关指标
  planGenerationRequests: meter.createCounter('plan_generation_requests_total', {
    description: 'Total number of plan generation requests',
  }),
  planGenerationDuration: meter.createHistogram('plan_generation_duration_seconds', {
    description: 'Duration of plan generation',
    unit: 's',
  }),
  planGenerationSuccess: meter.createCounter('plan_generation_success_total', {
    description: 'Total number of successful plan generations',
  }),
  planGenerationFailures: meter.createCounter('plan_generation_failures_total', {
    description: 'Total number of failed plan generations',
  }),
  
  // LLM相关指标
  llmRequests: meter.createCounter('llm_requests_total', {
    description: 'Total number of LLM requests',
  }),
  llmResponseTime: meter.createHistogram('llm_response_time_seconds', {
    description: 'LLM response time',
    unit: 's',
  }),
  llmTokensUsed: meter.createCounter('llm_tokens_used_total', {
    description: 'Total number of LLM tokens used',
  }),
  
  // 数据库相关指标
  databaseQueries: meter.createCounter('database_queries_total', {
    description: 'Total number of database queries',
  }),
  databaseQueryDuration: meter.createHistogram('database_query_duration_seconds', {
    description: 'Database query duration',
    unit: 's',
  }),
};

// 创建自定义Span工具函数
export const createBusinessSpan = (name: string, attributes: Record<string, any> = {}) => {
  const span = tracer.startSpan(name);
  Object.entries(attributes).forEach(([key, value]) => {
    span.setAttribute(key, value);
  });
  return span;
};

// 创建计划生成追踪
export const tracePlanGeneration = (userId: string, planData: any) => {
  const span = createBusinessSpan('plan_generation', {
    'plan.user_id': userId,
    'plan.complexity': planData.complexity || 'standard',
    'plan.equipment_count': planData.equipment?.length || 0,
    'plan.availability_days': planData.availabilityDays || 0,
    'plan.proficiency': planData.proficiency || 'intermediate',
  });
  return span;
};

// 创建LLM调用追踪
export const traceLLMCall = (model: string, promptLength: number, userId: string) => {
  const span = createBusinessSpan('llm_call', {
    'llm.model': model,
    'llm.prompt_length': promptLength,
    'user.id': userId,
  });
  return span;
};

// 创建数据库操作追踪
export const traceDatabaseOperation = (operation: string, table: string, userId?: string) => {
  const span = createBusinessSpan('database_operation', {
    'db.operation': operation,
    'db.table': table,
    'user.id': userId || 'system',
  });
  return span;
};

// Initialize OpenTelemetry
const sdk = new NodeSDK({
  resource,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        requestHook: (span: any, request: any) => {
          span.setAttribute('http.user_agent', request.getHeader?.('user-agent') || 'unknown');
          span.setAttribute('http.content_type', request.getHeader?.('content-type') || 'unknown');
        },
      },
    }),
  ],
  traceExporter: new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
  }),
  metricReader: new PrometheusExporter({
    port: parseInt(process.env.PROMETHEUS_METRICS_PORT || '9466'),
    endpoint: process.env.PROMETHEUS_METRICS_ENDPOINT || '/metrics',
  }),
});

// Start the SDK
sdk.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});

export { sdk, tracer, meter };

