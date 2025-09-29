/**
 * 🛡️ 统一错误处理中间件
 * 作者: 后端团队
 * 版本: 1.0.0
 * 
 * 功能:
 * - 全局错误处理
 * - 统一错误响应格式
 * - 错误日志记录
 * - 错误分类和状态码映射
 */

import { FastifyInstance, FastifyError } from 'fastify';
import { ZodError } from 'zod';

// 错误类型枚举
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

// 错误响应接口
export interface ErrorResponse {
  success: false;
  error: {
    type: ErrorType;
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
}

// 错误映射配置
const ERROR_MAPPINGS = {
  [ErrorType.VALIDATION_ERROR]: {
    statusCode: 400,
    message: 'Validation Error',
  },
  [ErrorType.AUTHENTICATION_ERROR]: {
    statusCode: 401,
    message: 'Authentication Required',
  },
  [ErrorType.AUTHORIZATION_ERROR]: {
    statusCode: 403,
    message: 'Access Denied',
  },
  [ErrorType.NOT_FOUND_ERROR]: {
    statusCode: 404,
    message: 'Resource Not Found',
  },
  [ErrorType.CONFLICT_ERROR]: {
    statusCode: 409,
    message: 'Resource Conflict',
  },
  [ErrorType.RATE_LIMIT_ERROR]: {
    statusCode: 429,
    message: 'Rate Limit Exceeded',
  },
  [ErrorType.DATABASE_ERROR]: {
    statusCode: 500,
    message: 'Database Error',
  },
  [ErrorType.EXTERNAL_SERVICE_ERROR]: {
    statusCode: 502,
    message: 'External Service Error',
  },
  [ErrorType.BUSINESS_LOGIC_ERROR]: {
    statusCode: 422,
    message: 'Business Logic Error',
  },
  [ErrorType.INTERNAL_SERVER_ERROR]: {
    statusCode: 500,
    message: 'Internal Server Error',
  },
};

export class ErrorHandler {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.setupErrorHandling();
  }

