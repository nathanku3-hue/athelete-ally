/**
 * V3 協議引擎 - 核心實現
 * 實現訓練協議系統的完整邏輯
 */

// 協議類型枚舉
export enum ProtocolType {
  STANDARD = 'STANDARD',
  TOP_SET_AMRAP = 'TOP_SET_AMRAP',
  MAX_STRENGTH_TEST = 'MAX_STRENGTH_TEST'
}

// 協議配置接口
export interface ProtocolConfig {
  id: string;
  name: string;
  type: ProtocolType;
  description?: string;
  rpeTriggerRules: RPETriggerRule[];
  adaptiveRules: AdaptiveRule[];
  parameters: ProtocolParameters;
}

// RPE 觸發規則
export interface RPETriggerRule {
  id: string;
  condition: 'core_lift_final_set' | 'key_set_only' | 'every_attempt' | 'high_intensity_set';
  exerciseTypes: string[];
  enabled: boolean;
  priority: number;
}

// 適應性規則
export interface AdaptiveRule {
  id: string;
  name: string;
  condition: {
    type: 'rpe_trend' | 'fatigue_level' | 'performance_plateau' | 'volume_increase';
    threshold: number;
    timeWindow: number; // 天數
  };
  action: {
    type: 'load_adjustment' | 'rest_recommendation' | 'exercise_modification' | 'protocol_change';
    parameters: Record<string, any>;
    description: string;
  };
  priority: number;
  enabled: boolean;
}

// 協議參數
export interface ProtocolParameters {
  maxRpeIncrease: number; // 最大 RPE 增加
  minRestBetweenSets: number; // 最小休息時間（秒）
  maxVolumeIncrease: number; // 最大體積增加百分比
  fatigueThreshold: number; // 疲勞閾值
  adaptationRate: number; // 適應率
}

// 訓練上下文
export interface TrainingContext {
  exerciseId: string;
  exerciseType: string;
  isCoreLift: boolean;
  isKeySet: boolean;
  setNumber: number;
  totalSets: number;
  timeElapsed: number; // 秒
  currentRpe?: number;
  previousRpes: number[];
  fatigueLevel?: number;
  motivation?: number;
}

// RPE 觸發決策
export interface RPETriggerDecision {
  shouldTrigger: boolean;
  reason?: string;
  priority: number;
  coachSuggestion?: string;
}

// 適應性建議
export interface AdaptiveSuggestion {
  type: 'load_adjustment' | 'rest_recommendation' | 'exercise_modification' | 'protocol_change';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  implementation: Record<string, any>;
  expectedOutcome: string;
}

// V3 協議引擎類
export class V3ProtocolEngine {
  private protocols: Map<string, ProtocolConfig> = new Map();

  constructor() {
    this.initializeDefaultProtocols();
  }

