// 性能监控工具
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 开始性能测量
  startMeasure(name: string): void {
    if (typeof window === 'undefined') return;
    
    performance.mark(`${name}-start`);
    this.metrics.set(name, performance.now());
  }

  // 结束性能测量
  endMeasure(name: string): number | null {
    if (typeof window === 'undefined') return null;
    
    const startTime = this.metrics.get(name);
    if (!startTime) return null;

    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const duration = performance.now() - startTime;
    this.metrics.delete(name);
    
    // 记录到控制台（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  // 监控页面加载性能
  monitorPageLoad(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        'page-load-time': navigation.loadEventEnd - navigation.loadEventStart,
        'dom-content-loaded': navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        'first-contentful-paint': this.getFirstContentfulPaint(),
        'largest-contentful-paint': this.getLargestContentfulPaint(),
        'cumulative-layout-shift': this.getCumulativeLayoutShift(),
      };

      // 发送到分析服务
      const filteredMetrics = Object.fromEntries(
        Object.entries(metrics).filter(([_, value]) => value !== null)
      ) as Record<string, number>;
      this.sendMetrics(filteredMetrics);
    });
  }

  // 监控组件渲染性能
  monitorComponentRender(componentName: string, renderFn: () => void): void {
    this.startMeasure(`render-${componentName}`);
    renderFn();
    this.endMeasure(`render-${componentName}`);
  }

  // 监控API调用性能
  monitorApiCall(apiName: string, apiCall: () => Promise<any>): Promise<any> {
    this.startMeasure(`api-${apiName}`);
    return apiCall().finally(() => {
      this.endMeasure(`api-${apiName}`);
    });
  }

  // 获取首次内容绘制时间
  private getFirstContentfulPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcpEntry ? fcpEntry.startTime : null;
  }

  // 获取最大内容绘制时间
  private getLargestContentfulPaint(): number | null {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    const lastEntry = lcpEntries[lcpEntries.length - 1];
    return lastEntry ? lastEntry.startTime : null;
  }

  // 获取累积布局偏移
  private getCumulativeLayoutShift(): number {
    let clsValue = 0;
    const clsEntries = performance.getEntriesByType('layout-shift') as PerformanceEntry[];
    
    clsEntries.forEach(entry => {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    });
    
    return clsValue;
  }

  // 发送性能指标
  private sendMetrics(metrics: Record<string, number>): void {
    // 这里可以发送到你的分析服务
    if (process.env.NODE_ENV === 'development') {
      console.table(metrics);
    }
    
    // 示例：发送到分析服务
    // analytics.track('performance-metrics', metrics);
  }

  // 清理资源
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// 导出单例实例
export const performanceMonitor = PerformanceMonitor.getInstance();

// React Hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const startRender = () => performanceMonitor.startMeasure(`render-${componentName}`);
  const endRender = () => performanceMonitor.endMeasure(`render-${componentName}`);
  
  return { startRender, endRender };
}