import { useCallback } from 'react';
import { useTrainingStore } from '@/stores/trainingStore';
import { trainingAPI } from '@/lib/api/training';

export function useTrainingAPI() {
  const {
    setCurrentPlan,
    setCurrentSession,
    setLoading,
    setError,
    addPlan,
    updatePlan,
    deletePlan,
    addSession,
    updateSession,
  } = useTrainingStore();

  // 训练计划相关
  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const plans = await trainingAPI.getPlans();
      // setPlans(plans);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const loadPlan = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const plan = await trainingAPI.getPlan(id);
      setCurrentPlan(plan as any);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load plan');
    } finally {
      setLoading(false);
    }
  }, [setCurrentPlan, setLoading, setError]);

  const createPlan = useCallback(async (planData: any) => {
    try {
      setLoading(true);
      setError(null);
      const newPlan = await trainingAPI.createPlan(planData);
      addPlan(newPlan as any);
      return newPlan;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create plan');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [addPlan, setLoading, setError]);

  const updatePlanData = useCallback(async (id: string, updates: any) => {
    try {
      setLoading(true);
      setError(null);
      const updatedPlan = await trainingAPI.updatePlan(id, updates);
      updatePlan(id, updatedPlan as any);
      return updatedPlan;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update plan');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updatePlan, setLoading, setError]);

  const removePlan = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await trainingAPI.deletePlan(id);
      deletePlan(id);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete plan');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [deletePlan, setLoading, setError]);

  // 训练会话相关
  const loadSessions = useCallback(async (planId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const sessions = await trainingAPI.getSessions(planId);
      // setSessions(sessions);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const loadSession = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const session = await trainingAPI.getSession(id);
      setCurrentSession(session as any);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  }, [setCurrentSession, setLoading, setError]);

  const createSession = useCallback(async (sessionData: any) => {
    try {
      setLoading(true);
      setError(null);
      const newSession = await trainingAPI.createSession(sessionData);
      addSession(newSession as any);
      return newSession;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create session');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [addSession, setLoading, setError]);

  const updateSessionData = useCallback(async (id: string, updates: any) => {
    try {
      setLoading(true);
      setError(null);
      const updatedSession = await trainingAPI.updateSession(id, updates);
      updateSession(id, updatedSession as any);
      return updatedSession;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update session');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updateSession, setLoading, setError]);

  const startSession = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await trainingAPI.startSession(id);
      updateSession(id, { status: 'in_progress', startedAt: new Date().toISOString() });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start session');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updateSession, setLoading, setError]);

  const completeSession = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await trainingAPI.completeSession(id);
      updateSession(id, { status: 'completed', completedAt: new Date().toISOString() });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to complete session');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updateSession, setLoading, setError]);

  const completeExercise = useCallback(async (sessionId: string, exerciseId: string) => {
    try {
      setLoading(true);
      setError(null);
      await trainingAPI.completeExercise(sessionId, exerciseId);
      // 这里可以更新本地状态
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to complete exercise');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const loadTimeCrunchStatus = useCallback(async (planId: string, sessionId: string) => {
    try {
      setError(null);
      const response = await trainingAPI.getTimeCrunchStatus(planId, sessionId);
      const session = (response as any)?.session;
      const timeCrunch = (response as any)?.timeCrunch;
      if (session) {
        updateSession(sessionId, {
          duration: session.duration ?? 0,
          isTimeCrunchActive: timeCrunch?.isActive ?? false,
          timeCrunchMinutes: timeCrunch?.minutes ?? null,
          compressionSummary: timeCrunch?.summary ?? null,
          compressionDiff: timeCrunch?.diff ?? null,
          compressedSession: timeCrunch?.compressedSession ?? null,
        });
      }
      return response;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load time crunch status');
      throw error;
    }
  }, [setError, updateSession]);

  const compressSession = useCallback(async (planId: string, payload: {
    sessionId: string;
    targetMinutes: number;
    source?: string;
    reason?: string;
  }) => {
    try {
      setError(null);
      const response = await trainingAPI.compressSession(planId, payload);
      const { sessionId } = payload;
      const compressedSession = (response as any)?.compressedSession;
      const diff = (response as any)?.diff;
      const summary = (response as any)?.summary;
      if (compressedSession) {
        const achievedMinutes = (response as any)?.achievedMinutes ?? compressedSession.duration;
        const targetMinutes = (response as any)?.targetMinutes ?? payload.targetMinutes;
        updateSession(sessionId, {
          duration: Math.round(achievedMinutes),
          isTimeCrunchActive: compressedSession.isTimeCrunchActive ?? false,
          timeCrunchMinutes: Math.round(targetMinutes),
          compressionSummary: summary ?? null,
          compressionDiff: diff ?? null,
          compressedSession,
        });
      }
      return response;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to compress session');
      throw error;
    }
  }, [setError, updateSession]);

  return {
    // 计划相关
    loadPlans,
    loadPlan,
    createPlan,
    updatePlanData,
    removePlan,
    
    // 会话相关
    loadSessions,
    loadSession,
    createSession,
    updateSessionData,
    startSession,
    completeSession,
    completeExercise,
    loadTimeCrunchStatus,
    compressSession,
  };
}
