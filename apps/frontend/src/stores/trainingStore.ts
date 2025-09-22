import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  sessionsPerWeek: number;
  estimatedTime: number;
  tags: string[];
  status: 'draft' | 'active' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

interface TrainingSession {
  id: string;
  planId: string;
  weekNumber: number;
  dayOfWeek: number;
  name: string;
  duration: number;
  exercises: Exercise[];
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  sets: number;
  reps: string;
  weight: string;
  notes?: string;
  completed: boolean;
}

interface TrainingState {
  // 状态
  currentPlan: TrainingPlan | null;
  currentSession: TrainingSession | null;
  plans: TrainingPlan[];
  sessions: TrainingSession[];
  loading: boolean;
  error: string | null;
  
  // 动作
  setCurrentPlan: (plan: TrainingPlan | null) => void;
  setCurrentSession: (session: TrainingSession | null) => void;
  addPlan: (plan: TrainingPlan) => void;
  updatePlan: (id: string, updates: Partial<TrainingPlan>) => void;
  deletePlan: (id: string) => void;
  addSession: (session: TrainingSession) => void;
  updateSession: (id: string, updates: Partial<TrainingSession>) => void;
  completeExercise: (sessionId: string, exerciseId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useTrainingStore = create<TrainingState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        currentPlan: null,
        currentSession: null,
        plans: [],
        sessions: [],
        loading: false,
        error: null,
        
        // 动作
        setCurrentPlan: (plan) => set({ currentPlan: plan }),
        setCurrentSession: (session) => set({ currentSession: session }),
        
        addPlan: (plan) => set((state) => ({ 
          plans: [...state.plans, plan] 
        })),
        
        updatePlan: (id, updates) => set((state) => ({
          plans: state.plans.map(plan => 
            plan.id === id ? { ...plan, ...updates } : plan
          )
        })),
        
        deletePlan: (id) => set((state) => ({
          plans: state.plans.filter(plan => plan.id !== id)
        })),
        
        addSession: (session) => set((state) => ({
          sessions: [...state.sessions, session]
        })),
        
        updateSession: (id, updates) => set((state) => ({
          sessions: state.sessions.map(session =>
            session.id === id ? { ...session, ...updates } : session
          )
        })),
        
        completeExercise: (sessionId, exerciseId) => set((state) => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  exercises: session.exercises.map(exercise =>
                    exercise.id === exerciseId
                      ? { ...exercise, completed: true }
                      : exercise
                  )
                }
              : session
          )
        })),
        
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        
        reset: () => set({
          currentPlan: null,
          currentSession: null,
          plans: [],
          sessions: [],
          loading: false,
          error: null,
        }),
      }),
      {
        name: 'training-store',
        partialize: (state) => ({
          currentPlan: state.currentPlan,
          plans: state.plans,
          sessions: state.sessions,
        }),
      }
    ),
    {
      name: 'training-store',
    }
  )
);



