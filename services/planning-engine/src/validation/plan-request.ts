/**
 * @fileoverview 计划请求验证和映射模块
 * 提供从事件到计划生成请求的安全转换
 */

import { z } from 'zod';
import { OnboardingCompletedEvent, PlanGenerationRequestedEvent } from '@athlete-ally/contracts';
import { TrainingPlanRequest } from '../llm.js';

// 域枚举定义（与contracts保持一致）
const PROFICIENCY_ENUM = ['beginner', 'intermediate', 'advanced'] as const;
const SEASON_ENUM = ['offseason', 'preseason', 'inseason'] as const;
const PURPOSE_ENUM = ['general_fitness', 'sport_performance', 'muscle_building', 'weight_loss', 'rehabilitation'] as const;

// Zod Schema - 镜像TrainingPlanRequest并编码域默认值
export const PlanRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  proficiency: z.enum(PROFICIENCY_ENUM).default('intermediate'),
  season: z.enum(SEASON_ENUM).default('offseason'),
  availabilityDays: z.number().int().min(1).max(7).default(3),
  weeklyGoalDays: z.number().int().min(1).max(7).default(3),
  equipment: z.array(z.string()).default(['bodyweight']),
  purpose: z.enum(PURPOSE_ENUM).optional(),
  competitionDate: z.string().optional(),
});

// 内部类型，用于类型安全
type PlanRequestInput = z.input<typeof PlanRequestSchema>;
type PlanRequestOutput = z.output<typeof PlanRequestSchema>;

/**
 * 通用的事件到计划请求转换器
 * 应用域默认值并验证输入
 */
function createPlanRequestFromEvent(event: OnboardingCompletedEvent | PlanGenerationRequestedEvent): TrainingPlanRequest {
  const validated = PlanRequestSchema.parse({
    userId: event.userId,
    proficiency: event.proficiency,
    season: event.season,
    availabilityDays: event.availabilityDays,
    weeklyGoalDays: event.weeklyGoalDays,
    equipment: event.equipment,
    purpose: event.purpose,
    competitionDate: event.competitionDate,
  });

  return validated as TrainingPlanRequest;
}

/**
 * 从OnboardingCompletedEvent转换为TrainingPlanRequest
 * 应用域默认值并验证输入
 */
export function toPlanGenerationRequest(event: OnboardingCompletedEvent): TrainingPlanRequest {
  return createPlanRequestFromEvent(event);
}

/**
 * 从PlanGenerationRequestedEvent转换为TrainingPlanRequest
 * 这个事件类型已经包含所有必需字段
 */
export function toPlanGenerationRequestFromRequested(event: PlanGenerationRequestedEvent): TrainingPlanRequest {
  return createPlanRequestFromEvent(event);
}

/**
 * 带错误处理的验证和转换
 * 提供更详细的错误信息用于调试
 */
export function toPlanGenerationRequestWithErrorHandling(event: OnboardingCompletedEvent | PlanGenerationRequestedEvent): TrainingPlanRequest {
  try {
    return createPlanRequestFromEvent(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid plan request: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}
