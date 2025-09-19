// Unified ApiResponse result shape for tests
export type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: unknown };
