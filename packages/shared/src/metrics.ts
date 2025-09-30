/**
 * @fileoverview Metrics bootstrap helper
 * Ensures default metrics are registered only once across all services
 */

import { register, collectDefaultMetrics, Registry } from 'prom-client';

let defaultMetricsRegistered = false;
let defaultRegistry: Registry;

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
