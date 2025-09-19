"use client";
import { useEffect, useState } from 'react';
import { useSubmitPerformance } from '@/hooks/useFeedback';
import { useToast } from '@/contexts/ToastContext';

export default function PerformanceForm({ sessionId, onSubmitted }: { sessionId: string; onSubmitted?: () => void; }) {
  const submit = useSubmitPerformance();
  const { show } = useToast();
  const [totalVolume, setTotalVolume] = useState(0);
  const [averageRPE, setAverageRPE] = useState(7);
  const [completionRate, setCompletionRate] = useState(100);
  const [recoveryTime, setRecoveryTime] = useState(24);
  const [sleepQuality, setSleepQuality] = useState(7);
  const [stressLevel, setStressLevel] = useState(4);
  const [errors, setErrors] = useState<{ totalVolume?: string; averageRPE?: string; completionRate?: string; recoveryTime?: string; sleepQuality?: string; stressLevel?: string }>({});
  const [success, setSuccess] = useState<string | null>(null);

  // Inline validation
  function validate(next?: Partial<{ totalVolume: number; averageRPE: number; completionRate: number; recoveryTime: number; sleepQuality: number; stressLevel: number }>) {
    const v = {
      totalVolume: next?.totalVolume ?? totalVolume,
      averageRPE: next?.averageRPE ?? averageRPE,
      completionRate: next?.completionRate ?? completionRate,
      recoveryTime: next?.recoveryTime ?? recoveryTime,
      sleepQuality: next?.sleepQuality ?? sleepQuality,
      stressLevel: next?.stressLevel ?? stressLevel,
    };
    const e: typeof errors = {};
    if (v.totalVolume == null || Number.isNaN(v.totalVolume) || v.totalVolume < 0) e.totalVolume = 'Volume must be >= 0';
    if (v.averageRPE == null || Number.isNaN(v.averageRPE) || v.averageRPE < 1 || v.averageRPE > 10) e.averageRPE = 'Avg RPE must be 1–10';
    if (v.completionRate == null || Number.isNaN(v.completionRate) || v.completionRate < 0 || v.completionRate > 100) e.completionRate = 'Completion must be 0–100%';
    if (v.recoveryTime == null || Number.isNaN(v.recoveryTime) || v.recoveryTime < 0) e.recoveryTime = 'Recovery must be >= 0h';
    if (v.sleepQuality == null || Number.isNaN(v.sleepQuality) || v.sleepQuality < 1 || v.sleepQuality > 10) e.sleepQuality = 'Sleep quality must be 1–10';
    if (v.stressLevel == null || Number.isNaN(v.stressLevel) || v.stressLevel < 1 || v.stressLevel > 10) e.stressLevel = 'Stress level must be 1–10';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  useEffect(() => { validate(); }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(null);
    if (!validate()) {
      show('Please fix validation errors', 'error');
      return;
    }
    try {
      await submit.mutateAsync({
        sessionId,
        totalVolume,
        averageRPE,
        completionRate,
        recoveryTime,
        sleepQuality,
        stressLevel,
        timestamp: new Date().toISOString(),
      } as any);
      setSuccess('Performance submitted');
      show('Performance submitted', 'success');
      onSubmitted?.();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      show('Performance submit failed', 'error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm col-span-1">Total Volume
          <input type="number" value={totalVolume} onChange={e=> validate({ totalVolume: Number(e.target.value) }) && setTotalVolume(Number(e.target.value))} className="border px-2 py-1 w-full" disabled={submit.isPending} aria-invalid={!!errors.totalVolume} aria-describedby={errors.totalVolume ? 'vol-error' : undefined} />
          {errors.totalVolume && <div id="vol-error" className="text-xs text-red-500 mt-1">{errors.totalVolume}</div>}
        </label>
        <label className="block text-sm col-span-1">Avg RPE
          <input type="number" min={1} max={10} value={averageRPE} onChange={e=> validate({ averageRPE: Number(e.target.value) }) && setAverageRPE(Number(e.target.value))} className="border px-2 py-1 w-full" disabled={submit.isPending} aria-invalid={!!errors.averageRPE} aria-describedby={errors.averageRPE ? 'avg-error' : undefined} />
          {errors.averageRPE && <div id="avg-error" className="text-xs text-red-500 mt-1">{errors.averageRPE}</div>}
        </label>
        <label className="block text-sm col-span-1">Completion %
          <input type="number" min={0} max={100} value={completionRate} onChange={e=> validate({ completionRate: Number(e.target.value) }) && setCompletionRate(Number(e.target.value))} className="border px-2 py-1 w-full" disabled={submit.isPending} aria-invalid={!!errors.completionRate} aria-describedby={errors.completionRate ? 'comp-error' : undefined} />
          {errors.completionRate && <div id="comp-error" className="text-xs text-red-500 mt-1">{errors.completionRate}</div>}
        </label>
        <label className="block text-sm col-span-1">Recovery Time (h)
          <input type="number" value={recoveryTime} onChange={e=> validate({ recoveryTime: Number(e.target.value) }) && setRecoveryTime(Number(e.target.value))} className="border px-2 py-1 w-full" disabled={submit.isPending} aria-invalid={!!errors.recoveryTime} aria-describedby={errors.recoveryTime ? 'rec-error' : undefined} />
          {errors.recoveryTime && <div id="rec-error" className="text-xs text-red-500 mt-1">{errors.recoveryTime}</div>}
        </label>
        <label className="block text-sm col-span-1">Sleep Quality (1-10)
          <input type="number" min={1} max={10} value={sleepQuality} onChange={e=> validate({ sleepQuality: Number(e.target.value) }) && setSleepQuality(Number(e.target.value))} className="border px-2 py-1 w-full" disabled={submit.isPending} aria-invalid={!!errors.sleepQuality} aria-describedby={errors.sleepQuality ? 'sleep-error' : undefined} />
          {errors.sleepQuality && <div id="sleep-error" className="text-xs text-red-500 mt-1">{errors.sleepQuality}</div>}
        </label>
        <label className="block text-sm col-span-1">Stress Level (1-10)
          <input type="number" min={1} max={10} value={stressLevel} onChange={e=> validate({ stressLevel: Number(e.target.value) }) && setStressLevel(Number(e.target.value))} className="border px-2 py-1 w-full" disabled={submit.isPending} aria-invalid={!!errors.stressLevel} aria-describedby={errors.stressLevel ? 'stress-error' : undefined} />
          {errors.stressLevel && <div id="stress-error" className="text-xs text-red-500 mt-1">{errors.stressLevel}</div>}
        </label>
      </div>
      <button type="submit" disabled={submit.isPending || Object.keys(errors).length > 0} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 flex items-center gap-2">
        {submit.isPending && <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {submit.isPending ? 'Submitting…' : 'Submit Performance'}
      </button>
      <div role="status" aria-live="polite" className="text-sm mt-1">
        {submit.isError && <div className="text-red-500">Submit failed.</div>}
        {success && <div className="text-green-500">{success}</div>}
      </div>
    </form>
  );
}
