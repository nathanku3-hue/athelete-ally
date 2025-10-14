/**
 * Main configuration re-export
 * Centralizes config from shared module for convenience
 */

export { config } from './shared/config.js';

// Re-export commonly used constants
export const BATCH_SIZE = 10;
export const EXPIRES_MS = 5000;
export const IDLE_BACKOFF_MS = 50;
