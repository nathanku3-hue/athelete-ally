"use client";
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

type Plan = { id: string; name: string; description?: string; content?: any; createdAt?: string; updatedAt?: string };

export function usePlan(planId: string, enabled = true) {
  return useQuery({
    queryKey: ['plan', planId],
    queryFn: async () => {
      try {
        const data = await api<Plan>(`/v1/plans/${planId}`);
        return data;
      } catch (err: any) {
        if (err?.message?.includes('HTTP 404')) return null;
        throw err;
      }
    },
    enabled: enabled && !!planId,
  });
}