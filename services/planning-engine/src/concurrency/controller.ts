import { Mutex } from 'async-mutex';
import { register, Gauge, Counter } from 'prom-client';
import { Task, ConcurrencyStatus } from '../types/index.js';

// 并发控制指标
export const concurrencyMetrics = {
  // 当前并发数
  currentConcurrency: new Gauge({
    name: 'planning_engine_current_concurrency',
    help: 'Current number of concurrent operations',
    labelNames: ['operation']
  }),

  // 最大并发数
  maxConcurrency: new Gauge({
    name: 'planning_engine_max_concurrency',
    help: 'Maximum allowed concurrent operations',
    labelNames: ['operation']
  }),

  // 并发限制触发次数
  concurrencyLimitHits: new Counter({
    name: 'planning_engine_concurrency_limit_hits_total',
    help: 'Total number of times concurrency limit was hit',
    labelNames: ['operation']
  }),

  // 并发操作完成数
  concurrencyOperationsCompleted: new Counter({
    name: 'planning_engine_concurrency_operations_completed_total',
    help: 'Total number of concurrent operations completed',
    labelNames: ['operation', 'status']
  })
};

// 注册指标
Object.values(concurrencyMetrics).forEach(metric => {
  register.registerMetric(metric);
});

export class ConcurrencyController {
  private mutexes = new Map<string, Mutex>();
  private currentCounts = new Map<string, number>();
  private maxCounts = new Map<string, number>();
  private operationQueues = new Map<string, Array<() => Promise<void>>>();

  constructor() {
    // 初始化默认配置
    this.setMaxConcurrency('default', 10);
  }

  setMaxConcurrency(operation: string, maxConcurrency: number) {
    this.maxCounts.set(operation, maxConcurrency);
    concurrencyMetrics.maxConcurrency.set({ operation }, maxConcurrency);
    
    // 确保当前计数不超过最大值
    const current = this.currentCounts.get(operation) || 0;
    if (current > maxConcurrency) {
      this.currentCounts.set(operation, maxConcurrency);
      concurrencyMetrics.currentConcurrency.set({ operation }, maxConcurrency);
    }
  }

  async execute<T>(
    operation: string,
    task: Task<T>,
    fn: (task: Task<T>) => Promise<void>
  ): Promise<void> {
    const maxConcurrency = this.maxCounts.get(operation) || 10;
    const currentConcurrency = this.currentCounts.get(operation) || 0;

    // 检查是否超过并发限制
    if (currentConcurrency >= maxConcurrency) {
      concurrencyMetrics.concurrencyLimitHits.inc({ operation });
      
      // 将操作加入队列
      return new Promise((resolve, reject) => {
        if (!this.operationQueues.has(operation)) {
          this.operationQueues.set(operation, []);
        }
        
        this.operationQueues.get(operation)!.push(async () => {
          try {
            await this.execute(operation, task, fn);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    }

    // 获取或创建互斥锁
    if (!this.mutexes.has(operation)) {
      this.mutexes.set(operation, new Mutex());
    }

    const mutex = this.mutexes.get(operation)!;
    
    return mutex.runExclusive(async () => {
      // 增加并发计数
      this.currentCounts.set(operation, currentConcurrency + 1);
      concurrencyMetrics.currentConcurrency.set(
        { operation },
        this.currentCounts.get(operation) || 0
      );

      try {
        await fn(task);
        concurrencyMetrics.concurrencyOperationsCompleted.inc({
          operation,
          status: 'success'
        });
      } catch (error) {
        concurrencyMetrics.concurrencyOperationsCompleted.inc({
          operation,
          status: 'error'
        });
        throw error;
      } finally {
        // 减少并发计数
        const newCount = Math.max(0, (this.currentCounts.get(operation) || 0) - 1);
        this.currentCounts.set(operation, newCount);
        concurrencyMetrics.currentConcurrency.set({ operation }, newCount);

        // 处理队列中的下一个操作
        this.processQueue(operation);
      }
    });
  }

  private async processQueue(operation: string) {
    const queue = this.operationQueues.get(operation);
    if (!queue || queue.length === 0) {
      return;
    }

    const nextOperation = queue.shift();
    if (nextOperation) {
      // 异步执行下一个操作，不等待完成
      nextOperation().catch(error => {
        console.error(`Error processing queued operation for ${operation}:`, error);
      });
    }
  }

  getStatus(operation?: string): ConcurrencyStatus | Record<string, ConcurrencyStatus> {
    if (operation) {
      const currentConcurrency = this.currentCounts.get(operation) || 0;
      const maxConcurrency = this.maxCounts.get(operation) || 10;
      
      return {
        currentConcurrency,
        maxConcurrency,
        availableSlots: maxConcurrency - currentConcurrency,
        isHealthy: currentConcurrency < maxConcurrency
      };
    }

    // 返回所有操作的状态
    const status: Record<string, ConcurrencyStatus> = {};
    for (const op of this.maxCounts.keys()) {
      status[op] = this.getStatus(op) as ConcurrencyStatus;
    }
    return status;
  }

  getQueueLength(operation: string): number {
    return this.operationQueues.get(operation)?.length || 0;
  }

  clearQueue(operation: string) {
    this.operationQueues.set(operation, []);
  }

  reset() {
    this.currentCounts.clear();
    this.operationQueues.clear();
    this.mutexes.clear();
  }
}

export const concurrencyController = new ConcurrencyController();
