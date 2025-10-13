"use client";

import { WeeklyReviewSummary } from '@athlete-ally/shared-types';
// eslint-disable-next-line import/no-internal-modules
import { api } from './api/client';

export async function fetchWeeklyReview(planId: string): Promise<WeeklyReviewSummary | null> {
  const review = await api<WeeklyReviewSummary | null>(`/v1/plans/${encodeURIComponent(planId)}/weekly-review`);
  return review ?? null;
}

export async function applyWeeklyReview(planId: string): Promise<WeeklyReviewSummary | null> {
  const review = await api<WeeklyReviewSummary | null>(
    `/v1/plans/${encodeURIComponent(planId)}/weekly-review/apply`,
    { method: 'POST' }
  );

  // Send telemetry for weekly review application
  if (review) {
    await sendWeeklyReviewTelemetry('weekly_review_applied', review);
  }

  return review ?? null;
}

export async function sendWeeklyReviewTelemetry(
  event: 'weekly_review_shown' | 'weekly_review_applied',
  review: WeeklyReviewSummary
): Promise<void> {
  const payload = {
    event,
    reviewId: review.reviewId,
    planId: review.planId,
    userId: review.userId,
    status: review.status,
    timestamp: new Date().toISOString(),
  };

  try {
    await api<null>('/v1/telemetry/weekly-review', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('Weekly review telemetry failed', error);
    }
  }
}
