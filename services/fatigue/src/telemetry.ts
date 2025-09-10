import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace, metrics } from '@opentelemetry/api';

// 创建自定义资源信息
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'fatigue-service',
  [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: process.env.HOSTNAME || 'fatigue-service-1',
});

// 创建追踪器
const tracer = trace.getTracer('fatigue-service', '1.0.0');

// 创建指标
const meter = metrics.getMeter('fatigue-service', '1.0.0');

// 业务指标定义
export const businessMetrics = {
  // 疲劳评估相关指标
  fatigueAssessments: meter.createCounter('fatigue_assessments_total', {
    description: 'Total number of fatigue assessments',
  }),
  averageFatigueLevel: meter.createHistogram('fatigue_level_average', {
    description: 'Average fatigue level distribution',
    unit: '1-5',
  }),
  
  // 训练调整相关指标
  trainingAdjustments: meter.createCounter('training_adjustments_total', {
    description: 'Total number of training adjustments',
  }),
  adjustmentSuccess: meter.createCounter('adjustment_success_total', {
    description: 'Number of successful adjustments',
  }),
  adjustmentRejection: meter.createCounter('adjustment_rejection_total', {
    description: 'Number of rejected adjustments',
  }),
  
  // 用户满意度指标
  userSatisfaction: meter.createHistogram('user_satisfaction_score', {
    description: 'User satisfaction with adjustments',
    unit: '1-5',
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

// 创建疲劳评估追踪
export const traceFatigueAssessment = (userId: string, fatigueLevel: number, assessmentType: string) => {
  const span = createBusinessSpan('fatigue_assessment', {
    'user.id': userId,
    'fatigue.level': fatigueLevel,
    'assessment.type': assessmentType,
  });
  return span;
};

// 创建训练调整追踪
export const traceTrainingAdjustment = (userId: string, adjustmentType: string, confidence: number) => {
  const span = createBusinessSpan('training_adjustment', {
    'user.id': userId,
    'adjustment.type': adjustmentType,
    'adjustment.confidence': confidence,
  });
  return span;
};

// 创建用户反馈追踪
export const traceUserFeedback = (userId: string, satisfactionScore: number, adjustmentId: string) => {
  const span = createBusinessSpan('user_feedback', {
    'user.id': userId,
    'feedback.satisfaction': satisfactionScore,
    'adjustment.id': adjustmentId,
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
        requestHook: (span, request) => {
          const getHeader = (name: string) => {
            if ('getHeader' in request && typeof request.getHeader === 'function') {
              return request.getHeader(name);
            }
            return undefined;
          };
          span.setAttribute('http.user_agent', getHeader('user-agent') || 'unknown');
          span.setAttribute('http.content_type', getHeader('content-type') || 'unknown');
        },
      },
    }),
  ],
  traceExporter: new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
  }),
  metricReader: new PrometheusExporter({
    port: 9468,
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

