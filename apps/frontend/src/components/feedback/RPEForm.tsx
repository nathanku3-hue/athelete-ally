"use client";
import { useEffect, useState } from 'react';
import { useSubmitRPE } from '@/hooks/useFeedback';
import { useToast } from '@/contexts/ToastContext';

export default function RPEForm({ sessionId, exerciseId, onSubmitted }: { sessionId: string; exerciseId: string; onSubmitted?: () => void; }) {
  const submit = useSubmitRPE();
  const { show } = useToast();
  const [rpe, setRpe] = useState(7);
  const [completionRate, setCompletionRate] = useState(100);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ rpe?: string; completionRate?: string; notes?: string }>(() => ({}));
  const [success, setSuccess] = useState<string | null>(null);

  // Basic inline validation
  function validate(next?: { rpe?: number; completionRate?: number; notes?: string }) {
    const v = {
      rpe: next?.rpe ?? rpe,
      completionRate: next?.completionRate ?? completionRate,
      notes: next?.notes ?? notes,
    };
    const e: { rpe?: string; completionRate?: string; notes?: string } = {};
    if (v.rpe == null || Number.isNaN(v.rpe) || v.rpe < 1 || v.rpe > 10) e.rpe = 'RPE must be between 1 and 10';
    if (v.completionRate == null || Number.isNaN(v.completionRate) || v.completionRate < 0 || v.completionRate > 100) e.completionRate = 'Completion must be 0–100%';
    if (v.notes && v.notes.length > 500) e.notes = 'Notes must be 500 characters or less';
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
        exerciseId,
        rpe,
        completionRate,
        notes: notes || undefined,
        timestamp: new Date().toISOString(),
      } as any);
      setSuccess('RPE submitted');
      show('RPE submitted', 'success');
      onSubmitted?.();
      // Optionally clear notes after success
      setNotes('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      show('RPE submit failed', 'error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-sm">RPE (1-10)</label>
        <input
          type="number"
          min={1}
          max={10}
          value={rpe}
          onChange={e => validate({ rpe: Number(e.target.value) }) && setRpe(Number(e.target.value))}
          className="border px-2 py-1 w-full"
          disabled={submit.isPending}
          aria-invalid={!!errors.rpe}
          aria-describedby={errors.rpe ? 'rpe-error' : undefined}
        />
        {errors.rpe && <div id="rpe-error" className="text-xs text-red-500 mt-1">{errors.rpe}</div>}
      </div>
      <div>
        <label className="block text-sm">Completion Rate (%)</label>
        <input
          type="number"
          min={0}
          max={100}
          value={completionRate}
          onChange={e => validate({ completionRate: Number(e.target.value) }) && setCompletionRate(Number(e.target.value))}
          className="border px-2 py-1 w-full"
          disabled={submit.isPending}
          aria-invalid={!!errors.completionRate}
          aria-describedby={errors.completionRate ? 'completion-error' : undefined}
        />
        {errors.completionRate && <div id="completion-error" className="text-xs text-red-500 mt-1">{errors.completionRate}</div>}
      </div>
      <div>
        <label className="block text-sm">Notes</label>
        <textarea
          value={notes}
          onChange={e => validate({ notes: e.target.value }) && setNotes(e.target.value)}
          className="border px-2 py-1 w-full"
          disabled={submit.isPending}
          aria-invalid={!!errors.notes}
          aria-describedby={errors.notes ? 'notes-error' : undefined}
        />
        {errors.notes && <div id="notes-error" className="text-xs text-red-500 mt-1">{errors.notes}</div>}
      </div>
      <button
        type="submit"
        disabled={submit.isPending || Object.keys(errors).length > 0}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 flex items-center gap-2"
      >
        {submit.isPending && <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {submit.isPending ? 'Submitting…' : 'Submit RPE'}
      </button>
      <div role="status" aria-live="polite" className="text-sm mt-1">
        {submit.isError && <div className="text-red-500">Submit failed.</div>}
        {success && <div className="text-green-500">{success}</div>}
      </div>
    </form>
  );
}
