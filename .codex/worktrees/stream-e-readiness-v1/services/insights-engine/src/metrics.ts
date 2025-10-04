// Prometheus metrics for insights-engine readiness API
// Uses shared registry to avoid duplicate default metrics across services
import crypto from 'crypto';
import { Counter, Histogram } from 'prom-client';
import { getMetricsRegistry } from '@athlete-ally/shared';

const register = getMetricsRegistry();

// Hash user id to keep low-cardinality label while allowing grouping in dev
function hashUser(userId: string): string {
  try {
    return crypto.createHash('sha256').update(userId).digest('hex').slice(0, 12);
  } catch {
    return 'anon';
  }
}

// Whether to include user label (default false to limit cardinality); enable per env
const includeUserLabel = (process.env.METRICS_INCLUDE_USER === 'true');

export const readinessComputeTotal = new Counter({
  name: 'readiness_compute_total',
  help: 'Total compute attempts for readiness v1',
  labelNames: includeUserLabel ? ['operation', 'status', 'user'] as const : ['operation', 'status'] as const,
  registers: [register],
});

export const readinessComputeDurationSeconds = new Histogram({
  name: 'readiness_compute_duration_seconds',
  help: 'Duration of readiness computation in seconds',
  labelNames: ['operation', 'status'],
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
  registers: [register],
});

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'HTTP requests count',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

export async function timeCompute<T>(operation: 'latest' | 'range', userId: string, fn: () => Promise<T>): Promise<{ result: 'success' | 'error'; value?: T; error?: unknown }> {
  const start = process.hrtime.bigint();
  try {
    const value = await fn();
    const dur = Number(process.hrtime.bigint() - start) / 1e9; // seconds
    readinessComputeDurationSeconds.labels(operation, 'success').observe(dur);
    if (includeUserLabel) readinessComputeTotal.labels(operation, 'success', hashUser(userId)).inc(1);
    else readinessComputeTotal.labels(operation, 'success').inc(1);
    return { result: 'success', value };
  } catch (error) {
    const dur = Number(process.hrtime.bigint() - start) / 1e9; // seconds
    readinessComputeDurationSeconds.labels(operation, 'error').observe(dur);
    if (includeUserLabel) readinessComputeTotal.labels(operation, 'error', hashUser(userId)).inc(1);
    else readinessComputeTotal.labels(operation, 'error').inc(1);
    return { result: 'error', error };
  }
}

export function incHttpRequest(method: string, route: string, status: number): void {
  httpRequestsTotal.labels(method.toUpperCase(), route, String(status)).inc(1);
}

export async function renderMetrics(): Promise<string> {
  // prom-client registers are managed via shared registry; export its metrics
  return await register.metrics();
}