  /**
   * 设置错误处理
   */
  private setupErrorHandling(): void {
    // 全局错误处理器
    this.fastify.setErrorHandler((error: FastifyError, request, reply) => {
      this.fastify.log.error('Unhandled error:', error as any);

      const errorResponse = this.createErrorResponse(error, request.id);
      const statusCode = this.getStatusCode(error);

      return reply.status(statusCode).send(errorResponse);
    });

    // 404处理器
    this.fastify.setNotFoundHandler((request, reply) => {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          type: ErrorType.NOT_FOUND_ERROR,
          code: 'ROUTE_NOT_FOUND',
          message: `Route ${request.method} ${request.url} not found`,
          timestamp: new Date().toISOString(),
          requestId: request.id,
        },
      };

      return reply.status(404).send(errorResponse);
    });
  }

  /**
   * 创建错误响应
   */
  private createErrorResponse(error: FastifyError, requestId?: string): ErrorResponse {
    const errorType = this.classifyError(error);
    const mapping = ERROR_MAPPINGS[errorType];

    return {
      success: false,
      error: {
        type: errorType,
        code: this.getErrorCode(error),
        message: this.getErrorMessage(error, mapping.message),
        details: this.getErrorDetails(error),
        timestamp: new Date().toISOString(),
        requestId,
      },
    };
  }

  /**
   * 分类错误类型
   */
  private classifyError(error: FastifyError): ErrorType {
    // Zod验证错误
    if (error instanceof ZodError) {
      return ErrorType.VALIDATION_ERROR;
    }

    // 根据状态码分类
    if (error.statusCode) {
      switch (error.statusCode) {
        case 400:
          return ErrorType.VALIDATION_ERROR;
        case 401:
          return ErrorType.AUTHENTICATION_ERROR;
        case 403:
          return ErrorType.AUTHORIZATION_ERROR;
        case 404:
          return ErrorType.NOT_FOUND_ERROR;
        case 409:
          return ErrorType.CONFLICT_ERROR;
        case 422:
          return ErrorType.BUSINESS_LOGIC_ERROR;
        case 429:
          return ErrorType.RATE_LIMIT_ERROR;
        case 502:
          return ErrorType.EXTERNAL_SERVICE_ERROR;
        default:
          return ErrorType.INTERNAL_SERVER_ERROR;
      }
    }

    // 根据错误消息分类
    const message = error.message.toLowerCase();
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION_ERROR;
    }
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return ErrorType.AUTHENTICATION_ERROR;
    }
    if (message.includes('forbidden') || message.includes('permission')) {
      return ErrorType.AUTHORIZATION_ERROR;
    }
    if (message.includes('not found') || message.includes('missing')) {
      return ErrorType.NOT_FOUND_ERROR;
    }
    if (message.includes('conflict') || message.includes('duplicate')) {
      return ErrorType.CONFLICT_ERROR;
    }
    if (message.includes('rate limit') || message.includes('too many')) {
      return ErrorType.RATE_LIMIT_ERROR;
    }
    if (message.includes('database') || message.includes('connection')) {
      return ErrorType.DATABASE_ERROR;
    }
    if (message.includes('external') || message.includes('service')) {
      return ErrorType.EXTERNAL_SERVICE_ERROR;
    }

    return ErrorType.INTERNAL_SERVER_ERROR;
  }

  /**
   * 获取错误代码
   */
  private getErrorCode(error: FastifyError): string {
    if (error instanceof ZodError) {
      return 'VALIDATION_FAILED';
    }

    // 从错误消息中提取代码
    const message = error.message;
    if (message.includes('OPENAI_API_KEY')) {
      return 'MISSING_API_KEY';
    }
    if (message.includes('timeout')) {
      return 'REQUEST_TIMEOUT';
    }
    if (message.includes('connection')) {
      return 'CONNECTION_ERROR';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * 获取错误消息
   */
  private getErrorMessage(error: FastifyError, defaultMessage: string): string {
    if (error instanceof ZodError) {
      return 'Request validation failed';
    }

    return error.message || defaultMessage;
  }

  /**
   * 获取错误详情
   */
  private getErrorDetails(error: FastifyError): any {
    if (error instanceof ZodError) {
      return {
        validationErrors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      };
    }

    // 在开发环境中返回更多详情
    if (process.env.NODE_ENV === 'development') {
      return {
        stack: error.stack,
        name: error.name,
      };
    }

    return undefined;
  }

  /**
   * 获取状态码
   */
  private getStatusCode(error: FastifyError): number {
    const errorType = this.classifyError(error);
    return ERROR_MAPPINGS[errorType].statusCode;
  }

  /**
   * 业务错误处理
   */
  static handleBusinessError(message: string, details?: any): ErrorResponse {
    return {
      success: false,
      error: {
        type: ErrorType.BUSINESS_LOGIC_ERROR,
        code: 'BUSINESS_ERROR',
        message,
        details,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * 验证错误处理
   */
  static handleValidationError(errors: any[]): ErrorResponse {
    return {
      success: false,
      error: {
        type: ErrorType.VALIDATION_ERROR,
        code: 'VALIDATION_FAILED',
        message: 'Request validation failed',
        details: { validationErrors: errors },
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * 数据库错误处理
   */
  static handleDatabaseError(error: any): ErrorResponse {
    return {
      success: false,
      error: {
        type: ErrorType.DATABASE_ERROR,
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * 外部服务错误处理
   */
  static handleExternalServiceError(service: string, error: any): ErrorResponse {
    return {
      success: false,
      error: {
        type: ErrorType.EXTERNAL_SERVICE_ERROR,
        code: 'EXTERNAL_SERVICE_ERROR',
        message: `${service} service unavailable`,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * 速率限制错误处理
   */
  static handleRateLimitError(limit: number, window: number): ErrorResponse {
    return {
      success: false,
      error: {
        type: ErrorType.RATE_LIMIT_ERROR,
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded: ${limit} requests per ${window}ms`,
        details: {
          limit,
          window,
          retryAfter: Math.ceil(window / 1000),
        },
        timestamp: new Date().toISOString(),
      },
    };
  }
}

/**
 * 错误处理装饰器
 */
export function handleErrors(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    try {
      return await method.apply(this, args);
    } catch (error) {
      console.error(`Error in ${target.constructor.name}.${propertyName}:`, error);
      throw error;
    }
  };
}

/**
 * 异步错误处理包装器
 */
export function asyncErrorHandler(fn: (req: unknown, res: unknown, next: unknown) => Promise<unknown>) {
  return (req: unknown, res: unknown, next: unknown) => {
    Promise.resolve(fn(req, res, next)).catch((error: unknown) => {
      if (typeof next === 'function') {
        next(error);
      }
    });
  };
}
