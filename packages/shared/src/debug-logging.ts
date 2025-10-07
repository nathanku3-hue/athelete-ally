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

export type DebugLogContext = LogContext;

export interface DebugConfig {
  NATS_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  DB_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  ESLINT_VERBOSE: boolean;
  ENABLE_CORRELATION_ID: boolean;
  ENABLE_REQUEST_TRACKING: boolean;
}

export const DEBUG_CONFIG: DebugConfig = {
  NATS_LOG_LEVEL: process.env.DEBUG_NATS ? 'debug' : 'info',
  DB_LOG_LEVEL: process.env.DEBUG_DB ? 'debug' : 'info',
  ESLINT_VERBOSE: process.env.DEBUG_ESLINT === 'true',
  ENABLE_CORRELATION_ID: process.env.DEBUG_CORRELATION_ID !== 'false',
  ENABLE_REQUEST_TRACKING: process.env.DEBUG_REQUEST_TRACKING !== 'false',
};

export class DebugLogger {
  private static instance: DebugLogger;
  private correlationId: string | null = null;
  private requestId: string | null = null;

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  setCorrelationId(id: string): void {
    this.correlationId = id;
  }

  setRequestId(id: string): void {
    this.requestId = id;
  }

  log(context: Partial<DebugLogContext>): void {
    const logEntry: DebugLogContext = {
      requestId: this.requestId || 'unknown',
      correlationId: this.correlationId || undefined,
      timestamp: new Date().toISOString(),
      level: 'info',
      component: 'general',
      message: '',
      ...context,
    };

    // Check if we should log based on component and level
    if (this.shouldLog(logEntry.component, logEntry.level)) {
      this.logToExternalLogger(JSON.stringify(logEntry));
    }
  }

  /**
   * 外部日志记录接口 - 由应用/服务实现
   */
  private logToExternalLogger(_message: string): void {
    // No-op stub - apps/services should implement actual logging
    // This allows packages to export logging interface without direct console usage
  }

  private shouldLog(component: string, level: string): boolean {
    switch (component) {
      case 'nats':
        return this.isLevelEnabled(level, DEBUG_CONFIG.NATS_LOG_LEVEL);
      case 'db':
        return this.isLevelEnabled(level, DEBUG_CONFIG.DB_LOG_LEVEL);
      default:
        return true;
    }
  }

  private isLevelEnabled(logLevel: string, configLevel: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const logIndex = levels.indexOf(logLevel);
    const configIndex = levels.indexOf(configLevel);
    return logIndex >= configIndex;
  }

  // Convenience methods
  debug(message: string, component: DebugLogContext['component'] = 'general', metadata?: Record<string, unknown>): void {
    this.log({ level: 'debug', component, message, metadata });
  }

  info(message: string, component: DebugLogContext['component'] = 'general', metadata?: Record<string, unknown>): void {
    this.log({ level: 'info', component, message, metadata });
  }

  warn(message: string, component: DebugLogContext['component'] = 'general', metadata?: Record<string, unknown>): void {
    this.log({ level: 'warn', component, message, metadata });
  }

  error(message: string, component: DebugLogContext['component'] = 'general', metadata?: Record<string, unknown>): void {
    this.log({ level: 'error', component, message, metadata });
  }

  // NATS-specific logging
  natsDebug(message: string, subject?: string, durable?: string, redeliveryCount?: number): void {
    this.log({
      level: 'debug',
      component: 'nats',
      message,
      subject,
      durable,
      redeliveryCount,
    });
  }

  natsInfo(message: string, subject?: string, durable?: string): void {
    this.log({
      level: 'info',
      component: 'nats',
      message,
      subject,
      durable,
    });
  }

  // Database-specific logging
  dbDebug(message: string, query?: string, duration?: number): void {
    this.log({
      level: 'debug',
      component: 'db',
      message,
      metadata: { query, duration },
    });
  }

  dbInfo(message: string, query?: string, duration?: number): void {
    this.log({
      level: 'info',
      component: 'db',
      message,
      metadata: { query, duration },
    });
  }
}

// Export singleton instance
export const debugLogger = DebugLogger.getInstance();

// Utility functions for common debug scenarios
export const debugUtils = {
  generateRequestId: (): string => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  generateCorrelationId: (): string => {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  formatNATSSubject: (subject: string, durable?: string): string => {
    return durable ? `${subject} (${durable})` : subject;
  },

  formatDuration: (startTime: number): number => {
    return Date.now() - startTime;
  },
};

// Environment variable helpers
export const debugEnv = {
  isDebugMode: (): boolean => {
    return process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true';
  },

  getDebugLevel: (component: string): string => {
    switch (component) {
      case 'nats':
        return DEBUG_CONFIG.NATS_LOG_LEVEL;
      case 'db':
        return DEBUG_CONFIG.DB_LOG_LEVEL;
      default:
        return 'info';
    }
  },

  shouldEnableVerboseLogging: (): boolean => {
    return DEBUG_CONFIG.ESLINT_VERBOSE || debugEnv.isDebugMode();
  },
};
