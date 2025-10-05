/**
 * 🛡️ 统一错误处理中间件
 * 作者: 后端团队
 * 版本: 1.0.0
 * 
 * 功能:
 * - 统一错误格式
 * - 错误日志记录
 * - 错误分类和响应
 */

import type { FastifyRequest, FastifyReply } from './fastify-augment.js';
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
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// 错误严重程度
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// 标准错误接口
export interface StandardError {
  type: ErrorType;
  code: string;
  message: string;
  details?: any;
  severity: ErrorSeverity;
  timestamp: string;
  requestId?: string;
  userId?: string;
  service?: string;
  stack?: string;
}

// 错误分类器
export class ErrorClassifier {
  static classify(error: Error): { type: ErrorType; severity: ErrorSeverity; code: string } {
    // Zod 验证错误
    if (error instanceof ZodError) {
      return {
        type: ErrorType.VALIDATION_ERROR,
        severity: ErrorSeverity.LOW,
        code: 'VALIDATION_FAILED'
      };
    }
    
    // Prisma 数据库错误 (通过错误名称和消息判断)
    if (error.name === 'PrismaClientKnownRequestError') {
      const prismaError = error as any;
      switch (prismaError.code) {
        case 'P2002':
          return {
            type: ErrorType.CONFLICT_ERROR,
            severity: ErrorSeverity.MEDIUM,
            code: 'DUPLICATE_ENTRY'
          };
        case 'P2025':
          return {
            type: ErrorType.NOT_FOUND_ERROR,
            severity: ErrorSeverity.LOW,
            code: 'RECORD_NOT_FOUND'
          };
        default:
          return {
            type: ErrorType.DATABASE_ERROR,
            severity: ErrorSeverity.HIGH,
            code: 'DATABASE_OPERATION_FAILED'
          };
      }
    }
    
    // Prisma 连接错误
    if (error.name === 'PrismaClientInitializationError') {
      return {
        type: ErrorType.DATABASE_ERROR,
        severity: ErrorSeverity.CRITICAL,
        code: 'DATABASE_CONNECTION_FAILED'
      };
    }
    
    // 网络错误
    if (error.name === 'FetchError' || error.message.includes('ECONNREFUSED')) {
      return {
        type: ErrorType.NETWORK_ERROR,
        severity: ErrorSeverity.HIGH,
        code: 'NETWORK_CONNECTION_FAILED'
      };
    }
    
    // 超时错误
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return {
        type: ErrorType.TIMEOUT_ERROR,
        severity: ErrorSeverity.MEDIUM,
        code: 'REQUEST_TIMEOUT'
      };
    }
    
    // 认证错误
    if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      return {
        type: ErrorType.AUTHENTICATION_ERROR,
        severity: ErrorSeverity.MEDIUM,
        code: 'AUTHENTICATION_FAILED'
      };
    }
    
    // 授权错误
    if (error.message.includes('forbidden') || error.message.includes('permission')) {
      return {
        type: ErrorType.AUTHORIZATION_ERROR,
        severity: ErrorSeverity.MEDIUM,
        code: 'AUTHORIZATION_FAILED'
      };
    }
    
    // 默认错误
    return {
      type: ErrorType.UNKNOWN_ERROR,
      severity: ErrorSeverity.HIGH,
      code: 'UNKNOWN_ERROR'
    };
  }
}

// 错误构建器
export class ErrorBuilder {
  static build(error: Error, request?: FastifyRequest): StandardError {
    const classification = ErrorClassifier.classify(error);
    
    return {
      type: classification.type,
      code: classification.code,
      message: error.message || 'An unexpected error occurred',
      severity: classification.severity,
      timestamp: new Date().toISOString(),
      requestId: request?.id,
      userId: (request as any)?.user?.userId,
      service: process.env.SERVICE_NAME || 'unknown',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
  
  static buildFromZod(zodError: ZodError, request?: FastifyRequest): StandardError {
    const details = zodError.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));
    
    return {
      type: ErrorType.VALIDATION_ERROR,
      code: 'VALIDATION_FAILED',
      message: 'Request validation failed',
      details,
      severity: ErrorSeverity.LOW,
      timestamp: new Date().toISOString(),
      requestId: request?.id,
      userId: (request as any)?.user?.userId,
      service: process.env.SERVICE_NAME || 'unknown'
    };
  }
}

// HTTP状态码映射
export function getHttpStatusCode(errorType: ErrorType): number {
  switch (errorType) {
    case ErrorType.VALIDATION_ERROR:
      return 400;
    case ErrorType.AUTHENTICATION_ERROR:
      return 401;
    case ErrorType.AUTHORIZATION_ERROR:
      return 403;
    case ErrorType.NOT_FOUND_ERROR:
      return 404;
    case ErrorType.CONFLICT_ERROR:
      return 409;
    case ErrorType.RATE_LIMIT_ERROR:
      return 429;
    case ErrorType.DATABASE_ERROR:
    case ErrorType.EXTERNAL_SERVICE_ERROR:
    case ErrorType.INTERNAL_SERVER_ERROR:
    case ErrorType.NETWORK_ERROR:
    case ErrorType.TIMEOUT_ERROR:
    case ErrorType.UNKNOWN_ERROR:
    default:
      return 500;
  }
}