  // 初始化默認協議
  private initializeDefaultProtocols(): void {
    // 標準協議
    this.protocols.set('standard_protocol', {
      id: 'standard_protocol',
      name: '標準協議',
      type: ProtocolType.STANDARD,
      description: '標準的肌肥大訓練協議',
      rpeTriggerRules: [
        {
          id: 'core_lift_final_set',
          condition: 'core_lift_final_set',
          exerciseTypes: ['squat', 'bench_press', 'deadlift', 'overhead_press'],
          enabled: true,
          priority: 1
        }
      ],
      adaptiveRules: [
        {
          id: 'rpe_trend_analysis',
          name: 'RPE 趨勢分析',
          condition: {
            type: 'rpe_trend',
            threshold: 1.5,
            timeWindow: 7
          },
          action: {
            type: 'load_adjustment',
            parameters: { adjustmentPercentage: -0.05 },
            description: 'RPE 趨勢上升，建議降低負荷'
          },
          priority: 1,
          enabled: true
        },
        {
          id: 'fatigue_management',
          name: '疲勞管理',
          condition: {
            type: 'fatigue_level',
            threshold: 8.0,
            timeWindow: 3
          },
          action: {
            type: 'rest_recommendation',
            parameters: { additionalRestDays: 1 },
            description: '疲勞水平過高，建議增加休息'
          },
          priority: 2,
          enabled: true
        }
      ],
      parameters: {
        maxRpeIncrease: 1.0,
        minRestBetweenSets: 120,
        maxVolumeIncrease: 0.1,
        fatigueThreshold: 7.0,
        adaptationRate: 0.05
      }
    });

    // 頂峰組協議
    this.protocols.set('top_set_amrap_protocol', {
      id: 'top_set_amrap_protocol',
      name: '頂峰組協議',
      type: ProtocolType.TOP_SET_AMRAP,
      description: '頂峰組 AMRAP 訓練協議',
      rpeTriggerRules: [
        {
          id: 'key_set_only',
          condition: 'key_set_only',
          exerciseTypes: ['squat', 'bench_press', 'deadlift', 'overhead_press'],
          enabled: true,
          priority: 1
        }
      ],
      adaptiveRules: [
        {
          id: 'amrap_performance',
          name: 'AMRAP 表現分析',
          condition: {
            type: 'performance_plateau',
            threshold: 0.6,
            timeWindow: 14
          },
          action: {
            type: 'load_adjustment',
            parameters: { adjustmentPercentage: 0.025 },
            description: 'AMRAP 表現穩定，建議微調負荷'
          },
          priority: 1,
          enabled: true
        }
      ],
      parameters: {
        maxRpeIncrease: 1.5,
        minRestBetweenSets: 180,
        maxVolumeIncrease: 0.05,
        fatigueThreshold: 8.0,
        adaptationRate: 0.03
      }
    });

    // 最大力量測試協議
    this.protocols.set('max_strength_test_protocol', {
      id: 'max_strength_test_protocol',
      name: '最大力量測試協議',
      type: ProtocolType.MAX_STRENGTH_TEST,
      description: '最大力量測試和評估協議',
      rpeTriggerRules: [
        {
          id: 'every_attempt',
          condition: 'every_attempt',
          exerciseTypes: ['squat', 'bench_press', 'deadlift', 'overhead_press'],
          enabled: true,
          priority: 1
        }
      ],
      adaptiveRules: [
        {
          id: 'strength_progression',
          name: '力量進展分析',
          condition: {
            type: 'performance_plateau',
            threshold: 0.8,
            timeWindow: 21
          },
          action: {
            type: 'protocol_change',
            parameters: { newProtocol: 'standard_protocol' },
            description: '力量進展停滯，建議切換到標準協議'
          },
          priority: 1,
          enabled: true
        }
      ],
      parameters: {
        maxRpeIncrease: 2.0,
        minRestBetweenSets: 300,
        maxVolumeIncrease: 0.0,
        fatigueThreshold: 9.0,
        adaptationRate: 0.1
      }
    });
  }

  // 獲取協議
  getProtocol(protocolId: string): ProtocolConfig | undefined {
    return this.protocols.get(protocolId);
  }

  // 獲取所有協議
  getAllProtocols(): ProtocolConfig[] {
    return Array.from(this.protocols.values());
  }

  // 根據訓練日類型獲取協議
  getProtocolForTrainingDay(dayType: 'regular' | 'hypertrophy' | 'max_effort'): ProtocolConfig {
    switch (dayType) {
      case 'regular':
        return this.protocols.get('standard_protocol')!;
      case 'hypertrophy':
        return this.protocols.get('top_set_amrap_protocol')!;
      case 'max_effort':
        return this.protocols.get('max_strength_test_protocol')!;
      default:
        return this.protocols.get('standard_protocol')!;
    }
  }

  // 判斷是否應該觸發 RPE
  shouldTriggerRPE(protocolId: string, context: TrainingContext): RPETriggerDecision {
    const protocol = this.getProtocol(protocolId);
    if (!protocol) {
      return { shouldTrigger: false, priority: 0 };
    }

    // 按優先級排序規則
    const enabledRules = protocol.rpeTriggerRules
      .filter(rule => rule.enabled)
      .sort((a, b) => a.priority - b.priority);

    for (const rule of enabledRules) {
      if (this.evaluateRPETriggerRule(rule, context)) {
        return {
          shouldTrigger: true,
          reason: this.getTriggerReason(rule.condition),
          priority: rule.priority,
          coachSuggestion: this.getCoachSuggestion(protocol.type, context)
        };
      }
    }

    return { shouldTrigger: false, priority: 0 };
  }

