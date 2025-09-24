"use client";
import { useState } from 'react';
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    show('Performance submitted', 'success');
    onSubmitted?.();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm col-span-1">Total Volume<input type="number" value={totalVolume} onChange={e=>setTotalVolume(Number(e.target.value))} className="border px-2 py-1 w-full"/></label>
        <label className="block text-sm col-span-1">Avg RPE<input type="number" min={1} max={10} value={averageRPE} onChange={e=>setAverageRPE(Number(e.target.value))} className="border px-2 py-1 w-full"/></label>
        <label className="block text-sm col-span-1">Completion %<input type="number" min={0} max={100} value={completionRate} onChange={e=>setCompletionRate(Number(e.target.value))} className="border px-2 py-1 w-full"/></label>
        <label className="block text-sm col-span-1">Recovery Time (h)<input type="number" value={recoveryTime} onChange={e=>setRecoveryTime(Number(e.target.value))} className="border px-2 py-1 w-full"/></label>
        <label className="block text-sm col-span-1">Sleep Quality (1-10)<input type="number" min={1} max={10} value={sleepQuality} onChange={e=>setSleepQuality(Number(e.target.value))} className="border px-2 py-1 w-full"/></label>
        <label className="block text-sm col-span-1">Stress Level (1-10)<input type="number" min={1} max={10} value={stressLevel} onChange={e=>setStressLevel(Number(e.target.value))} className="border px-2 py-1 w-full"/></label>
      </div>
      <button type="submit" disabled={submit.isPending} className="px-4 py-2 bg-blue-600 text-white rounded">
        {submit.isPending ? 'Submitting…' : 'Submit Performance'}
      </button>
      {submit.isError && <div className="text-red-500">Submit failed.</div>}
    </form>
  );
}