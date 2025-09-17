// 高级缓存管理
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: string;
}

export class AdvancedCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
      version: '1.0.0',
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    return item ? Date.now() <= item.expiresAt : false;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 获取缓存统计信息
  getStats() {
    const now = Date.now();
    const validItems = Array.from(this.cache.values()).filter(
      item => now <= item.expiresAt
    );
    
    return {
      totalItems: this.cache.size,
      validItems: validItems.length,
      expiredItems: this.cache.size - validItems.length,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0;
    for (const [key, value] of this.cache) {
      totalSize += key.length * 2; // 字符串长度 * 2 (UTF-16)
      totalSize += JSON.stringify(value).length * 2;
    }
    return totalSize;
  }
}

// 全局缓存实例
export const globalCache = new AdvancedCache();

// 缓存装饰器
export function cached<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : `fn_${fn.name}_${JSON.stringify(args)}`;
    
    const cached = globalCache.get<ReturnType<T>>(key);
    if (cached !== null) {
      return cached;
    }
    
    const result = fn(...args);
    
    // 处理Promise结果
    if (result instanceof Promise) {
      return result.then((resolvedResult) => {
        globalCache.set(key, resolvedResult, ttl);
        return resolvedResult;
      });
    }
    
    globalCache.set(key, result, ttl);
    return result;
  }) as T;
}