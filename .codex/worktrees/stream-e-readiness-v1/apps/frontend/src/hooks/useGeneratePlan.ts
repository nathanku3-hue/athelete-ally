"use client";
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { EnhancedPlanGenerationRequest } from '@athlete-ally/shared-types';

type GenerateResp = { jobId: string; status: string; message?: string };

export function useGeneratePlan() {
  return useMutation({
    mutationFn: (payload: EnhancedPlanGenerationRequest) =>
      api<GenerateResp>('/v1/plans/enhanced/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  });
}