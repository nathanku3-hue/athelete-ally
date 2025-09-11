import { NextRequest, NextResponse } from 'next/server';
import { handleCorsOptions, addCorsHeaders } from '@/lib/cors';

export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json();
    
    // 记录引导流程错误事件
    console.error('Onboarding error occurred:', {
      step: errorData.step,
      stepName: errorData.stepName,
      userId: errorData.userId,
      error: errorData.error,
      timestamp: errorData.timestamp,
      userAgent: errorData.userAgent,
      url: errorData.url,
    });

    // 这里可以发送到错误追踪服务
    // 例如：发送到Sentry、DataDog或其他错误监控工具
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process error event:', error);
    return NextResponse.json(
      { error: 'Failed to process error event' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return handleCorsOptions();
}

