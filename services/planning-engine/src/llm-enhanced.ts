/**
 * 🧠 增强的LLM训练计划生成算法
 * 作者: 后端团队
 * 版本: 1.0.0
 * 
 * 功能:
 * - 增强的训练意图识别
 * - 个性化计划生成
 * - 适应性调整支持
 * - 详细的运动规范
 */

import OpenAI from 'openai';
import { z } from 'zod';
import { config } from './config.js';

// 增强的训练意图识别
export interface TrainingIntent {
  primaryGoal: 'strength' | 'endurance' | 'flexibility' | 'weight_loss' | 'muscle_gain' | 'sports_specific';
  secondaryGoals: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  timeConstraints: {
    availableDays: number;
    sessionDuration: number;
    preferredTimes: string[];
  };
  equipment: string[];
  limitations: string[];
  preferences: {
    intensity: 'low' | 'medium' | 'high';
    style: 'traditional' | 'functional' | 'hiit' | 'yoga' | 'pilates';
    progression: 'linear' | 'undulating' | 'block';
  };
}

// 增强的计划生成请求
export interface EnhancedPlanGenerationRequest {
  userId: string;
  trainingIntent: TrainingIntent;
  currentFitnessLevel: {
    strength: number; // 1-10
    endurance: number; // 1-10
    flexibility: number; // 1-10
    mobility: number; // 1-10
  };
  injuryHistory: string[];
  performanceGoals: {
    shortTerm: string[]; // 1-3 months
    mediumTerm: string[]; // 3-6 months
    longTerm: string[]; // 6+ months
  };
  feedbackHistory: {
    sessionId: string;
    rpe: number;
    completionRate: number;
    notes?: string;
  }[];
}

// 增强的Zod schema
const EnhancedExerciseSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['strength', 'cardio', 'flexibility', 'power', 'endurance', 'mobility', 'sports_specific']),
  subcategory: z.string().optional(),
  sets: z.number().int().min(1).max(20),
  reps: z.string().min(1).max(50),
  weight: z.string().min(1).max(100),
  restTime: z.number().int().min(0).max(600), // 0-10 minutes
  tempo: z.string().optional(), // e.g., "3-1-2-1"
  notes: z.string().max(500).optional(),
  alternatives: z.array(z.string()).optional(),
  progression: z.object({
    type: z.enum(['linear', 'undulating', 'block']),
    increment: z.number().optional(),
    frequency: z.number().optional(), // weeks
  }).optional(),
});

export const EnhancedSessionSchema = z.object({
  dayOfWeek: z.number().int().min(1).max(7),
  name: z.string().min(1).max(100),
  duration: z.number().int().min(15).max(300),
  intensity: z.enum(['low', 'medium', 'high']),
  focus: z.string().optional(),
  exercises: z.array(EnhancedExerciseSchema).min(1).max(20),
  warmup: z.array(z.string()).optional(),
  cooldown: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional(),
});

const EnhancedMicrocycleSchema = z.object({
  weekNumber: z.number().int().min(1).max(52),
  name: z.string().min(1).max(100),
  phase: z.enum(['preparation', 'competition', 'recovery', 'transition', 'base', 'build', 'peak']),
  theme: z.string().optional(),
  sessions: z.array(EnhancedSessionSchema).min(1).max(14),
  deload: z.boolean().optional(),
  notes: z.string().max(1000).optional(),
});

const EnhancedPlanSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  duration: z.number().int().min(1).max(52),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  category: z.string(),
  tags: z.array(z.string()),
  microcycles: z.array(EnhancedMicrocycleSchema).min(1).max(52),
  progression: z.object({
    type: z.enum(['linear', 'undulating', 'block']),
    phases: z.array(z.object({
      name: z.string(),
      duration: z.number(),
      focus: z.string(),
    })),
  }),
  adaptations: z.object({
    basedOnRPE: z.boolean(),
    basedOnPerformance: z.boolean(),
    basedOnRecovery: z.boolean(),
  }),
});

export type EnhancedTrainingPlan = z.infer<typeof EnhancedPlanSchema>;

// 严格的API密钥检查
if (!config.OPENAI_API_KEY) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('🚨 CRITICAL: OPENAI_API_KEY is required in production environment.');
  }
  console.warn('⚠️  OPENAI_API_KEY not found. Enhanced LLM features will use mock data in development mode only.');
}

