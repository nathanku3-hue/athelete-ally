// 数据库优化服务 - 改善Planning Engine数据库操作性能
import { prisma } from '../db.js';
import { config } from '../config.js';
// 使用统一的日志记录
// 使用console进行日志记录，避免循环依赖
import { TrainingPlan } from '../llm.js';

// 批量操作接口
interface BatchOperation<T> {
  operation: 'create' | 'update' | 'delete';
  data: T;
  table: string;
}

// 数据库优化器
export class DatabaseOptimizer {
  private batchSize: number;
  private connectionPoolSize: number;
  private queryTimeout: number;

  constructor() {
    this.batchSize = config.DB_BATCH_SIZE;
    this.connectionPoolSize = config.DB_CONNECTION_POOL_SIZE;
    this.queryTimeout = config.DB_QUERY_TIMEOUT_MS;
  }

  // 批量创建计划（优化版本）
  async createPlanOptimized(
    userId: string,
    planData: TrainingPlan,
    jobId: string
  ): Promise<string> {
    const startTime = Date.now();

    try {
      // 使用事务确保数据一致性
      const result = await prisma.$transaction(async (tx: any) => {
        // 1. 创建主计划记录
        const plan = await tx.plan.create({
          data: {
            userId,
            status: 'completed',
            name: planData.name,
            description: planData.description,
            content: planData,
          },
        });

        // 2. 批量创建微周期
        const microcycleData = planData.microcycles.map((mc: any) => ({
          planId: plan.id,
          weekNumber: (mc as any).weekNumber,
          name: (mc as any).name,
          phase: (mc as any).phase,
        }));

        const microcycles = await tx.microcycle.createMany({
          data: microcycleData,
        });

        // 3. 获取创建的微周期ID
        const createdMicrocycles = await tx.microcycle.findMany({
          where: { planId: plan.id },
          select: { id: true, weekNumber: true },
        });

        // 4. 批量创建训练会话
        const sessionData: any[] = [];
        for (const mc of planData.microcycles) {
          const microcycle = createdMicrocycles.find(
            (cmc: any) => cmc.weekNumber === (mc as any).weekNumber
          );
          if (microcycle) {
            for (const session of (mc as any).sessions) {
              sessionData.push({
                microcycleId: microcycle.id,
                dayOfWeek: session.dayOfWeek,
                name: session.name,
                duration: session.duration,
              });
            }
          }
        }

        const sessions = await tx.session.createMany({
          data: sessionData,
        });

        // 5. 获取创建的会话ID
        const createdSessions = await tx.session.findMany({
          where: { microcycle: { planId: plan.id } },
          select: { id: true, dayOfWeek: true, microcycleId: true },
        });

        // 6. 批量创建练习
        const exerciseData: any[] = [];
        for (const mc of planData.microcycles) {
          const microcycle = createdMicrocycles.find(
            (cmc: any) => cmc.weekNumber === (mc as any).weekNumber
          );
          if (microcycle) {
            for (const session of (mc as any).sessions) {
              const createdSession = createdSessions.find(
                (cs: any) =>
                  cs.microcycleId === microcycle.id &&
                  cs.dayOfWeek === session.dayOfWeek
              );
              if (createdSession) {
                for (const exercise of session.exercises) {
                  exerciseData.push({
                    sessionId: createdSession.id,
                    name: exercise.name,
                    category: exercise.category,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    weight: exercise.weight,
                    notes: exercise.notes,
                  });
                }
              }
            }
          }
        }

        const exercises = await tx.exercise.createMany({
          data: exerciseData,
        });

        return {
          planId: plan.id,
          microcyclesCount: microcycles.count,
          sessionsCount: sessions.count,
          exercisesCount: exercises.count,
        };
      }, {
        timeout: this.queryTimeout,
      });

      const duration = Date.now() - startTime;
      console.info({
        planId: result.planId,
        jobId,
        duration,
        microcyclesCount: result.microcyclesCount,
        sessionsCount: result.sessionsCount,
        exercisesCount: result.exercisesCount,
      }, 'Plan created successfully with optimized database operations');

      return result.planId;

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error({
        error,
        jobId,
        duration,
        userId,
      }, 'Failed to create plan with optimized database operations');
      throw error;
    }
  }

