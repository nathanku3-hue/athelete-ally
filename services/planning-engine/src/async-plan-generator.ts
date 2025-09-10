// 异步计划生成服务
import { eventBus } from '@athlete-ally/event-bus';
import { PlanGenerationRequestedEvent, PlanGeneratedEvent, PlanGenerationFailedEvent, EVENT_TOPICS } from '@athlete-ally/contracts';
import { randomUUID } from 'crypto';
import { prisma } from './db.js';
import { generateTrainingPlan } from './llm.js';
import { businessMetrics, tracePlanGeneration, traceLLMCall, traceDatabaseOperation } from './telemetry.js';

export class AsyncPlanGenerator {
  private isRunning = false;

  async start() {
    if (this.isRunning) {
      console.log('AsyncPlanGenerator is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting AsyncPlanGenerator...');

    // 连接到事件总线
    await eventBus.connect(process.env.NATS_URL || 'nats://localhost:4222');

    // 订阅计划生成请求事件
    await eventBus.subscribeToPlanGenerationRequested(this.handlePlanGenerationRequest.bind(this));

    console.log('AsyncPlanGenerator started successfully');
  }

  async stop() {
    this.isRunning = false;
    await eventBus.close();
    console.log('AsyncPlanGenerator stopped');
  }

  private async handlePlanGenerationRequest(event: PlanGenerationRequestedEvent) {
    const { jobId, userId } = event;
    console.log(`Processing plan generation request: ${jobId} for user: ${userId}`);

    const planSpan = tracePlanGeneration(userId, event);
    
    try {
      // 记录业务指标
      businessMetrics.planGenerationRequests.add(1, {
        'user.id': userId,
      });

      // 追踪LLM调用
      const llmSpan = traceLLMCall('gpt-4', 1000, userId);
      
      // 生成训练计划
      const llmStartTime = Date.now();
      const planData = await generateTrainingPlan({
        userId: userId,
        proficiency: event.proficiency,
        season: event.season,
        availabilityDays: event.availabilityDays,
        weeklyGoalDays: event.weeklyGoalDays,
        equipment: event.equipment,
        purpose: event.purpose,
        competitionDate: event.competitionDate,
        fixedSchedules: event.fixedSchedules,
        recoveryHabits: event.recoveryHabits,
      });
      
      const llmDuration = (Date.now() - llmStartTime) / 1000;
      businessMetrics.llmResponseTime.record(llmDuration, {
        'user.id': userId,
        'llm.model': 'gpt-4',
      });
      businessMetrics.llmRequests.add(1, {
        'user.id': userId,
        'llm.model': 'gpt-4',
      });
      
      llmSpan.setStatus({ code: 1, message: 'LLM call successful' });
      llmSpan.end();

      // 追踪数据库操作
      const dbSpan = traceDatabaseOperation('create', 'plans', userId);
      
      // 保存计划到数据库
      const dbStartTime = Date.now();
      const plan = await prisma.plan.create({
        data: {
          userId: userId,
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
      
      const dbDuration = (Date.now() - dbStartTime) / 1000;
      businessMetrics.databaseQueryDuration.record(dbDuration, {
        'db.operation': 'create',
        'db.table': 'plans',
      });
      businessMetrics.databaseQueries.add(1, {
        'db.operation': 'create',
        'db.table': 'plans',
      });
      
      dbSpan.setStatus({ code: 1, message: 'Database operation successful' });
      dbSpan.end();

      const totalDuration = (Date.now() - Date.now()) / 1000;
      businessMetrics.planGenerationDuration.record(totalDuration, {
        'user.id': userId,
        'plan.status': 'success',
      });
      businessMetrics.planGenerationSuccess.add(1, {
        'user.id': userId,
      });

      planSpan.end();

      // 发布计划生成成功事件
      const successEvent: PlanGeneratedEvent = {
        eventId: randomUUID(),
        userId: userId,
        planId: plan.id,
        timestamp: Date.now(),
        planName: plan.name || 'Unnamed Plan',
        status: 'completed',
        version: plan.version,
      };

      await eventBus.publishPlanGenerated(successEvent);
      console.log(`Plan generation completed successfully: ${plan.id}`);

    } catch (error) {
      console.error(`Plan generation failed for job ${jobId}:`, error);
      
      businessMetrics.planGenerationFailures.add(1, {
        'user.id': userId,
        'error.type': 'internal_error',
      });
      
      planSpan.setStatus({ code: 2, message: 'Plan generation failed' });
      planSpan.end();
      
      // 发布计划生成失败事件
      const failureEvent: PlanGenerationFailedEvent = {
        eventId: randomUUID(),
        userId: userId,
        timestamp: Date.now(),
        jobId: jobId,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
      };

      await eventBus.publishPlanGenerationFailed(failureEvent);
    }
  }
}

// 创建单例实例
export const asyncPlanGenerator = new AsyncPlanGenerator();

