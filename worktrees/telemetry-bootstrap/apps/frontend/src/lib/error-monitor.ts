// 错误监控和日志系统
interface ErrorInfo {
  error: Error;
  timestamp: number;
  context: {
    type: string;
    filename?: string;
    lineno?: number;
    colno?: number;
    reason?: any;
    userAgent: string;
    url: string;
    userId?: string;
    sessionId?: string;
  };
}

export class ErrorMonitor {
  private static instance: ErrorMonitor;
  private errors: ErrorInfo[] = [];
  private maxErrors: number = 100;
  private sessionId: string;

  static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor();
    }
    return ErrorMonitor.instance;
  }

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  init(): void {
    // 全局JavaScript错误处理
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        type: 'javascript',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Promise rejection处理
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(new Error(event.reason), {
        type: 'promise',
        reason: event.reason
      });
    });

    // 资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.captureError(new Error(`Resource loading failed: ${event.target}`), {
          type: 'resource',
          filename: (event.target as any)?.src || (event.target as any)?.href
        });
      }
    }, true);
  }

  captureError(error: Error, context: Partial<ErrorInfo['context']> = {}): void {
    const errorInfo: ErrorInfo = {
      error,
      timestamp: Date.now(),
      context: {
        type: 'unknown',
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.getCurrentUserId() || undefined,
        sessionId: this.sessionId,
        ...context
      }
    };

    this.errors.push(errorInfo);
    
    // 限制错误数量
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }
    
    // 发送到监控服务
    this.sendToMonitoring(errorInfo);
    
    // 开发环境输出
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', errorInfo);
    }
  }

  private getCurrentUserId(): string | null {
    try {
      return localStorage.getItem('userId') || sessionStorage.getItem('userId');
    } catch {
      return null;
    }
  }

  private async sendToMonitoring(errorInfo: ErrorInfo): Promise<void> {
    try {
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorInfo)
      });
    } catch (error) {
      console.error('Failed to send error to monitoring:', error);
    }
  }

  // 手动报告错误
  reportError(error: Error, context?: Partial<ErrorInfo['context']>): void {
    this.captureError(error, context);
  }

  // 获取错误列表
  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  // 清除错误列表
  clearErrors(): void {
    this.errors = [];
  }

  // 获取错误统计
  getErrorStats() {
    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;
    const last1h = now - 60 * 60 * 1000;
    
    const errors24h = this.errors.filter(e => e.timestamp > last24h);
    const errors1h = this.errors.filter(e => e.timestamp > last1h);
    
    const errorTypes = errors24h.reduce((acc, error) => {
      acc[error.context.type] = (acc[error.context.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: this.errors.length,
      last24h: errors24h.length,
      last1h: errors1h.length,
      types: errorTypes
    };
  }
}

// 全局错误监控实例
export const errorMonitor = ErrorMonitor.getInstance();

// React Hook for error monitoring
export function useErrorMonitor() {
  const reportError = (error: Error, context?: Partial<ErrorInfo['context']>) => {
    errorMonitor.reportError(error, context);
  };

  const getErrors = () => errorMonitor.getErrors();
  const clearErrors = () => errorMonitor.clearErrors();
  const getStats = () => errorMonitor.getErrorStats();

  return {
    reportError,
    getErrors,
    clearErrors,
    getStats
  };
}

