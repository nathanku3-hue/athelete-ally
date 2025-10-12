export interface PlanScoringFactorDetail {
  weight: number;
  score: number;
  contribution: number;
  reasons: string[];
  metrics: Record<string, number>;
}

export interface PlanScoringSummary {
  version: string;
  total: number;
  weights: {
    safety: number;
    compliance: number;
    performance: number;
  };
  factors: {
    safety: PlanScoringFactorDetail;
    compliance: PlanScoringFactorDetail;
    performance: PlanScoringFactorDetail;
  };
  metadata: {
    evaluatedAt: string;
    weeklySessionsPlanned: number;
    weeklyGoalDays?: number;
    requestContext?: {
      availabilityDays?: number;
      weeklyGoalDays?: number;
    };
  };
}
