import OpenAI from 'openai';
import { z } from 'zod';
import { config } from './config.js';
// 严格的API密钥检查 - 生产环境必须失败
if (!config.OPENAI_API_KEY) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('🚨 CRITICAL: OPENAI_API_KEY is required in production environment. LLM service cannot operate without valid API key.');
    }
    console.warn('⚠️  OPENAI_API_KEY not found. LLM features will use mock data in development mode only.');
}
const openai = config.OPENAI_API_KEY ? new OpenAI({
    apiKey: config.OPENAI_API_KEY,
    timeout: config.LLM_TIMEOUT_MS + 5000, // 比内部超时多5秒
    maxRetries: config.LLM_MAX_RETRIES,
}) : null;
// 严格的Zod schema用于验证LLM输出
const ExerciseSchema = z.object({
    name: z.string().min(1).max(100),
    category: z.enum(['strength', 'cardio', 'flexibility', 'power', 'endurance', 'mobility']),
    sets: z.number().int().min(1).max(20),
    reps: z.string().min(1).max(50),
    weight: z.string().min(1).max(100),
    notes: z.string().max(500).optional(),
});
const SessionSchema = z.object({
    dayOfWeek: z.number().int().min(1).max(7),
    name: z.string().min(1).max(100),
    duration: z.number().int().min(15).max(300), // 15分钟到5小时
    exercises: z.array(ExerciseSchema).min(1).max(20),
});
const MicrocycleSchema = z.object({
    weekNumber: z.number().int().min(1).max(52),
    name: z.string().min(1).max(100),
    phase: z.enum(['preparation', 'competition', 'recovery', 'transition']),
    sessions: z.array(SessionSchema).min(1).max(14), // 最多每天2次训练
});
const PlanSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().min(1).max(1000),
    duration: z.number().int().min(1).max(52), // 1周到1年
    microcycles: z.array(MicrocycleSchema).min(1).max(52),
});
// 安全的超时包装器
async function withTimeout(promise, timeoutMs) {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]);
}
export async function generateTrainingPlan(request) {
    if (!openai) {
        // 生产环境必须失败，不允许回退到mock数据
        if (process.env.NODE_ENV === 'production') {
            throw new Error('🚨 CRITICAL: LLM service is not available in production. OPENAI_API_KEY is required.');
        }
        // 开发环境允许使用mock数据
        console.warn('⚠️  Using mock data in development mode. Set OPENAI_API_KEY for real LLM integration.');
        return generateMockPlan(request);
    }
    const prompt = `Generate a ${request.proficiency} level training plan for an athlete in ${request.season} season.

Requirements:
- Available ${request.availabilityDays} days per week
- User's weekly goal: ${request.weeklyGoalDays || request.availabilityDays} days per week
- Equipment: ${request.equipment.join(', ')}
- Season: ${request.season}
- Proficiency: ${request.proficiency}

Please generate a 4-week periodized plan with specific exercises, sets, reps, and progression.
The plan should respect the user's weekly goal days while working within their availability.

Return the plan as structured JSON with this exact format:
{
  "name": "Plan Name",
  "description": "Plan description",
  "duration": 4,
  "microcycles": [
    {
      "weekNumber": 1,
      "name": "Week 1 Name",
      "phase": "preparation",
      "sessions": [
        {
          "dayOfWeek": 1,
          "name": "Session Name",
          "duration": 60,
          "exercises": [
            {
              "name": "Exercise Name",
              "category": "strength",
              "sets": 3,
              "reps": "8-12",
              "weight": "bodyweight",
              "notes": "Form cues"
            }
          ]
        }
      ]
    }
  ]
}`;
    try {
        const completion = await withTimeout(openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            temperature: config.LLM_TEMPERATURE,
            max_tokens: config.LLM_MAX_TOKENS,
            response_format: { type: "json_object" }, // 强制JSON模式
        }), config.LLM_TIMEOUT_MS);
        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No content generated from LLM');
        }
        // 安全解析JSON
        let parsedContent;
        try {
            parsedContent = JSON.parse(content);
        }
        catch (parseError) {
            console.error('Failed to parse LLM JSON output:', parseError);
            throw new Error('Invalid JSON received from LLM');
        }
        // 使用Zod schema严格验证
        const validationResult = PlanSchema.safeParse(parsedContent);
        if (!validationResult.success) {
            console.error('LLM output validation failed:', validationResult.error);
            throw new Error('LLM output does not match expected schema');
        }
        return validationResult.data;
    }
    catch (error) {
        console.error('LLM generation failed, falling back to mock:', error);
        return generateMockPlan(request);
    }
}
function generateMockPlan(request) {
    const weeklyGoalDays = request.weeklyGoalDays || request.availabilityDays || 3;
    return {
        name: `${request.proficiency} ${request.season} Training Plan (${weeklyGoalDays} days/week)`,
        description: `A ${request.proficiency} level plan for ${request.season} season, targeting ${weeklyGoalDays} training days per week`,
        duration: 4,
        microcycles: [
            {
                weekNumber: 1,
                name: "Foundation Week",
                phase: "preparation",
                sessions: [
                    {
                        dayOfWeek: 1,
                        name: "Upper Body Strength",
                        duration: 60,
                        exercises: [
                            {
                                name: "Push-ups",
                                category: "strength",
                                sets: 3,
                                reps: "8-12",
                                weight: "bodyweight",
                                notes: "Keep core tight"
                            },
                            {
                                name: "Pull-ups",
                                category: "strength",
                                sets: 3,
                                reps: "5-8",
                                weight: "bodyweight",
                                notes: "Full range of motion"
                            }
                        ]
                    }
                ]
            }
        ]
    };
}
//# sourceMappingURL=llm.js.map