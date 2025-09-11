import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace, metrics } from '@opentelemetry/api';

// 创建自定义资源信息
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'workouts-service',
  [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: process.env.HOSTNAME || 'workouts-service-1',
});

// 创建追踪器
const tracer = trace.getTracer('workouts-service', '1.0.0');

// 创建指标
const meter = metrics.getMeter('workouts-service', '1.0.0');

// 业务指标定义
export const businessMetrics = {
  // 训练会话相关指标
  workoutSessions: meter.createCounter('workout_sessions_total', {
    description: 'Total number of workout sessions',
  }),
  sessionDuration: meter.createHistogram('workout_session_duration_minutes', {
    description: 'Workout session duration in minutes',
    unit: 'minutes',
  }),
  sessionCompletion: meter.createCounter('workout_sessions_completed_total', {
    description: 'Number of completed workout sessions',
  }),
  
  // 训练记录相关指标
  workoutRecords: meter.createCounter('workout_records_total', {
    description: 'Total number of workout records',
  }),
  recordAccuracy: meter.createHistogram('workout_record_accuracy', {
    description: 'Accuracy of recorded vs target values',
    unit: 'percentage',
  }),
  
  // 个人记录相关指标
  personalRecords: meter.createCounter('personal_records_total', {
    description: 'Total number of personal records set',
  }),
  recordTypes: meter.createCounter('personal_record_types_total', {
    description: 'Personal records by type',
  }),
  
  // 用户参与度指标
  userEngagement: meter.createHistogram('user_workout_frequency', {
    description: 'User workout frequency per week',
    unit: 'workouts_per_week',
  }),
  sessionRating: meter.createHistogram('workout_session_rating', {
    description: 'User rating of workout sessions',
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

// 创建训练会话追踪
export const traceWorkoutSession = (userId: string, sessionId: string, action: string) => {
  const span = createBusinessSpan('workout_session', {
    'user.id': userId,
    'session.id': sessionId,
    'session.action': action,
  });
  return span;
};

// 创建训练记录追踪
export const traceWorkoutRecord = (userId: string, exerciseName: string, recordType: string) => {
  const span = createBusinessSpan('workout_record', {
    'user.id': userId,
    'exercise.name': exerciseName,
    'record.type': recordType,
  });
  return span;
};

// 创建个人记录追踪
export const tracePersonalRecord = (userId: string, exerciseName: string, recordType: string, value: number) => {
  const span = createBusinessSpan('personal_record', {
    'user.id': userId,
    'exercise.name': exerciseName,
    'record.type': recordType,
    'record.value': value,
  });
  return span;
};

// 创建目标追踪
export const traceWorkoutGoal = (userId: string, goalType: string, progress: number) => {
  const span = createBusinessSpan('workout_goal', {
    'user.id': userId,
    'goal.type': goalType,
    'goal.progress': progress,
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
    port: parseInt(process.env.PROMETHEUS_METRICS_PORT || '9469'),
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

