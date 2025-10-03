import { Repo, ReadinessRecord } from './repo';

export interface ComputeOptions {
  lookbackDays?: number; // default 7
}

function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }

export function computeScoreComponents(params: { durationMinutes?: number; qualityScore?: number; lnRmssdToday?: number; baselineLnRmssd?: number; }): { sleepScore?: number; hrvScore?: number; incomplete: boolean; score: number } {
  const { durationMinutes, qualityScore, lnRmssdToday, baselineLnRmssd } = params;

  let incomplete = false;
  // sleep_ratio
  let sleepRatio = undefined as number | undefined;
  if (durationMinutes != null) {
    const durationNorm = clamp01(durationMinutes / 480);
    if (qualityScore != null) {
      sleepRatio = 0.8 * durationNorm + 0.2 * clamp01(qualityScore / 100);
    } else {
      sleepRatio = durationNorm;
    }
  } else {
    incomplete = true;
  }

  // hrv_ratio
  let hrvRatio = undefined as number | undefined;
  if (lnRmssdToday != null && baselineLnRmssd != null && baselineLnRmssd > 0) {
    hrvRatio = clamp01(lnRmssdToday / baselineLnRmssd);
  } else {
    incomplete = true;
  }

  const sleepPart = sleepRatio ?? 0;
  const hrvPart = hrvRatio ?? 0;
  const raw = 100 * (0.6 * sleepPart + 0.4 * hrvPart);
  const score = Math.round(Math.max(0, Math.min(100, raw)));

  const components: { sleepScore?: number; hrvScore?: number } = {};
  if (sleepRatio != null) components.sleepScore = Math.round(sleepRatio * 100);
  if (hrvRatio != null) components.hrvScore = Math.round(hrvRatio * 100);

  return { sleepScore: components.sleepScore, hrvScore: components.hrvScore, incomplete, score };
}

export async function computeAndUpsertReadiness(repo: Repo, userId: string, date: Date, opts: ComputeOptions = {}): Promise<ReadinessRecord> {
  const lookback = opts.lookbackDays ?? 7;
  const sleep = await repo.getSleepForDate(userId, date);
  const hrv = await repo.getHrvForDate(userId, date);
  const baselineArr = await repo.getHrvBaseline(userId, date, lookback);
  const baseline = baselineArr.length > 0 ? baselineArr.reduce((a, b) => a + b, 0) / baselineArr.length : undefined;

  const { score, incomplete, hrvScore, sleepScore } = computeScoreComponents({
    durationMinutes: sleep?.durationMinutes,
    qualityScore: sleep?.qualityScore,
    lnRmssdToday: hrv?.lnRmssd,
    baselineLnRmssd: baseline,
  });

  const record: ReadinessRecord = {
    userId,
    date,
    score,
    incomplete,
    components: { hrvScore, sleepScore },
  };
  await repo.upsertReadiness(record);
  return record;
}

