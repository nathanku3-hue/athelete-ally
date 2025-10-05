import { NextRequest, NextResponse } from 'next/server';
import { handleCorsOptions, addCorsHeaders } from '@/lib/cors';
import { convertLbsToKg } from '@/lib/weightConverter';

export async function GET(request: NextRequest) {
  try {
    // 获取当前用户计划
    
    // 在真实实现中，这里会从请求头或cookie中获取用户ID
    // const userId = request.headers.get('x-user-id') || 'default_user';
    
    // 模拟从后端获取当前用户的训练计划
    // 在真实实现中，这里会调用后端服务来获取实际数据
    const currentPlan = {
      weekNumber: 1,
      theme: 'Foundation',
      volume: 'Mid' as const,
      fatigue: {
        status: 'high' as const,
        details: 'High Fatigue: 8.5/10'
      },
      trainingDays: [
        {
          day: 'Monday',
          title: 'Upper Body Strength',
          estimatedTime: '60 min',
          exercises: [
            { 
              id: 'ex1', 
              name: 'Bench Press', 
              sets: 4, 
              reps: 8, 
              plannedWeight: 135, // 135 lbs = 61.2 kg → 向上取整到 62.5 kg
              cue: 'Heavy & Focused' as const,
              description: 'A classic compound exercise for chest, shoulders, and triceps.',
              videoThumbnailUrl: 'https://example.com/bench-press-thumb.jpg'
            },
            { 
              id: 'ex2', 
              name: 'Pull Ups', 
              sets: 4, 
              reps: 10, 
              plannedWeight: 0, 
              cue: 'Slow & Controlled' as const,
              description: 'A bodyweight exercise targeting the back and biceps.',
              videoThumbnailUrl: 'https://example.com/pull-ups-thumb.jpg'
            },
            { 
              id: 'ex3', 
              name: 'Dumbbell Rows', 
              sets: 3, 
              reps: 12, 
              plannedWeight: 45, 
              cue: 'Slow & Controlled' as const,
              description: 'A unilateral back exercise for muscle balance.',
              videoThumbnailUrl: 'https://example.com/dumbbell-rows-thumb.jpg'
            },
          ],
        },
        {
          day: 'Wednesday',
          title: 'Lower Body Power',
          estimatedTime: '75 min',
          exercises: [
            { 
              id: 'ex4', 
              name: 'Barbell Squat', 
              sets: 5, 
              reps: 5, 
              plannedWeight: 225, // 225 lbs = 102.1 kg → 向上取整到 102.5 kg 
              cue: 'Heavy & Focused' as const 
            },
            { 
              id: 'ex5', 
              name: 'Box Jumps', 
              sets: 4, 
              reps: 6, 
              plannedWeight: 0, 
              cue: 'Fast & Explosive' as const 
            },
            { 
              id: 'ex6', 
              name: 'Leg Press', 
              sets: 3, 
              reps: 10, 
              plannedWeight: 300, 
              cue: 'Slow & Controlled' as const 
            },
          ],
        },
        {
          day: 'Friday',
          title: 'Full Body Hypertrophy',
          estimatedTime: '70 min',
          exercises: [
            { 
              id: 'ex7', 
              name: 'Deadlift', 
              sets: 3, 
              reps: 5, 
              plannedWeight: 275, 
              cue: 'Heavy & Focused' as const 
            },
            { 
              id: 'ex8', 
              name: 'Overhead Press', 
              sets: 4, 
              reps: 8, 
              plannedWeight: 95, 
              cue: 'Slow & Controlled' as const 
            },
            { 
              id: 'ex9', 
              name: 'Bicep Curls', 
              sets: 3, 
              reps: 15, 
              plannedWeight: 25, 
              cue: 'Slow & Controlled' as const 
            },
          ],
        },
        {
          day: 'Saturday',
          title: 'Active Recovery',
          estimatedTime: '30 min',
          exercises: [
            { 
              id: 'ex10', 
              name: 'Foam Rolling', 
              sets: 2, 
              reps: 0, 
              plannedWeight: 0, 
              cue: 'Slow & Controlled' as const 
            },
            { 
              id: 'ex11', 
              name: 'Stretching', 
              sets: 2, 
              reps: 0, 
              plannedWeight: 0, 
              cue: 'Slow & Controlled' as const 
            },
          ],
        },
      ],
    };
    
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return NextResponse.json(currentPlan);
    
  } catch (error) {
    // Log error for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to fetch current plan:', error);
    }
    return NextResponse.json(
      { 
        error: 'Failed to fetch current plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}
