"use client";

import { CoachTipPayload } from '@athlete-ally/shared-types';
import clsx from 'clsx';

interface CoachTipCardProps {
  tip: CoachTipPayload;
  isVisible: boolean;
  onDismiss: () => void;
  onAccept: () => void;
}

const severityStyles: Record<CoachTipPayload['severity'], string> = {
  info: 'border-blue-500/60 bg-blue-500/10',
  warning: 'border-amber-500/60 bg-amber-500/10',
  critical: 'border-red-500/70 bg-red-500/10',
};

const severityLabel: Record<CoachTipPayload['severity'], string> = {
  info: 'Heads up',
  warning: 'Take action',
  critical: 'Immediate attention',
};

export function CoachTipCard({ tip, isVisible, onDismiss, onAccept }: CoachTipCardProps) {
  return (
    <aside
      className={clsx(
        'fixed bottom-6 right-6 z-50 w-full max-w-sm rounded-2xl border px-6 py-5 shadow-xl transition-all duration-300',
        'backdrop-blur-sm text-white/90',
        severityStyles[tip.severity],
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      )}
      aria-live="polite"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-wide text-white/60">{severityLabel[tip.severity]}</span>
          <h2 className="mt-1 text-lg font-semibold text-white">{tip.title}</h2>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss coach tip"
          className="ml-4 text-white/50 transition-colors hover:text-white"
        >
          ×
        </button>
      </div>

      <p className="mt-3 text-sm text-white/80">{tip.message}</p>
      <p className="mt-3 text-xs text-white/60">{tip.guidance}</p>

      {tip.scoringContext && (
        <div className="mt-4 flex gap-3 text-xs text-white/55">
          {typeof tip.scoringContext.safetyScore === 'number' && (
            <span>Safety: {(tip.scoringContext.safetyScore * 100).toFixed(0)}%</span>
          )}
          {typeof tip.scoringContext.complianceScore === 'number' && (
            <span>Compliance: {(tip.scoringContext.complianceScore * 100).toFixed(0)}%</span>
          )}
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onAccept}
          className="flex-1 rounded-lg bg-white/90 px-3 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-white"
        >
          {tip.actions[0]?.label ?? 'Apply suggestion'}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="flex-1 rounded-lg border border-white/40 px-3 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10"
        >
          {tip.actions[1]?.label ?? 'Dismiss'}
        </button>
      </div>
    </aside>
  );
}

export default CoachTipCard;
