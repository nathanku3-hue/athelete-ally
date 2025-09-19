import React, { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSubmitRPEFeedback } from '@/hooks/useSubmitRPEFeedback';
import { useSubmitPerformanceMetrics } from '@/hooks/useSubmitPerformanceMetrics';

// Mock fetch
global.fetch = jest.fn();

function withClient(children: React.ReactNode) {
  const qc = new QueryClient();
  return (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

function RPEComponent({ payload, onDone }: { payload: any; onDone: (r: any) => void }) {
  const m = useSubmitRPEFeedback();
  useEffect(() => {
    m.mutateAsync(payload).then(onDone).catch(onDone);
  }, [payload]);
  return null;
}

function PerfComponent({ payload, onDone }: { payload: any; onDone: (r: any) => void }) {
  const m = useSubmitPerformanceMetrics();
  useEffect(() => {
    m.mutateAsync(payload).then(onDone).catch(onDone);
  }, [payload]);
  return null;
}

describe('Magic Slice Hooks', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockReset();
  });

  it('submits RPE feedback to BFF route', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { ok: true } })
    });

    const payload = {
      sessionId: 'session-1',
      exerciseId: 'squat',
      rpe: 8,
      completionRate: 100,
      notes: 'Good',
      timestamp: new Date().toISOString(),
    };

    const onDone = jest.fn();
    render(withClient(<RPEComponent payload={payload} onDone={onDone} />));

    await waitFor(() => expect(onDone).toHaveBeenCalled());

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/plans/feedback/rpe'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('submits performance metrics to BFF route', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { ok: true } })
    });

    const payload = {
      sessionId: 'session-2',
      totalVolume: 12000,
      averageRPE: 7,
      completionRate: 95,
      recoveryTime: 24,
      sleepQuality: 7,
      stressLevel: 3,
      timestamp: new Date().toISOString(),
    };

    const onDone = jest.fn();
    render(withClient(<PerfComponent payload={payload} onDone={onDone} />));

    await waitFor(() => expect(onDone).toHaveBeenCalled());

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/plans/feedback/performance'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});

