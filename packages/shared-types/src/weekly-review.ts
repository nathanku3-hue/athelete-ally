export type WeeklyReviewStatus = 'pending' | 'applied';

export interface WeeklyReviewAdjustment {
  metric: string;
  unit: 'percent' | 'sessions' | 'string';
  baseline: number | string;
  adjusted: number | string;
  direction: 'up' | 'down' | 'neutral';
  summary: string;
}

export interface WeeklyReviewSummary {
  reviewId: string;
  planId: string;
  userId: string;
  status: WeeklyReviewStatus;
  generatedAt: string;
  appliedAt?: string;
  headline: string;
  adjustments: WeeklyReviewAdjustment[];
  recommendation: string;
}
