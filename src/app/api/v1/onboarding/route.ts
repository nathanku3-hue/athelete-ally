import { NextRequest, NextResponse } from 'next/server';
import { handleCorsOptions, addCorsHeaders } from '@/lib/cors';

export async function POST(request: NextRequest) {
  try {
    const onboardingData = await request.json();
    
    // 处理引导数据
    
    // 验证必需字段
    const requiredFields = ['userId', 'proficiency', 'availabilityDays'];
    const missingFields = requiredFields.filter(field => !onboardingData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          missingFields,
          receivedData: onboardingData 
        },
        { status: 400 }
      );
    }
    
    // 验证数据格式
    if (!Array.isArray(onboardingData.availabilityDays)) {
      return NextResponse.json(
        { error: 'availabilityDays must be an array' },
        { status: 400 }
      );
    }
    
    if (onboardingData.availabilityDays.length === 0) {
      return NextResponse.json(
        { error: 'At least one availability day is required' },
        { status: 400 }
      );
    }
    
    // 使用安全的ID生成器
    const jobId = `job_${crypto.randomUUID()}`;
    const planId = `plan_${crypto.randomUUID()}`;
    
    // 這裡應該調用實際的計劃生成服務
    // 目前返回模擬響應，包含 jobId 用於狀態輪詢
    const response = {
      success: true,
      planId: planId,
      jobId: jobId, // 添加 jobId 用於狀態輪詢
      message: 'Training plan generation started successfully',
      data: {
        userId: onboardingData.userId,
        planId: planId,
        jobId: jobId,
        createdAt: new Date().toISOString(),
        status: 'generating',
        estimatedCompletionTime: '2-3 minutes'
      }
    };
    
    // 返回成功响应
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Failed to process onboarding data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process onboarding data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return handleCorsOptions();
}
