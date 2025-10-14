/**
 * Shared error handling utilities
 */

/**
 * Determines if an error is retryable based on error message
 */
export function isRetryable(err: unknown): boolean {
  const errMsg = err instanceof Error ? err.message : String(err);
  return errMsg.includes('ECONNREFUSED') ||
         errMsg.includes('timeout') ||
         errMsg.includes('ETIMEDOUT') ||
         errMsg.includes('Connection') ||
         errMsg.includes('ENOTFOUND');
}

/**
 * Error type classification for metrics and logging
 */
export type ErrorType = 'schema_invalid' | 'max_deliver' | 'non_retryable' | 'retry';

/**
 * Determines the error type for a given error and delivery attempt
 */
export function classifyError(err: unknown, attempt: number, maxDeliver: number): ErrorType {
  if (attempt >= maxDeliver) {
    return 'max_deliver';
  }
  if (isRetryable(err)) {
    return 'retry';
  }
  return 'non_retryable';
}
