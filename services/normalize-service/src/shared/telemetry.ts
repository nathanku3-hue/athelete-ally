/**
 * Telemetry bootstrap with graceful fallbacks
 */

import { TelemetryBootstrap, WithExtractedContext, TelemetrySpan } from './types.js';
import { config } from './config.js';

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
