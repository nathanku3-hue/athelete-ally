"use client";
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

interface PlanMicrocycle {
  weekNumber: number;
  name: string;
  phase: string;
  sessions: Array<{
    dayOfWeek: number;
    name: string;
    duration: number;
    exercises: unknown[];
  }>;
}

type Plan = {
  id: string;
  name: string;
  description?: string;
  status?: string;
  version?: number;
  content: {
    microcycles: PlanMicrocycle[];
  };
  createdAt?: string;
  updatedAt?: string
};

export function usePlan(planId: string, enabled = true) {
  return useQuery({
    queryKey: ['plan', planId],
    queryFn: async () => {
      try {
        const data = await api<Plan>(`/v1/plans/${planId}`);
        return data;
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('HTTP 404')) return null;
        throw err;
      }
    },
    enabled: enabled && !!planId,
  });
}