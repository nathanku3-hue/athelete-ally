/**
 * Structured Logging Policy and Implementation
 * 
 * This module provides a unified logging approach across the monorepo
 * with proper ESLint exceptions and environment-aware behavior.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogComponent = 'nats' | 'db' | 'api' | 'eslint' | 'general' | 'frontend' | 'service';

export interface LogContext {
  requestId?: string;
  correlationId?: string;
  subject?: string;
  durable?: string;
  redeliveryCount?: number;
  timestamp: string;
  level: LogLevel;
  component: LogComponent;
  message: string;
  metadata?: Record<string, unknown>;
  // Environment context
  nodeEnv?: string;
  isClient?: boolean;
}

class StructuredLogger {
  private defaultLogLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
  private isClient: boolean = typeof window !== 'undefined';
  private nodeEnv: string = process.env.NODE_ENV || 'development';

  public setLogLevel(level: LogLevel) {
    this.defaultLogLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.defaultLogLevel];
  }

  private log(level: LogLevel, message: string, component: LogComponent, metadata?: Record<string, unknown>) {
    if (!this.shouldLog(level)) return;

    const logEntry: LogContext = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      metadata,
      nodeEnv: this.nodeEnv,
      isClient: this.isClient,
    };

    // Use appropriate logging method based on environment
    // Defer to external logger - apps/services handle actual logging
    this.logToExternalLogger(level, JSON.stringify(logEntry));
  }

  /**
   * 外部日志记录接口 - 由应用/服务实现
   */
  private logToExternalLogger(_level: string, _message: string): void {
    // No-op stub - apps/services should implement actual logging
    // This allows packages to export logging interface without direct console usage
  }

  // Public logging methods
  public debug(message: string, component: LogComponent = 'general', metadata?: Record<string, unknown>) {
    this.log('debug', message, component, metadata);
  }

  public info(message: string, component: LogComponent = 'general', metadata?: Record<string, unknown>) {
    this.log('info', message, component, metadata);
  }

  public warn(message: string, component: LogComponent = 'general', metadata?: Record<string, unknown>) {
    this.log('warn', message, component, metadata);
  }

  public error(message: string, error?: Error, component: LogComponent = 'general', metadata?: Record<string, unknown>) {
    this.log('error', message, component, {
      ...metadata,
      error: error ? { message: error.message, stack: error.stack, name: error.name } : undefined,
    });
  }

  // Component-specific logging methods
  public nats(message: string, subject?: string, durable?: string, redeliveryCount?: number, metadata?: Record<string, unknown>) {
    if (process.env.NATS_LOG_LEVEL === 'debug' || process.env.NATS_LOG_LEVEL === 'trace') {
      this.log('debug', message, 'nats', { subject, durable, redeliveryCount, ...metadata });
    }
  }

  public db(message: string, query?: string, durationMs?: number, metadata?: Record<string, unknown>) {
    if (process.env.DB_LOG_LEVEL === 'debug' || process.env.DB_LOG_LEVEL === 'trace') {
      this.log('debug', message, 'db', { query, durationMs, ...metadata });
    }
  }

  public api(message: string, endpoint?: string, method?: string, status?: number, metadata?: Record<string, unknown>) {
    this.log('debug', message, 'api', { endpoint, method, status, ...metadata });
  }

  public eslint(message: string, rule?: string, file?: string, metadata?: Record<string, unknown>) {
    if (process.env.ESLINT_VERBOSE === 'true') {
      this.log('debug', message, 'eslint', { rule, file, ...metadata });
    }
  }
}

class LogUtils {
  public generateCorrelationId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  public redactSensitiveInfo(data: string): string {
    // Simple redaction for example. In a real app, use a robust redaction library.
    return data.replace(/password|secret|token|key/gi, '********');
  }

  public formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }
}

// Export singleton instances
export const logger = new StructuredLogger();
export const logUtils = new LogUtils();
