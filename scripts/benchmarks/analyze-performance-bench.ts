import { AdaptationEngine } from '../../services/planning-engine/src/adaptation-engine';

function hrtimeMs() {
  const [s, ns] = process.hrtime();
  return s * 1e3 + ns / 1e6;
}

async function main() {
  const engine = new AdaptationEngine();
  const rpe = Array.from({ length: 1000 }, (_, i) => ({ sessionId: , rpe: (i % 10) + 1, completionRate: (i % 101), timestamp: new Date().toISOString() }));
  const perf = Array.from({ length: 1000 }, (_, i) => ({ sessionId: , totalVolume: i * 10, averageRPE: (i % 10) + 1, completionRate: (i % 101), recoveryTime: i % 48, sleepQuality: (i % 10) + 1, stressLevel: (i % 10) + 1, timestamp: new Date().toISOString() }));

  // Warmup
  await engine.analyzePerformance(rpe.slice(0, 10) as any, perf.slice(0, 10) as any);

  const start = hrtimeMs();
  const runs = 10;
  for (let i = 0; i < runs; i++) {
    await engine.analyzePerformance(rpe as any, perf as any);
  }
  const end = hrtimeMs();
  const total = end - start;
  const avg = total / runs;
  const report = { runs, totalMs: total, avgMs: avg, perItemUs: (avg / rpe.length) * 1000 };
  console.log(JSON.stringify(report, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
