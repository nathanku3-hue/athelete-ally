/**
 * @fileoverview LLM集成模块
 * 提供与大型语言模型的集成功能
 * 
 * @note 这是一个占位符模块，实际LLM集成需要根据具体需求实现
 */

export interface TrainingPlanRequest {
  userId: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced';
  season: 'offseason' | 'preseason' | 'inseason';
  availabilityDays: number;
  weeklyGoalDays: number;
  equipment: string[];
  purpose?: 'general_fitness' | 'sport_performance' | 'muscle_building' | 'weight_loss' | 'rehabilitation';
  competitionDate?: string;
}

// 注意：PlanGenerationRequest别名已移除，请直接使用TrainingPlanRequest

export interface TrainingPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  duration: number;
  microcycles: unknown[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 生成训练计划
 * @param request 训练计划请求参数
 * @returns 生成的训练计划
 * 
 * @todo 实现真实的LLM集成
 */
export async function generateTrainingPlan(_request: TrainingPlanRequest): Promise<TrainingPlan> {
  // TODO: 实现真实的LLM集成
  throw new Error('LLM integration not implemented yet');
}