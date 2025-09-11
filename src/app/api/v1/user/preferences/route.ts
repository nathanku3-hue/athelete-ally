import { NextRequest, NextResponse } from 'next/server';
import { handleCorsOptions, addCorsHeaders } from '@/lib/cors';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { unit } = body;
    
    if (!unit || !['lbs', 'kg'].includes(unit)) {
      return NextResponse.json(
        { error: 'Invalid unit. Must be "lbs" or "kg"' },
        { status: 400 }
      );
    }
    
    console.log('Updating user preference for unit:', unit);
    
    // 在真实实现中，这里会更新数据库中的用户偏好
    // 例如：await updateUserPreference(userId, { unit });
    
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('User preference updated successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'User preference updated successfully',
      unit 
    });
    
  } catch (error) {
    console.error('Failed to update user preference:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update user preference',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching user preferences...');
    
    // 在真实实现中，这里会从数据库获取用户偏好
    // 例如：const preferences = await getUserPreferences(userId);
    
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const preferences = {
      unit: 'lbs', // 默认单位
      theme: 'dark',
      notifications: true,
    };
    
    console.log('Returning user preferences:', preferences);
    
    return NextResponse.json(preferences);
    
  } catch (error) {
    console.error('Failed to fetch user preferences:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user preferences',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return handleCorsOptions();
}
