/**
 * 🔄 适应性调整算法引擎
 * 作者: 后端团队
 * 版本: 1.0.0
 * 
 * 功能:
 * - RPE反馈分析
 * - 性能指标监控
 * - 智能适应性调整
 * - 训练计划优化
 */

import { z } from 'zod';

// RPE反馈数据结构
export const RPEFeedbackSchema = z.object({
  sessionId: z.string(),
  exerciseId: z.string(),
  rpe: z.number().min(1).max(10),
  completionRate: z.number().min(0).max(100),
  notes: z.string().optional(),
  timestamp: z.date(),
});

// 性能指标数据结构
export const PerformanceMetricsSchema = z.object({
  sessionId: z.string(),
  totalVolume: z.number(),
  averageRPE: z.number().min(1).max(10),
  completionRate: z.number().min(0).max(100),
  recoveryTime: z.number(),
  sleepQuality: z.number().min(1).max(10),
  stressLevel: z.number().min(1).max(10),
  timestamp: z.date(),
});

// 适应性调整类型
export const AdaptationTypeSchema = z.enum([
  'recovery',
  'intensity_reduction',
  'volume_reduction',
  'frequency_adjustment',
  'exercise_substitution',
  'progression_modification'
]);

// 适应性调整结果
export const AdaptationResultSchema = z.object({
  type: AdaptationTypeSchema,
  changes: z.object({
    intensity: z.enum(['increase', 'decrease', 'maintain']),
    volume: z.enum(['increase', 'decrease', 'maintain']),
    frequency: z.enum(['increase', 'decrease', 'maintain']),
    duration: z.enum(['increase', 'decrease', 'maintain']),
  }),
  rationale: z.string(),
  confidence: z.number().min(0).max(1),
  implementation: z.object({
    immediate: z.boolean(),
    shortTerm: z.boolean(),
    longTerm: z.boolean(),
  }),
});

export type RPEFeedback = z.infer<typeof RPEFeedbackSchema>;
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;
export type AdaptationResult = z.infer<typeof AdaptationResultSchema>;

// 性能分析结果
export interface PerformanceAnalysis {
  overallTrend: {
    rpeTrend: 'increasing' | 'decreasing' | 'stable';
    completionTrend: 'increasing' | 'decreasing' | 'stable';
    volumeTrend: 'increasing' | 'decreasing' | 'stable';
  };
  fatigueLevel: number; // 0-10
  adaptationNeeded: boolean;
  recommendations: string[];
  riskFactors: string[];
  opportunities: string[];
}

export class AdaptationEngine {
  private adaptationRules: Map<string, (data: unknown) => unknown> = new Map();
  private historicalData: Map<string, unknown[]> = new Map();

  constructor() {
    this.initializeAdaptationRules();
  }

  /**
   * 分析性能数据并生成适应性调整建议
   */
  async analyzePerformance(
    rpeFeedback: RPEFeedback[],
    performanceMetrics: PerformanceMetrics[]
  ): Promise<PerformanceAnalysis> {
    // 存储历史数据
    this.historicalData.set('rpe', rpeFeedback);
    this.historicalData.set('performance', performanceMetrics);

    const analysis: PerformanceAnalysis = {
      overallTrend: this.calculateOverallTrend(rpeFeedback, performanceMetrics),
      fatigueLevel: this.calculateFatigueLevel(performanceMetrics),
      adaptationNeeded: this.determineAdaptationNeeded(rpeFeedback, performanceMetrics),
      recommendations: this.generateRecommendations(rpeFeedback, performanceMetrics),
      riskFactors: this.identifyRiskFactors(rpeFeedback, performanceMetrics),
      opportunities: this.identifyOpportunities(rpeFeedback, performanceMetrics),
    };

    return analysis;
  }

