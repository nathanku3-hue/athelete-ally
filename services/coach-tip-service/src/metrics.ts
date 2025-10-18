/**
 * Prometheus metrics for coach-tip-service
 *
 * Tracks tip generation operations, Redis operations, and error types
 * for comprehensive observability of the CoachTip service.
 */

import { Counter, Histogram, Registry } from 'prom-client';
import { getMetricsRegistry } from '@athlete-ally/shared';

// Get shared metrics registry (ensures default metrics registered only once)
export const register: Registry = getMetricsRegistry();

/**
 * Error types for coach-tip-service operations
 */
export enum ErrorType {
  SCHEMA_VALIDATION_FAILED = 'schema_validation_failed',
  REDIS_CONNECTION_ERROR = 'redis_connection_error',
  TIP_GENERATION_FAILED = 'tip_generation_failed',
  STORAGE_ERROR = 'storage_error',
  MISSING_SCORING_DATA = 'missing_scoring_data',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Event processing results
 */
export enum ProcessingResult {
  SUCCESS = 'success',
  SKIPPED_NO_SCORING = 'skipped_no_scoring',
  SKIPPED_DUPLICATE = 'skipped_duplicate',
  ERROR = 'error'
}

// ============================================================================
// Event Processing Metrics
// ============================================================================

/**
 * Total number of plan_generated events received
 */
export const eventsReceivedCounter = new Counter({
  name: 'coach_tip_events_received_total',
  help: 'Total number of plan_generated events received by CoachTip service',
  labelNames: ['topic'],
  registers: [register]
});

/**
 * Total number of tips generated and stored
 */
export const tipsGeneratedCounter = new Counter({
  name: 'coach_tip_tips_generated_total',
  help: 'Total number of coaching tips generated and stored',
  labelNames: ['tip_type', 'priority'],
  registers: [register]
});

/**
 * Total number of tip generation operations skipped
 */
export const tipsSkippedCounter = new Counter({
  name: 'coach_tip_tips_skipped_total',
  help: 'Total number of tip generation operations skipped',
  labelNames: ['reason'],
  registers: [register]
});

/**
 * Total number of errors during event processing
 */
export const processingErrorsCounter = new Counter({
  name: 'coach_tip_processing_errors_total',
  help: 'Total number of errors during event processing',
  labelNames: ['error_type', 'stage'],
  registers: [register]
});

// ============================================================================
// Operation Duration Metrics
// ============================================================================

/**
 * Duration of tip generation operations
 */
export const tipGenerationDuration = new Histogram({
  name: 'coach_tip_generation_duration_seconds',
  help: 'Duration of tip generation operations',
  labelNames: ['status'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  registers: [register]
});

/**
 * Duration of Redis storage operations
 */
export const redisOperationDuration = new Histogram({
  name: 'coach_tip_redis_operation_duration_seconds',
  help: 'Duration of Redis storage operations',
  labelNames: ['operation', 'status'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5],
  registers: [register]
});

/**
 * End-to-end event processing duration (from event received to tip stored)
 */
export const eventProcessingDuration = new Histogram({
  name: 'coach_tip_event_processing_duration_seconds',
  help: 'End-to-end duration of event processing (from received to stored)',
  labelNames: ['result'],
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register]
});

// ============================================================================
// Business Logic Metrics
// ============================================================================

/**
 * Total number of scoring data extractions
 */
export const scoringExtractionsCounter = new Counter({
  name: 'coach_tip_scoring_extractions_total',
  help: 'Total number of scoring data extraction attempts',
  labelNames: ['status'],
  registers: [register]
});

/**
 * Total number of tip candidates generated during analysis
 */
export const tipCandidatesCounter = new Counter({
  name: 'coach_tip_candidates_generated_total',
  help: 'Total number of tip candidates generated during scoring analysis',
  labelNames: ['tip_type'],
  registers: [register]
});

// ============================================================================
// Redis Operation Metrics
// ============================================================================

/**
 * Total number of Redis operations
 */
export const redisOperationsCounter = new Counter({
  name: 'coach_tip_redis_operations_total',
  help: 'Total number of Redis operations',
  labelNames: ['operation', 'status'],
  registers: [register]
});

/**
 * Total number of Redis errors
 */
export const redisErrorsCounter = new Counter({
  name: 'coach_tip_redis_errors_total',
  help: 'Total number of Redis errors',
  labelNames: ['operation', 'error_type'],
  registers: [register]
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Classify error into appropriate error type
 */
export function classifyError(error: unknown): ErrorType {
  if (!error) return ErrorType.UNKNOWN_ERROR;

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorLower = errorMessage.toLowerCase();

  // Redis errors
  if (errorLower.includes('redis') || errorLower.includes('connection')) {
    return ErrorType.REDIS_CONNECTION_ERROR;
  }

  // Schema validation errors
  if (errorLower.includes('schema') || errorLower.includes('validation')) {
    return ErrorType.SCHEMA_VALIDATION_FAILED;
  }

  // Tip generation errors
  if (errorLower.includes('tip generation') || errorLower.includes('generatetips')) {
    return ErrorType.TIP_GENERATION_FAILED;
  }

  // Storage errors
  if (errorLower.includes('storage') || errorLower.includes('store')) {
    return ErrorType.STORAGE_ERROR;
  }

  // Missing data errors
  if (errorLower.includes('scoring') || errorLower.includes('missing')) {
    return ErrorType.MISSING_SCORING_DATA;
  }

  return ErrorType.UNKNOWN_ERROR;
}

/**
 * Record a successful event processing
 */
export function recordSuccessfulProcessing(
  tipType: string,
  priority: string,
  duration: number
): void {
  tipsGeneratedCounter.inc({ tip_type: tipType, priority });
  eventProcessingDuration.observe({ result: ProcessingResult.SUCCESS }, duration);
}

/**
 * Record a skipped event processing
 */
export function recordSkippedProcessing(reason: string, duration: number): void {
  tipsSkippedCounter.inc({ reason });
  eventProcessingDuration.observe({ result: reason }, duration);
}

/**
 * Record an error during processing
 */
export function recordProcessingError(
  error: unknown,
  stage: string,
  duration: number
): void {
  const errorType = classifyError(error);
  processingErrorsCounter.inc({ error_type: errorType, stage });
  eventProcessingDuration.observe({ result: ProcessingResult.ERROR }, duration);
}

/**
 * Record Redis operation metrics
 */
export function recordRedisOperation(
  operation: string,
  success: boolean,
  duration: number,
  error?: unknown
): void {
  const status = success ? 'success' : 'error';

  redisOperationsCounter.inc({ operation, status });
  redisOperationDuration.observe({ operation, status }, duration);

  if (!success && error) {
    const errorType = classifyError(error);
    redisErrorsCounter.inc({ operation, error_type: errorType });
  }
}
