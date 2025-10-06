// 摘要数据聚合器 - 用于生成仪表盘所需的预计算数据
import { prisma } from './db.js';
import { eventBus } from '@athlete-ally/event-bus';
import { PlanGeneratedEvent } from '@athlete-ally/contracts';

export interface UserSummaryData {
  userId: string;
  weekStart: Date;
  weekEnd: Date;
  
  // 训练数据
  totalWorkouts: number;
  completedWorkouts: number;
  totalVolume: number; // 总吨位
  averageSessionDuration: number; // 平均训练时长(分钟)
  
  // 疲劳数据
  averageFatigueLevel: number;
  fatigueAssessmentCount: number;
  
  // 个人记录
  personalRecordsSet: number;
  newPersonalRecords: string[]; // 新设置的PR列表
  
  // 进度指标
  weeklyGoalCompletion: number; // 周目标完成率
  consistencyScore: number; // 一致性评分
  
  // 元数据
  lastUpdated: Date;
  dataVersion: number;
}

export class SummaryAggregator {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  async start() {
    if (this.isRunning) {
      console.log('SummaryAggregator is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting SummaryAggregator...');

    // 连接到事件总线
    await eventBus.connect(process.env.NATS_URL || 'nats://localhost:4223');

    // 订阅计划生成请求事件，触发摘要更新
    await eventBus.subscribeToPlanGenerationRequested(this.handlePlanGenerated.bind(this) as any);

    // 每小时运行一次全量更新
    this.intervalId = setInterval(() => {
      this.updateAllSummaries().catch(console.error);
    }, 60 * 60 * 1000); // 1小时

    // 启动时立即运行一次
    await this.updateAllSummaries();

    console.log('SummaryAggregator started successfully');
  }

  async stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    await eventBus.close();
    console.log('SummaryAggregator stopped');
  }

  private async handlePlanGenerated(event: PlanGeneratedEvent) {
    console.log(`Plan generated for user ${event.userId}, updating summary data...`);
    await this.updateUserSummary(event.userId);
  }

  private async updateAllSummaries() {
    console.log('Running full summary update...');
    
    try {
      // Get all active users from UserSummary model (not User model)
      // UserSummary contains aggregated user data and is the correct model for this operation
      const users = await prisma.userSummary.findMany({
        select: {
          userId: true,
        },
        distinct: ['userId'],
      });

      // Update all user summaries in parallel for better performance
      const updatePromises = users.map((user: any) => this.updateUserSummary(user.userId));
      await Promise.all(updatePromises);

      console.log(`Updated summaries for ${users.length} users`);
    } catch (error) {
      console.error('Failed to update all summaries:', error);
    }
  }

