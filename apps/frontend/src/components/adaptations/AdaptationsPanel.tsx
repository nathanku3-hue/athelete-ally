"use client";
import { useState } from 'react';
import { useAdaptations, useApplyAdaptations } from '@/hooks/useAdaptations';
import { useToast } from '@/contexts/ToastContext';

interface Adaptation {
  type?: string;
  rationale?: string;
}

export default function AdaptationsPanel({ planId }: { planId: string }) {
  const { data, isLoading, error } = useAdaptations(planId, !!planId);
  const apply = useApplyAdaptations(planId);
  const { show } = useToast();
  const [selected, setSelected] = useState<Adaptation[]>([]);

  if (isLoading) return <div>Loading adaptations…</div>;
  if (error) return <div role="alert">Failed to load adaptations.</div>;

  const adaptations = data?.adaptations || [];

  function toggle(item: Adaptation) {
    setSelected((cur) =>
      cur.includes(item) ? cur.filter((x) => x !== item) : [...cur, item]
    );
  }

  async function onApply() {
    show('Adaptations applied', 'success');
    setSelected([]);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Adaptation Suggestions</h3>
      <ul className="space-y-2">
        {adaptations.map((a, idx) => (
          <li key={idx} className="p-3 bg-gray-800 rounded flex items-start space-x-3">
            <input
              type="checkbox"
              className="mt-1"
              checked={selected.includes(a)}
              onChange={() => toggle(a)}
            />
            <div>
              <div className="font-medium">{a.type || 'adjustment'}</div>
              <div className="text-gray-400 text-sm">{a.rationale || '—'}</div>
            </div>
          </li>
        ))}
      </ul>
      <button
        disabled={apply.isPending || selected.length === 0}
        onClick={onApply}
        className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-700"
      >
        {apply.isPending ? 'Applying…' : 'Apply Selected'}
      </button>
      {apply.isError && <div role="alert" className="text-red-400">Failed to apply. Please try again.</div>}
    </div>
  );
}