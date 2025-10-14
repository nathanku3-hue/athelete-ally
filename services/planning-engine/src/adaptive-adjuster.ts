/**
 * 🔄 适应性调整算法
 * 作者: 后端团队
 * 版本: 1.0.0
 * 
 * 功能:
 * - RPE反馈分析
 * - 性能指标监控
 * - 自动计划调整
 * - 恢复状态评估
 */

import { EnhancedTrainingPlan } from './llm-enhanced.js';

export interface RPEFeedback {
  sessionId: string;
  exerciseId: string;
  rpe: number; // 1-10 scale
  completionRate: number; // 0-100%
  notes?: string;
  timestamp: string;
}

export interface PerformanceMetrics {
  sessionId: string;
  totalVolume: number;
  averageRPE: number;
  completionRate: number;
  recoveryTime: number; // hours
  sleepQuality: number; // 1-10 scale
  stressLevel: number; // 1-10 scale
}

export interface AdaptiveAdjustment {
  type: 'intensity' | 'volume' | 'frequency' | 'exercise_selection' | 'rest_time';
  value: number;
  reason: string;
  confidence: number; // 0-1
  appliedAt: string;
}

export class AdaptivePlanAdjuster {
  private rpeHistory: RPEFeedback[] = [];
  private performanceHistory: PerformanceMetrics[] = [];

  // 添加RPE反馈
  addRPEFeedback(feedback: RPEFeedback): void {
    this.rpeHistory.push(feedback);
  }

  // 添加性能指标
  addPerformanceMetrics(metrics: PerformanceMetrics): void {
    this.performanceHistory.push(metrics);
  }

  // 分析并生成调整建议
  analyzeAndAdjust(_plan: EnhancedTrainingPlan): AdaptiveAdjustment[] {
    const adjustments: AdaptiveAdjustment[] = [];
    
    // 分析RPE趋势
    const rpeTrend = this.analyzeRPETrend();
    if (rpeTrend.needsAdjustment) {
      adjustments.push(...this.generateRPEAdjustments(rpeTrend));
    }

    // 分析性能指标
    const performanceTrend = this.analyzePerformanceTrend();
    if (performanceTrend.needsAdjustment) {
      adjustments.push(...this.generatePerformanceAdjustments(performanceTrend));
    }

    // 分析恢复状态
    const recoveryStatus = this.analyzeRecoveryStatus();
    if (recoveryStatus.needsAdjustment) {
      adjustments.push(...this.generateRecoveryAdjustments(recoveryStatus));
    }

    return adjustments;
  }

  // 分析RPE趋势
  private analyzeRPETrend() {
    if (this.rpeHistory.length < 3) {
      return { needsAdjustment: false };
    }

    const recentRPEs = this.rpeHistory.slice(-5).map(f => f.rpe);
    const averageRPE = recentRPEs.reduce((sum, rpe) => sum + rpe, 0) / recentRPEs.length;
    const rpeTrend = this.calculateTrend(recentRPEs);

    return {
      needsAdjustment: averageRPE > 8 || averageRPE < 4 || Math.abs(rpeTrend) > 0.5,
      averageRPE,
      trend: rpeTrend,
    };
  }

  // 分析性能趋势
  private analyzePerformanceTrend() {
    if (this.performanceHistory.length < 3) {
      return { needsAdjustment: false };
    }

    const recentMetrics = this.performanceHistory.slice(-5);
    const averageCompletion = recentMetrics.reduce((sum, m) => sum + m.completionRate, 0) / recentMetrics.length;
    const averageRecovery = recentMetrics.reduce((sum, m) => sum + m.recoveryTime, 0) / recentMetrics.length;

    return {
      needsAdjustment: averageCompletion < 80 || averageRecovery > 48,
      averageCompletion,
      averageRecovery,
    };
  }

  // 分析恢复状态
  private analyzeRecoveryStatus() {
    if (this.performanceHistory.length < 2) {
      return { needsAdjustment: false };
    }

    const recentMetrics = this.performanceHistory.slice(-3);
    const averageSleep = recentMetrics.reduce((sum, m) => sum + m.sleepQuality, 0) / recentMetrics.length;
    const averageStress = recentMetrics.reduce((sum, m) => sum + m.stressLevel, 0) / recentMetrics.length;

    return {
      needsAdjustment: averageSleep < 6 || averageStress > 7,
      averageSleep,
      averageStress,
    };
  }

  // 生成RPE调整
  private generateRPEAdjustments(rpeTrend: any): AdaptiveAdjustment[] {
    const adjustments: AdaptiveAdjustment[] = [];

    if (rpeTrend.averageRPE > 8) {
      // RPE过高，降低强度
      adjustments.push({
        type: 'intensity',
        value: -0.1,
        reason: `Average RPE ${rpeTrend.averageRPE.toFixed(1)} is too high, reducing intensity`,
        confidence: 0.8,
        appliedAt: new Date().toISOString(),
      });
    } else if (rpeTrend.averageRPE < 4) {
      // RPE过低，增加强度
      adjustments.push({
        type: 'intensity',
        value: 0.1,
        reason: `Average RPE ${rpeTrend.averageRPE.toFixed(1)} is too low, increasing intensity`,
        confidence: 0.8,
        appliedAt: new Date().toISOString(),
      });
    }

    return adjustments;
  }

