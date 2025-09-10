import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching RPE data...');
    
    // 在真实实现中，这里会从数据库获取用户的RPE数据
    // 目前使用模拟数据
    const rpeData = {
      currentRpe: 7.5,
      averageRpe: 6.8,
      trend: 'increasing' as const, // 'increasing', 'stable', 'decreasing'
      lastWorkout: {
        date: new Date().toISOString(),
        exercises: [
          {
            exerciseId: 'ex1',
            exerciseName: 'Bench Press',
            sets: [
              { setNumber: 1, reps: 8, weight: 135, rpe: 6.5 },
              { setNumber: 2, reps: 8, weight: 135, rpe: 7.0 },
              { setNumber: 3, reps: 8, weight: 135, rpe: 7.5 },
              { setNumber: 4, reps: 8, weight: 135, rpe: 8.0 }
            ]
          }
        ]
      },
      recommendations: [
        'Consider reducing weight by 5-10 lbs for next session',
        'Focus on maintaining consistent RPE across all sets',
        'Ensure adequate rest between sets (3-5 minutes)'
      ],
      lastUpdated: new Date().toISOString()
    };
    
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('Returning RPE data:', { 
      currentRpe: rpeData.currentRpe, 
      averageRpe: rpeData.averageRpe,
      trend: rpeData.trend 
    });
    
    return NextResponse.json(rpeData);
    
  } catch (error) {
    console.error('Failed to fetch RPE data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch RPE data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { exerciseId, setNumber, reps, weight, rpe } = body;
    
    console.log('Submitting RPE data:', { exerciseId, setNumber, reps, weight, rpe });
    
    // 在真实实现中，这里会保存用户的RPE数据
    // 并可能触发AI分析来调整训练计划
    
    const result = {
      success: true,
      message: 'RPE data submitted successfully',
      timestamp: new Date().toISOString(),
      data: {
        exerciseId,
        setNumber,
        reps,
        weight,
        rpe,
        id: `rpe_${Date.now()}`
      }
    };
    
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 150));
    
    console.log('RPE data submission result:', result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Failed to submit RPE data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit RPE data',
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
