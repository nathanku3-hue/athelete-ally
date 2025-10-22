import { CompressionConfig } from './types.js';

export const DEFAULT_COMPRESSION_CONFIG: CompressionConfig = {
  coreLiftSetCap: 3,
  coreLiftRestSeconds: 150,
  supersetRestSeconds: 45,
  blockInterExerciseRestSeconds: 15,
  blockRoundRestSeconds: 60,
  maxBlockExercises: 3
};

export function resolveCompressionConfig(
  overrides?: Partial<CompressionConfig>
): CompressionConfig {
  return {
    ...DEFAULT_COMPRESSION_CONFIG,
    ...(overrides ?? {})
  };
}
