/**
 * 事件追踪系统
 * 用于捕获和分析用户行为数据
 */

export interface BaseEvent {
  userId: string;
  timestamp: Date;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface UserLifecycleEvent extends BaseEvent {
  eventType: 'registration' | 'onboarding_start' | 'onboarding_complete' | 'first_workout' | 'churn';
  source?: string;
  device?: string;
  userAgent?: string;
}

export interface WorkoutBehaviorEvent extends BaseEvent {
  eventType: 'session_start' | 'exercise_start' | 'set_complete' | 'session_complete' | 'session_abandon';
  exerciseId?: string;
  setNumber?: number;
  rpe?: number;
  duration?: number;
  planId?: string;
  phase?: string;
  equipment?: string[];
}

export interface PlanGenerationEvent extends BaseEvent {
  eventType: 'plan_requested' | 'plan_generated' | 'plan_modified' | 'plan_accepted' | 'plan_rejected';
  planId: string;
  generationTime?: number;
  planComplexity?: number;
  userPreferences?: Record<string, any>;
}

export interface FeatureUsageEvent extends BaseEvent {
  eventType: 'feature_accessed' | 'feature_completed' | 'feature_abandoned';
  featureName: string;
  featureCategory: string;
  duration?: number;
  success?: boolean;
}

export interface CustomEvent extends BaseEvent {
  eventType: string;
  eventData: Record<string, any>;
}

export type AnalyticsEvent = 
  | UserLifecycleEvent 
  | WorkoutBehaviorEvent 
  | PlanGenerationEvent 
  | FeatureUsageEvent 
  | CustomEvent;

export class EventTracker {
  private events: AnalyticsEvent[] = [];
  private batchSize: number = 100;
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;

  constructor(
    private apiEndpoint: string,
    private apiKey: string,
    options?: {
      batchSize?: number;
      flushInterval?: number;
    }
  ) {
    if (options?.batchSize) this.batchSize = options.batchSize;
    if (options?.flushInterval) this.flushInterval = options.flushInterval;
    
    this.startFlushTimer();
  }

  /**
   * 追踪用户生命周期事件
   */
  async trackUserEvent(event: UserLifecycleEvent): Promise<void> {
    await this.trackEvent(event);
  }

  /**
   * 追踪训练行为事件
   */
  async trackWorkoutEvent(event: WorkoutBehaviorEvent): Promise<void> {
    await this.trackEvent(event);
  }

  /**
   * 追踪计划生成事件
   */
  async trackPlanEvent(event: PlanGenerationEvent): Promise<void> {
    await this.trackEvent(event);
  }

  /**
   * 追踪功能使用事件
   */
  async trackFeatureEvent(event: FeatureUsageEvent): Promise<void> {
    await this.trackEvent(event);
  }

  /**
   * 追踪自定义事件
   */
  async trackCustomEvent(event: CustomEvent): Promise<void> {
    await this.trackEvent(event);
  }

  /**
   * 追踪通用事件
   */
  private async trackEvent(event: AnalyticsEvent): Promise<void> {
    // 添加事件到批次
    this.events.push(event);

    // 如果达到批次大小，立即刷新
    if (this.events.length >= this.batchSize) {
      await this.flush();
    }
  }

  /**
   * 立即刷新所有待处理事件
   */
  async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      await this.sendEvents(eventsToSend);
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // 可以选择重新添加到队列或记录到本地存储
    }
  }

  /**
   * 发送事件到分析服务
   */
  private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        events,
        timestamp: new Date().toISOString(),
        batchId: this.generateBatchId(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send events: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * 开始定时刷新
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * 停止事件追踪
   */
  async stop(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    await this.flush();
  }

  /**
   * 生成批次ID
   */
  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 实时指标计算器
 */
export class RealTimeMetrics {
  constructor(private eventTracker: EventTracker) {}

  /**
   * 计算用户参与度分数
   */
  async calculateUserEngagementScore(userId: string): Promise<number> {
    // 这里应该查询数据库或缓存来计算参与度分数
    // 基于用户的训练频率、功能使用、会话时长等
    return 0.85; // 示例分数
  }

  /**
   * 计算训练效果数据
   */
  async calculateTrainingEffectiveness(
    userId: string, 
    period: string
  ): Promise<{
    totalVolume: number;
    averageSessionDuration: number;
    consistencyScore: number;
    personalRecordsSet: number;
    goalAchievementRate: number;
  }> {
    // 这里应该查询数据库来计算训练效果
    return {
      totalVolume: 0,
      averageSessionDuration: 0,
      consistencyScore: 0,
      personalRecordsSet: 0,
      goalAchievementRate: 0,
    };
  }

  /**
   * 计算流失风险
   */
  async calculateChurnRisk(userId: string): Promise<number> {
    // 基于用户最近的活动、参与度、训练频率等计算流失风险
    return 0.2; // 示例风险分数 (0-1)
  }

  /**
   * 计算计划成功率
   */
  async calculatePlanSuccessRate(planId: string): Promise<number> {
    // 基于计划执行情况、用户反馈等计算成功率
    return 0.75; // 示例成功率
  }
}

/**
 * 分析事件工厂
 */
export class AnalyticsEventFactory {
  /**
   * 创建用户注册事件
   */
  static createUserRegistrationEvent(
    userId: string,
    source?: string,
    device?: string
  ): UserLifecycleEvent {
    return {
      userId,
      eventType: 'registration',
      timestamp: new Date(),
      source,
      device,
    };
  }

  /**
   * 创建训练开始事件
   */
  static createWorkoutStartEvent(
    userId: string,
    sessionId: string,
    planId?: string
  ): WorkoutBehaviorEvent {
    return {
      userId,
      sessionId,
      eventType: 'session_start',
      timestamp: new Date(),
      planId,
    };
  }

  /**
   * 创建RPE记录事件
   */
  static createRPEEvent(
    userId: string,
    sessionId: string,
    exerciseId: string,
    setNumber: number,
    rpe: number
  ): WorkoutBehaviorEvent {
    return {
      userId,
      sessionId,
      eventType: 'set_complete',
      timestamp: new Date(),
      exerciseId,
      setNumber,
      rpe,
    };
  }

  /**
   * 创建计划生成事件
   */
  static createPlanGenerationEvent(
    userId: string,
    planId: string,
    generationTime: number,
    success: boolean
  ): PlanGenerationEvent {
    return {
      userId,
      planId,
      eventType: success ? 'plan_generated' : 'plan_rejected',
      timestamp: new Date(),
      generationTime,
    };
  }
}

// 导出单例实例
export const eventTracker = new EventTracker(
  process.env.ANALYTICS_API_ENDPOINT || 'http://localhost:3001/api/analytics',
  process.env.ANALYTICS_API_KEY || 'default-key'
);

export const realTimeMetrics = new RealTimeMetrics(eventTracker);
