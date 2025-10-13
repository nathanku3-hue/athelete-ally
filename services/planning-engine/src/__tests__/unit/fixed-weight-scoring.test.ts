import { scorePlanCandidate } from '../../scoring/fixed-weight.js';
import { TrainingPlan, TrainingPlanRequest } from '../../llm.js';

function createBasePlan(): TrainingPlan {
  return {
    id: 'plan-001',
    userId: 'user-001',
    name: 'Balanced Strength',
    description: 'Hybrid strength plan with deload week',
    duration: 12,
    microcycles: [
      {
        weekNumber: 1,
        deload: false,
        sessions: [
          { dayOfWeek: 1, intensity: 'medium', exercises: [] },
          { dayOfWeek: 3, intensity: 'high', exercises: [] },
          { dayOfWeek: 5, intensity: 'medium', exercises: [] },
        ],
      },
      {
        weekNumber: 4,
        deload: true,
        sessions: [
          { dayOfWeek: 2, intensity: 'low', exercises: [] },
          { dayOfWeek: 4, intensity: 'medium', exercises: [] },
        ],
      },
    ],
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    progression: {
      phases: [
        { name: 'Base', duration: 4, focus: 'volume' },
        { name: 'Build', duration: 4, focus: 'intensity' },
      ],
    },
  } as unknown as TrainingPlan;
}

describe('scorePlanCandidate', () => {
  it('calculates weighted contributions for a structured plan', () => {
    const plan = createBasePlan();
    const request: TrainingPlanRequest = {
      userId: 'user-001',
      proficiency: 'intermediate',
      season: 'offseason',
      availabilityDays: 4,
      weeklyGoalDays: 4,
      equipment: ['barbell', 'dumbbells'],
      purpose: 'general_fitness',
    };

    const scoring = scorePlanCandidate(plan, request);

    const contributionSum = Object.values(scoring.factors).reduce(
      (acc, factor) => acc + factor.contribution,
      0
    );

    expect(scoring.version).toBe('fixed-weight-v1');
    expect(scoring.total).toBeGreaterThan(0);
    expect(scoring.total).toBeLessThanOrEqual(1);
    expect(contributionSum).toBeCloseTo(scoring.total, 4);
    expect(scoring.weights.safety).toBeCloseTo(0.6);
    expect(scoring.weights.compliance).toBeCloseTo(0.3);
    expect(scoring.weights.performance).toBeCloseTo(0.1);
    expect(scoring.factors.safety.reasons.length).toBeGreaterThan(0);
    expect(scoring.metadata.weeklySessionsPlanned).toBeGreaterThan(0);
  });

  it('defaults to safe scores when plan has no sessions', () => {
    const emptyPlan: TrainingPlan = {
      id: 'plan-empty',
      userId: 'user-002',
      name: 'Placeholder',
      description: 'No sessions defined',
      duration: 6,
      microcycles: [],
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    } as unknown as TrainingPlan;

    const request: TrainingPlanRequest = {
      userId: 'user-002',
      proficiency: 'beginner',
      season: 'offseason',
      availabilityDays: 3,
      weeklyGoalDays: 3,
      equipment: ['bodyweight'],
    };

    const scoring = scorePlanCandidate(emptyPlan, request);

    expect(scoring.factors.safety.score).toBeCloseTo(0.7, 1);
    expect(scoring.factors.compliance.score).toBeGreaterThan(0);
    expect(scoring.total).toBeGreaterThan(0);
  });
});
