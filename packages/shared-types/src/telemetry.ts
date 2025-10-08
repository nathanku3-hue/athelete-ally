/**
 * Contract Telemetry - Legacy Mapping Metrics
 * 
 * Tracks usage of backward compatibility mappings to inform deprecation timing.
 */

interface LegacyMappingMetric {
  field: string;
  value: string;
  timestamp: number;
  environment: string;
}

class ContractTelemetry {
  private metrics: LegacyMappingMetric[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 events
  
  /**
   * Record a legacy mapping usage
   */
  recordLegacyMapping(field: string, value: string, environment: string = 'unknown') {
    const metric: LegacyMappingMetric = {
      field,
      value,
      timestamp: Date.now(),
      environment
    };
    
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log warning for monitoring
    // eslint-disable-next-line no-console
    console.warn(`⚠️ Legacy mapping used: ${field}="${value}" in ${environment}`);

    // In production, you might want to send this to your metrics system
    // e.g., Prometheus, DataDog, etc.
    this.sendToMetricsSystem(metric);
  }
  
  /**
   * Get metrics summary
   */
  getMetricsSummary() {
    const summary = this.metrics.reduce((acc, metric) => {
      const key = `${metric.field}:${metric.value}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalMappings: this.metrics.length,
      byFieldValue: summary,
      recentMappings: this.metrics.slice(-10) // Last 10 mappings
    };
  }
  
  /**
   * Check if legacy mappings are still being used
   */
  hasRecentLegacyUsage(hoursThreshold: number = 24): boolean {
    const threshold = Date.now() - (hoursThreshold * 60 * 60 * 1000);
    return this.metrics.some(metric => metric.timestamp > threshold);
  }
  
  /**
   * Send to external metrics system (placeholder)
   */
  private sendToMetricsSystem(metric: LegacyMappingMetric) {
    // Placeholder for actual metrics system integration
    // In production, you might use:
    // - Prometheus: prometheusClient.increment('contract_legacy_mapping_total', { field: metric.field, value: metric.value })
    // - DataDog: datadogClient.increment('contract.legacy_mapping', { field: metric.field, value: metric.value })
    // - Custom API: fetch('/api/metrics', { method: 'POST', body: JSON.stringify(metric) })
    
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Prometheus-style metrics
      // eslint-disable-next-line no-console
      console.log(`METRIC: contract_legacy_mapping_total{field="${metric.field}",value="${metric.value}",environment="${metric.environment}"} 1`);
    }
  }
}

// Global telemetry instance
export const contractTelemetry = new ContractTelemetry();

/**
 * Helper function to record legacy mapping usage
 */
export function recordLegacyMapping(field: string, value: string, environment?: string) {
  contractTelemetry.recordLegacyMapping(field, value, environment);
}

/**
 * Get current metrics summary
 */
export function getContractMetrics() {
  return contractTelemetry.getMetricsSummary();
}

/**
 * Check if legacy usage is still active
 */
export function hasActiveLegacyUsage(hoursThreshold?: number) {
  return contractTelemetry.hasRecentLegacyUsage(hoursThreshold);
}
