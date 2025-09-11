"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';

interface PlanStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedTime: number;
  message: string;
  planId?: string;
  error?: string;
}

interface UsePlanStatusPollingOptions {
  jobId?: string;
  maxRetries?: number;
  baseInterval?: number;
  maxInterval?: number;
  onComplete?: (planId: string) => void;
  onError?: (error: string) => void;
}

interface UsePlanStatusPollingReturn {
  status: PlanStatus | null;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  retry: () => void;
  stop: () => void;
}

export function usePlanStatusPolling({
  jobId,
  maxRetries = 5,
  baseInterval = 1000,
  maxInterval = 10000,
  onComplete,
  onError
}: UsePlanStatusPollingOptions = {}): UsePlanStatusPollingReturn {
  const [status, setStatus] = useState<PlanStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isPolling, setIsPolling] = useState(true);
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // 计算指数退避间隔
  const getPollInterval = useCallback((attempt: number): number => {
    return Math.min(baseInterval * Math.pow(1.5, attempt), maxInterval);
  }, [baseInterval, maxInterval]);

  // 轮询函数
  const pollStatus = useCallback(async () => {
    if (!isMountedRef.current || !isPolling || !jobId) return;

    try {
      const response = await fetch(`/api/v1/plans/status?jobId=${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PlanStatus = await response.json();
      
      if (isMountedRef.current) {
        setStatus(data);
        setError(null);

        if (data.status === 'completed') {
          setIsPolling(false);
          setIsLoading(false);
          onComplete?.(data.planId || '');
        } else if (data.status === 'failed') {
          setIsPolling(false);
          setIsLoading(false);
          const errorMessage = data.error || 'Plan generation failed';
          setError(errorMessage);
          onError?.(errorMessage);
        } else {
          // 继续轮询
          const interval = getPollInterval(retryCount);
          timeoutRef.current = setTimeout(pollStatus, interval);
        }
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      logger.error('Error polling plan status:', err);
      
      if (retryCount < maxRetries) {
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        
        const interval = getPollInterval(newRetryCount);
        timeoutRef.current = setTimeout(pollStatus, interval);
      } else {
        setIsPolling(false);
        setIsLoading(false);
        const errorMessage = 'Unable to connect to our servers. Please check your connection and try again.';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    }
  }, [jobId, retryCount, maxRetries, isPolling, getPollInterval, onComplete, onError]);

  // 重试函数
  const retry = useCallback(() => {
    setRetryCount(0);
    setError(null);
    setIsPolling(true);
    setIsLoading(true);
    setStatus({
      status: 'pending',
      progress: 0,
      estimatedTime: 30,
      message: 'Retrying plan generation...'
    });
  }, []);

  // 停止轮询
  const stop = useCallback(() => {
    setIsPolling(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // 开始轮询
  useEffect(() => {
    if (isPolling) {
      // 初始延迟
      timeoutRef.current = setTimeout(pollStatus, 1000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPolling, pollStatus]);

  // 清理函数
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    status,
    isLoading,
    error,
    retryCount,
    retry,
    stop
  };
}
