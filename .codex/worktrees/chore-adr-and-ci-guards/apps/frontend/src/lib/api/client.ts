export type ApiSuccess<T> = { success: true; data: T; message?: string };
export type ApiError = { success: false; error: any; message?: string };

const API = process.env.NEXT_PUBLIC_GATEWAY_ORIGIN || 'http://localhost:4000';

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
      ...(init.headers || {}),
    },
    credentials: 'include',
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw (body as any)?.error || { message: `HTTP ${res.status}` };
  if ((body as any)?.success === true) return (body as any).data as T;
  throw (body as any)?.error || { message: 'Invalid envelope' };
}