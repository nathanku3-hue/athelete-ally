/**
 * Telemetry and metrics setup for normalize-service
 */

import { Counter } from 'prom-client';
import { getMetricsRegistry } from '@athlete-ally/shared';
import { config } from './config.js';
import type { TelemetryBootstrap, WithExtractedContext, TelemetrySpan } from './types.js';

// Optional telemetry bootstrap (fallback to no-op if package unavailable)
/* eslint-disable @typescript-eslint/no-require-imports */
let bootstrapTelemetry: (opts: unknown) => TelemetryBootstrap;
let withExtractedContext: WithExtractedContext;

try {
  ({ bootstrapTelemetry, withExtractedContext } = require('@athlete-ally/telemetry-bootstrap'));
} catch {
  // No-op fallbacks
  withExtractedContext = async (_headers: Record<string, string>, fn: () => Promise<void>) => await fn();
  bootstrapTelemetry = () => ({
    tracer: {
      startActiveSpan: async (_name: string, fn: (span: TelemetrySpan) => Promise<void>) => await fn({
        setAttribute() {}, setStatus() {}, end() {}, recordException() {}
      })
    },
    meter: { createCounter: () => ({ add: () => {} }) }
  });
}
/* eslint-enable @typescript-eslint/no-require-imports */

// Bootstrap telemetry early (traces + Prometheus exporter)
export const telemetry = bootstrapTelemetry({
  serviceName: 'normalize-service',
  traces: { enabled: true },
  metrics: {
    enabled: true,
    port: config.prometheusPort,
    endpoint: config.prometheusEndpoint
  },
});

export { withExtractedContext };

// Get shared metrics registry (ensures default metrics registered only once)
const register = getMetricsRegistry();

// Prometheus Counters
export const promHrvMessagesCounter = new Counter({
  name: 'normalize_hrv_messages_total',
  help: 'Total number of HRV messages processed by normalize service',
  labelNames: ['result', 'subject', 'stream', 'durable'],
  registers: [register]
});

export const promSleepMessagesCounter = new Counter({
  name: 'normalize_sleep_messages_total',
  help: 'Total number of Sleep messages processed by normalize service',
  labelNames: ['result', 'subject', 'stream', 'durable'],
  registers: [register]
});

export const dlqMessagesCounter = new Counter({
  name: 'dlq_messages_total',
  help: 'Total number of messages sent to Dead Letter Queue',
  labelNames: ['consumer', 'reason', 'subject'],
  registers: [register]
});

export { register };
