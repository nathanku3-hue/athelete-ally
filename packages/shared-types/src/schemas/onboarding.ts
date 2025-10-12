import { z } from 'zod';

// Base season enum
export const SeasonSchema = z.enum(['offseason', 'preseason', 'inseason']);
export type Season = z.infer<typeof SeasonSchema>;

export const SeasonOptionSchema = z.object({
  id: SeasonSchema,
  title: z.string(),
  description: z.string(),
});
export type SeasonOption = z.infer<typeof SeasonOptionSchema>;

// 统一的OnboardingPayloadSchema - 单一数据源
export const OnboardingPayloadSchema = z.object({
  // 必需字段
  userId: z.string().uuid('Invalid user ID format'),
  
  // 步骤1: 目的和目标
  purpose: z.enum([
    'general_fitness',
    'sport_performance', 
    'body_recomposition',
    'muscle_building',
    'weight_loss',
    'rehabilitation'
  ]).optional(),
  purposeDetails: z.string().max(500).optional(),
  
  // 步骤2: 技能水平
  proficiency: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  
  // 步骤3: 赛季和目标
  season: SeasonSchema.optional(),
  competitionDate: z.string().datetime().optional(),
  
  // 步骤4: 可用性 - 统一为数字类型
  availabilityDays: z.number().int().min(1).max(7).optional(),
  weeklyGoalDays: z.number().int().min(1).max(7).optional(),
  
  // 步骤5: 设备和时间安排
  equipment: z.array(z.string()).optional(),
  fixedSchedules: z.array(z.object({
    day: z.string(),
    start: z.string(),
    end: z.string()
  })).optional(),
  
  // 步骤6: 恢复习惯
  recoveryHabits: z.array(z.string()).optional(),
  
  // 引导流程状态
  onboardingStep: z.number().int().min(1).max(6).optional(),
  isOnboardingComplete: z.boolean().optional(),
  
  // 前端特定字段
  currentStep: z.number().int().min(1).max(6).optional(),
  isCompleted: z.boolean().optional(),
  submittedAt: z.number().optional(),
});

// 导出类型
export type OnboardingPayload = z.infer<typeof OnboardingPayloadSchema>;

// 验证函数
export function validateOnboardingPayload(data: unknown): OnboardingPayload {
  return OnboardingPayloadSchema.parse(data);
}

// 安全解析函数
export function safeParseOnboardingPayload(data: unknown): {
  success: boolean;
  data?: OnboardingPayload;
  error?: z.ZodError;
} {
  const result = OnboardingPayloadSchema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  } else {
    return {
      success: false,
      error: result.error,
    };
  }
}

// 部分更新schema（用于步骤验证）
export const OnboardingStepSchema = z.object({
  userId: z.string().uuid().optional(),
  purpose: z.enum([
    'general_fitness',
    'sport_performance', 
    'body_recomposition',
    'muscle_building',
    'weight_loss',
    'rehabilitation'
  ]).optional(),
  purposeDetails: z.string().max(500).optional(),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  season: SeasonSchema.optional(),
  competitionDate: z.string().datetime().optional(),
  availabilityDays: z.number().int().min(1).max(7).optional(),
  weeklyGoalDays: z.number().int().min(1).max(7).optional(),
  equipment: z.array(z.string()).optional(),
  fixedSchedules: z.array(z.object({
    day: z.string(),
    start: z.string(),
    end: z.string()
  })).optional(),
  recoveryHabits: z.array(z.string()).optional(),
  onboardingStep: z.number().int().min(1).max(6).optional(),
  isOnboardingComplete: z.boolean().optional(),
  currentStep: z.number().int().min(1).max(6).optional(),
  isCompleted: z.boolean().optional(),
  submittedAt: z.number().optional(),
});

export type OnboardingStep = z.infer<typeof OnboardingStepSchema>;

// 步骤验证函数
export function validateOnboardingStep(step: number, data: Partial<OnboardingPayload>): boolean {
  switch (step) {
    case 1:
      return !!(data.purpose && data.purposeDetails);
    case 2:
      return !!data.proficiency;
    case 3:
      return !!(data.season && data.competitionDate);
    case 4:
      return !!(data.availabilityDays && data.weeklyGoalDays);
    case 5:
      return !!(data.equipment && data.equipment.length > 0);
    case 6:
      return !!(data.recoveryHabits && data.recoveryHabits.length > 0);
    default:
      return false;
  }
}

// 获取步骤进度
export function getStepProgress(data: Partial<OnboardingPayload>): {
  current: number;
  total: number;
  percentage: number;
} {
  let completedSteps = 0;
  
  for (let step = 1; step <= 6; step++) {
    if (validateOnboardingStep(step, data)) {
      completedSteps++;
    }
  }
  
  return {
    current: completedSteps,
    total: 6,
    percentage: Math.round((completedSteps / 6) * 100),
  };
}
