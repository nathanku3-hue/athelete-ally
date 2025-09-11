import { NextRequest, NextResponse } from 'next/server';
import { handleCorsOptions, addCorsHeaders } from '@/lib/cors';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const { planId } = params;
    
    if (!planId) {
      return NextResponse.json(
        { error: 'planId is required' },
        { status: 400 }
      );
    }
    
    logger.log('Fetching plan details for planId:', planId);
    
    // TODO: 替换为真实的后端API调用
    // 在NODE_ENV=production时，必须调用真实服务
    if (process.env.NODE_ENV === 'production') {
      // 调用planning-engine服务获取真实数据
      const response = await fetch(`${process.env.PLANNING_ENGINE_URL}/plans/${planId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${request.headers.get('authorization') || ''}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch plan: ${response.status}`);
      }
      
      const plan = await response.json();
      return NextResponse.json(plan);
    } else {
      // 开发环境可以返回基础结构
      return NextResponse.json({
        id: planId,
        status: 'development_mode',
        message: 'This endpoint requires real backend integration in production'
      });
    }
    
  } catch (error) {
    logger.error('Failed to fetch plan details:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch plan details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return handleCorsOptions();
}