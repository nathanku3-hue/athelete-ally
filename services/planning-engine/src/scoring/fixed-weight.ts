import { TrainingPlan, TrainingPlanRequest } from '../llm.js';
import { PlanScoringSummary } from '../types/scoring.js';

const SAFETY_WEIGHT = 0.6;
const COMPLIANCE_WEIGHT = 0.3;
const PERFORMANCE_WEIGHT = 0.1;

const SCORING_VERSION = 'fixed-weight-v1';

interface SafetyAssessment {
  score: number;
  reasons: string[];
  metrics: {
    totalSessions: number;
    highIntensityRatio: number;
    averageRestDays: number;
    deloadWeeks: number;
  };
}

interface ComplianceAssessment {
  score: number;
  reasons: string[];
  metrics: {
    plannedWeeklySessions: number;
    weeklyGoalDays?: number;
    availabilityDays?: number;
    deviation: number;
  };
}

interface PerformanceAssessment {
  score: number;
  reasons: string[];
  metrics: {
    progressionPhases: number;
    intensityVariety: number;
    durationWeeks?: number;
  };
}

export function scorePlanCandidate(
  plan: TrainingPlan,
  request: TrainingPlanRequest
): PlanScoringSummary {
  const microcycles = Array.isArray((plan as any).microcycles) ? (plan as any).microcycles : [];
  const sessions = microcycles.flatMap((mc: any) => (Array.isArray(mc.sessions) ? mc.sessions : []));

  const plannedWeeklySessions = calculatePlannedWeeklySessions(microcycles, sessions.length);

  const safety = assessSafety(microcycles, sessions);
  const compliance = assessCompliance(plannedWeeklySessions, request);
  const performance = assessPerformance(plan, microcycles, sessions);

  const total = round(
    safety.score * SAFETY_WEIGHT +
      compliance.score * COMPLIANCE_WEIGHT +
      performance.score * PERFORMANCE_WEIGHT
  );

  return {
    version: SCORING_VERSION,
    total,
    weights: {
      safety: SAFETY_WEIGHT,
      compliance: COMPLIANCE_WEIGHT,
      performance: PERFORMANCE_WEIGHT,
    },
    factors: {
      safety: {
        weight: SAFETY_WEIGHT,
        score: round(safety.score),
        contribution: round(safety.score * SAFETY_WEIGHT),
        reasons: safety.reasons,
        metrics: safety.metrics,
      },
      compliance: {
        weight: COMPLIANCE_WEIGHT,
        score: round(compliance.score),
        contribution: round(compliance.score * COMPLIANCE_WEIGHT),
        reasons: compliance.reasons,
        metrics: compliance.metrics,
      },
      performance: {
        weight: PERFORMANCE_WEIGHT,
        score: round(performance.score),
        contribution: round(performance.score * PERFORMANCE_WEIGHT),
        reasons: performance.reasons,
        metrics: performance.metrics,
      },
    },
    metadata: {
      evaluatedAt: new Date().toISOString(),
      weeklySessionsPlanned: round(plannedWeeklySessions),
      weeklyGoalDays: request.weeklyGoalDays,
      requestContext: {
        availabilityDays: request.availabilityDays,
        weeklyGoalDays: request.weeklyGoalDays,
      },
    },
  };
}

function assessSafety(microcycles: any[], sessions: any[]): SafetyAssessment {
  if (sessions.length === 0) {
    return {
      score: 0.7,
      reasons: ['No sessions scheduled; defaulting safety score'],
      metrics: {
        totalSessions: 0,
        highIntensityRatio: 0,
        averageRestDays: 7,
        deloadWeeks: 0,
      },
    };
  }

  const highIntensitySessions = sessions.filter((session) =>
    typeof session.intensity === 'string' && session.intensity.toLowerCase() === 'high'
  ).length;

  const uniqueTrainingDays = new Set(
    sessions
      .map((session) =>
        typeof session.dayOfWeek === 'number'
          ? session.dayOfWeek
          : typeof session.day === 'number'
          ? session.day
          : null
      )
      .filter((day): day is number => day !== null)
  );

  const averageRestDays = Math.max(0, 7 - uniqueTrainingDays.size);
  const deloadWeeks = microcycles.filter((mc) => mc && mc.deload === true).length;
  const highIntensityRatio = highIntensitySessions / sessions.length;

  let score = 1;
  const reasons: string[] = [];

  if (highIntensityRatio > 0.4) {
    score -= Math.min(0.4, highIntensityRatio * 0.6);
    reasons.push(
      `High-intensity sessions represent ${(highIntensityRatio * 100).toFixed(1)}% of weekly work`);
  } else {
    score -= highIntensityRatio * 0.2;
    reasons.push('Intensity distribution remains within safe thresholds');
  }

  if (averageRestDays < 2) {
    score -= 0.15;
    reasons.push(`Limited rest days detected (${averageRestDays.toFixed(1)} per week)`);
  } else {
    reasons.push(`Rest days allocated (${averageRestDays.toFixed(1)} per week)`);
  }

  if (deloadWeeks > 0) {
    score += 0.05;
    reasons.push(`Deload structure present in ${deloadWeeks} microcycle(s)`);
  }

  return {
    score: clamp(score, 0, 1),
    reasons,
    metrics: {
      totalSessions: sessions.length,
      highIntensityRatio: round(highIntensityRatio),
      averageRestDays: round(averageRestDays),
      deloadWeeks,
    },
  };
}