  /**
   * 生成适应性调整方案
   */
  async generateAdaptation(
    currentPlan: any,
    analysis: PerformanceAnalysis,
    userProfile: any
  ): Promise<AdaptationResult[]> {
    const adaptations: AdaptationResult[] = [];

    // 基于疲劳水平调整
    if (analysis.fatigueLevel > 7) {
      adaptations.push(this.createRecoveryAdaptation(currentPlan, analysis.fatigueLevel));
    }

    // 基于RPE趋势调整
    if (analysis.overallTrend.rpeTrend === 'increasing') {
      adaptations.push(this.createIntensityReduction(currentPlan, analysis.overallTrend.rpeTrend));
    }

    // 基于完成率调整
    if (analysis.overallTrend.completionTrend === 'decreasing') {
      adaptations.push(this.createVolumeReduction(currentPlan, analysis.overallTrend.completionTrend));
    }

    // 基于风险因素调整
    if (analysis.riskFactors.length > 0) {
      adaptations.push(this.createRiskMitigationAdaptation(currentPlan, analysis.riskFactors));
    }

    // 基于机会调整
    if (analysis.opportunities.length > 0) {
      adaptations.push(this.createOpportunityAdaptation(currentPlan, analysis.opportunities));
    }

    return adaptations;
  }

  /**
   * 应用适应性调整到训练计划
   */
  async applyAdaptations(
    currentPlan: any,
    adaptations: AdaptationResult[]
  ): Promise<any> {
    let updatedPlan = { ...currentPlan };

    for (const adaptation of adaptations) {
      switch (adaptation.type) {
        case 'recovery':
          updatedPlan = this.applyRecoveryAdaptation(updatedPlan, adaptation);
          break;
        case 'intensity_reduction':
          updatedPlan = this.applyIntensityReduction(updatedPlan, adaptation);
          break;
        case 'volume_reduction':
          updatedPlan = this.applyVolumeReduction(updatedPlan, adaptation);
          break;
        case 'frequency_adjustment':
          updatedPlan = this.applyFrequencyAdjustment(updatedPlan, adaptation);
          break;
        case 'exercise_substitution':
          updatedPlan = this.applyExerciseSubstitution(updatedPlan, adaptation);
          break;
        case 'progression_modification':
          updatedPlan = this.applyProgressionModification(updatedPlan, adaptation);
          break;
        default:
          console.warn(`Unknown adaptation type: ${adaptation.type}`);
      }
    }

    return updatedPlan;
  }

  /**
   * 计算整体趋势
   */
  private calculateOverallTrend(
    rpeFeedback: RPEFeedback[],
    performanceMetrics: PerformanceMetrics[]
  ): PerformanceAnalysis['overallTrend'] {
    const rpeTrend = this.calculateTrend(rpeFeedback.map(f => f.rpe));
    const completionTrend = this.calculateTrend(performanceMetrics.map(m => m.completionRate));
    const volumeTrend = this.calculateVolumeTrend(performanceMetrics);

    return {
      rpeTrend,
      completionTrend,
      volumeTrend,
    };
  }

  /**
   * 计算疲劳水平
   */
  private calculateFatigueLevel(metrics: PerformanceMetrics[]): number {
    if (metrics.length === 0) return 0;

    const recentMetrics = metrics.slice(-7); // 最近7天
    const avgRPE = recentMetrics.reduce((sum, m) => sum + m.averageRPE, 0) / recentMetrics.length;
    const avgRecovery = recentMetrics.reduce((sum, m) => sum + m.recoveryTime, 0) / recentMetrics.length;
    const avgSleep = recentMetrics.reduce((sum, m) => sum + m.sleepQuality, 0) / recentMetrics.length;
    const avgStress = recentMetrics.reduce((sum, m) => sum + m.stressLevel, 0) / recentMetrics.length;

    // 疲劳水平计算：RPE权重30%，恢复时间权重25%，睡眠质量权重25%，压力水平权重20%
    const fatigueLevel = (avgRPE * 0.3) + 
                        ((10 - avgRecovery) * 0.25) + 
                        ((10 - avgSleep) * 0.25) + 
                        (avgStress * 0.2);

    return Math.min(10, Math.max(0, fatigueLevel));
  }

  /**
   * 判断是否需要适应性调整
   */
  private determineAdaptationNeeded(
    rpeFeedback: RPEFeedback[],
    performanceMetrics: PerformanceMetrics[]
  ): boolean {
    const fatigueLevel = this.calculateFatigueLevel(performanceMetrics);
    const completionRate = performanceMetrics[performanceMetrics.length - 1]?.completionRate || 100;
    const avgRPE = rpeFeedback.length > 0 ? 
      rpeFeedback.reduce((sum, f) => sum + f.rpe, 0) / rpeFeedback.length : 5;

    return fatigueLevel > 7 || completionRate < 80 || avgRPE > 8;
  }

