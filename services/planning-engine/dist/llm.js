import OpenAI from 'openai';
import { config } from './config.js';
const openai = config.OPENAI_API_KEY ? new OpenAI({ apiKey: config.OPENAI_API_KEY }) : null;
export async function generateTrainingPlan(request) {
    if (!openai) {
        // Fallback to mock data when no API key
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

Return the plan as structured JSON with this format:
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
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });
        const content = completion.choices[0]?.message?.content;
        if (!content)
            throw new Error('No content generated');
        return JSON.parse(content);
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