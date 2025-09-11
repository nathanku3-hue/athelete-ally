import { NextRequest, NextResponse } from 'next/server';
import { handleCorsOptions, addCorsHeaders } from '@/lib/cors';
import { OnboardingPayloadSchema, safeParseOnboardingPayload } from '@athlete-ally/shared-types';

export async function POST(request: NextRequest) {
  try {
    const onboardingData = await request.json();
    
    // 使用统一的schema验证
    const validationResult = safeParseOnboardingPayload(onboardingData);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error?.errors,
          receivedData: onboardingData 
        },
        { status: 400 }
      );
    }
    
    const validatedData = validationResult.data!;
    
    // 验证必需字段
    const requiredFields = ['userId', 'proficiency', 'availabilityDays'];
    const missingFields = requiredFields.filter(field => !validatedData[field as keyof typeof validatedData]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          missingFields,
          receivedData: validatedData 
        },
        { status: 400 }
      );
    }
    
    // 验证availabilityDays（现在应该是数字）
    if (typeof validatedData.availabilityDays !== 'number' || validatedData.availabilityDays < 1 || validatedData.availabilityDays > 7) {
      return NextResponse.json(
        { error: 'availabilityDays must be a number between 1 and 7' },
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
        userId: validatedData.userId,
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