  /**
   * 生成建议
   */
  private generateRecommendations(
    rpeFeedback: RPEFeedback[],
    performanceMetrics: PerformanceMetrics[]
  ): string[] {
    const recommendations: string[] = [];
    const fatigueLevel = this.calculateFatigueLevel(performanceMetrics);

    if (fatigueLevel > 8) {
      recommendations.push('建议增加休息日，减少训练强度');
      recommendations.push('考虑进行主动恢复训练');
    } else if (fatigueLevel > 6) {
      recommendations.push('建议调整训练计划，增加恢复时间');
      recommendations.push('监控睡眠质量和压力水平');
    }

    const completionRate = performanceMetrics[performanceMetrics.length - 1]?.completionRate || 100;
    if (completionRate < 70) {
      recommendations.push('建议降低训练量，确保计划可执行性');
      recommendations.push('检查训练计划的现实性');
    } else if (completionRate > 95) {
      recommendations.push('可以考虑适当增加训练强度');
      recommendations.push('当前计划可能过于保守');
    }

    const avgRPE = rpeFeedback.length > 0 ? 
      rpeFeedback.reduce((sum, f) => sum + f.rpe, 0) / rpeFeedback.length : 5;
    if (avgRPE > 8) {
      recommendations.push('建议降低训练强度，避免过度训练');
    } else if (avgRPE < 4) {
      recommendations.push('可以适当增加训练强度');
    }

    return recommendations;
  }

  /**
   * 识别风险因素
   */
  private identifyRiskFactors(
    rpeFeedback: RPEFeedback[],
    performanceMetrics: PerformanceMetrics[]
  ): string[] {
    const riskFactors: string[] = [];
    const fatigueLevel = this.calculateFatigueLevel(performanceMetrics);

    if (fatigueLevel > 8) {
      riskFactors.push('过度训练风险');
    }
    if (fatigueLevel > 6) {
      riskFactors.push('恢复不足');
    }

    const completionRate = performanceMetrics[performanceMetrics.length - 1]?.completionRate || 100;
    if (completionRate < 70) {
      riskFactors.push('计划执行困难');
    }

    const avgRPE = rpeFeedback.length > 0 ? 
      rpeFeedback.reduce((sum, f) => sum + f.rpe, 0) / rpeFeedback.length : 5;
    if (avgRPE > 8) {
      riskFactors.push('训练强度过高');
    }

    return riskFactors;
  }

  /**
   * 识别机会
   */
  private identifyOpportunities(
    rpeFeedback: RPEFeedback[],
    performanceMetrics: PerformanceMetrics[]
  ): string[] {
    const opportunities: string[] = [];
    const fatigueLevel = this.calculateFatigueLevel(performanceMetrics);

    if (fatigueLevel < 4) {
      opportunities.push('可以增加训练强度');
    }

    const completionRate = performanceMetrics[performanceMetrics.length - 1]?.completionRate || 100;
    if (completionRate > 95) {
      opportunities.push('可以增加训练量');
    }

    const avgRPE = rpeFeedback.length > 0 ? 
      rpeFeedback.reduce((sum, f) => sum + f.rpe, 0) / rpeFeedback.length : 5;
    if (avgRPE < 4) {
      opportunities.push('可以增加训练难度');
    }

    return opportunities;
  }

  /**
   * 创建恢复性调整
   */
  private createRecoveryAdaptation(currentPlan: any, fatigueLevel: number): AdaptationResult {
    const intensityReduction = Math.min(0.3, fatigueLevel * 0.05);
    const volumeReduction = Math.min(0.4, fatigueLevel * 0.06);

    return {
      type: 'recovery',
      changes: {
        intensity: 'decrease',
        volume: 'decrease',
        frequency: 'maintain',
        duration: 'decrease',
      },
      rationale: `基于疲劳水平分析 (${fatigueLevel.toFixed(1)}/10)，建议增加恢复时间`,
      confidence: Math.min(0.9, fatigueLevel / 10),
      implementation: {
        immediate: true,
        shortTerm: true,
        longTerm: false,
      },
    };
  }

