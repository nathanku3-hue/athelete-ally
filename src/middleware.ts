import { NextRequest, NextResponse } from 'next/server';
import { handleCorsOptions, addCorsHeaders, isOriginAllowed, getCorsConfig } from './lib/cors';

// 需要CORS处理的API路由模式
const API_ROUTES = [
  '/api/v1/onboarding',
  '/api/v1/onboarding/step',
  '/api/v1/onboarding/error',
  '/api/v1/plans',
  '/api/v1/plans/current',
  '/api/v1/plans/status',
  '/api/v1/exercises',
  '/api/v1/fatigue',
  '/api/v1/rpe-data',
  '/api/v1/user',
  '/api/v1/workouts',
];

// 检查是否为API路由
function isApiRoute(pathname: string): boolean {
  return API_ROUTES.some(route => pathname.startsWith(route));
}

// 主中间件函数
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 只处理API路由
  if (!isApiRoute(pathname)) {
    return NextResponse.next();
  }
  
  const origin = request.headers.get('origin');
  const config = getCorsConfig();
  
  // 检查来源是否被允许
  if (origin && !isOriginAllowed(origin, config.origins)) {
    return new NextResponse(
      JSON.stringify({ 
        error: 'CORS policy violation', 
        message: 'Origin not allowed' 
      }),
      { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
  
  // 处理预检请求
  if (request.method === 'OPTIONS') {
    return handleCorsOptions(request);
  }
  
  // 对于其他请求，继续处理并添加CORS头
  const response = NextResponse.next();
  return addCorsHeaders(request, response);
}

// 中间件配置
export const config = {
  matcher: [
    // 匹配所有API路由
    '/api/v1/:path*',
    // 排除静态文件和内部Next.js路由
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
