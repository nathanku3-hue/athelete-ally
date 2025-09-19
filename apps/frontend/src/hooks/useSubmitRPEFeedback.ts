"use client";
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { RPEFeedback } from '@athlete-ally/shared-types';

type RPEResponse = { success: boolean; message?: string } | Record<string, any>;

export function useSubmitRPEFeedback() {
  return useMutation({
    mutationFn: (payload: RPEFeedback) =>
      api<RPEResponse>('/v1/plans/feedback/rpe', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  });
}

