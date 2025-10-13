"use client";

import type { MovementDraft, MovementStageStatus } from '@/lib/api/curation';
import { movementStatusLabel, statusBadgeClass } from './helpers';

type MovementListProps = {
  drafts: MovementDraft[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRefresh: () => void;
  loading: boolean;
  statusFilter: MovementStageStatus | 'ALL';
  setStatusFilter: (status: MovementStageStatus | 'ALL') => void;
  search: string;
  setSearch: (value: string) => void;
  tag: string;
  setTag: (value: string) => void;
};

export function MovementList({
  drafts,
  selectedId,
  onSelect,
  onCreate,
  onRefresh,
  loading,
  statusFilter,
  setStatusFilter,
  search,
  setSearch,
  tag,
  setTag,
}: MovementListProps) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as MovementStageStatus | 'ALL')}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="READY_FOR_REVIEW">Ready for review</option>
            <option value="CHANGES_REQUESTED">Changes requested</option>
            <option value="APPROVED">Approved</option>
            <option value="PUBLISHED">Recently published</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, classification, tag…"
            className="w-56 rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <input
            type="text"
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            placeholder="Filter by tag"
            className="w-40 rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
          <button
            type="button"
            onClick={onCreate}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            New Draft
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50">
        <div className="grid grid-cols-[auto_1fr_auto] border-b border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <span className="w-32">Status</span>
          <span>Name</span>
          <span className="w-32 text-right">Updated</span>
        </div>
        <div className="h-full overflow-y-auto">
          {drafts.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-400">No drafts match the current filters.</p>
          ) : (
            drafts.map((draft) => {
              const isSelected = draft.id === selectedId;
              return (
                <button
                  key={draft.id}
                  type="button"
                  onClick={() => onSelect(draft.id)}
                  className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 text-left transition ${
                    isSelected ? 'bg-slate-800/80' : 'hover:bg-slate-800/60'
                  }`}
                >
                  <span className={`w-32 rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(draft.status)}`}>
                    {movementStatusLabel(draft.status)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-white">{draft.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-slate-400">
                      {draft.classification} • {draft.tags.join(', ') || 'No tags'}
                    </span>
                  </span>
                  <span className="w-32 text-right text-xs text-slate-400">
                    {new Date(draft.updatedAt).toLocaleString()}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

