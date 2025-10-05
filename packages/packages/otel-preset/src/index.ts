import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace, metrics } from '@opentelemetry/api';

export interface TelemetryExporters {
  jaeger?: { endpoint?: string };
  otlp?: { endpoint?: string; protocol?: 'http/protobuf' | 'grpc' };
  prometheus?: { port?: number; endpoint?: string };
}

export interface InitTelemetryOptions {
  serviceName: string;
  version?: string;
  environment?: string;
  instanceId?: string;
  enabled?: boolean;
  exporters?: TelemetryExporters;
  instrumentations?: {
    fs?: boolean;
    http?: boolean;
    express?: boolean;
    fastify?: boolean;
  };
}

export interface TelemetryInstance {
  sdk: NodeSDK;
  tracer: any;
  meter: any;
  shutdown: () => Promise<void>;
}

/**
 * Initialize OpenTelemetry with consistent configuration
 */
export function initTelemetry(opts: InitTelemetryOptions): TelemetryInstance {
  const {
    serviceName,
    version = process.env.SERVICE_VERSION || '0.0.0',
    environment = process.env.NODE_ENV || 'development',
    instanceId = process.env.HOSTNAME || `${serviceName}-1`,
    enabled = process.env.TELEMETRY_ENABLED === 'true',
    exporters = {},
    instrumentations = {}
  } = opts;

  // Check if telemetry is enabled
  if (!enabled) {
    // Console logging removed - use proper logger instead
    return {
      sdk: undefined as any,
      tracer: trace.getTracer(serviceName, version),
      meter: metrics.getMeter(serviceName, version),
      shutdown: async () => {}
    };
  }

  // Console logging removed - use proper logger instead

  // Create resource with consistent attributes
  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: version,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: environment,
    [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: instanceId,
  });

  // Create tracer and meter
  const tracer = trace.getTracer(serviceName, version);
  const meter = metrics.getMeter(serviceName, version);

  // Configure exporters based on environment
  const traceExporter = createTraceExporter(exporters);
  const metricReader = createMetricReader(exporters);

  // Configure instrumentations
  const instrumentationConfig = {
    '@opentelemetry/instrumentation-fs': {
      enabled: instrumentations.fs ?? false,
    },
    '@opentelemetry/instrumentation-http': {
      enabled: instrumentations.http ?? true,
      requestHook: (span: any, request: any) => {
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
    '@opentelemetry/instrumentation-express': {
      enabled: instrumentations.express ?? true,
    },
    '@opentelemetry/instrumentation-fastify': {
      enabled: instrumentations.fastify ?? true,
    },
  };

  // Initialize SDK
  const sdk = new NodeSDK({
    resource,
    instrumentations: [getNodeAutoInstrumentations(instrumentationConfig)],
    traceExporter,
    metricReader,
  });

  // Start the SDK
  sdk.start();

  // Graceful shutdown handler
  const shutdown = async () => {
    try {
      await sdk.shutdown();
      // Console logging removed - use proper logger instead
    } catch (error) {
      console.error(`❌ Error shutting down telemetry for ${serviceName}:`, error);
    }
  };

  // Register shutdown handlers
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Console logging removed - use proper logger instead
  return { sdk, tracer, meter, shutdown };
}

/**
 * Create trace exporter based on configuration
 */
function createTraceExporter(exporters: InitTelemetryOptions['exporters']) {
  const exporterType = process.env.OTEL_EXPORTER || 'none';

  switch (exporterType) {
    case 'jaeger':
      try {
        const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
        return new JaegerExporter({
          endpoint: exporters?.jaeger?.endpoint || process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
        });
      } catch (error) {
        console.warn('⚠️ Jaeger exporter not available, using noop');
        return undefined;
      }

    case 'otlp':
      try {
        const { OTLPTraceExporter } = require('@opentelemetry/exporter-otlp-http');
        return new OTLPTraceExporter({
          url: exporters?.otlp?.endpoint || process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
        });
      } catch (error) {
        console.warn('⚠️ OTLP exporter not available, using noop');
        return undefined;
      }

    default:
      // Console logging removed - use proper logger instead
      return undefined;
  }
}

/**
 * Create metric reader based on configuration
 */
function createMetricReader(exporters: InitTelemetryOptions['exporters']) {
  const exporterType = process.env.OTEL_EXPORTER || 'none';

  switch (exporterType) {
    case 'prometheus':
      try {
        const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
        return new PrometheusExporter({
          port: exporters?.prometheus?.port || parseInt(process.env.PROMETHEUS_PORT || '9464'),
          endpoint: exporters?.prometheus?.endpoint || '/metrics',
        });
      } catch (error) {
        console.warn('⚠️ Prometheus exporter not available, using noop');
        return undefined;
      }

    case 'otlp':
      try {
        const { OTLPMetricExporter } = require('@opentelemetry/exporter-otlp-http');
        return new OTLPMetricExporter({
          url: exporters?.otlp?.endpoint || process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/metrics',
        });
      } catch (error) {
        console.warn('⚠️ OTLP metric exporter not available, using noop');
        return undefined;
      }

    default:
      // Console logging removed - use proper logger instead
      return undefined;
  }
}


/**
 * Create business span helper
 */
export function createBusinessSpan(tracer: any, name: string, attributes: Record<string, any> = {}) {
  const span = tracer.startSpan(name);
  Object.entries(attributes).forEach(([key, value]) => {
    span.setAttribute(key, value);
  });
  return span;
}

/**
 * Create business metrics helper
 */
export function createBusinessMetrics(meter: any, serviceName: string) {
  return {
    apiRequests: meter.createCounter(`${serviceName}_api_requests_total`, {
      description: 'Total number of API requests',
    }),
    apiResponseTime: meter.createHistogram(`${serviceName}_api_response_time_seconds`, {
      description: 'API response time',
      unit: 's',
    }),
    apiErrors: meter.createCounter(`${serviceName}_api_errors_total`, {
      description: 'Total number of API errors',
    }),
  };
}

export default { initTelemetry, createBusinessSpan, createBusinessMetrics };