// 错误日志记录器
export class ErrorLogger {
  static log(error: StandardError, request?: FastifyRequest) {
    const logLevel = this.getLogLevel(error.severity);
    const logData = {
      ...error,
      url: request?.url,
      method: request?.method,
      userAgent: request?.headers['user-agent'],
      ip: request?.ip
    };
    
    // Defer to external logger - apps/services handle actual logging
    this.logToExternalLogger(logLevel, JSON.stringify(logData, null, 2));
  }

  /**
   * 外部日志记录接口 - 由应用/服务实现
   */
  private static logToExternalLogger(level: string, message: string): void {
    // No-op stub - apps/services should implement actual logging
    // This allows packages to export logging interface without direct console usage
  }
  
  
  private static getLogLevel(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.LOW:
        return 'info';
      default:
        return 'log';
    }
  }
}

// Fastify 错误处理中间件
export function createErrorHandler() {
  return async (error: Error, request: any, reply: any) => {
    let standardError: StandardError;
    
    // 处理 Zod 验证错误
    if (error instanceof ZodError) {
      standardError = ErrorBuilder.buildFromZod(error, request);
    } else {
      standardError = ErrorBuilder.build(error, request);
    }
    
    // 记录错误日志
    ErrorLogger.log(standardError, request);
    
    // 获取HTTP状态码
    const statusCode = getHttpStatusCode(standardError.type);
    
    // 构建响应
    const response = {
      error: {
        type: standardError.type,
        code: standardError.code,
        message: standardError.message,
        ...(standardError.details && { details: standardError.details }),
        ...(standardError.requestId && { requestId: standardError.requestId }),
        ...(process.env.NODE_ENV === 'development' && { stack: standardError.stack })
      },
      timestamp: standardError.timestamp
    };
    
    // 发送响应
    reply.status(statusCode).send(response);
  };
}

// 错误监控和告警
export class ErrorMonitor {
  private static errorCounts = new Map<ErrorType, number>();
  private static lastReset = Date.now();
  
  static track(error: StandardError) {
    const count = this.errorCounts.get(error.type) || 0;
    this.errorCounts.set(error.type, count + 1);
    
    // 检查是否需要告警
    this.checkAlerts(error);
  }
  
  private static checkAlerts(error: StandardError) {
    const count = this.errorCounts.get(error.type) || 0;
    
    // 严重错误立即告警
    if (error.severity === ErrorSeverity.CRITICAL) {
      this.sendAlert(error, 'CRITICAL_ERROR');
    }
    
    // 高频错误告警
    if (count > 10 && error.severity === ErrorSeverity.HIGH) {
      this.sendAlert(error, 'HIGH_FREQUENCY_ERROR');
    }
  }
  
  private static sendAlert(error: StandardError, alertType: string) {
    // Defer to external logger - apps/services handle actual logging
    this.logToExternalLogger('error', `🚨 ALERT [${alertType}]: ${JSON.stringify({
      errorType: error.type,
      code: error.code,
      count: this.errorCounts.get(error.type),
      service: error.service,
      timestamp: error.timestamp
    })}`);
  }
  
  static getErrorStats() {
    return {
      counts: Object.fromEntries(this.errorCounts),
      lastReset: this.lastReset,
      totalErrors: Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0)
    };
  }
  
  static reset() {
    this.errorCounts.clear();
    this.lastReset = Date.now();
  }
}

// 增强的错误处理中间件
export function createEnhancedErrorHandler() {
  return async (error: Error, request: any, reply: any) => {
    let standardError: StandardError;
    
    // 处理 Zod 验证错误
    if (error instanceof ZodError) {
      standardError = ErrorBuilder.buildFromZod(error, request);
    } else {
      standardError = ErrorBuilder.build(error, request);
    }
    
    // 记录错误日志
    ErrorLogger.log(standardError, request);
    
    // 跟踪错误
    ErrorMonitor.track(standardError);
    
    // 获取HTTP状态码
    const statusCode = getHttpStatusCode(standardError.type);
    
    // 构建响应
    const response = {
      error: {
        type: standardError.type,
        code: standardError.code,
        message: standardError.message,
        ...(standardError.details && { details: standardError.details }),
        ...(standardError.requestId && { requestId: standardError.requestId }),
        ...(process.env.NODE_ENV === 'development' && { stack: standardError.stack })
      },
      timestamp: standardError.timestamp
    };
    
    // 发送响应
    reply.status(statusCode).send(response);
  };
}