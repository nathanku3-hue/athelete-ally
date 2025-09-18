import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace, metrics } from '@opentelemetry/api';

// 创建自定义资源信息
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'exercises-service',
  [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: process.env.HOSTNAME || 'exercises-service-1',
});

// 创建追踪器
const tracer = trace.getTracer('exercises-service', '1.0.0');

// 创建指标
const meter = metrics.getMeter('exercises-service', '1.0.0');

// 业务指标定义
export const businessMetrics = {
  // 运动库相关指标
  exerciseRequests: meter.createCounter('exercise_requests_total', {
    description: 'Total number of exercise requests',
  }),
  exerciseSearches: meter.createCounter('exercise_searches_total', {
    description: 'Total number of exercise searches',
  }),
  exerciseViews: meter.createCounter('exercise_views_total', {
    description: 'Total number of exercise detail views',
  }),
  exerciseRatings: meter.createCounter('exercise_ratings_total', {
    description: 'Total number of exercise ratings',
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

// 创建运动搜索追踪
export const traceExerciseSearch = (query: string, filters: any, userId?: string) => {
  const span = createBusinessSpan('exercise_search', {
    'search.query': query,
    'search.filters': JSON.stringify(filters),
    'user.id': userId || 'anonymous',
  });
  return span;
};

// 创建运动查看追踪
export const traceExerciseView = (exerciseId: string, userId?: string) => {
  const span = createBusinessSpan('exercise_view', {
    'exercise.id': exerciseId,
    'user.id': userId || 'anonymous',
  });
  return span;
};

// 创建运动评分追踪
export const traceExerciseRating = (exerciseId: string, rating: number, userId: string) => {
  const span = createBusinessSpan('exercise_rating', {
    'exercise.id': exerciseId,
    'rating.value': rating,
    'user.id': userId,
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
    port: parseInt(process.env.PROMETHEUS_METRICS_PORT || '9467'),
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

