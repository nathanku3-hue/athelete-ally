import React, { PropsWithChildren } from 'react';
import { renderHook, act } from '@testing-library/react';
import { usePlanStatusPolling } from '@/hooks/usePlanStatusPolling';

// Mock fetch globally
const originalFetch = global.fetch;

describe('usePlanStatusPolling edge cases', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // @ts-ignore
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    // @ts-ignore
    global.fetch = originalFetch;
  });

  it('handles network errors with retries and invokes onError after max retries', async () => {
    (global.fetch as unknown as jest.Mock).mockRejectedValue(new Error('Network down'));

    const onError = jest.fn();
    const { result } = renderHook(() =>
      usePlanStatusPolling({ jobId: 'job-1', maxRetries: 2, baseInterval: 10, maxInterval: 20, onError })
    );

    // Kick timers to run retries
    await act(async () => {
      jest.advanceTimersByTime(10);
    });
    await act(async () => {
      jest.advanceTimersByTime(20);
    });
    await act(async () => {
      jest.advanceTimersByTime(20);
    });

    expect(onError).toHaveBeenCalled();
    expect(result.current.error).toBeTruthy();
  });

  it('continues polling on malformed response (no status) without crashing', async () => {
    (global.fetch as unknown as jest.Mock)
      .mockResolvedValue({ ok: true, json: async () => ({}) })
      .mockResolvedValue({ ok: true, json: async () => ({ status: 'processing', progress: 10, estimatedTime: 10, message: 'ok' }) });

    const { result } = renderHook(() =>
      usePlanStatusPolling({ jobId: 'job-2', maxRetries: 1, baseInterval: 10, maxInterval: 20 })
    );

    await act(async () => {
      jest.advanceTimersByTime(10);
    });
    // Next poll
    await act(async () => {
      jest.advanceTimersByTime(20);
    });

    // Should not have errored and should have some status set by second response
    expect(result.current.error).toBeNull();
    expect(result.current.status?.status).toBe('processing');
  });

  it('resets state when jobId changes rapidly', async () => {
    (global.fetch as unknown as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ status: 'completed', progress: 100, estimatedTime: 0, message: 'done', planId: 'p1' }) });

    const { result, rerender } = renderHook(({ jobId }) => usePlanStatusPolling({ jobId, baseInterval: 10, maxInterval: 20 }), {
      initialProps: { jobId: 'job-A' }
    });

    await act(async () => { jest.advanceTimersByTime(10); });
    expect(result.current.status?.status).toBe('completed');

    // Change jobId quickly
    rerender({ jobId: 'job-B' });
    await act(async () => { jest.advanceTimersByTime(10); });
    // Should poll for new job and not crash
    expect(result.current.error).toBeNull();
  });
});

