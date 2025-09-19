// Generic test utility types for event-bus
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export interface ApiEnvelope<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: Error };
