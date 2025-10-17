/**
 * Scoring Payload Validator
 * 
 * Validates PlanScoringSummary payloads against the contract defined in
 * docs/contracts/SCORING_PAYLOAD_CONTRACT.md
 * 
 * Usage:
 *   import { validateScoringPayload } from './validation/scoring-validator';
 *   const result = validateScoringPayload(scoring);
 *   if (!result.valid) {
 *     console.error('Validation failed:', result.errors);
 *   }
 */

import type { PlanScoringSummary, PlanScoringFactorDetail } from '../types/scoring.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates a scoring payload against the contract
 */
export function validateScoringPayload(payload: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Type guard
  if (!payload || typeof payload !== 'object') {
    errors.push('Payload must be a non-null object');
    return { valid: false, errors, warnings };
  }

  const scoring = payload as Partial<PlanScoringSummary>;

  // Required fields
  if (!scoring.version) {
    errors.push('Missing required field: version');
  } else if (scoring.version !== 'fixed-weight-v1') {
    errors.push(`Invalid version: expected "fixed-weight-v1", got "${scoring.version}"`);
  }

  if (typeof scoring.total !== 'number') {
    errors.push('Missing or invalid field: total (must be number)');
  } else if (scoring.total < 0 || scoring.total > 1) {
    errors.push(`Invalid total score: ${scoring.total} (must be 0-1)`);
  } else if (isNaN(scoring.total)) {
    errors.push('Invalid total score: NaN');
  }

  // Weights
  if (!scoring.weights || typeof scoring.weights !== 'object') {
    errors.push('Missing or invalid field: weights');
  } else {
    validateWeights(scoring.weights, errors, warnings);
  }

  // Factors
  if (!scoring.factors || typeof scoring.factors !== 'object') {
    errors.push('Missing or invalid field: factors');
  } else {
    validateFactors(scoring.factors, errors, warnings);
  }

  // Metadata
  if (!scoring.metadata || typeof scoring.metadata !== 'object') {
    errors.push('Missing or invalid field: metadata');
  } else {
    validateMetadata(scoring.metadata, errors, warnings);
  }

  // Cross-validation
  if (scoring.weights && scoring.factors && errors.length === 0) {
    validateCrossReferences(scoring as PlanScoringSummary, errors, warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function validateWeights(
  weights: Partial<PlanScoringSummary['weights']>,
  errors: string[],
  warnings: string[]
): void {
  const required = ['safety', 'compliance', 'performance'] as const;

  for (const key of required) {
    if (typeof weights[key] !== 'number') {
      errors.push(`Missing or invalid weight: ${key} (must be number)`);
    } else if (weights[key]! < 0 || weights[key]! > 1) {
      errors.push(`Invalid weight ${key}: ${weights[key]} (must be 0-1)`);
    } else if (isNaN(weights[key]!)) {
      errors.push(`Invalid weight ${key}: NaN`);
    }
  }

  // Validate weights sum to ~1.0
  if (
    typeof weights.safety === 'number' &&
    typeof weights.compliance === 'number' &&
    typeof weights.performance === 'number'
  ) {
    const sum = weights.safety + weights.compliance + weights.performance;
    const tolerance = 0.01;
    if (Math.abs(sum - 1.0) > tolerance) {
      warnings.push(`Weights sum to ${sum.toFixed(4)}, expected ~1.0 (tolerance: ${tolerance})`);
    }
  }
}

function validateFactors(
  factors: Partial<PlanScoringSummary['factors']>,
  errors: string[],
  warnings: string[]
): void {
  const required = ['safety', 'compliance', 'performance'] as const;

  for (const key of required) {
    if (!factors[key] || typeof factors[key] !== 'object') {
      errors.push(`Missing or invalid factor: ${key}`);
    } else {
      validateFactorDetail(key, factors[key]!, errors, warnings);
    }
  }
}

function validateFactorDetail(
  factorName: string,
  factor: Partial<PlanScoringFactorDetail>,
  errors: string[],
  warnings: string[]
): void {
  const prefix = `Factor ${factorName}`;

  // Weight
  if (typeof factor.weight !== 'number') {
    errors.push(`${prefix}: missing or invalid weight`);
  } else if (factor.weight < 0 || factor.weight > 1) {
    errors.push(`${prefix}: invalid weight ${factor.weight} (must be 0-1)`);
  } else if (isNaN(factor.weight)) {
    errors.push(`${prefix}: invalid weight NaN`);
  }

  // Score
  if (typeof factor.score !== 'number') {
    errors.push(`${prefix}: missing or invalid score`);
  } else if (factor.score < 0 || factor.score > 1) {
    errors.push(`${prefix}: invalid score ${factor.score} (must be 0-1)`);
  } else if (isNaN(factor.score)) {
    errors.push(`${prefix}: invalid score NaN`);
  }

  // Contribution
  if (typeof factor.contribution !== 'number') {
    errors.push(`${prefix}: missing or invalid contribution`);
  } else if (factor.contribution < 0 || factor.contribution > 1) {
    errors.push(`${prefix}: invalid contribution ${factor.contribution} (must be 0-1)`);
  } else if (isNaN(factor.contribution)) {
    errors.push(`${prefix}: invalid contribution NaN`);
  }

  // Reasons
  if (!Array.isArray(factor.reasons)) {
    errors.push(`${prefix}: missing or invalid reasons (must be array)`);
  } else if (factor.reasons.length === 0) {
    warnings.push(`${prefix}: reasons array is empty`);
  } else {
    for (let i = 0; i < factor.reasons.length; i++) {
      if (typeof factor.reasons[i] !== 'string') {
        errors.push(`${prefix}: reasons[${i}] is not a string`);
      } else if (factor.reasons[i].trim().length === 0) {
        warnings.push(`${prefix}: reasons[${i}] is empty or whitespace`);
      }
    }
  }

  // Metrics
  if (!factor.metrics || typeof factor.metrics !== 'object') {
    errors.push(`${prefix}: missing or invalid metrics (must be object)`);
  } else {
    const metricKeys = Object.keys(factor.metrics);
    if (metricKeys.length === 0) {
      warnings.push(`${prefix}: metrics object is empty`);
    }
    for (const key of metricKeys) {
      if (typeof factor.metrics[key] !== 'number') {
        errors.push(`${prefix}: metrics.${key} is not a number`);
      } else if (isNaN(factor.metrics[key])) {
        errors.push(`${prefix}: metrics.${key} is NaN`);
      }
    }
  }

  // Cross-validation: contribution = weight × score (within tolerance)
  if (
    typeof factor.weight === 'number' &&
    typeof factor.score === 'number' &&
    typeof factor.contribution === 'number' &&
    !isNaN(factor.weight) &&
    !isNaN(factor.score) &&
    !isNaN(factor.contribution)
  ) {
    const expected = factor.weight * factor.score;
    const tolerance = 0.001;
    if (Math.abs(factor.contribution - expected) > tolerance) {
      errors.push(
        `${prefix}: contribution ${factor.contribution.toFixed(4)} does not match weight × score = ${expected.toFixed(4)}`
      );
    }
  }
}

function validateMetadata(
  metadata: Partial<PlanScoringSummary['metadata']>,
  errors: string[],
  warnings: string[]
): void {
  // evaluatedAt
  if (typeof metadata.evaluatedAt !== 'string') {
    errors.push('Metadata: missing or invalid evaluatedAt (must be string)');
  } else {
    const date = new Date(metadata.evaluatedAt);
    if (isNaN(date.getTime())) {
      errors.push(`Metadata: evaluatedAt "${metadata.evaluatedAt}" is not a valid ISO 8601 date`);
    }
  }

  // weeklySessionsPlanned
  if (typeof metadata.weeklySessionsPlanned !== 'number') {
    errors.push('Metadata: missing or invalid weeklySessionsPlanned (must be number)');
  } else if (metadata.weeklySessionsPlanned < 0) {
    errors.push(`Metadata: weeklySessionsPlanned ${metadata.weeklySessionsPlanned} must be >= 0`);
  } else if (isNaN(metadata.weeklySessionsPlanned)) {
    errors.push('Metadata: weeklySessionsPlanned is NaN');
  }

  // weeklyGoalDays (optional)
  if (metadata.weeklyGoalDays !== undefined) {
    if (typeof metadata.weeklyGoalDays !== 'number') {
      errors.push('Metadata: weeklyGoalDays must be number if present');
    } else if (metadata.weeklyGoalDays < 0) {
      errors.push(`Metadata: weeklyGoalDays ${metadata.weeklyGoalDays} must be >= 0`);
    } else if (isNaN(metadata.weeklyGoalDays)) {
      errors.push('Metadata: weeklyGoalDays is NaN');
    }
  }

  // requestContext (optional)
  if (metadata.requestContext !== undefined) {
    if (typeof metadata.requestContext !== 'object' || metadata.requestContext === null) {
      errors.push('Metadata: requestContext must be object if present');
    } else {
      const ctx = metadata.requestContext;
      if (ctx.availabilityDays !== undefined && typeof ctx.availabilityDays !== 'number') {
        errors.push('Metadata: requestContext.availabilityDays must be number if present');
      }
      if (ctx.weeklyGoalDays !== undefined && typeof ctx.weeklyGoalDays !== 'number') {
        errors.push('Metadata: requestContext.weeklyGoalDays must be number if present');
      }
    }
  }
}

function validateCrossReferences(
  scoring: PlanScoringSummary,
  errors: string[],
  warnings: string[]
): void {
  // Validate factor weights match top-level weights
  const factors = ['safety', 'compliance', 'performance'] as const;
  for (const factor of factors) {
    const topWeight = scoring.weights[factor];
    const factorWeight = scoring.factors[factor].weight;
    if (Math.abs(topWeight - factorWeight) > 0.001) {
      errors.push(
        `Weight mismatch for ${factor}: weights.${factor}=${topWeight} but factors.${factor}.weight=${factorWeight}`
      );
    }
  }

  // Validate total = sum of contributions
  const totalContribution =
    scoring.factors.safety.contribution +
    scoring.factors.compliance.contribution +
    scoring.factors.performance.contribution;
  const tolerance = 0.001;
  if (Math.abs(scoring.total - totalContribution) > tolerance) {
    errors.push(
      `Total score ${scoring.total.toFixed(4)} does not match sum of contributions ${totalContribution.toFixed(4)}`
    );
  }
}

/**
 * Validates multiple scoring payloads and returns aggregate results
 */
export function validateScoringPayloads(payloads: unknown[]): {
  valid: boolean;
  results: ValidationResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
} {
  const results = payloads.map((payload, idx) => {
    const result = validateScoringPayload(payload);
    if (!result.valid) {
      result.errors.unshift(`Payload ${idx}:`);
    }
    return result;
  });

  const passed = results.filter((r) => r.valid).length;
  const failed = results.filter((r) => !r.valid).length;

  return {
    valid: failed === 0,
    results,
    summary: {
      total: payloads.length,
      passed,
      failed,
    },
  };
}
