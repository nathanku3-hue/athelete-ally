// 错误监控和性能追踪
interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  lineNumber?: number;
  columnNumber?: number;
  timestamp: number;
  userAgent: string;
  userId?: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'navigation' | 'paint' | 'layout' | 'script' | 'custom';
  metadata?: Record<string, any>;
}

class MonitoringService {
  private sessionId: string;
  private userId?: string;
  private errorQueue: ErrorReport[] = [];
  private metricsQueue: PerformanceMetric[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupEventListeners();
    this.setupPerformanceObserver();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners(): void {
    // 监听在线状态
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueues();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // 监听页面卸载
    window.addEventListener('beforeunload', () => {
      this.flushQueues();
    });

    // 监听未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        severity: 'high',
      });
    });
  }

  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      // 观察导航性能
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: 'navigation',
            value: entry.duration,
            category: 'navigation',
            metadata: {
              type: entry.entryType,
              startTime: entry.startTime,
            },
          });
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });

      // 观察绘制性能
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: entry.name,
            value: entry.startTime,
            category: 'paint',
            metadata: {
              type: entry.entryType,
            },
          });
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });

      // 观察布局性能
      const layoutObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: 'layout-shift',
            value: (entry as any).value,
            category: 'layout',
            metadata: {
              type: entry.entryType,
              hadRecentInput: (entry as any).hadRecentInput,
            },
          });
        }
      });
      layoutObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  reportError(error: Partial<ErrorReport>): void {
    const errorReport: ErrorReport = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: window.location.href,
      lineNumber: error.lineNumber,
      columnNumber: error.columnNumber,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      userId: this.userId,
      sessionId: this.sessionId,
      severity: error.severity || 'medium',
    };

    this.errorQueue.push(errorReport);
    
    // 如果在线，立即发送
    if (this.isOnline) {
      this.sendErrorReport(errorReport);
    }

    // 控制台输出（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.error('Error reported:', errorReport);
    }
  }

  recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const performanceMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
    };

    this.metricsQueue.push(performanceMetric);
    
    // 如果在线，立即发送
    if (this.isOnline) {
      this.sendMetric(performanceMetric);
    }
  }

  private async sendErrorReport(error: ErrorReport): Promise<void> {
    try {
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(error),
      });
    } catch (err) {
      console.error('Failed to send error report:', err);
    }
  }

  private async sendMetric(metric: PerformanceMetric): Promise<void> {
    try {
      await fetch('/api/monitoring/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric),
      });
    } catch (err) {
      console.error('Failed to send metric:', err);
    }
  }

  private async flushQueues(): Promise<void> {
    // 发送错误队列
    for (const error of this.errorQueue) {
      await this.sendErrorReport(error);
    }
    this.errorQueue = [];

    // 发送指标队列
    for (const metric of this.metricsQueue) {
      await this.sendMetric(metric);
    }
    this.metricsQueue = [];
  }

  // 自定义性能测量
  measurePerformance<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.recordMetric({
      name,
      value: end - start,
      category: 'custom',
    });
    
    return result;
  }

  async measureAsyncPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    this.recordMetric({
      name,
      value: end - start,
      category: 'custom',
    });
    
    return result;
  }
}

// 全局监控实例
export const monitoring = new MonitoringService();

// 错误边界集成
export function setupErrorBoundary() {
  window.addEventListener('error', (event) => {
    monitoring.reportError({
      message: event.message,
      stack: event.error?.stack,
      lineNumber: event.lineno,
      columnNumber: event.colno,
      severity: 'high',
    });
  });
}

// React Hook for monitoring
export function useMonitoring() {
  return {
    reportError: (error: Partial<ErrorReport>) => monitoring.reportError(error),
    recordMetric: (metric: Omit<PerformanceMetric, 'timestamp'>) => monitoring.recordMetric(metric),
    measurePerformance: <T>(name: string, fn: () => T) => monitoring.measurePerformance(name, fn),
    measureAsyncPerformance: <T>(name: string, fn: () => Promise<T>) => monitoring.measureAsyncPerformance(name, fn),
  };
}