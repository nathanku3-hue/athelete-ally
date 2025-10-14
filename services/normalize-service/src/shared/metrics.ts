/**
 * Prometheus metrics setup for normalize-service
 */

import { Counter, Registry } from 'prom-client';
import { getMetricsRegistry } from '@athlete-ally/shared';

// Get shared metrics registry (ensures default metrics registered only once)
export const register: Registry = getMetricsRegistry();

// HRV messages counter with full labels
export const promHrvMessagesCounter = new Counter({
  name: 'normalize_hrv_messages_total',
  help: 'Total number of HRV messages processed by normalize service',
  labelNames: ['result', 'subject', 'stream', 'durable'],
  registers: [register]
});

// Sleep messages counter with full labels
export const promSleepMessagesCounter = new Counter({
  name: 'normalize_sleep_messages_total',
  help: 'Total number of Sleep messages processed by normalize service',
  labelNames: ['result', 'subject', 'stream', 'durable'],
  registers: [register]
});

// DLQ messages counter (cross-cutting metric for alerting)
export const dlqMessagesCounter = new Counter({
  name: 'dlq_messages_total',
  help: 'Total number of messages sent to Dead Letter Queue',
  labelNames: ['consumer', 'reason', 'subject'],
  registers: [register]
});