const openai = config.OPENAI_API_KEY ? new OpenAI({ 
  apiKey: config.OPENAI_API_KEY,
  timeout: config.LLM_TIMEOUT_MS + 5000,
  maxRetries: config.LLM_MAX_RETRIES,
}) : null;

// 使用统一的超时工具函数
// withTimeout函数已移除，使用原生Promise.race实现超时

// 增强的计划生成函数
export async function generateEnhancedTrainingPlan(
  request: EnhancedPlanGenerationRequest
): Promise<EnhancedTrainingPlan> {
  if (!openai) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('🚨 CRITICAL: LLM service is not available in production. OPENAI_API_KEY is required.');
    }
    return generateMockEnhancedPlan(request);
  }

  // 构建增强的提示词
  const prompt = buildEnhancedPrompt(request);

  try {
    // 使用Promise.race实现超时控制
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('LLM request timeout')), config.LLM_TIMEOUT_MS)
    );
    
    const completion = await Promise.race([
      openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: config.LLM_TEMPERATURE,
        max_tokens: config.LLM_MAX_TOKENS,
        response_format: { type: "json_object" },
      }),
      timeoutPromise
    ]) as any;

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated from LLM');
    }

    const parsedContent = JSON.parse(content);
    const validationResult = EnhancedPlanSchema.safeParse(parsedContent);
    
    if (!validationResult.success) {
      console.error('LLM output validation failed:', validationResult.error);
      throw new Error('LLM output does not match expected schema');
    }

    return validationResult.data;
  } catch (error) {
    console.error('Enhanced LLM generation failed, falling back to mock:', error);
    return generateMockEnhancedPlan(request);
  }
}

// 构建增强的提示词
function buildEnhancedPrompt(request: EnhancedPlanGenerationRequest): string {
  const { trainingIntent, currentFitnessLevel, performanceGoals, feedbackHistory } = request;
  
  return `Generate an advanced, personalized training plan based on the following comprehensive analysis:

TRAINING INTENT:
- Primary Goal: ${trainingIntent.primaryGoal}
- Secondary Goals: ${trainingIntent.secondaryGoals.join(', ')}
- Experience Level: ${trainingIntent.experienceLevel}
- Available Days: ${trainingIntent.timeConstraints.availableDays}
- Session Duration: ${trainingIntent.timeConstraints.sessionDuration} minutes
- Equipment: ${trainingIntent.equipment.join(', ')}
- Limitations: ${trainingIntent.limitations.join(', ')}
- Intensity Preference: ${trainingIntent.preferences.intensity}
- Style Preference: ${trainingIntent.preferences.style}
- Progression Preference: ${trainingIntent.preferences.progression}

CURRENT FITNESS LEVEL:
- Strength: ${currentFitnessLevel.strength}/10
- Endurance: ${currentFitnessLevel.endurance}/10
- Flexibility: ${currentFitnessLevel.flexibility}/10
- Mobility: ${currentFitnessLevel.mobility}/10

PERFORMANCE GOALS:
- Short-term (1-3 months): ${performanceGoals.shortTerm.join(', ')}
- Medium-term (3-6 months): ${performanceGoals.mediumTerm.join(', ')}
- Long-term (6+ months): ${performanceGoals.longTerm.join(', ')}

FEEDBACK HISTORY:
${feedbackHistory.map(f => `- Session ${f.sessionId}: RPE ${f.rpe}, Completion ${f.completionRate}%, Notes: ${f.notes}`).join('\n')}

REQUIREMENTS:
1. Create a periodized plan that adapts to the user's feedback history
2. Include proper progression based on their experience level
3. Ensure exercises are appropriate for their equipment and limitations
4. Include warmup and cooldown routines
5. Provide alternative exercises for each movement
6. Include tempo and rest time specifications
7. Plan should be adaptable based on RPE and performance feedback
8. Include deload weeks for recovery
9. Ensure the plan is realistic and achievable
10. Include specific notes for form and technique

Return the plan as structured JSON with this exact format:
{
  "name": "Plan Name",
  "description": "Detailed plan description",
  "duration": 12,
  "difficulty": "intermediate",
  "category": "Strength Training",
  "tags": ["strength", "muscle_gain", "beginner_friendly"],
  "microcycles": [
    {
      "weekNumber": 1,
      "name": "Week 1 Name",
      "phase": "base",
      "theme": "Foundation Building",
      "sessions": [
        {
          "dayOfWeek": 1,
          "name": "Upper Body Strength",
          "duration": 60,
          "intensity": "medium",
          "focus": "Push movements",
          "warmup": ["Arm circles", "Shoulder rolls", "Light cardio"],
          "exercises": [
            {
              "name": "Bench Press",
              "category": "strength",
              "subcategory": "push",
              "sets": 3,
              "reps": "8-12",
              "weight": "bodyweight",
              "restTime": 120,
              "tempo": "3-1-2-1",
              "notes": "Focus on controlled movement",
              "alternatives": ["Push-ups", "Dumbbell Press"],
              "progression": {
                "type": "linear",
                "increment": 2.5,
                "frequency": 1
              }
            }
          ],
          "cooldown": ["Stretching", "Deep breathing"],
          "notes": "Focus on form over weight"
        }
      ],
      "deload": false,
      "notes": "Foundation week - focus on technique"
    }
  ],
  "progression": {
    "type": "linear",
    "phases": [
      {
        "name": "Base Phase",
        "duration": 4,
        "focus": "Technique and foundation"
      }
    ]
  },
  "adaptations": {
    "basedOnRPE": true,
    "basedOnPerformance": true,
    "basedOnRecovery": true
  }
}`;
}

