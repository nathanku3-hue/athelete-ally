"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CuratorLoginForm } from '@/components/curation/CuratorLoginForm';
import { MovementList } from '@/components/curation/MovementList';
import { MovementEditor } from '@/components/curation/MovementEditor';
import { MovementCreateForm } from '@/components/curation/MovementCreateForm';
import {
  curationApi,
  type MovementDraft,
  type MovementDraftUpdateInput,
  type MovementLibraryEntry,
  type MovementStageStatus,
} from '@/lib/api/curation';
import { useAuth } from '@/hooks/useAuth';
import { formatList, movementStatusLabel, statusBadgeClass } from '@/components/curation/helpers';

type StatusSummary = {
  label: string;
  status: MovementStageStatus;
  count: number;
};

export default function CurationPage() {
  const { isAuthenticated, setToken } = useAuth();
  const [drafts, setDrafts] = useState<MovementDraft[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<MovementStageStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [libraryItems, setLibraryItems] = useState<MovementLibraryEntry[]>([]);
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);

  const searchRef = useRef(search);
  const tagRef = useRef(tag);
  const selectedRef = useRef<string | null>(selectedId);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  useEffect(() => {
    tagRef.current = tag;
  }, [tag]);

  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);

  const loadDrafts = useCallback(
    async (overrides?: {
      status?: MovementStageStatus[];
      search?: string;
      tag?: string;
    }) => {
      if (!isAuthenticated) return;
      setLoadingDrafts(true);
      setError(null);
      try {
        const effectiveStatus =
          overrides?.status ??
          (statusFilter !== 'ALL' ? [statusFilter as MovementStageStatus] : undefined);
        const effectiveSearch =
          overrides?.search ?? (searchRef.current.trim() ? searchRef.current.trim() : undefined);
        const effectiveTag = overrides?.tag ?? (tagRef.current.trim() ? tagRef.current.trim() : undefined);

        const result = await curationApi.listDrafts({
          status: effectiveStatus,
          search: effectiveSearch,
          tag: effectiveTag,
        });
        setDrafts(result);

        if (result.length === 0) {
          setSelectedId(null);
        } else {
          const previouslySelected = selectedRef.current;
          if (!previouslySelected || !result.some((item) => item.id === previouslySelected)) {
            setSelectedId(result[0].id);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load drafts');
      } finally {
        setLoadingDrafts(false);
      }
    },
    [isAuthenticated, statusFilter],
  );

  const refreshLibrary = useCallback(
    async (query?: string) => {
      if (!isAuthenticated) return;
      setLibraryLoading(true);
      setLibraryError(null);
      try {
        const result = await curationApi.listLibrary(query?.trim() || librarySearch.trim() || undefined);
        setLibraryItems(result);
      } catch (err) {
        setLibraryError(err instanceof Error ? err.message : 'Failed to load library movements');
      } finally {
        setLibraryLoading(false);
      }
    },
    [isAuthenticated, librarySearch],
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    loadDrafts();
    refreshLibrary();
  }, [isAuthenticated, statusFilter, loadDrafts, refreshLibrary]);

  const handleCreateDraft = async (input: Parameters<typeof curationApi.createDraft>[0]) => {
    setSaving(true);
    try {
      const draft = await curationApi.createDraft(input);
      setShowCreate(false);
      await loadDrafts();
      setSelectedId(draft.id);
      return draft;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async (id: string, payload: MovementDraftUpdateInput) => {
    setSaving(true);
    try {
      await curationApi.updateDraft(id, payload);
      await loadDrafts();
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitDraft = async (id: string, notes?: string) => {
    setSaving(true);
    try {
      await curationApi.submitDraft(id, notes);
      await loadDrafts();
    } finally {
      setSaving(false);
    }
  };

  const handleRequestChanges = async (id: string, notes: string) => {
    setSaving(true);
    try {
      await curationApi.requestChanges(id, notes);
      await loadDrafts();
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id: string, notes?: string) => {
    setSaving(true);
    try {
      await curationApi.approveDraft(id, notes);
      await loadDrafts();
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (
    id: string,
    params: { notes?: string; metadata?: Record<string, unknown> | null },
  ) => {
    setSaving(true);
    try {
      const result = await curationApi.publishDraft(id, params);
      await loadDrafts();
      await refreshLibrary();
      return result;
    } finally {
      setSaving(false);
    }
  };

  const statusSummary = useMemo(() => {
    const counts: Record<MovementStageStatus, number> = {
      DRAFT: 0,
      READY_FOR_REVIEW: 0,
      CHANGES_REQUESTED: 0,
      APPROVED: 0,
      PUBLISHED: 0,
      ARCHIVED: 0,
    };
    drafts.forEach((draft) => {
      counts[draft.status] += 1;
    });
    const list: StatusSummary[] = (Object.keys(counts) as MovementStageStatus[]).map((status) => ({
      label: movementStatusLabel(status),
      status,
      count: counts[status],
    }));
    return list;
  }, [drafts]);

  const selectedDraft = drafts.find((draft) => draft.id === selectedId) ?? null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <CuratorLoginForm onAuthenticate={setToken} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-6 text-white">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Movement Curation Console</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage draft movements, collaborate on reviews, and publish trusted entries to the movement
          library.
        </p>
      </header>

      {error ? (
        <div className="mb-6 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {statusSummary.map((summary) => (
          <div
            key={summary.status}
            className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3"
          >
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(summary.status)}`}
            >
              {summary.label}
            </span>
            <p className="mt-3 text-3xl font-semibold">{summary.count}</p>
            <p className="text-xs text-slate-400">current drafts</p>
          </div>
        ))}
      </section>

      {showCreate ? (
        <div className="mb-6">
          <MovementCreateForm
            onCreate={handleCreateDraft}
            onClose={() => setShowCreate(false)}
            pending={saving}
          />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
        <div className="flex h-[calc(100vh-12rem)] flex-col">
          <MovementList
            drafts={drafts}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onCreate={() => setShowCreate(true)}
            onRefresh={() =>
              loadDrafts({
                status: statusFilter !== 'ALL' ? [statusFilter as MovementStageStatus] : undefined,
                search: searchRef.current.trim() || undefined,
                tag: tagRef.current.trim() || undefined,
              })
            }
            loading={loadingDrafts}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            search={search}
            setSearch={setSearch}
            tag={tag}
            setTag={setTag}
          />
        </div>
        <div className="flex h-[calc(100vh-12rem)] flex-col">
          <MovementEditor
            draft={selectedDraft}
            saving={saving}
            onSave={handleSaveDraft}
            onSubmit={handleSubmitDraft}
            onRequestChanges={handleRequestChanges}
            onApprove={handleApprove}
            onPublish={handlePublish}
          />
        </div>
      </div>

      <section className="mt-8 rounded-lg border border-slate-800 bg-slate-900/70 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Published movement library</h2>
            <p className="text-xs text-slate-400">
              Search published entries to confirm slug availability or review prior versions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="search"
              value={librarySearch}
              onChange={(event) => setLibrarySearch(event.target.value)}
              placeholder="Search by name, classification, tag…"
              className="w-64 rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => refreshLibrary(librarySearch)}
              className="rounded-md border border-slate-700 px-4 py-1.5 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:text-slate-500"
              disabled={libraryLoading}
            >
              {libraryLoading ? 'Loading…' : 'Search'}
            </button>
          </div>
        </div>

        {libraryError ? (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {libraryError}
          </div>
        ) : null}

        {libraryItems.length === 0 ? (
          <p className="text-sm text-slate-400">No published movements found for this query.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2">Version</th>
                  <th className="px-3 py-2">Classification</th>
                  <th className="px-3 py-2">Primary muscles</th>
                  <th className="px-3 py-2">Tags</th>
                  <th className="px-3 py-2">Published</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {libraryItems.map((item) => (
                  <tr key={`${item.id}-${item.version}`} className="hover:bg-slate-800/40">
                    <td className="px-3 py-2 font-mono text-xs text-blue-200">{item.slug}</td>
                    <td className="px-3 py-2 text-xs text-slate-300">{item.version}</td>
                    <td className="px-3 py-2 text-xs text-slate-300">{item.classification}</td>
                    <td className="px-3 py-2 text-xs text-slate-400">{formatList(item.primaryMuscles)}</td>
                    <td className="px-3 py-2 text-xs text-slate-400">{formatList(item.tags)}</td>
                    <td className="px-3 py-2 text-xs text-slate-400">
                      {new Date(item.publishedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

