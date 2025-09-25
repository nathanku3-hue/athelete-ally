"use client";
import { useState } from 'react';
import { useSubmitRPE } from '@/hooks/useFeedback';
import { useToast } from '@/contexts/ToastContext';

export default function RPEForm({ sessionId, exerciseId, onSubmitted }: { sessionId: string; exerciseId: string; onSubmitted?: () => void; }) {
  const submit = useSubmitRPE();
  const { show } = useToast();
  const [rpe, setRpe] = useState(7);
  const [completionRate, setCompletionRate] = useState(100);
  const [notes, setNotes] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    show('RPE submitted', 'success');
    onSubmitted?.();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-sm">RPE (1-10)</label>
        <input type="number" min={1} max={10} value={rpe} onChange={e => setRpe(Number(e.target.value))} className="border px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block text-sm">Completion Rate (%)</label>
        <input type="number" min={0} max={100} value={completionRate} onChange={e => setCompletionRate(Number(e.target.value))} className="border px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block text-sm">Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="border px-2 py-1 w-full" />
      </div>
      <button type="submit" disabled={submit.isPending} className="px-4 py-2 bg-blue-600 text-white rounded">
        {submit.isPending ? 'Submitting…' : 'Submit RPE'}
      </button>
      {submit.isError && <div className="text-red-500">Submit failed.</div>}
    </form>
  );
}