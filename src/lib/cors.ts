import { NextRequest, NextResponse } from 'next/server';

// CORS配置接口
export interface CorsConfig {
  origins: string[];
  methods: string[];
  headers: string[];
  credentials: boolean;
  maxAge?: number;
}

// 默认CORS配置
const DEFAULT_CORS_CONFIG: CorsConfig = {
  origins: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  headers: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  maxAge: 86400, // 24小时
};

// 从环境变量获取CORS配置
function getCorsConfig(): CorsConfig {
  const corsOrigins = process.env.CORS_ORIGINS;
  
  if (corsOrigins) {
    return {
      ...DEFAULT_CORS_CONFIG,
      origins: corsOrigins.split(',').map(origin => origin.trim()),
    };
  }
  
  return DEFAULT_CORS_CONFIG;
}

// 检查来源是否被允许
export function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  if (allowedOrigins.includes('*')) {
    return true;
  }
  
  return allowedOrigins.includes(origin);
}

// 生成CORS头
export function generateCorsHeaders(request: NextRequest, config: CorsConfig): Record<string, string> {
  const origin = request.headers.get('origin');
  const headers: Record<string, string> = {};
  
  // 设置Access-Control-Allow-Origin
  if (origin && isOriginAllowed(origin, config.origins)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else if (config.origins.length === 1) {
    headers['Access-Control-Allow-Origin'] = config.origins[0];
  } else {
    headers['Access-Control-Allow-Origin'] = '*';
  }
  
  // 设置其他CORS头
  headers['Access-Control-Allow-Methods'] = config.methods.join(', ');
  headers['Access-Control-Allow-Headers'] = config.headers.join(', ');
  headers['Access-Control-Allow-Credentials'] = config.credentials.toString();
  
  if (config.maxAge) {
    headers['Access-Control-Max-Age'] = config.maxAge.toString();
  }
  
  return headers;
}

// 处理CORS预检请求
export function handleCorsOptions(request: NextRequest): NextResponse {
  const config = getCorsConfig();
  const headers = generateCorsHeaders(request, config);
  
  return new NextResponse(null, {
    status: 200,
    headers,
  });
}

// 为响应添加CORS头
export function addCorsHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const config = getCorsConfig();
  const corsHeaders = generateCorsHeaders(request, config);
  
  // 添加CORS头到响应
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// 中间件辅助函数
export function createCorsResponse(request: NextRequest, response: NextResponse): NextResponse {
  return addCorsHeaders(request, response);
}

// 验证CORS配置
export function validateCorsConfig(): { valid: boolean; errors: string[] } {
  const config = getCorsConfig();
  const errors: string[] = [];
  
  if (!Array.isArray(config.origins) || config.origins.length === 0) {
    errors.push('CORS origins must be a non-empty array');
  }
  
  if (!Array.isArray(config.methods) || config.methods.length === 0) {
    errors.push('CORS methods must be a non-empty array');
  }
  
  if (!Array.isArray(config.headers) || config.headers.length === 0) {
    errors.push('CORS headers must be a non-empty array');
  }
  
  if (typeof config.credentials !== 'boolean') {
    errors.push('CORS credentials must be a boolean');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// 获取当前CORS配置（用于调试）
export function getCurrentCorsConfig(): CorsConfig {
  return getCorsConfig();
}