  // 評估 RPE 觸發規則
  private evaluateRPETriggerRule(rule: RPETriggerRule, context: TrainingContext): boolean {
    // 檢查動作類型是否匹配
    if (!rule.exerciseTypes.includes(context.exerciseType)) {
      return false;
    }

    switch (rule.condition) {
      case 'core_lift_final_set':
        return context.isCoreLift && context.setNumber === context.totalSets;
      
      case 'key_set_only':
        return context.isKeySet;
      
      case 'every_attempt':
        return true; // 每次試舉都觸發
      
      case 'high_intensity_set':
        return context.isCoreLift && context.setNumber >= 2 && context.timeElapsed > 60;
      
      default:
        return false;
    }
  }

  // 獲取觸發原因
  private getTriggerReason(condition: string): string {
    const reasons: Record<string, string> = {
      'core_lift_final_set': '核心動作最後一組',
      'key_set_only': '關鍵組',
      'every_attempt': '每次試舉',
      'high_intensity_set': '高強度組'
    };
    return reasons[condition] || '未知原因';
  }

  // 獲取教練建議
  private getCoachSuggestion(protocolType: ProtocolType, context: TrainingContext): string {
    switch (protocolType) {
      case ProtocolType.STANDARD:
        return '完成得很好！根據這次表現調整下次的負荷。';
      
      case ProtocolType.TOP_SET_AMRAP:
        return '頂峰組表現如何？這將幫助我們調整未來的訓練強度。';
      
      case ProtocolType.MAX_STRENGTH_TEST:
        return '記錄這次試舉的感受，這對評估你的最大力量很重要。';
      
      default:
        return '請評估這次動作的難度。';
    }
  }

  // 評估適應性規則
  evaluateAdaptiveRules(protocolId: string, context: any): AdaptiveSuggestion[] {
    const protocol = this.getProtocol(protocolId);
    if (!protocol) {
      return [];
    }

    const suggestions: AdaptiveSuggestion[] = [];

    for (const rule of protocol.adaptiveRules) {
      if (!rule.enabled) continue;

      if (this.evaluateAdaptiveRule(rule, context)) {
        suggestions.push({
          type: rule.action.type as any,
          priority: this.mapPriority(rule.priority),
          title: rule.name,
          description: rule.action.description,
          implementation: rule.action.parameters,
          expectedOutcome: this.getExpectedOutcome(rule.action.type)
        });
      }
    }

    return suggestions.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));
  }

  // 評估單個適應性規則
  private evaluateAdaptiveRule(rule: AdaptiveRule, context: any): boolean {
    const { condition } = rule;

    switch (condition.type) {
      case 'rpe_trend':
        return this.evaluateRPETrend(context, condition.threshold, condition.timeWindow);
      
      case 'fatigue_level':
        return context.fatigueLevel && context.fatigueLevel >= condition.threshold;
      
      case 'performance_plateau':
        return context.plateauScore && context.plateauScore >= condition.threshold;
      
      case 'volume_increase':
        return context.volumeIncrease && context.volumeIncrease >= condition.threshold;
      
      default:
        return false;
    }
  }

  // 評估 RPE 趨勢
  private evaluateRPETrend(context: any, threshold: number, timeWindow: number): boolean {
    if (!context.rpeData || context.rpeData.length < 3) {
      return false;
    }

    const recentRpes = context.rpeData.slice(-timeWindow).map((d: any) => d.rpe);
    if (recentRpes.length < 3) return false;

    const trend = recentRpes[recentRpes.length - 1] - recentRpes[0];
    return trend >= threshold;
  }

  // 映射優先級
  private mapPriority(priority: number): 'low' | 'medium' | 'high' | 'urgent' {
    if (priority >= 3) return 'urgent';
    if (priority >= 2) return 'high';
    if (priority >= 1) return 'medium';
    return 'low';
  }

  // 獲取優先級數值
  private getPriorityValue(priority: 'low' | 'medium' | 'high' | 'urgent'): number {
    const values = { low: 1, medium: 2, high: 3, urgent: 4 };
    return values[priority];
  }

  // 獲取預期結果
  private getExpectedOutcome(actionType: string): string {
    const outcomes: Record<string, string> = {
      'load_adjustment': '優化訓練負荷，提高訓練效果',
      'rest_recommendation': '促進恢復，避免過度訓練',
      'exercise_modification': '改善動作質量，降低受傷風險',
      'protocol_change': '調整訓練策略，突破平台期'
    };
    return outcomes[actionType] || '改善訓練效果';
  }
}

// 創建全局實例
export const v3ProtocolEngine = new V3ProtocolEngine();