  /**
   * 创建强度降低调整
   */
  private createIntensityReduction(currentPlan: any, trend: string): AdaptationResult {
    return {
      type: 'intensity_reduction',
      changes: {
        intensity: 'decrease',
        volume: 'maintain',
        frequency: 'maintain',
        duration: 'maintain',
      },
      rationale: `基于RPE趋势分析 (${trend})，建议降低训练强度`,
      confidence: 0.8,
      implementation: {
        immediate: true,
        shortTerm: true,
        longTerm: false,
      },
    };
  }

  /**
   * 创建训练量降低调整
   */
  private createVolumeReduction(currentPlan: any, trend: string): AdaptationResult {
    return {
      type: 'volume_reduction',
      changes: {
        intensity: 'maintain',
        volume: 'decrease',
        frequency: 'maintain',
        duration: 'decrease',
      },
      rationale: `基于完成率趋势分析 (${trend})，建议降低训练量`,
      confidence: 0.8,
      implementation: {
        immediate: true,
        shortTerm: true,
        longTerm: false,
      },
    };
  }

  /**
   * 创建风险缓解调整
   */
  private createRiskMitigationAdaptation(currentPlan: any, riskFactors: string[]): AdaptationResult {
    return {
      type: 'progression_modification',
      changes: {
        intensity: 'decrease',
        volume: 'decrease',
        frequency: 'maintain',
        duration: 'maintain',
      },
      rationale: `基于风险因素分析 (${riskFactors.join(', ')})，建议调整训练计划`,
      confidence: 0.9,
      implementation: {
        immediate: true,
        shortTerm: true,
        longTerm: true,
      },
    };
  }

  /**
   * 创建机会利用调整
   */
  private createOpportunityAdaptation(currentPlan: any, opportunities: string[]): AdaptationResult {
    return {
      type: 'progression_modification',
      changes: {
        intensity: 'increase',
        volume: 'increase',
        frequency: 'maintain',
        duration: 'maintain',
      },
      rationale: `基于机会分析 (${opportunities.join(', ')})，建议增加训练挑战`,
      confidence: 0.7,
      implementation: {
        immediate: false,
        shortTerm: true,
        longTerm: true,
      },
    };
  }

  /**
   * 计算趋势
   */
  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const change = (secondAvg - firstAvg) / firstAvg;

    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  /**
   * 计算训练量趋势
   */
  private calculateVolumeTrend(metrics: PerformanceMetrics[]): 'increasing' | 'decreasing' | 'stable' {
    const volumes = metrics.map(m => m.totalVolume);
    return this.calculateTrend(volumes);
  }

  /**
   * 应用恢复性调整
   */
  private applyRecoveryAdaptation(plan: any, adaptation: AdaptationResult): any {
    return {
      ...plan,
      intensity: Math.max(0.5, plan.intensity * 0.8),
      volume: Math.max(0.5, plan.volume * 0.8),
      recoveryDays: (plan.recoveryDays || 0) + 1,
    };
  }

  /**
   * 应用强度降低调整
   */
  private applyIntensityReduction(plan: any, adaptation: AdaptationResult): any {
    return {
      ...plan,
      intensity: Math.max(0.6, plan.intensity * 0.9),
    };
  }

  /**
   * 应用训练量降低调整
   */
  private applyVolumeReduction(plan: any, adaptation: AdaptationResult): any {
    return {
      ...plan,
      volume: Math.max(0.7, plan.volume * 0.85),
    };
  }

  /**
   * 应用频率调整
   */
  private applyFrequencyAdjustment(plan: any, adaptation: AdaptationResult): any {
    // 实现频率调整逻辑
    return plan;
  }

  /**
   * 应用运动替代调整
   */
  private applyExerciseSubstitution(plan: any, adaptation: AdaptationResult): any {
    // 实现运动替代逻辑
    return plan;
  }

  /**
   * 应用进度修改调整
   */
  private applyProgressionModification(plan: any, adaptation: AdaptationResult): any {
    // 实现进度修改逻辑
    return plan;
  }

  /**
   * 初始化适应性调整规则
   */
  private initializeAdaptationRules(): void {
    this.adaptationRules.set('high_fatigue', (data: unknown) => this.createRecoveryAdaptation((data as any).currentPlan, (data as any).fatigueLevel));
    this.adaptationRules.set('low_completion', (data: unknown) => this.createVolumeReduction((data as any).currentPlan, (data as any).trend));
    this.adaptationRules.set('high_rpe', (data: unknown) => this.createIntensityReduction((data as any).currentPlan, (data as any).trend));
  }
}
