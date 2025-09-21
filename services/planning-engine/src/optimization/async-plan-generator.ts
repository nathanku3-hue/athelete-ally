// 异步计划生成器 - 优化Planning Engine性能
import { generateTrainingPlan, PlanGenerationRequest, TrainingPlan } from '../llm.js';
import { prisma } from '../db.js';
import { config } from '../config.js';
import { EventPublisher } from '../events/publisher.js';
import { ConcurrencyController } from '../concurrency/controller.js';
// 使用统一的日志记录
import { safeLog as logger } from '@athlete-ally/shared/logger.js';

// 缓存接口
interface PlanCache {
  get(key: string): Promise<TrainingPlan | null>;
  set(key: string, plan: TrainingPlan, ttl: number): Promise<void>;
  delete(key: string): Promise<void>;
}

// Redis缓存实现
class RedisPlanCache implements PlanCache {
  constructor(private redis: any) {}

  async get(key: string): Promise<TrainingPlan | null> {
    try {
      const cached = await this.redis.get(`plan:${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.warn({ error, key }, 'Failed to get from cache');
      return null;
    }
  }

  async set(key: string, plan: TrainingPlan, ttl: number): Promise<void> {
    try {
      await this.redis.setex(`plan:${key}`, ttl, JSON.stringify(plan));
    } catch (error) {
      logger.warn({ error, key }, 'Failed to set cache');
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(`plan:${key}`);
    } catch (error) {
      logger.warn({ error, key }, 'Failed to delete from cache');
    }
  }
}

// 内存缓存实现（备用）
class MemoryPlanCache implements PlanCache {
  private cache = new Map<string, { plan: TrainingPlan; expires: number }>();

  async get(key: string): Promise<TrainingPlan | null> {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.plan;
  }

  async set(key: string, plan: TrainingPlan, ttl: number): Promise<void> {
    this.cache.set(key, {
      plan,
      expires: Date.now() + ttl * 1000
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }
}

// 计划生成任务
interface PlanGenerationTask {
  id: string;
  request: PlanGenerationRequest;
  priority: number;
  createdAt: Date;
  retryCount: number;
  maxRetries: number;
}

// 异步计划生成器
export class AsyncPlanGenerator {
  private cache: PlanCache;
  private concurrencyController: ConcurrencyController;
  private eventPublisher: EventPublisher;
  private taskQueue: PlanGenerationTask[] = [];
  private isProcessing = false;
  private processingTasks = new Set<string>();

  constructor(
    redis: any,
    concurrencyController: ConcurrencyController,
    eventPublisher: EventPublisher
  ) {
    this.cache = redis ? new RedisPlanCache(redis) : new MemoryPlanCache();
    this.concurrencyController = concurrencyController;
    this.eventPublisher = eventPublisher;
  }

  // 生成缓存键
  private generateCacheKey(request: PlanGenerationRequest): string {
    const keyData = {
      proficiency: request.proficiency,
      season: request.season,
      availabilityDays: request.availabilityDays,
      weeklyGoalDays: request.weeklyGoalDays,
      equipment: request.equipment.sort(), // 排序确保一致性
      purpose: request.purpose
    };
    return `plan:${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
  }

  // 异步生成计划
  async generatePlanAsync(
    jobId: string,
    request: PlanGenerationRequest,
    priority: number = 1
  ): Promise<void> {
    const task: PlanGenerationTask = {
      id: jobId,
      request,
      priority,
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: 3
    };

    // 检查缓存
    const cacheKey = this.generateCacheKey(request);
    const cachedPlan = await this.cache.get(cacheKey);
    
    if (cachedPlan) {
      logger.info({ jobId, cacheKey }, 'Using cached plan');
      await this.savePlanToDatabase(jobId, request.userId, cachedPlan);
      await this.publishPlanGeneratedEvent(jobId, request.userId, cachedPlan);
      return;
    }

    // 添加到任务队列
    this.taskQueue.push(task);
    this.taskQueue.sort((a, b) => b.priority - a.priority);

    // 开始处理队列
    this.processQueue();
  }

  // 处理任务队列
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.taskQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      if (!task) break;

      // 检查并发限制
      if (this.processingTasks.size >= config.PLAN_GENERATION_MAX_CONCURRENT) {
        this.taskQueue.unshift(task); // 放回队列
        break;
      }

      this.processingTasks.add(task.id);
      
      // 异步处理任务
      this.processTask(task).catch(error => {
        logger.error({ error, taskId: task.id }, 'Task processing failed');
        this.processingTasks.delete(task.id);
      });
    }

    this.isProcessing = false;
  }

  // 处理单个任务
  private async processTask(task: PlanGenerationTask): Promise<void> {
    const { id: jobId, request } = task;

    try {
      // 更新任务状态
      await this.updateJobStatus(jobId, 'processing', 10);

      // 使用并发控制器执行生成
      await this.concurrencyController.execute(
        'plan_generation',
        { 
          data: request,
          retries: 0,
          maxRetries: 3,
          createdAt: new Date()
        },
        async (task) => {
          await this.generateAndSavePlan(jobId, request);
        }
      );

      this.processingTasks.delete(jobId);
      logger.info({ jobId }, 'Plan generation completed successfully');

    } catch (error) {
      this.processingTasks.delete(jobId);
      
      // 重试逻辑
      if (task.retryCount < task.maxRetries) {
        task.retryCount++;
        task.priority = Math.max(1, task.priority - 1); // 降低优先级
        this.taskQueue.push(task);
        this.taskQueue.sort((a, b) => b.priority - a.priority);
        
        logger.warn({ jobId, retryCount: task.retryCount }, 'Retrying plan generation');
        this.processQueue();
      } else {
        logger.error({ error, jobId }, 'Plan generation failed after max retries');
        await this.updateJobStatus(jobId, 'failed', 0);
      }
    }
  }

  // 生成并保存计划
  private async generateAndSavePlan(
    jobId: string,
    request: PlanGenerationRequest
  ): Promise<void> {
    // 更新进度
    await this.updateJobStatus(jobId, 'processing', 25);

    // 生成计划
    const planData = await generateTrainingPlan(request);

    // 更新进度
    await this.updateJobStatus(jobId, 'processing', 75);

    // 保存到数据库
    await this.savePlanToDatabase(jobId, request.userId, planData);

    // 缓存计划
    const cacheKey = this.generateCacheKey(request);
    await this.cache.set(cacheKey, planData, config.PLAN_CACHE_TTL_SECONDS);

    // 发布事件
    await this.publishPlanGeneratedEvent(jobId, request.userId, planData);

    // 完成
    await this.updateJobStatus(jobId, 'completed', 100);
  }

  // 保存计划到数据库
  private async savePlanToDatabase(
    jobId: string,
    userId: string,
    planData: TrainingPlan
  ): Promise<void> {
    const plan = await prisma.plan.create({
      data: {
        userId,
        status: 'completed',
        name: planData.name,
        description: planData.description,
        content: planData,
        microcycles: {
          create: planData.microcycles.map((mc: any) => ({
            weekNumber: mc.weekNumber,
            name: mc.name,
            phase: mc.phase,
            sessions: {
              create: mc.sessions.map((session: any) => ({
                dayOfWeek: session.dayOfWeek,
                name: session.name,
                duration: session.duration,
                exercises: {
                  create: session.exercises.map((exercise: any) => ({
                    name: exercise.name,
                    category: exercise.category,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    weight: exercise.weight,
                    notes: exercise.notes,
                  })),
                },
              })),
            },
          })),
        },
      },
    });

    logger.info({ planId: plan.id, jobId }, 'Plan saved to database');
  }

  // 发布计划生成事件
  private async publishPlanGeneratedEvent(
    jobId: string,
    userId: string,
    planData: TrainingPlan
  ): Promise<void> {
    const event = {
      eventId: `plan-${jobId}-${Date.now()}`,
      userId,
      jobId,
      planId: planData.name, // 使用计划名称作为ID
      timestamp: Date.now(),
      planData,
    };

    await this.eventPublisher.publishPlanGenerated(event);
    logger.info({ jobId, userId }, 'Plan generated event published');
  }

  // 更新任务状态
  private async updateJobStatus(
    jobId: string,
    status: string,
    progress: number
  ): Promise<void> {
    try {
      await prisma.planJob.updateMany({
        where: { jobId },
        data: { status, progress, updatedAt: new Date() },
      });
    } catch (error) {
      logger.warn({ error, jobId }, 'Failed to update job status');
    }
  }

  // 获取队列状态
  getQueueStatus(): {
    queueLength: number;
    processingCount: number;
    isProcessing: boolean;
  } {
    return {
      queueLength: this.taskQueue.length,
      processingCount: this.processingTasks.size,
      isProcessing: this.isProcessing,
    };
  }

  // 清理过期缓存
  async cleanupCache(): Promise<void> {
    // Redis会自动清理过期键，这里主要用于内存缓存
    if (this.cache instanceof MemoryPlanCache) {
      const now = Date.now();
      for (const [key, item] of this.cache['cache'].entries()) {
        if (now > item.expires) {
          this.cache['cache'].delete(key);
        }
      }
    }
  }
}

