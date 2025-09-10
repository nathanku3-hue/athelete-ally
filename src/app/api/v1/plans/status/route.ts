import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      );
    }
    
    // 检查计划状态
    
    // 模擬計劃生成狀態檢查
    // 在真實實現中，這裡會調用後端服務來檢查實際狀態
    const mockStatuses = [
      {
        status: 'pending',
        progress: 0,
        estimatedTime: 30,
        message: 'Initializing your personalized training plan...'
      },
      {
        status: 'processing',
        progress: 25,
        estimatedTime: 25,
        message: 'Analyzing your profile and preferences...'
      },
      {
        status: 'processing',
        progress: 50,
        estimatedTime: 20,
        message: 'Generating exercises tailored to your goals...'
      },
      {
        status: 'processing',
        progress: 75,
        estimatedTime: 10,
        message: 'Creating your personalized schedule...'
      },
      {
        status: 'completed',
        progress: 100,
        estimatedTime: 0,
        message: 'Your training plan is ready!',
        planId: `plan_${jobId}_${Date.now()}`
      }
    ];
    
    // 使用更簡單的時間戳解析
    const now = Date.now();
    let jobTimestamp;
    
    // 嘗試從 jobId 中提取時間戳
    const timestampMatch = jobId.match(/(\d{13})/); // 匹配 13 位時間戳
    if (timestampMatch) {
      jobTimestamp = parseInt(timestampMatch[1], 10);
    } else {
      // 如果無法解析，使用當前時間減去一個隨機時間
      jobTimestamp = now - Math.random() * 3000; // 0-3秒前
    }
    
    const elapsed = now - jobTimestamp;
    
    // 模擬 3-5 秒的生成時間（更快完成）
    const totalDuration = 3000 + (Math.abs(jobId.charCodeAt(0)) % 2000);
    
    let status;
    if (elapsed < 500) {
      status = mockStatuses[0]; // pending
    } else if (elapsed < totalDuration * 0.25) {
      status = mockStatuses[1]; // processing 25%
    } else if (elapsed < totalDuration * 0.5) {
      status = mockStatuses[2]; // processing 50%
    } else if (elapsed < totalDuration * 0.75) {
      status = mockStatuses[3]; // processing 75%
    } else {
      status = mockStatuses[4]; // completed
    }
    
    // 返回计划状态
    
    return NextResponse.json(status);
    
  } catch (error) {
    console.error('Failed to check plan status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check plan status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}