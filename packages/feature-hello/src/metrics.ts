/**
 * Feature Hello Metrics
 * 
 * Example metrics implementation for the pilot package.
 */

export interface MetricsCollector {
  increment(counter: string, tags?: Record<string, string>): void;
  timing(metric: string, value: number, tags?: Record<string, string>): void;
}

export class HelloMetrics implements MetricsCollector {
  private metrics: Map<string, number> = new Map();

  increment(counter: string, tags?: Record<string, string>): void {
    const key = tags ? `${counter}:${JSON.stringify(tags)}` : counter;
    const current = this.metrics.get(key) || 0;
    this.metrics.set(key, current + 1);
  }

  timing(metric: string, value: number, tags?: Record<string, string>): void {
    const key = tags ? `${metric}:${JSON.stringify(tags)}` : metric;
    this.metrics.set(key, value);
  }

  getMetrics(): Map<string, number> {
    return new Map(this.metrics);
  }
}

export const defaultMetrics = new HelloMetrics();
