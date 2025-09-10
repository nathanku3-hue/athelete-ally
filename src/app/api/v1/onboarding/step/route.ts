import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const stepData = await request.json();
    
    // 记录步骤完成事件
    console.log('Onboarding step completed:', {
      step: stepData.step,
      stepName: stepData.stepName,
      userId: stepData.userId,
      timestamp: stepData.timestamp,
    });

    // 这里可以发送到分析服务或数据库
    // 例如：发送到Prometheus、InfluxDB或其他分析工具
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process step event:', error);
    return NextResponse.json(
      { error: 'Failed to process step event' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