  private async updateUserSummary(userId: string) {
    try {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // 本周开始
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // 查询本周训练数据
      const workouts = await prisma.workoutSession.findMany({
        where: {
          userId: userId,
          startedAt: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
        include: {
          exercises: {
            include: {
              records: true,
            },
          },
        },
      });

      // 计算训练指标
      const completedWorkouts = workouts.filter((w: any) => w.status === 'completed');
      const totalVolume = this.calculateTotalVolume(completedWorkouts);
      const averageSessionDuration = this.calculateAverageDuration(completedWorkouts);
      const personalRecordsSet = this.countPersonalRecords(completedWorkouts);
      const newPersonalRecords = this.getNewPersonalRecords(completedWorkouts);

      // 查询疲劳评估数据
      const fatigueData = await this.getFatigueData(userId, weekStart, weekEnd);

      // 计算进度指标
      const weeklyGoalCompletion = this.calculateGoalCompletion(completedWorkouts.length, 4); // 假设目标是4次/周
      const consistencyScore = await this.calculateConsistencyScore(userId, weekStart);

      // 创建摘要数据
      const summaryData: UserSummaryData = {
        userId: userId,
        weekStart: weekStart,
        weekEnd: weekEnd,
        totalWorkouts: workouts.length,
        completedWorkouts: completedWorkouts.length,
        totalVolume: totalVolume,
        averageSessionDuration: averageSessionDuration,
        averageFatigueLevel: fatigueData.averageLevel,
        fatigueAssessmentCount: fatigueData.assessmentCount,
        personalRecordsSet: personalRecordsSet,
        newPersonalRecords: newPersonalRecords,
        weeklyGoalCompletion: weeklyGoalCompletion,
        consistencyScore: consistencyScore,
        lastUpdated: now,
        dataVersion: 1,
      };

      // 保存或更新摘要数据
      await this.saveSummaryData(summaryData);

      console.log(`Updated summary for user ${userId}: ${completedWorkouts.length}/${workouts.length} workouts completed`);
    } catch (error) {
      console.error(`Failed to update summary for user ${userId}:`, error);
    }
  }

  private calculateTotalVolume(workouts: any[]): number {
    return workouts.reduce((total, workout) => {
      return total + workout.exercises.reduce((exerciseTotal: number, exercise: any) => {
        return exerciseTotal + exercise.records.reduce((recordTotal: number, record: any) => {
          return recordTotal + (record.weight || 0) * (record.reps || 0);
        }, 0);
      }, 0);
    }, 0);
  }

  private calculateAverageDuration(workouts: any[]): number {
    if (workouts.length === 0) return 0;
    
    const totalDuration = workouts.reduce((total, workout) => {
      return total + (workout.totalDuration || 0);
    }, 0);
    
    return Math.round(totalDuration / workouts.length);
  }

  private countPersonalRecords(workouts: any[]): number {
    return workouts.reduce((total, workout) => {
      return total + workout.exercises.reduce((exerciseTotal: number, exercise: any) => {
        return exerciseTotal + exercise.records.filter((record: any) => record.isPersonalRecord).length;
      }, 0);
    }, 0);
  }

  private getNewPersonalRecords(workouts: any[]): string[] {
    const newPRs: string[] = [];
    
    workouts.forEach(workout => {
      workout.exercises.forEach((exercise: any) => {
        exercise.records.forEach((record: any) => {
          if (record.isPersonalRecord && record.notes?.includes('NEW PR')) {
            newPRs.push(`${exercise.name}: ${record.weight}kg x ${record.reps}`);
          }
        });
      });
    });
    
    return newPRs;
  }

  private async getFatigueData(_userId: string, _weekStart: Date, _weekEnd: Date) {
    // 这里应该查询疲劳服务的数据
    // 暂时返回模拟数据
    return {
      averageLevel: 3.2,
      assessmentCount: 5,
    };
  }

  private calculateGoalCompletion(completed: number, goal: number): number {
    return Math.min(100, Math.round((completed / goal) * 100));
  }

  private async calculateConsistencyScore(userId: string, weekStart: Date): Promise<number> {
    // 计算过去4周的一致性评分
    const fourWeeksAgo = new Date(weekStart);
    fourWeeksAgo.setDate(weekStart.getDate() - 28);
    
    const workouts = await prisma.workoutSession.count({
      where: {
        userId: userId,
        startedAt: {
          gte: fourWeeksAgo,
          lte: weekStart,
        },
        status: 'completed',
      },
    });
    
    // 假设目标是每周3次，4周12次
    const targetWorkouts = 12;
    return Math.min(100, Math.round((workouts / targetWorkouts) * 100));
  }

  private async saveSummaryData(summary: UserSummaryData) {
    // 这里应该保存到专门的摘要表
    // 暂时使用现有的数据库表
    console.log('Saving summary data:', {
      userId: summary.userId,
      weekStart: summary.weekStart,
      completedWorkouts: summary.completedWorkouts,
      totalVolume: summary.totalVolume,
    });
  }
}

// 创建单例实例
export const summaryAggregator = new SummaryAggregator();

