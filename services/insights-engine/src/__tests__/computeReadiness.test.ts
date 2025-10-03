import { computeReadiness, clamp } from "../utils/computeReadiness";

test("clamp works", () => {
  expect(clamp(110,0,100)).toBe(100);
  expect(clamp(-10,0,100)).toBe(0);
});

test("computeReadiness duration only", () => {
  const { score, incomplete, components } = computeReadiness(480, null);
  expect(components.sleepScore).toBe(100);
  expect(incomplete).toBe(true);
});

test("computeReadiness hrv extremes", () => {
  const low = computeReadiness(0, 3.0);
  const high = computeReadiness(0, 4.8);
  expect(low.components.hrvScore).toBe(0);
  expect(high.components.hrvScore).toBe(100);
});

test("computeReadiness complete with both inputs", () => {
  const r = computeReadiness(480, 3.9);
  expect(r.incomplete).toBe(false);
  expect(r.score).toBeGreaterThanOrEqual(0);
  expect(r.score).toBeLessThanOrEqual(100);
});
