// 共享类型定义
export interface Task<T> {
  data: T;
  retries: number;
  maxRetries: number;
  createdAt: Date;
}

export interface ConcurrencyStatus {
  currentConcurrency: number;
  maxConcurrency: number;
  availableSlots: number;
  isHealthy: boolean;
}

export interface SubscriptionOptions {
  maxConcurrent?: number;
  enableConcurrencyControl?: boolean;
}
