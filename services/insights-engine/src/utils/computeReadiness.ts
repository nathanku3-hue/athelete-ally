export function clamp(n: number, min: number, max: number): number { return Math.max(min, Math.min(max, n)); }

export interface ReadinessComponents { sleepScore: number; hrvScore: number }

export function computeReadiness(durationMinutes?: number | null, lnRmssd?: number | null): { score: number; incomplete: boolean; components: ReadinessComponents } {
  const sleepScore = (typeof durationMinutes === 'number') ? clamp((durationMinutes / 480) * 100, 0, 100) : 0;
  const hasHrv = typeof lnRmssd === 'number';
  const hrvScore = hasHrv ? clamp(((lnRmssd! - 3.0) / (4.8 - 3.0)) * 100, 0, 100) : 50;
  const score = Math.round(0.6 * sleepScore + 0.4 * hrvScore);
  const incomplete = !(typeof durationMinutes === 'number') || !hasHrv;
  return { score, incomplete, components: { sleepScore, hrvScore } };
}
