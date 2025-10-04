"use client";
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { RPEFeedback, PerformanceMetrics } from '@athlete-ally/shared-types';

export function useSubmitRPE() {
  return useMutation({
    mutationFn: (payload: RPEFeedback) =>
      api('/v1/plans/feedback/rpe', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  });
}

export function useSubmitPerformance() {
  return useMutation({
    mutationFn: (payload: PerformanceMetrics) =>
      api('/v1/plans/feedback/performance', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  });
}