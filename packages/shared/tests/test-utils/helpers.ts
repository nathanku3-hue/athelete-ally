import { ApiResponse } from './types';

export const ok = <T>(data: T): ApiResponse<T> => ({ ok: true, data });
export const err = <T = never>(error: unknown): ApiResponse<T> => ({ ok: false, error });

export const isOk = <T>(r: ApiResponse<T>): r is { ok: true; data: T } => r.ok === true;

export async function fromPromise<T>(p: Promise<T>): Promise<ApiResponse<T>> {
  try { return ok(await p); } catch (e) { return err<T>(e); }
}

export function unwrap<T>(r: ApiResponse<T>): T {
  if (r.ok) return r.data;
  throw (r.error instanceof Error ? r.error : new Error(String(r.error)));
}

export function map<T, U>(r: ApiResponse<T>, fn: (v: T) => U): ApiResponse<U> {
  return r.ok ? ok(fn(r.data)) : err<U>(r.error);
}
