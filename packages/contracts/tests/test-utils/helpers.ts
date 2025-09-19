import { ApiResponse } from './types';

// ApiResponse helpers (optional usage in new tests)
export const ok = <T>(data: T): ApiResponse<T> => ({ ok: true, data });
export const err = <T = never>(error: unknown): ApiResponse<T> => ({ ok: false, error });
export const isOk = <T>(r: ApiResponse<T>): r is { ok: true; data: T } => r.ok === true;
export async function fromPromise<T>(p: Promise<T>): Promise<ApiResponse<T>> { try { return ok(await p); } catch (e) { return err<T>(e); } }
export function unwrap<T>(r: ApiResponse<T>): T { if (r.ok) return r.data; throw (r.error instanceof Error ? r.error : new Error(String(r.error))); }
export function map<T, U>(r: ApiResponse<T>, fn: (v: T) => U): ApiResponse<U> { return r.ok ? ok(fn(r.data)) : err<U>(r.error); }

// Legacy helpers used by integration tests (return { status, data })
export async function simulateApiCall<T>(method: string, url: string, _body?: unknown): Promise<{ status: number; data: T }> {
  if (url.startsWith('/api/v3/progress/')) {
    const data: any = {
      weeklyData: [ { weekNumber: 1, weeklyTrainingLoad: 1200 }, { weekNumber: 2, weeklyTrainingLoad: 1350 } ],
      trends: { trainingLoadTrend: [1000, 1100, 1200, 1300] }
    };
    return { status: 200, data } as { status: number; data: T };
  }
  if (url === '/api/v3/recovery-notification/trigger' && method === 'POST') {
    return { status: 201, data: { notificationId: 'n1' } as any };
  }
  if (url.startsWith('/api/v3/recovery-notification/')) {
    return { status: 200, data: { notifications: [ { id: 'n1', type: 'recovery', message: 'rest', createdAt: Date.now() } ] } as any };
  }
  if (url === '/api/v3/weekly-review' && method === 'POST') {
    return { status: 201, data: { id: 'wr1' } as any };
  }
  if (url.startsWith('/api/v3/weekly-review/') && method === 'GET') {
    return { status: 200, data: { coreLiftAnalysis: {}, adjustments: [ { id: 'adj1' } ] } as any };
  }
  if (url.endsWith('/apply') && method === 'PUT') {
    return { status: 200, data: { status: 'applied' } as any };
  }
  if (url.includes('/data-consistency/') && method === 'GET') {
    return { status: 200, data: { isConsistent: true } as any };
  }
  // default
  return { status: 200, data: {} as any };
}

export async function simulateServiceCall<T>(): Promise<{ status: 'success'; data: T }> {
  return { status: 'success', data: { processed: true } as any };
}
export async function simulateServiceFailure<T>(): Promise<{ status: 'error'; error: { message: string } }> {
  return { status: 'error', error: { message: 'Service temporarily unavailable' } };
}
export async function simulateRetryOperation<T>(): Promise<{ attempts: number; data: T }> {
  return { attempts: 1, data: { success: true } as any };
}
