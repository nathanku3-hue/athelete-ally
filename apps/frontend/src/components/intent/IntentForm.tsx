'use client';
import { useState } from 'react';
import { useGeneratePlan } from '@/hooks/useGeneratePlan';
import { useRouter } from 'next/navigation';

export default function IntentForm() {
  const router = useRouter();
  const gen = useGeneratePlan();
  const [userId, setUserId] = useState('00000000-0000-4000-8000-000000000001');
  const [availableDays, setAvailableDays] = useState(3);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      userId,
      trainingIntent: {
        primaryGoal: 'strength',
        secondaryGoals: [],
        experienceLevel: 'beginner',
        timeConstraints: { availableDays, sessionDuration: 60, preferredTimes: [] },
        equipment: ['bodyweight'],
        limitations: [],
        preferences: { intensity: 'low', style: 'traditional', progression: 'linear' },
      },
      currentFitnessLevel: { strength: 5, endurance: 5, flexibility: 5, mobility: 5 },
      injuryHistory: [],
      performanceGoals: { shortTerm: [], mediumTerm: [], longTerm: [] },
      feedbackHistory: [],
    } as any;

    const res = await gen.mutateAsync(payload);
    if (typeof window !== 'undefined') localStorage.setItem('planGenerationJobId', res.jobId);
    router.push(`/onboarding/generating?jobId=${res.jobId}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1">User ID (dev)</label>
        <input value={userId} onChange={e => setUserId(e.target.value)} className="border px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block text-sm mb-1">Available Days</label>
        <input type="number" min={1} max={7} value={availableDays} onChange={e => setAvailableDays(Number(e.target.value))} className="border px-2 py-1 w-full" />
      </div>
      <button type="submit" disabled={gen.isPending} className="px-4 py-2 bg-blue-600 text-white rounded">
        {gen.isPending ? 'Submitting…' : 'Generate Plan'}
      </button>
      {gen.isError && <div className="text-red-500">Failed: {(gen.error as any)?.message || 'Please try again'}</div>}
    </form>
  );
}