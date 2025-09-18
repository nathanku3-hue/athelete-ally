"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

type AdaptationsResp = {
  analysis: any;
  adaptations: any[];
};

export function useAdaptations(planId: string, enabled = true) {
  return useQuery({
    queryKey: ['adaptations', planId],
    queryFn: () => api<AdaptationsResp>(`/v1/plans/${planId}/adaptations`),
    enabled: enabled && !!planId,
  });
}

export function useApplyAdaptations(planId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (adjustments: any[]) =>
      api(`/v1/plans/${planId}/adaptations/apply`, {
        method: 'POST',
        body: JSON.stringify({ adjustments }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adaptations', planId] });
      qc.invalidateQueries({ queryKey: ['plan', planId] });
    },
  });
}