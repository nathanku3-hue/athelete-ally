import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingAPI } from '@/lib/api/training';

// Query Keys
export const trainingKeys = {
  all: ['training'] as const,
  plans: () => [...trainingKeys.all, 'plans'] as const,
  plan: (id: string) => [...trainingKeys.plans(), id] as const,
  sessions: (planId?: string) => [...trainingKeys.all, 'sessions', planId] as const,
  session: (id: string) => [...trainingKeys.all, 'sessions', id] as const,
  exercises: () => [...trainingKeys.all, 'exercises'] as const,
  progress: (planId?: string) => [...trainingKeys.all, 'progress', planId] as const,
};

// 训练计划相关查询
export function usePlans() {
  return useQuery({
    queryKey: trainingKeys.plans(),
    queryFn: () => trainingAPI.getPlans(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: trainingKeys.plan(id),
    queryFn: () => trainingAPI.getPlan(id),
    enabled: !!id,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (plan: any) => trainingAPI.createPlan(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.plans() });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      trainingAPI.updatePlan(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.plans() });
      queryClient.invalidateQueries({ queryKey: trainingKeys.plan(variables.id) });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => trainingAPI.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.plans() });
    },
  });
}

// 训练会话相关查询
export function useSessions(planId?: string) {
  return useQuery({
    queryKey: trainingKeys.sessions(planId),
    queryFn: () => trainingAPI.getSessions(planId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: trainingKeys.session(id),
    queryFn: () => trainingAPI.getSession(id),
    enabled: !!id,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (session: any) => trainingAPI.createSession(session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.sessions() });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      trainingAPI.updateSession(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: trainingKeys.session(variables.id) });
    },
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => trainingAPI.startSession(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: trainingKeys.session(id) });
    },
  });
}

export function useCompleteSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => trainingAPI.completeSession(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: trainingKeys.session(id) });
      queryClient.invalidateQueries({ queryKey: trainingKeys.progress() });
    },
  });
}

export function useCompleteExercise() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sessionId, exerciseId }: { sessionId: string; exerciseId: string }) => 
      trainingAPI.completeExercise(sessionId, exerciseId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.session(variables.sessionId) });
    },
  });
}

// 动作相关查询
export function useExercises() {
  return useQuery({
    queryKey: trainingKeys.exercises(),
    queryFn: () => trainingAPI.getExercises(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// 进度相关查询
export function useProgress(planId?: string) {
  return useQuery({
    queryKey: trainingKeys.progress(planId),
    queryFn: () => trainingAPI.getProgress(planId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useWorkoutSummary() {
  return useQuery({
    queryKey: [...trainingKeys.all, 'workout-summary'],
    queryFn: () => trainingAPI.getWorkoutSummary(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}