  // 生成性能调整
  private generatePerformanceAdjustments(performanceTrend: any): AdaptiveAdjustment[] {
    const adjustments: AdaptiveAdjustment[] = [];

    if (performanceTrend.averageCompletion < 80) {
      // 完成率低，降低容量
      adjustments.push({
        type: 'volume',
        value: -0.15,
        reason: `Completion rate ${performanceTrend.averageCompletion.toFixed(1)}% is low, reducing volume`,
        confidence: 0.9,
        appliedAt: new Date().toISOString(),
      });
    }

    if (performanceTrend.averageRecovery > 48) {
      // 恢复时间长，增加休息时间
      adjustments.push({
        type: 'rest_time',
        value: 0.2,
        reason: `Recovery time ${performanceTrend.averageRecovery.toFixed(1)}h is long, increasing rest time`,
        confidence: 0.7,
        appliedAt: new Date().toISOString(),
      });
    }

    return adjustments;
  }

  // 生成恢复调整
  private generateRecoveryAdjustments(recoveryStatus: any): AdaptiveAdjustment[] {
    const adjustments: AdaptiveAdjustment[] = [];

    if (recoveryStatus.averageSleep < 6) {
      // 睡眠质量差，降低频率
      adjustments.push({
        type: 'frequency',
        value: -0.2,
        reason: `Sleep quality ${recoveryStatus.averageSleep.toFixed(1)}/10 is poor, reducing frequency`,
        confidence: 0.8,
        appliedAt: new Date().toISOString(),
      });
    }

    if (recoveryStatus.averageStress > 7) {
      // 压力水平高，降低强度
      adjustments.push({
        type: 'intensity',
        value: -0.15,
        reason: `Stress level ${recoveryStatus.averageStress.toFixed(1)}/10 is high, reducing intensity`,
        confidence: 0.7,
        appliedAt: new Date().toISOString(),
      });
    }

    return adjustments;
  }

  // 计算趋势
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  // 应用调整到计划
  applyAdjustments(plan: EnhancedTrainingPlan, adjustments: AdaptiveAdjustment[]): EnhancedTrainingPlan {
    let adjustedPlan = { ...plan };

    for (const adjustment of adjustments) {
      adjustedPlan = this.applyAdjustment(adjustedPlan, adjustment);
    }

    return adjustedPlan;
  }

  // 应用单个调整
  private applyAdjustment(plan: EnhancedTrainingPlan, adjustment: AdaptiveAdjustment): EnhancedTrainingPlan {
    const adjustedPlan = { ...plan };

    switch (adjustment.type) {
      case 'intensity':
        // 调整强度（通过重量、次数等）
        adjustedPlan.microcycles = adjustedPlan.microcycles.map(microcycle => ({
          ...microcycle,
          sessions: microcycle.sessions.map(session => ({
            ...session,
            exercises: session.exercises.map(exercise => ({
              ...exercise,
              weight: this.adjustWeight(exercise.weight, adjustment.value),
              reps: this.adjustReps(exercise.reps, adjustment.value),
            })),
          })),
        }));
        break;

      case 'volume':
        // 调整容量（通过组数、次数等）
        adjustedPlan.microcycles = adjustedPlan.microcycles.map(microcycle => ({
          ...microcycle,
          sessions: microcycle.sessions.map(session => ({
            ...session,
            exercises: session.exercises.map(exercise => ({
              ...exercise,
              sets: Math.max(1, Math.round(exercise.sets * (1 + adjustment.value))),
            })),
          })),
        }));
        break;

      case 'frequency':
        // 调整频率（通过会话数量）
        adjustedPlan.microcycles = adjustedPlan.microcycles.map(microcycle => ({
          ...microcycle,
          sessions: microcycle.sessions.slice(0, Math.max(1, Math.round(microcycle.sessions.length * (1 + adjustment.value)))),
        }));
        break;

      case 'rest_time':
        // 调整休息时间
        adjustedPlan.microcycles = adjustedPlan.microcycles.map(microcycle => ({
          ...microcycle,
          sessions: microcycle.sessions.map(session => ({
            ...session,
            exercises: session.exercises.map(exercise => ({
              ...exercise,
              restTime: Math.max(30, Math.round(exercise.restTime * (1 + adjustment.value))),
            })),
          })),
        }));
        break;
    }

    return adjustedPlan;
  }

  // 调整重量
  private adjustWeight(weight: string, adjustment: number): string {
    if (weight === 'bodyweight') return weight;
    
    const numericWeight = parseFloat(weight);
    if (isNaN(numericWeight)) return weight;
    
    const adjustedWeight = Math.max(0, numericWeight * (1 + adjustment));
    return adjustedWeight.toString();
  }

  // 调整次数
  private adjustReps(reps: string, adjustment: number): string {
    if (reps.includes('-')) {
      const [min, max] = reps.split('-').map(r => parseInt(r.trim()));
      const adjustedMin = Math.max(1, Math.round(min * (1 + adjustment)));
      const adjustedMax = Math.max(1, Math.round(max * (1 + adjustment)));
      return `${adjustedMin}-${adjustedMax}`;
    }
    
    const numericReps = parseInt(reps);
    if (isNaN(numericReps)) return reps;
    
    const adjustedReps = Math.max(1, Math.round(numericReps * (1 + adjustment)));
    return adjustedReps.toString();
  }
}
