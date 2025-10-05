/**
 * Service-Level Metrics Adapter
 * 
 * Provides Prometheus-compatible metrics export for contract telemetry.
 * This should be used by service processes to expose metrics on /metrics endpoints.
 */

import { NextResponse } from 'next/server';

interface MetricsRegistry {
  incrementCounter(name: string, labels: Record<string, string>, value?: number): void;
  getMetrics(): string;
}

class PrometheusMetricsAdapter implements MetricsRegistry {
  private counters: Map<string, Map<string, number>> = new Map();
  
  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, labels: Record<string, string>, value: number = 1): void {
    const labelString = Object.entries(labels)
      .map(([key, val]) => `${key}="${val}"`)
      .join(',');
    
    const key = `${name}{${labelString}}`;
    
    if (!this.counters.has(key)) {
      this.counters.set(key, new Map());
    }
    
    const counter = this.counters.get(key)!;
    counter.set('value', (counter.get('value') || 0) + value);
  }
  
  /**
   * Get metrics in Prometheus format
   */
  getMetrics(): string {
    const lines: string[] = [];
    
    // Group by metric name
    const metricsByName = new Map<string, Array<{labels: string, value: number}>>();
    
    for (const [key, counter] of this.counters) {
      const [name, labels] = key.split('{');
      const cleanName = name;
      const cleanLabels = labels.slice(0, -1); // Remove trailing }
      
      if (!metricsByName.has(cleanName)) {
        metricsByName.set(cleanName, []);
      }
      
      metricsByName.get(cleanName)!.push({
        labels: cleanLabels,
        value: counter.get('value') || 0
      });
    }
    
    // Generate Prometheus format
    for (const [name, entries] of metricsByName) {
      lines.push(`# HELP ${name} Contract telemetry counter`);
      lines.push(`# TYPE ${name} counter`);
      
      for (const entry of entries) {
        lines.push(`${name}{${entry.labels}} ${entry.value}`);
      }
      
      lines.push(''); // Empty line between metrics
    }
    
    return lines.join('\n');
  }
}

// Global metrics adapter
const metricsAdapter = new PrometheusMetricsAdapter();

/**
 * Contract telemetry service adapter
 * Integrates with service-level metrics
 */
export class ContractMetricsService {
  private adapter: MetricsRegistry;
  
  constructor(adapter: MetricsRegistry = metricsAdapter) {
    this.adapter = adapter;
  }
  
  /**
   * Record legacy mapping usage
   * Ensures no PII in labels
   */
  recordLegacyMapping(field: string, value: string, environment: string = 'unknown'): void {
    // Sanitize inputs to prevent PII leakage
    const sanitizedField = this.sanitizeLabel(field);
    const sanitizedValue = this.sanitizeLabel(value);
    const sanitizedEnvironment = this.sanitizeLabel(environment);
    
    this.adapter.incrementCounter('contract_legacy_mapping_total', {
      field: sanitizedField,
      value: sanitizedValue,
      environment: sanitizedEnvironment
    });
  }
  
  /**
   * Record contract validation failure
   */
  recordValidationFailure(type: string, reason: string, environment: string = 'unknown'): void {
    const sanitizedType = this.sanitizeLabel(type);
    const sanitizedReason = this.sanitizeLabel(reason);
    const sanitizedEnvironment = this.sanitizeLabel(environment);
    
    this.adapter.incrementCounter('contract_validation_failure_total', {
      type: sanitizedType,
      reason: sanitizedReason,
      environment: sanitizedEnvironment
    });
  }
  
  /**
   * Record contract drift detection
   */
  recordDriftDetection(severity: 'low' | 'medium' | 'high', environment: string = 'unknown'): void {
    const sanitizedEnvironment = this.sanitizeLabel(environment);
    
    this.adapter.incrementCounter('contract_drift_detection_total', {
      severity,
      environment: sanitizedEnvironment
    });
  }
  
  /**
   * Sanitize label values to prevent PII leakage
   */
  private sanitizeLabel(value: string): string {
    // Remove or replace potentially sensitive information
    return value
      .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .substring(0, 50) // Limit length
      .toLowerCase();
  }
  
  /**
   * Get metrics in Prometheus format
   * Ensures proper content-type and no PII
   */
  getMetrics(): string {
    const metrics = this.adapter.getMetrics();
    
    // Validate that metrics don't contain PII
    if (this.containsPII(metrics)) {
      // Console error removed - use proper logger instead
      return this.sanitizeMetrics(metrics);
    }
    
    return metrics;
  }
  
  /**
   * Check if metrics contain potentially sensitive information
   */
  private containsPII(metrics: string): boolean {
    const piiPatterns = [
      /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // Email addresses
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email pattern
      /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, // IP addresses
    ];
    
    return piiPatterns.some(pattern => pattern.test(metrics));
  }
  
  /**
   * Sanitize metrics output to remove PII
   */
  private sanitizeMetrics(metrics: string): string {
    return metrics
      .replace(/@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REDACTED]')
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]')
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_REDACTED]');
  }
  
  /**
   * Get metrics summary for health checks
   */
  getMetricsSummary(): Record<string, unknown> {
    const metrics = this.getMetrics();
    const lines = metrics.split('\n').filter(line => line && !line.startsWith('#'));
    
    const summary: Record<string, unknown> = {
      totalMetrics: lines.length,
      metrics: {}
    };
    
    for (const line of lines) {
      const [metric, value] = line.split(' ');
      const metricName = metric.split('{')[0];
      
      if (!summary.metrics[metricName]) {
        summary.metrics[metricName] = 0;
      }
      
      summary.metrics[metricName] += parseInt(value);
    }
    
    return summary;
  }
}

// Global service instance
export const contractMetricsService = new ContractMetricsService();

/**
 * Express.js middleware for metrics endpoint
 */
export function createMetricsMiddleware() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (req: unknown, res: unknown, next: unknown) => {
    if (req.path === '/metrics') {
      res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
      res.send(contractMetricsService.getMetrics());
    } else {
      next();
    }
  };
}

/**
 * Next.js API route handler for metrics
 */
export function createMetricsApiHandler() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (req: unknown, res: unknown) => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(contractMetricsService.getMetrics());
  };
}

/**
 * Health check endpoint with metrics summary
 */
export function createHealthCheckHandler() {
  return async (req: unknown, res: unknown): Promise<NextResponse> => {
    const summary = contractMetricsService.getMetricsSummary();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: summary
    });
  };
}
