import { trace, metrics as otelMetrics, context, propagation } from '@opentelemetry/api';
import { initTelemetry as initPreset } from '@athlete-ally/otel-preset';

export interface TelemetryBootstrapOptions {
  serviceName: string;
  version?: string;
  environment?: string;
  traces?: { enabled?: boolean };
  metrics?: { enabled?: boolean; port?: number; endpoint?: string };
}

export interface TelemetryBootstrapInstance {
  tracer: ReturnType<typeof trace.getTracer>;
  meter: ReturnType<typeof otelMetrics.getMeter>;
  shutdown: () => Promise<void>;
}

export function bootstrapTelemetry(opts: TelemetryBootstrapOptions): TelemetryBootstrapInstance {
  const {
    serviceName,
    version = process.env.SERVICE_VERSION || '0.0.0',
    environment = process.env.NODE_ENV || 'development',
    traces = { enabled: process.env.OTEL_TRACES_EXPORTER !== 'none' },
    metrics = { enabled: process.env.OTEL_METRICS_EXPORTER === 'prometheus', port: parseInt(process.env.PROMETHEUS_PORT || '9464'), endpoint: process.env.PROMETHEUS_ENDPOINT || '/metrics' },
  } = opts;

  const telemetryEnabled = process.env.TELEMETRY_ENABLED === 'true' || !!traces.enabled || !!metrics.enabled;

  if (metrics.enabled) process.env.OTEL_EXPORTER = 'prometheus';
  else if (traces.enabled) process.env.OTEL_EXPORTER = 'otlp';
  else process.env.OTEL_EXPORTER = 'none';

  const instance = initPreset({
    serviceName,
    version,
    environment,
    enabled: telemetryEnabled,
    exporters: {
      prometheus: metrics.enabled ? { port: metrics.port, endpoint: metrics.endpoint } : undefined,
      otlp: traces.enabled ? { endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT } : undefined,
    },
    instrumentations: {
      http: true,
      express: true,
      fastify: true,
      fs: false,
    },
  });

  return {
    tracer: instance.tracer,
    meter: instance.meter,
    shutdown: instance.shutdown,
  };
}

export function injectTraceHeaders(headers: Record<string, string> = {}): Record<string, string> {
  try {
    const carrier: Record<string, string> = { ...headers };
    propagation.inject(context.active(), carrier);
    return carrier;
  } catch {
    return headers;
  }
}

export async function withExtractedContext<T>(headers: Record<string, string> | undefined, fn: () => Promise<T>): Promise<T> {
  try {
    const carrier = headers || {};
    const ctx = propagation.extract(context.active(), carrier);
    return await context.with(ctx, fn);
  } catch {
    return await fn();
  }
}
