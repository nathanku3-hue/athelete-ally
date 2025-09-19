// Generic test helpers for shared-types
import { ApiEnvelope, Result } from './types';

export function makeEnvelope<T>(data: T, status = 200): ApiEnvelope<T> {
  return { success: true, data, status };
}

export function ensureError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}

export function fakeId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

export function sleep(ms = 10): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export function deepFreeze<T>(o: T): T {
  if (o && typeof o === 'object') {
    Object.freeze(o as any);
    for (const k of Object.keys(o as any)) {
      // @ts-ignore
      deepFreeze((o as any)[k]);
    }
  }
  return o;
}