  // 批量更新计划状态
  async updatePlanStatusBatch(
    updates: Array<{ planId: string; status: string; progress?: number }>
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // 分批处理更新
      for (let i = 0; i < updates.length; i += this.batchSize) {
        const batch = updates.slice(i, i + this.batchSize);
        
        await Promise.all(
          batch.map((update) =>
            prisma.plan.update({
              where: { id: update.planId },
              data: {
                status: update.status,
                ...(update.progress !== undefined && { progress: update.progress }),
                updatedAt: new Date(),
              },
            })
          )
        );
      }

      const duration = Date.now() - startTime;
      console.info({
        count: updates.length,
        duration,
        batchSize: this.batchSize,
      }, 'Batch plan status updates completed');

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error({
        error,
        count: updates.length,
        duration,
      }, 'Failed to update plan status batch');
      throw error;
    }
  }

  // 批量更新任务状态
  async updateJobStatusBatch(
    updates: Array<{ jobId: string; status: string; progress: number }>
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // 分批处理更新
      for (let i = 0; i < updates.length; i += this.batchSize) {
        const batch = updates.slice(i, i + this.batchSize);
        
        await Promise.all(
          batch.map((update) =>
            prisma.planJob.updateMany({
              where: { jobId: update.jobId },
              data: {
                status: update.status,
                progress: update.progress,
                updatedAt: new Date(),
              },
            })
          )
        );
      }

      const duration = Date.now() - startTime;
      console.info({
        count: updates.length,
        duration,
        batchSize: this.batchSize,
      }, 'Batch job status updates completed');

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error({
        error,
        count: updates.length,
        duration,
      }, 'Failed to update job status batch');
      throw error;
    }
  }

  // 优化查询 - 获取用户计划（带分页）
  async getUserPlansOptimized(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    plans: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const startTime = Date.now();
    const offset = (page - 1) * limit;

    try {
      const [plans, total] = await Promise.all([
        prisma.plan.findMany({
          where: { userId },
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            progress: true,
            createdAt: true,
            updatedAt: true,
            microcycles: {
              select: {
                id: true,
                weekNumber: true,
                name: true,
                phase: true,
                sessions: {
                  select: {
                    id: true,
                    dayOfWeek: true,
                    name: true,
                    duration: true,
                    exercises: {
                      select: {
                        id: true,
                        name: true,
                        category: true,
                        sets: true,
                        reps: true,
                        weight: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        prisma.plan.count({
          where: { userId },
        }),
      ]);

      const duration = Date.now() - startTime;
      console.info({
        userId,
        page,
        limit,
        total,
        duration,
      }, 'User plans query completed');

      return {
        plans,
        total,
        page,
        limit,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error({
        error,
        userId,
        page,
        limit,
        duration,
      }, 'Failed to get user plans');
      throw error;
    }
  }

  // 优化查询 - 获取计划详情（减少查询次数）
  async getPlanDetailsOptimized(planId: string): Promise<any> {
    const startTime = Date.now();

    try {
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
        include: {
          microcycles: {
            include: {
              sessions: {
                include: {
                  exercises: true,
                },
              },
            },
            orderBy: { weekNumber: 'asc' },
          },
        },
      });

      const duration = Date.now() - startTime;
      console.info({
        planId,
        duration,
        hasMicrocycles: plan?.microcycles?.length || 0,
      }, 'Plan details query completed');

      return plan;

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error({
        error,
        planId,
        duration,
      }, 'Failed to get plan details');
      throw error;
    }
  }

  // 清理过期数据
  async cleanupExpiredData(): Promise<{
    deletedJobs: number;
    deletedPlans: number;
  }> {
    const startTime = Date.now();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    try {
      const [deletedJobs, deletedPlans] = await Promise.all([
        // 删除30天前的失败任务
        prisma.planJob.deleteMany({
          where: {
            status: 'failed',
            createdAt: { lt: thirtyDaysAgo },
          },
        }),
        // 删除30天前的草稿计划
        prisma.plan.deleteMany({
          where: {
            status: 'draft',
            createdAt: { lt: thirtyDaysAgo },
          },
        }),
      ]);

      const duration = Date.now() - startTime;
      console.info({
        deletedJobs: deletedJobs.count,
        deletedPlans: deletedPlans.count,
        duration,
      }, 'Expired data cleanup completed');

      return {
        deletedJobs: deletedJobs.count,
        deletedPlans: deletedPlans.count,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error({
        error,
        duration,
      }, 'Failed to cleanup expired data');
      throw error;
    }
  }

  // 获取数据库性能指标
  async getPerformanceMetrics(): Promise<{
    activeConnections: number;
    queryCount: number;
    averageQueryTime: number;
  }> {
    try {
      // 这里可以添加实际的数据库性能查询
      // 例如：SELECT * FROM pg_stat_activity WHERE state = 'active'
      
      return {
        activeConnections: 0, // 需要实现实际的查询
        queryCount: 0, // 需要实现实际的查询
        averageQueryTime: 0, // 需要实现实际的查询
      };
    } catch (error) {
      console.error(`Failed to get performance metrics: ${error}`);
      return {
        activeConnections: 0,
        queryCount: 0,
        averageQueryTime: 0,
      };
    }
  }
}
