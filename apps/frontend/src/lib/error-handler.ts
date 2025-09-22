/**
 * 前端错误处理系统
 * 为React组件和API调用提供错误处理
 * 
 * 使用统一的错误处理库，避免重复代码
 */

import { ErrorType, ErrorSeverity, StandardError } from '@athlete-ally/shared';

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    timestamp: string;
    context?: any;
  };
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export type ErrorCode = string;

/**
 * 前端API错误类
 */
export class FrontendError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly timestamp: string;
  public readonly context?: any;

  constructor(
    message: string,
    code: string = 'INTERNAL_ERROR',
    statusCode: number = 500,
    context?: any
  ) {
    super(message);
    this.name = 'FrontendError';
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.context = context;
  }

  static fromApiResponse(response: ApiErrorResponse): FrontendError {
    return new FrontendError(
      response.error.message,
      response.error.code,
      response.error.statusCode,
      response.error.context
    );
  }

  static fromNetworkError(error: Error): FrontendError {
    return new FrontendError(
      'Network error: Unable to connect to server',
      'SERVICE_UNAVAILABLE',
      503,
      { originalError: error.message }
    );
  }
}

/**
 * API调用包装器
 */
export async function apiCall<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw FrontendError.fromApiResponse(data);
    }

    return data;
  } catch (error) {
    if (error instanceof FrontendError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw FrontendError.fromNetworkError(error);
    }

    throw new FrontendError(
      error instanceof Error ? error.message : 'Unknown error',
      'INTERNAL_ERROR',
      500
    );
  }
}

/**
 * 错误边界组件使用的错误信息
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: FrontendError;
  errorInfo?: any;
}

/**
 * 用户友好的错误消息映射
 */
export const USER_FRIENDLY_MESSAGES: Record<string, string> = {
  'INTERNAL_ERROR': '系统内部错误，请稍后重试',
  'VALIDATION_ERROR': '输入数据格式不正确',
  'NOT_FOUND': '请求的资源不存在',
  'UNAUTHORIZED': '请先登录',
  'FORBIDDEN': '您没有权限执行此操作',
  'BAD_REQUEST': '请求参数错误',
  'SERVICE_UNAVAILABLE': '服务暂时不可用，请稍后重试',
  'SERVICE_TIMEOUT': '请求超时，请检查网络连接',
  'DATABASE_ERROR': '数据服务异常，请稍后重试',
  'AUTH_TOKEN_EXPIRED': '登录已过期，请重新登录',
  'AUTH_TOKEN_INVALID': '登录状态无效，请重新登录',
  'USER_NOT_FOUND': '用户不存在',
  'PLAN_NOT_FOUND': '训练计划不存在',
  'EXERCISE_NOT_FOUND': '训练动作不存在',
  'INVALID_TRAINING_DATA': '训练数据格式不正确',
  'OPENAI_API_ERROR': 'AI服务暂时不可用',
  'REDIS_ERROR': '缓存服务异常',
  'NATS_ERROR': '消息服务异常',
};

/**
 * 获取用户友好的错误消息
 */
export function getUserFriendlyMessage(error: FrontendError): string {
  return USER_FRIENDLY_MESSAGES[error.code] || error.message;
}

/**
 * 判断错误是否可重试
 */
export function isRetryableError(error: FrontendError): boolean {
  const retryableCodes = [
    'SERVICE_UNAVAILABLE',
    'SERVICE_TIMEOUT',
    'DATABASE_CONNECTION_ERROR',
    'REDIS_ERROR',
    'NATS_ERROR',
  ];

  return retryableCodes.includes(error.code as ErrorCode) || 
         error.statusCode >= 500;
}

/**
 * 错误重试机制
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (error instanceof FrontendError && !isRetryableError(error)) {
        throw error;
      }

      if (attempt === maxRetries) {
        throw error;
      }

      // 指数退避延迟
      const delayMs = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw lastError!;
}

/**
 * 错误日志记录（前端）
 */
export function logFrontendError(error: FrontendError, context?: string) {
  const logData = {
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
      context: error.context,
      stack: error.stack,
    },
    frontendContext: {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      context,
    },
  };

  // 在开发环境中打印到控制台
  if (process.env.NODE_ENV === 'development') {
    console.error('Frontend Error:', logData);
  }

  // 在生产环境中，这里应该发送到错误收集服务
  if (process.env.NODE_ENV === 'production') {
    // Error collection service integration (Sentry, Bugsnag, etc.) will be implemented
    console.error('Frontend Error:', logData);
  }
}

export default FrontendError;
