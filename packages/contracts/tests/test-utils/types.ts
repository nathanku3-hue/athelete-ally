// Minimal shapes the tests actually use
export type ReviewCreateData = { id: string };
export type ReviewData = { 
  adjustments: Array<{ id: string }>;
  coreLiftAnalysis: Array<{ exerciseId: string; averageRpe: number }>;
};
export type NotificationsData = { notifications: unknown[] };
export type ProgressData = { weeklyData: unknown[]; trends: unknown };
export type ApplyResponseData = { status: string };
export type TriggerResponseData = { notificationId: string };
export type ConsistencyData = { isConsistent: boolean };
export type ServiceCallData = { processed: boolean };
export type ServiceFailureData = { message: string };
export type RetryData = { success: boolean };

// Unified ApiResponse result shape for tests
export type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: unknown };

// Narrow unknown to object
export const isRecord = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object";

// Compile-time narrowing: after calling this, r.data is T
export function assertHasData<T>(r: { data: unknown }): asserts r is { data: T } {}

// Safe accessor for weeklyData
export function getWeeklyData(v: unknown): unknown[] {
  return isRecord(v) && Array.isArray((v as any).weeklyData)
    ? (v as any).weeklyData
    : [];
}
