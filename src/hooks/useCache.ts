import { useCallback } from 'react';
import { CacheStrategy } from '@/lib/cache-strategy';

export function useCache() {
  const cache = CacheStrategy.getInstance();

  const getCachedData = useCallback(async <T>(key: string): Promise<T | null> => {
    return await cache.get<T>(key);
  }, [cache]);

  const setCachedData = useCallback(async (key: string, data: any, ttl?: number): Promise<void> => {
    await cache.set(key, data, ttl);
  }, [cache]);

  const invalidateCache = useCallback(async (pattern: string): Promise<void> => {
    await cache.invalidate(pattern);
  }, [cache]);

  const clearCache = useCallback(async (): Promise<void> => {
    await cache.clear();
  }, [cache]);

  const getCacheStats = useCallback(() => {
    return cache.getStats();
  }, [cache]);

  return {
    getCachedData,
    setCachedData,
    invalidateCache,
    clearCache,
    getCacheStats
  };
}


