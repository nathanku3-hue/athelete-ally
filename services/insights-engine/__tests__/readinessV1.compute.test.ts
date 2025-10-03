import { computeScoreComponents } from '../src/readinessV1';

describe('computeScoreComponents (baseline formula)', () => {
  it('uses duration only when quality missing', () => {
    const r = computeScoreComponents({ durationMinutes: 480, lnRmssdToday: 3.8, baselineLnRmssd: 3.8 });
    expect(r.incomplete).toBe(false);
    expect(r.sleepScore).toBe(100);
    expect(r.hrvScore).toBe(100);
    expect(r.score).toBe(100);
  });

  it('blends duration and quality when present', () => {
    const r = computeScoreComponents({ durationMinutes: 360, qualityScore: 80, lnRmssdToday: 3.6, baselineLnRmssd: 3.8 });
    // duration_norm=0.75; sleep_ratio=0.8*0.75+0.2*0.8=0.76
    // hrv_ratio=3.6/3.8=0.947...
    expect(r.incomplete).toBe(false);
    expect(r.sleepScore).toBeCloseTo(76, 0);
    expect(r.hrvScore).toBeCloseTo(95, 0);
    expect(r.score).toBeGreaterThan(0);
  });

  it('marks incomplete if any input missing', () => {
    const r1 = computeScoreComponents({ durationMinutes: 450 });
    expect(r1.incomplete).toBe(true);
    const r2 = computeScoreComponents({ lnRmssdToday: 3.2, baselineLnRmssd: 3.4 });
    expect(r2.incomplete).toBe(true);
  });
});

