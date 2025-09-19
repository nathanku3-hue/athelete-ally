"use client";

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSubmitRPEFeedback } from '@/hooks/useSubmitRPEFeedback';
import { useSubmitPerformanceMetrics } from '@/hooks/useSubmitPerformanceMetrics';

function DevFeedbackInner() {
  const rpe = useSubmitRPEFeedback();
  const perf = useSubmitPerformanceMetrics();

  // Simple local form state
  const [sessionId, setSessionId] = useState('session-dev-001');
  const [exerciseId, setExerciseId] = useState('squat');
  const [rpeValue, setRpeValue] = useState(7);
  const [completionRate, setCompletionRate] = useState(100);
  const [notes, setNotes] = useState('Felt pretty good.');

  const [totalVolume, setTotalVolume] = useState(12000);
  const [averageRPE, setAverageRPE] = useState(7);
  const [recoveryTime, setRecoveryTime] = useState(24);
  const [sleepQuality, setSleepQuality] = useState(7);
  const [stressLevel, setStressLevel] = useState(3);

  // Ensure a dev token exists to satisfy gateway auth middleware in local runs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem('token');
      if (!existing) localStorage.setItem('token', 'dev-test-token');
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-12">
      <div className="rounded border p-4">
        <h2 className="text-xl font-semibold mb-4">Dev Only: Submit RPE Feedback</h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">Session ID
            <input className="border w-full px-2 py-1" value={sessionId} onChange={e => setSessionId(e.target.value)} />
          </label>
          <label className="text-sm">Exercise ID
            <input className="border w-full px-2 py-1" value={exerciseId} onChange={e => setExerciseId(e.target.value)} />
          </label>
          <label className="text-sm">RPE (1-10)
            <input type="number" min={1} max={10} className="border w-full px-2 py-1" value={rpeValue} onChange={e => setRpeValue(Number(e.target.value))} />
          </label>
          <label className="text-sm">Completion Rate (0-100)
            <input type="number" min={0} max={100} className="border w-full px-2 py-1" value={completionRate} onChange={e => setCompletionRate(Number(e.target.value))} />
          </label>
        </div>
        <label className="text-sm block mt-3">Notes
          <input className="border w-full px-2 py-1" value={notes} onChange={e => setNotes(e.target.value)} />
        </label>
        <button
          className="mt-4 px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          onClick={() => rpe.mutateAsync({ sessionId, exerciseId, rpe: rpeValue, completionRate, notes, timestamp: new Date().toISOString() } as any)}
          disabled={rpe.isPending}
        >
          {rpe.isPending ? 'Submitting…' : 'Submit RPE'}
        </button>
        <div className="mt-3 text-sm">
          {rpe.isError && <div className="text-red-500">Error: {(rpe.error as any)?.message || 'submit failed'}</div>}
          {rpe.isSuccess && <div className="text-green-600">Submitted successfully.</div>}
        </div>
      </div>

      <div className="rounded border p-4">
        <h2 className="text-xl font-semibold mb-4">Dev Only: Submit Performance Metrics</h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">Session ID
            <input className="border w-full px-2 py-1" value={sessionId} onChange={e => setSessionId(e.target.value)} />
          </label>
          <label className="text-sm">Total Volume
            <input type="number" className="border w-full px-2 py-1" value={totalVolume} onChange={e => setTotalVolume(Number(e.target.value))} />
          </label>
          <label className="text-sm">Average RPE (1-10)
            <input type="number" min={1} max={10} className="border w-full px-2 py-1" value={averageRPE} onChange={e => setAverageRPE(Number(e.target.value))} />
          </label>
          <label className="text-sm">Completion Rate (0-100)
            <input type="number" min={0} max={100} className="border w-full px-2 py-1" value={completionRate} onChange={e => setCompletionRate(Number(e.target.value))} />
          </label>
          <label className="text-sm">Recovery Time (h)
            <input type="number" className="border w-full px-2 py-1" value={recoveryTime} onChange={e => setRecoveryTime(Number(e.target.value))} />
          </label>
          <label className="text-sm">Sleep Quality (1-10)
            <input type="number" min={1} max={10} className="border w-full px-2 py-1" value={sleepQuality} onChange={e => setSleepQuality(Number(e.target.value))} />
          </label>
          <label className="text-sm">Stress Level (1-10)
            <input type="number" min={1} max={10} className="border w-full px-2 py-1" value={stressLevel} onChange={e => setStressLevel(Number(e.target.value))} />
          </label>
        </div>
        <button
          className="mt-4 px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          onClick={() => perf.mutateAsync({ sessionId, totalVolume, averageRPE, completionRate, recoveryTime, sleepQuality, stressLevel, timestamp: new Date().toISOString() } as any)}
          disabled={perf.isPending}
        >
          {perf.isPending ? 'Submitting…' : 'Submit Performance'}
        </button>
        <div className="mt-3 text-sm">
          {perf.isError && <div className="text-red-500">Error: {(perf.error as any)?.message || 'submit failed'}</div>}
          {perf.isSuccess && <div className="text-green-600">Submitted successfully.</div>}
        </div>
      </div>

      {process.env.NODE_ENV !== 'development' && (
        <div className="text-yellow-600 text-sm">This page is intended for development use only.</div>
      )}
    </div>
  );
}

export default function DevFeedbackPage() {
  const qc = new QueryClient();
  return (
    <QueryClientProvider client={qc}>
      <DevFeedbackInner />
    </QueryClientProvider>
  );
}

