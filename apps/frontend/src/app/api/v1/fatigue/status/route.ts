import { NextRequest, NextResponse } from 'next/server';
import { handleCorsOptions, addCorsHeaders } from '@/lib/cors';
import type { 
  FatigueLevel, 
  FatigueAssessmentInput, 
  FatigueAssessmentResult,
  FatigueStatusResponse,
  FatigueFactor
} from '@athlete-ally/shared-types';
import { 
  validateFatigueAssessmentInput,
  validateFatigueAssessmentResult,
  validateFatigueStatusResponse
} from '@athlete-ally/shared-types/schemas';

export async function GET(request: NextRequest) {
  try {
    // 获取用户疲劳状态
    
    // 在真实实现中，这里会从数据库获取用户的疲劳度数据
    // 目前使用模拟数据
    const fatigueStatus: FatigueStatusResponse = {
      level: 'high' as FatigueLevel, // 'low', 'moderate', 'high'
      score: 8.5, // 0-10 scale
      factors: [
        {
          type: 'sleep_quality',
          value: 6.5,
          impact: 'moderate',
          description: 'Poor sleep quality detected'
        },
        {
          type: 'training_load',
          value: 8.2,
          impact: 'high',
          description: 'High training volume this week'
        },
        {
          type: 'stress_level',
          value: 7.8,
          impact: 'high',
          description: 'Elevated stress levels'
        },
        {
          type: 'recovery_time',
          value: 4.2,
          impact: 'high',
          description: 'Insufficient recovery between sessions'
        }
      ] as FatigueFactor[],
      recommendations: [
        'Consider reducing training intensity by 10-15%',
        'Increase sleep duration by 30-60 minutes',
        'Add 1-2 additional rest days this week',
        'Focus on active recovery activities'
      ],
      lastUpdated: new Date().toISOString(),
      nextAssessment: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    };
    
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // 返回疲劳状态数据
    
    return NextResponse.json(fatigueStatus);
    
    } catch (error) {
      // Log error for debugging (in development)
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch fatigue status:', error);
      }
    return NextResponse.json(
      { 
        error: 'Failed to fetch fatigue status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证输入数据
    const validatedInput = validateFatigueAssessmentInput(body);
    const { sleepQuality, stressLevel, muscleSoreness, energyLevel, motivation } = validatedInput;
    
    // Log for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Submitting fatigue assessment:', { sleepQuality, stressLevel, muscleSoreness, energyLevel, motivation });
    }
    
    // 在真实实现中，这里会保存用户的疲劳度评估数据
    // 并可能触发AI分析来更新疲劳度状态
    
    // 模拟计算疲劳度分数
    const fatigueScore = (
      (10 - sleepQuality) * 0.3 +
      stressLevel * 0.25 +
      muscleSoreness * 0.25 +
      (10 - energyLevel) * 0.1 +
      (10 - motivation) * 0.1
    );
    
    const level: FatigueLevel = fatigueScore >= 7 ? 'high' : fatigueScore >= 4 ? 'moderate' : 'low';
    
    const result: FatigueAssessmentResult = {
      success: true,
      fatigueScore: Math.round(fatigueScore * 10) / 10,
      level,
      message: 'Fatigue assessment submitted successfully',
      timestamp: new Date().toISOString()
    };
    
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return NextResponse.json(result);
    
  } catch (error) {
    // 疲劳评估提交失败
    return NextResponse.json(
      { 
        error: 'Failed to submit fatigue assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}