function assessCompliance(
  plannedWeeklySessions: number,
  request: TrainingPlanRequest
): ComplianceAssessment {
  const reasons: string[] = [];

  const weeklyGoal =
    request.selectedDaysPerWeek ??
    request.weeklyGoalDays ??
    request.availabilityDays ??
    plannedWeeklySessions;

  if (!weeklyGoal || weeklyGoal <= 0) {
    reasons.push('No weekly cadence supplied; defaulting compliance score');
    return {
      score: 0.8,
      reasons,
      metrics: {
        plannedWeeklySessions: round(plannedWeeklySessions),
        deviation: round(plannedWeeklySessions),
      },
    };
  }

  const deviation = Math.abs(plannedWeeklySessions - weeklyGoal);
  const normalizedDeviation = deviation / Math.max(weeklyGoal, 1);

  let score = 1 - normalizedDeviation * 0.75;

  if (deviation < 0.25) {
    reasons.push('Planned weekly sessions match the athlete goal');
  } else if (plannedWeeklySessions < weeklyGoal) {
    reasons.push(
      `Plan schedules ${plannedWeeklySessions.toFixed(1)} sessions versus target ${weeklyGoal}`
    );
  } else {
    reasons.push(
      `Plan schedules ${plannedWeeklySessions.toFixed(1)} sessions exceeding target ${weeklyGoal}`
    );
  }

  if (plannedWeeklySessions === 0) {
    score = 0;
    reasons.push('Plan has zero sessions scheduled for the week');
  }

  return {
    score: clamp(score, 0, 1),
    reasons,
    metrics: {
      plannedWeeklySessions: round(plannedWeeklySessions),
      weeklyGoalDays: weeklyGoal,
      availabilityDays: request.availabilityDays,
      deviation: round(deviation),
    },
  };
}

function assessPerformance(
  plan: TrainingPlan,
  microcycles: any[],
  sessions: any[]
): PerformanceAssessment {
  let score = 0.45;
  const reasons: string[] = [];

  const progressionPhases = Array.isArray((plan as any).progression?.phases)
    ? (plan as any).progression.phases.length
    : 0;

  if (progressionPhases > 0) {
    const bonus = Math.min(0.2, progressionPhases * 0.05);
    score += bonus;
    reasons.push(`Progression phases detected (${progressionPhases}) supporting long-term gains`);
  }

  const intensityVariety = new Set(
    sessions
      .map((session) =>
        typeof session.intensity === 'string' ? session.intensity.toLowerCase() : 'unspecified'
      )
      .filter((value) => value !== 'unspecified')
  ).size;

  if (intensityVariety >= 3) {
    score += 0.1;
    reasons.push('Intensity variety ensures balanced stimulus across the block');
  } else if (intensityVariety === 2) {
    score += 0.05;
    reasons.push('Intensity variety partially supports adaptation');
  } else {
    reasons.push('Limited intensity variety may constrain stimulus variety');
  }

  const duration = typeof (plan as any).duration === 'number' ? (plan as any).duration : undefined;
  if (duration && duration >= 12) {
    score += 0.1;
    reasons.push('Program duration supports sustained progression');
  } else if (duration && duration >= 8) {
    score += 0.05;
    reasons.push('Program duration provides adequate progression window');
  } else if (!duration) {
    reasons.push('Plan duration not specified; limiting performance confidence');
  }

  if (microcycles.length > 0 && sessions.length > 0) {
    reasons.push('Microcycle structure present with defined sessions');
  } else {
    score *= 0.5;
    reasons.push('No explicit microcycle structure detected');
  }

  return {
    score: clamp(score, 0, 1),
    reasons,
    metrics: {
      progressionPhases,
      intensityVariety,
      durationWeeks: duration,
    },
  };
}

function calculatePlannedWeeklySessions(microcycles: any[], fallbackTotal: number): number {
  if (microcycles.length === 0) {
    return fallbackTotal;
  }

  const counts = microcycles.map((mc) => (Array.isArray(mc.sessions) ? mc.sessions.length : 0));
  const total = counts.reduce((acc, count) => acc + count, 0);
  const average = total / Math.max(counts.length, 1);
  return average;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function round(value: number, precision = 4): number {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}
