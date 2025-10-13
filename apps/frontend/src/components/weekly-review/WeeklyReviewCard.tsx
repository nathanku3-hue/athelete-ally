"use client";

import { WeeklyReviewSummary } from '@athlete-ally/shared-types';

interface WeeklyReviewCardProps {
  review: WeeklyReviewSummary;
  onApply: () => void;
  isApplying: boolean;
}

export function WeeklyReviewCard({ review, onApply, isApplying }: WeeklyReviewCardProps) {
  return (
    <section className="rounded-2xl border border-blue-500/40 bg-blue-500/10 p-6 text-white">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-blue-200">Weekly Review</p>
          <h2 className="text-xl font-semibold text-white">{review.headline}</h2>
        </div>
        {review.status === 'pending' && (
          <span className="inline-flex h-3 w-3 animate-pulse rounded-full bg-blue-300" aria-label="New weekly review" />
        )}
      </header>

      <ul className="mt-4 space-y-3 text-sm text-blue-100">
        {review.adjustments.map((adjustment) => (
          <li key={adjustment.metric} className="flex items-center justify-between gap-4 rounded-lg bg-blue-500/5 p-3">
            <div>
              <p className="font-medium text-white/90">{adjustment.metric}</p>
              <p className="text-xs text-blue-200">{adjustment.summary}</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-blue-100">Baseline: {adjustment.baseline}{adjustment.unit === 'percent' ? '%' : ''}</p>
              <p className="text-blue-200">After: {adjustment.adjusted}{adjustment.unit === 'percent' ? '%' : ''}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-sm text-blue-200">{review.recommendation}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        {review.status === 'pending' ? (
          <button
            type="button"
            onClick={onApply}
            disabled={isApplying}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:bg-white/60"
          >
            {isApplying ? 'Applying…' : 'Apply adjustments'}
          </button>
        ) : (
          <span className="rounded-lg bg-blue-600/20 px-3 py-1 text-xs font-semibold text-blue-200">
            Adjustments applied
          </span>
        )}
      </div>
    </section>
  );
}

export default WeeklyReviewCard;