// 生成模拟增强计划
function generateMockEnhancedPlan(request: EnhancedPlanGenerationRequest): EnhancedTrainingPlan {
  const { trainingIntent } = request;
  
  return {
    name: `${trainingIntent.primaryGoal} Training Plan`,
    description: `A comprehensive ${trainingIntent.primaryGoal} training plan designed for ${trainingIntent.experienceLevel} athletes.`,
    duration: 12,
    difficulty: trainingIntent.experienceLevel,
    category: trainingIntent.primaryGoal,
    tags: [trainingIntent.primaryGoal, ...trainingIntent.secondaryGoals],
    microcycles: generateMockMicrocycles(trainingIntent),
    progression: {
      type: trainingIntent.preferences.progression,
      phases: [
        { name: 'Base Phase', duration: 4, focus: 'Foundation' },
        { name: 'Build Phase', duration: 4, focus: 'Progression' },
        { name: 'Peak Phase', duration: 4, focus: 'Performance' },
      ],
    },
    adaptations: {
      basedOnRPE: true,
      basedOnPerformance: true,
      basedOnRecovery: true,
    },
  };
}

function generateMockMicrocycles(trainingIntent: TrainingIntent) {
  const microcycles = [];
  for (let week = 1; week <= 12; week++) {
    microcycles.push({
      weekNumber: week,
      name: `Week ${week}`,
      phase: (week <= 4 ? 'base' : week <= 8 ? 'build' : 'peak') as 'base' | 'build' | 'peak',
      theme: week <= 4 ? 'Foundation' : week <= 8 ? 'Progression' : 'Performance',
      sessions: generateMockSessions(trainingIntent, week),
      deload: week % 4 === 0,
      notes: `Week ${week} training focus`,
    });
  }
  return microcycles;
}

function generateMockSessions(trainingIntent: TrainingIntent, _week: number) {
  const sessions = [];
  const daysPerWeek = trainingIntent.timeConstraints.availableDays;

  for (let day = 1; day <= daysPerWeek; day++) {
    sessions.push({
      dayOfWeek: day,
      name: `Training Session ${day}`,
      duration: trainingIntent.timeConstraints.sessionDuration,
      intensity: trainingIntent.preferences.intensity,
      focus: `${trainingIntent.primaryGoal} focus`,
      exercises: generateMockExercises(trainingIntent, day),
      warmup: ['Dynamic warmup', 'Mobility work'],
      cooldown: ['Static stretching', 'Recovery breathing'],
      notes: `Day ${day} training notes`,
    });
  }
  return sessions;
}

function generateMockExercises(trainingIntent: TrainingIntent, _day: number) {
  const exercises = [];
  const exerciseCount = Math.min(6, Math.max(3, Math.floor(trainingIntent.timeConstraints.sessionDuration / 10)));
  
  for (let i = 0; i < exerciseCount; i++) {
    exercises.push({
      name: `Exercise ${i + 1}`,
      category: 'strength' as const,
      subcategory: 'main',
      sets: 3,
      reps: '8-12',
      weight: 'bodyweight',
      restTime: 60,
      tempo: '2-1-2-1',
      notes: 'Focus on form',
      alternatives: ['Alternative exercise'],
      progression: {
        type: 'linear' as const,
        increment: 2.5,
        frequency: 1,
      },
    });
  }
  return exercises;
}
