// 高级缓存策略管理
export class CacheStrategy {
  private static instance: CacheStrategy;
  private cache: Map<string, { data: any; expiry: number; version: string }> = new Map();
  private maxSize: number = 100;
  private version: string = '1.0.0';

  static getInstance(): CacheStrategy {
    if (!CacheStrategy.instance) {
      CacheStrategy.instance = new CacheStrategy();
    }
    return CacheStrategy.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now() && cached.version === this.version) {
      return cached.data;
    }
    
    // 清理过期缓存
    if (cached && cached.expiry <= Date.now()) {
      this.cache.delete(key);
    }
    
    return null;
  }

  async set(key: string, data: any, ttl: number = 300000): Promise<void> {
    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
      version: this.version
    });
  }

  async invalidate(pattern: string): Promise<void> {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  // 获取缓存统计
  getStats() {
    const now = Date.now();
    const validItems = Array.from(this.cache.values()).filter(
      item => item.expiry > now && item.version === this.version
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
      totalSize += key.length * 2; // UTF-16
      totalSize += JSON.stringify(value).length * 2;
    }
    return totalSize;
  }

  // 更新版本，清理旧缓存
  updateVersion(newVersion: string): void {
    this.version = newVersion;
    this.clear();
  }
}

// 缓存装饰器
export function cached<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  const cache = CacheStrategy.getInstance();
  
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : `fn_${fn.name}_${JSON.stringify(args)}`;
    
    return cache.get<ReturnType<T>>(key).then((cached) => {
      if (cached !== null) {
        return cached;
      }
      
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result.then((resolvedResult) => {
          cache.set(key, resolvedResult, ttl);
          return resolvedResult;
        });
      }
      
      cache.set(key, result, ttl);
      return result;
    });
  }) as T;
}

