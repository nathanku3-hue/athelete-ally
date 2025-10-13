"use client";

import { CoachTipPayload, CoachTipEventName } from '@athlete-ally/shared-types';
import { api } from './api/client';

export async function fetchCoachTip(planId: string): Promise<CoachTipPayload | null> {
  const tip = await api<CoachTipPayload | null>(`/v1/plans/${encodeURIComponent(planId)}/coach-tip`);
  return tip ?? null;
}

export async function sendCoachTipTelemetry(event: CoachTipEventName, tip: CoachTipPayload): Promise<void> {
  const payload = {
    event,
    tipId: tip.tipId,
    planId: tip.planId,
    userId: tip.userId,
    surface: tip.surface,
    severity: tip.severity,
    planScore: tip.scoringContext?.totalScore,
    timestamp: new Date().toISOString(),
  };

  try {
    await api<null>('/v1/telemetry/coach-tip', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Coach tip telemetry failed', error);
    }
  }
}
