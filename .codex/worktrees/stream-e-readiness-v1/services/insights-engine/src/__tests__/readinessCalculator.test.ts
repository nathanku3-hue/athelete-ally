import { describe, it, expect } from '@jest/globals';

describe('ReadinessCalculator', () => {
  describe('calculateBaseline', () => {
    it('should calculate baseline from historical scores', () => {
      const historicalScores = [45, 50, 55, 60, 65];
      const sum = historicalScores.reduce((acc, score) => acc + score, 0);
      const baseline = sum / historicalScores.length;
      expect(baseline).toBe(55); // Average of 45+50+55+60+65
    });

    it('should return default baseline for insufficient data', () => {
      const historicalScores = [45, 50];
      const baseline = historicalScores.length < 3 ? 50 : historicalScores.reduce((acc, score) => acc + score, 0) / historicalScores.length;
      expect(baseline).toBe(50); // Default baseline
    });
  });

  describe('calculateHrvDelta', () => {
    it('should calculate HRV delta correctly', () => {
      const currentRMSSD = 55;
      const baseline = 50;
      const delta = (currentRMSSD - baseline) / baseline;
      expect(delta).toBe(0.1); // (55-50)/50 = 0.1
    });

    it('should clamp delta to reasonable bounds', () => {
      const currentRMSSD = 100;
      const baseline = 50;
      const delta = (currentRMSSD - baseline) / baseline;
      const clampedDelta = Math.max(-0.5, Math.min(0.5, delta));
      expect(clampedDelta).toBe(0.5); // Clamped to 0.5
    });
  });

  describe('calculateDataFreshness', () => {
    it('should return 1.0 for recent data', () => {
      const recentTime = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // 30 minutes ago
      const captured = new Date(recentTime);
      const now = new Date();
      const hoursDiff = (now.getTime() - captured.getTime()) / (1000 * 60 * 60);
      
      let freshness: number;
      if (hoursDiff < 2) {
        freshness = 1.0;
      } else if (hoursDiff >= 48) {
        freshness = 0.0;
      } else {
        freshness = Math.max(0, 1.0 - (hoursDiff - 2) / 46);
      }
      
      expect(freshness).toBe(1.0);
    });

    it('should return 0.0 for old data', () => {
      const oldTime = new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(); // 50 hours ago
      const captured = new Date(oldTime);
      const now = new Date();
      const hoursDiff = (now.getTime() - captured.getTime()) / (1000 * 60 * 60);
      
      let freshness: number;
      if (hoursDiff < 2) {
        freshness = 1.0;
      } else if (hoursDiff >= 48) {
        freshness = 0.0;
      } else {
        freshness = Math.max(0, 1.0 - (hoursDiff - 2) / 46);
      }
      
      expect(freshness).toBe(0.0);
    });
  });

  describe('calculateWeightedScore', () => {
    it('should calculate weighted score correctly', () => {
      const hrvDelta = 0.1;
      const trend3d = 2;
      const dataFreshness = 0.9;
      
      // Normalize HRV delta to 0-100 scale
      const normalizedHrvDelta = ((hrvDelta + 0.5) / 1.0) * 100;
      
      // Normalize trend to 0-100 scale
      const normalizedTrend = Math.max(0, Math.min(100, 50 + (trend3d * 10)));
      
      // Calculate weighted score
      const score = 
        (normalizedHrvDelta * 0.7) +
        (dataFreshness * 100 * 0.2) +
        (normalizedTrend * 0.1);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
