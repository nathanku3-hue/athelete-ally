import { TimeCrunchPreviewResponse } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

class TrainingAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    // Attach Authorization header from localStorage token (client-side only)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...options.headers,
      } as HeadersInit,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
  
  // 训练计划相关
  async getPlans() {
    return this.request('/api/v1/plans');
  }
  
  async getPlan(id: string) {
    return this.request(`/api/v1/plans/${id}`);
  }
  
  async createPlan(plan: Record<string, unknown>) {
    return this.request('/api/v1/plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    });
  }
  
  async updatePlan(id: string, updates: Record<string, unknown>) {
    return this.request(`/api/v1/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }
  
  async deletePlan(id: string) {
    return this.request(`/api/v1/plans/${id}`, {
      method: 'DELETE',
    });
  }

  async previewTimeCrunch(planId: string, targetMinutes: number): Promise<TimeCrunchPreviewResponse> {
    return this.request<TimeCrunchPreviewResponse>('/api/v1/time-crunch/preview', {
      method: 'POST',
      body: JSON.stringify({ planId, targetMinutes }),
    });
  }

  // 训练会话相关
  async getSessions(planId?: string) {
    const endpoint = planId ? `/api/v1/sessions?planId=${planId}` : '/api/v1/sessions';
    return this.request(endpoint);
  }
  
  async getSession(id: string) {
    return this.request(`/api/v1/sessions/${id}`);
  }
  
  async createSession(session: Record<string, unknown>) {
    return this.request('/api/v1/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  }
  
  async updateSession(id: string, updates: Record<string, unknown>) {
    return this.request(`/api/v1/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }
  
  async startSession(id: string) {
    return this.request(`/api/v1/sessions/${id}/start`, {
      method: 'POST',
    });
  }
  
  async completeSession(id: string) {
    return this.request(`/api/v1/sessions/${id}/complete`, {
      method: 'POST',
    });
  }

  // 动作相关
  async getExercises() {
    return this.request('/api/v1/exercises');
  }
  
  async getExercise(id: string) {
    return this.request(`/api/v1/exercises/${id}`);
  }
  
  async completeExercise(sessionId: string, exerciseId: string) {
    return this.request(`/api/v1/sessions/${sessionId}/exercises/${exerciseId}/complete`, {
      method: 'POST',
    });
  }

  // 进度相关
  async getProgress(planId?: string) {
    const endpoint = planId ? `/api/v1/progress?planId=${planId}` : '/api/v1/progress';
    return this.request(endpoint);
  }
  
  async getWorkoutSummary() {
    return this.request('/api/v1/workouts/summary');
  }
}

export const trainingAPI = new TrainingAPI();
