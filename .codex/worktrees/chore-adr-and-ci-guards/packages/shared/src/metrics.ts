/**
 * @fileoverview Metrics bootstrap helper
 * Ensures default metrics are registered only once across all services
 */

import { register, collectDefaultMetrics, Registry } from 'prom-client';

let defaultMetricsRegistered = false;
let defaultRegistry: Registry;

/**
 * Enhanced metrics for normalize service with stream and durable labels
 */
export const normalizeHrvMessagesTotal = {
  name: 'normalize_hrv_messages_total',
  help: 'Total number of HRV messages processed by normalize service',
  labelNames: [
    { name: 'result', help: 'Processing result: success, retry, dlq, schema_invalid' },
    { name: 'subject', help: 'NATS subject that was processed' },
    { name: 'stream', help: 'JetStream stream name' },
    { name: 'durable', help: 'JetStream consumer durable name' },
  ],
};

/**
 * Get the default metrics registry, ensuring default metrics are registered only once
 */
export function getMetricsRegistry(): Registry {
  if (!defaultRegistry) {
    defaultRegistry = register;
    
    if (!defaultMetricsRegistered) {
      collectDefaultMetrics({ register: defaultRegistry });
      defaultMetricsRegistered = true;
    }
  }
  
  return defaultRegistry;
}

/**
 * Check if default metrics have been registered
 */
export function isDefaultMetricsRegistered(): boolean {
  return defaultMetricsRegistered;
}

/**
 * Reset the metrics state (useful for testing)
 */
export function resetMetricsState(): void {
  defaultMetricsRegistered = false;
  defaultRegistry = register;
}
