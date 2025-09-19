"use client";
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { PerformanceMetrics } from '@athlete-ally/shared-types';

type PerfResponse = { success: boolean; message?: string } | Record<string, any>;

export function useSubmitPerformanceMetrics() {
  return useMutation({
    mutationFn: (payload: PerformanceMetrics) =>
      api<PerfResponse>('/v1/plans/feedback/performance', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  });
}

