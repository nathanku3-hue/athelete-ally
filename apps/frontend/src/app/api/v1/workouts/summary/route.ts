import { NextRequest, NextResponse } from 'next/server';
import { handleCorsOptions, addCorsHeaders } from '@/lib/cors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const timeRange = searchParams.get('timeRange') || '30d';

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 调用workouts服务的摘要API
    const workoutsServiceUrl = process.env.WORKOUTS_SERVICE_URL || 'http://localhost:4104';
    const response = await fetch(`${workoutsServiceUrl}/api/v1/summary/${userId}?timeRange=${timeRange}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Workouts service responded with status: ${response.status}`);
    }

    const summaryData = await response.json();
    
    return NextResponse.json(summaryData);
  } catch (error) {
    console.error('Failed to fetch summary data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary data' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

