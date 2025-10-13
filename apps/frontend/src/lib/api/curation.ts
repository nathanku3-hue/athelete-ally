"use client";

const API_BASE = process.env.NEXT_PUBLIC_GATEWAY_ORIGIN || 'http://localhost:4000';

export type MovementStageStatus =
  | 'DRAFT'
  | 'READY_FOR_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type MovementInstructions = {
  setup?: string;
  execution?: string[];
  cues?: string[];
  commonMistakes?: string[];
  breathing?: string[];
  coachingTips?: string[];
} | null;

export type MovementDraft = {
  id: string;
  name: string;
  slug: string;
  classification: string;
  equipment: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  recommendedRpe: number | null;
  progressionIds: string[];
  regressionIds: string[];
  tags: string[];
  instructions: MovementInstructions;
  metadata: Record<string, unknown> | null;
  status: MovementStageStatus;
  createdById: string;
  updatedById: string;
  reviewerId: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  publishedMovementId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MovementDraftInput = {
  name: string;
  slug?: string;
  classification: string;
  equipment?: string[];
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  recommendedRpe?: number;
  progressionIds?: string[];
  regressionIds?: string[];
  tags?: string[];
  instructions?: MovementInstructions;
  metadata?: Record<string, unknown> | null;
};

export type MovementDraftUpdateInput = Partial<MovementDraftInput>;

export type MovementLibraryEntry = {
  id: string;
  name: string;
  slug: string;
  classification: string;
  equipment: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  recommendedRpe: number | null;
  progressionIds: string[];
  regressionIds: string[];
  tags: string[];
  instructions: MovementInstructions;
  metadata: Record<string, unknown> | null;
  version: number;
  stagingSourceId: string | null;
  publishedById: string;
  publishedAt: string;
};

export type ListDraftsParams = {
  status?: MovementStageStatus[];
  search?: string;
  tag?: string;
  reviewerId?: string;
};

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('token');
};

const buildQueryString = (params: Record<string, string | string[] | undefined>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && String(item).length > 0) {
          searchParams.append(key, String(item));
        }
      });
      return;
    }
    if (value !== undefined && value !== null && String(value).length > 0) {
      searchParams.append(key, String(value));
    }
  });

  const result = searchParams.toString();
  return result ? `?${result}` : '';
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (init.body && !('Content-Type' in (init.headers ?? {}))) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...(init.headers as Record<string, string> | undefined),
    },
    credentials: 'include',
  });

  const text = await response.text();
  let parsed: any = {};

  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return text as unknown as T;
    }
  }

  if (!response.ok) {
    const message =
      typeof parsed?.message === 'string'
        ? parsed.message
        : typeof parsed?.error === 'string'
          ? parsed.error
          : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (parsed && typeof parsed === 'object' && 'data' in parsed) {
    return parsed.data as T;
  }

  return parsed as T;
}

export const curationApi = {
  async listDrafts(params: ListDraftsParams = {}) {
    const query = buildQueryString({
      search: params.search,
      tag: params.tag,
      reviewerId: params.reviewerId,
      status: params.status,
    });
    return request<MovementDraft[]>(`/api/internal/curation/movements${query}`);
  },

  async getDraft(id: string) {
    return request<MovementDraft>(`/api/internal/curation/movements/${encodeURIComponent(id)}`);
  },

  async createDraft(payload: MovementDraftInput) {
    return request<MovementDraft>('/api/internal/curation/movements', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateDraft(id: string, payload: MovementDraftUpdateInput) {
    return request<MovementDraft>(`/api/internal/curation/movements/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async submitDraft(id: string, notes?: string) {
    return request<MovementDraft>(`/api/internal/curation/movements/${encodeURIComponent(id)}/submit`, {
      method: 'POST',
      body: JSON.stringify(notes ? { notes } : {}),
    });
  },

  async requestChanges(id: string, notes: string) {
    return request<MovementDraft>(
      `/api/internal/curation/movements/${encodeURIComponent(id)}/request-changes`,
      {
        method: 'POST',
        body: JSON.stringify({ notes }),
      },
    );
  },

  async approveDraft(id: string, notes?: string) {
    return request<MovementDraft>(`/api/internal/curation/movements/${encodeURIComponent(id)}/approve`, {
      method: 'POST',
      body: JSON.stringify(notes ? { notes } : {}),
    });
  },

  async publishDraft(id: string, params: { notes?: string; metadata?: Record<string, unknown> | null }) {
    return request<{ draft: MovementDraft; library: MovementLibraryEntry }>(
      `/api/internal/curation/movements/${encodeURIComponent(id)}/publish`,
      {
        method: 'POST',
        body: JSON.stringify({
          notes: params.notes,
          metadata: params.metadata ?? null,
        }),
      },
    );
  },

  async listLibrary(search?: string) {
    const query = buildQueryString({ search });
    return request<MovementLibraryEntry[]>(`/api/internal/curation/library${query}`);
  },
};

