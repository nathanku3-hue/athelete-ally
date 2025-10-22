import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace, metrics } from '@opentelemetry/api';
import { createLogger } from '@athlete-ally/logger';
import serverAdapter from '@athlete-ally/logger/server';

// 创建自定义资源信息
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'gateway-bff',
  [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: process.env.HOSTNAME || 'gateway-bff-1',
});

// 创建追踪器
const tracer = trace.getTracer('gateway-bff', '1.0.0');

// 创建指标
const meter = metrics.getMeter('gateway-bff', '1.0.0');

// 业务指标定义
export const businessMetrics = {
  // 用户引导相关指标
  onboardingRequests: meter.createCounter('onboarding_requests_total', {
    description: 'Total number of onboarding requests',
  }),
  onboardingCompletions: meter.createCounter('onboarding_completions_total', {
    description: 'Total number of completed onboardings',
  }),
  onboardingStepDuration: meter.createHistogram('onboarding_step_duration_seconds', {
    description: 'Duration of each onboarding step',
    unit: 's',
  }),
  
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
  
  // API相关指标
  apiRequests: meter.createCounter('api_requests_total', {
    description: 'Total number of API requests',
  }),
  apiResponseTime: meter.createHistogram('api_response_time_seconds', {
    description: 'API response time',
    unit: 's',
  }),
  apiErrors: meter.createCounter('api_errors_total', {
    description: 'Total number of API errors',
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

// 创建用户引导追踪
export const traceOnboardingStep = (stepName: string, userId: string, stepData: any) => {
  const span = createBusinessSpan('user_onboarding_step', {
    'onboarding.step_name': stepName,
    'user.id': userId,
    'onboarding.step_data': JSON.stringify(stepData),
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
  });
  return span;
};

// 创建API请求追踪
export const traceApiRequest = (method: string, path: string, userId?: string) => {
  const span = createBusinessSpan('api_request', {
    'http.method': method,
    'http.path': path,
    'user.id': userId || 'anonymous',
  });
  return span;
};

// Initialize OpenTelemetry
const sdk = new NodeSDK({
  resource,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false, // Disable file system instrumentation
      },
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        requestHook: (span: any, request: any) => {
          // 添加自定义HTTP请求属性
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
    port: 9464,
    endpoint: '/metrics',
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

const telemetryLogger = createLogger(serverAdapter, {
  module: 'telemetry',
  service: 'gateway-bff'
});

export const trackEvent = (eventName: string, payload: Record<string, unknown>) => {
  telemetryLogger.info(`event=${eventName}`, {
    event: eventName,
    payload,
    timestamp: new Date().toISOString()
  });
};
