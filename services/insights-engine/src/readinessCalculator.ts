import { PrismaClient } from '../prisma/generated/client';

export interface ReadinessCalculationInput {
  userId: string;
  currentRMSSD: number;
  currentDate: string; // 'YYYY-MM-DD'
  capturedAt: string; // ISO datetime
}

export interface ReadinessCalculationResult {
  score: number; // 0-100
  hrvDelta: number;
  trend3d: number;
  dataFreshness: number;
}

export class ReadinessCalculator {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Calculate readiness score based on HRV data
   */
  async calculateReadiness(input: ReadinessCalculationInput): Promise<ReadinessCalculationResult> {
    const { userId, currentRMSSD, currentDate, capturedAt } = input;

    // Get historical readiness scores for baseline and trend calculation
    const historicalScores = await this.getHistoricalScores(userId, currentDate, 7);
    
    // Calculate baseline (7-day rolling mean of lnRMSSD)
    const baseline = this.calculateBaseline(historicalScores);
    
    // Calculate HRV delta
    const hrvDelta = this.calculateHrvDelta(currentRMSSD, baseline);
    
    // Calculate 3-day trend
    const trend3d = this.calculateTrend3d(historicalScores);
    
    // Calculate data freshness
    const dataFreshness = this.calculateDataFreshness(capturedAt);
    
    // Calculate weighted score
    const score = this.calculateWeightedScore(hrvDelta, trend3d, dataFreshness);

    return {
      score: Math.round(score),
      hrvDelta,
      trend3d,
      dataFreshness
    };
  }

  /**
   * Get historical readiness scores for the user
   */
  private async getHistoricalScores(userId: string, currentDate: string, days: number): Promise<number[]> {
    const endDate = new Date(currentDate);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const scores = await this.prisma.readinessScore.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lt: endDate
        }
      },
      orderBy: {
        date: 'asc'
      },
      select: {
        score: true
      }
    });

    return scores.map(s => s.score);
  }

  /**
   * Calculate baseline from historical scores
   * Fallback to available days, require ≥3
   */
  private calculateBaseline(historicalScores: number[]): number {
    if (historicalScores.length < 3) {
      // Fallback: use a default baseline if insufficient data
      return 50; // Default baseline score
    }

    // Calculate rolling mean
    const sum = historicalScores.reduce((acc, score) => acc + score, 0);
    return sum / historicalScores.length;
  }

  /**
   * Calculate HRV delta: (current - baseline) / baseline
   * Clamp to reasonable bounds (-0.5 to +0.5)
   */
  private calculateHrvDelta(currentRMSSD: number, baseline: number): number {
    if (baseline === 0) return 0;
    
    const delta = (currentRMSSD - baseline) / baseline;
    return Math.max(-0.5, Math.min(0.5, delta));
  }

  /**
   * Calculate 3-day trend slope
   */
  private calculateTrend3d(historicalScores: number[]): number {
    if (historicalScores.length < 3) return 0;

    const recentScores = historicalScores.slice(-3);
    const n = recentScores.length;
    
    // Calculate slope using linear regression
    const sumX = (n * (n - 1)) / 2; // Sum of x values (0, 1, 2)
    const sumY = recentScores.reduce((acc, score) => acc + score, 0);
    const sumXY = recentScores.reduce((acc, score, index) => acc + (index * score), 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of x^2 values

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  /**
   * Calculate data freshness factor
   * 1.0 for <2h, decays to 0 at 48h
   */
  private calculateDataFreshness(capturedAt: string): number {
    const captured = new Date(capturedAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - captured.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 2) {
      return 1.0;
    } else if (hoursDiff >= 48) {
      return 0.0;
    } else {
      // Linear decay from 1.0 to 0.0 over 46 hours (48 - 2)
      return Math.max(0, 1.0 - (hoursDiff - 2) / 46);
    }
  }

  /**
   * Calculate weighted score
   * 70% lnRMSSD component scaled, 30% freshness/trend
   */
  private calculateWeightedScore(hrvDelta: number, trend3d: number, dataFreshness: number): number {
    // Get weights from environment or use defaults
    const lnRMSSDWeight = parseFloat(process.env.READINESS_LNRMSSD_WEIGHT || '0.7');
    const freshnessWeight = parseFloat(process.env.READINESS_FRESHNESS_WEIGHT || '0.2');
    const trendWeight = parseFloat(process.env.READINESS_TREND_WEIGHT || '0.1');

    // Normalize HRV delta to 0-100 scale
    const normalizedHrvDelta = ((hrvDelta + 0.5) / 1.0) * 100; // Map from [-0.5, 0.5] to [0, 100]

    // Normalize trend to 0-100 scale (assuming trend is small)
    const normalizedTrend = Math.max(0, Math.min(100, 50 + (trend3d * 10))); // Center at 50

    // Calculate weighted score
    const score = 
      (normalizedHrvDelta * lnRMSSDWeight) +
      (dataFreshness * 100 * freshnessWeight) +
      (normalizedTrend * trendWeight);

    return Math.max(0, Math.min(100, score));
  }
}
