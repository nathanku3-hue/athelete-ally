import { TrainingPlan } from '../llm.js';
import {
  PlanCompressionInput,
  CompressionOutcome,
  buildTimeCrunchInput,
  compressPlan
} from './index.js';

export type TimeCrunchPreviewErrorCode = 'plan_not_compressible';

export class TimeCrunchPreviewError extends Error {
  constructor(public readonly code: TimeCrunchPreviewErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'TimeCrunchPreviewError';
  }
}

export interface TimeCrunchPreviewResult {
  input: PlanCompressionInput;
  outcome: CompressionOutcome;
}

export function generateTimeCrunchPreview(
  plan: TrainingPlan,
  targetMinutes: number
): TimeCrunchPreviewResult {
  const compressionInput = buildTimeCrunchInput(plan);

  if (!compressionInput) {
    throw new TimeCrunchPreviewError('plan_not_compressible', 'Plan cannot be compressed');
  }

  const outcome = compressPlan(compressionInput, { targetMinutes });
  return {
    input: compressionInput,
    outcome
  };
}
