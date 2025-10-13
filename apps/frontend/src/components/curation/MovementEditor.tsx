"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import type {
  MovementDraft,
  MovementDraftUpdateInput,
  MovementLibraryEntry,
  MovementStageStatus,
} from '@/lib/api/curation';
import { movementStatusLabel, statusBadgeClass, formatList } from './helpers';

type MovementEditorProps = {
  draft: MovementDraft | null;
  saving: boolean;
  onSave: (id: string, input: MovementDraftUpdateInput) => Promise<void>;
  onSubmit: (id: string, notes?: string) => Promise<void>;
  onRequestChanges: (id: string, notes: string) => Promise<void>;
  onApprove: (id: string, notes?: string) => Promise<void>;
  onPublish: (
    id: string,
    params: { notes?: string; metadata?: Record<string, unknown> | null },
  ) => Promise<{ draft: MovementDraft; library: MovementLibraryEntry }>;
};

type MovementFormState = {
  name: string;
  slug: string;
  classification: string;
  equipment: string;
  primaryMuscles: string;
  secondaryMuscles: string;
  progressionIds: string;
  regressionIds: string;
  tags: string;
  recommendedRpe: string;
  instructionsSetup: string;
  instructionsExecution: string;
  instructionsCues: string;
  instructionsMistakes: string;
  instructionsBreathing: string;
  instructionsCoaching: string;
  metadata: string;
};

const defaultFormState: MovementFormState = {
  name: '',
  slug: '',
  classification: '',
  equipment: '',
  primaryMuscles: '',
  secondaryMuscles: '',
  progressionIds: '',
  regressionIds: '',
  tags: '',
  recommendedRpe: '',
  instructionsSetup: '',
  instructionsExecution: '',
  instructionsCues: '',
  instructionsMistakes: '',
  instructionsBreathing: '',
  instructionsCoaching: '',
  metadata: '',
};

const toCommaSeparated = (values: string[] | undefined | null) =>
  values && values.length > 0 ? values.join(', ') : '';
const toMultiline = (values: string[] | undefined | null) =>
  values && values.length > 0 ? values.join('\n') : '';

const movementToForm = (draft: MovementDraft | null): MovementFormState => {
  if (!draft) return { ...defaultFormState };
  return {
    name: draft.name ?? '',
    slug: draft.slug ?? '',
    classification: draft.classification ?? '',
    equipment: toCommaSeparated(draft.equipment),
    primaryMuscles: toCommaSeparated(draft.primaryMuscles),
    secondaryMuscles: toCommaSeparated(draft.secondaryMuscles),
    progressionIds: toCommaSeparated(draft.progressionIds),
    regressionIds: toCommaSeparated(draft.regressionIds),
    tags: toCommaSeparated(draft.tags),
    recommendedRpe: draft.recommendedRpe?.toString() ?? '',
    instructionsSetup: draft.instructions?.setup ?? '',
    instructionsExecution: toMultiline(draft.instructions?.execution),
    instructionsCues: toMultiline(draft.instructions?.cues),
    instructionsMistakes: toMultiline(draft.instructions?.commonMistakes),
    instructionsBreathing: toMultiline(draft.instructions?.breathing),
    instructionsCoaching: toMultiline(draft.instructions?.coachingTips),
    metadata: draft.metadata ? JSON.stringify(draft.metadata, null, 2) : '',
  };
};

const parseList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const parseMultiline = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const deriveActionAvailability = (status: MovementStageStatus) => ({
  canSubmit: status === 'DRAFT' || status === 'CHANGES_REQUESTED',
  canRequestChanges: status === 'READY_FOR_REVIEW' || status === 'APPROVED',
  canApprove: status === 'READY_FOR_REVIEW',
  canPublish: status === 'APPROVED',
});

export function MovementEditor({
  draft,
  saving,
  onSave,
  onSubmit,
  onRequestChanges,
  onApprove,
  onPublish,
}: MovementEditorProps) {
  const [form, setForm] = useState<MovementFormState>(() => movementToForm(draft));
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  useEffect(() => {
    setForm(movementToForm(draft));
    setError(null);
    setNotes('');
    setPublishMessage(null);
  }, [draft]);

  const actionAvailability = useMemo(
    () => (draft ? deriveActionAvailability(draft.status) : null),
    [draft],
  );

  const handleChange =
    (key: keyof MovementFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({
        ...prev,
        [key]: event.target.value,
      }));
    };

  const buildUpdatePayload = (): MovementDraftUpdateInput => {
    const name = form.name.trim();
    const classification = form.classification.trim();
    const primaryMuscles = parseList(form.primaryMuscles);

    if (!draft) {
      throw new Error('No draft selected');
    }

    if (!name) throw new Error('Name is required');
    if (!classification) throw new Error('Classification is required');
    if (primaryMuscles.length === 0) throw new Error('At least one primary muscle is required');

    let recommendedRpe: number | undefined;
    if (form.recommendedRpe.trim().length > 0) {
      const numeric = Number(form.recommendedRpe);
      if (!Number.isFinite(numeric) || numeric < 1 || numeric > 10) {
        throw new Error('Recommended RPE must be between 1 and 10');
      }
      recommendedRpe = numeric;
    }

    let metadata: Record<string, unknown> | null | undefined;
    if (form.metadata.trim().length > 0) {
      try {
        metadata = JSON.parse(form.metadata) as Record<string, unknown>;
        if (metadata && typeof metadata !== 'object') {
          throw new Error('Metadata must be a JSON object');
        }
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Failed to parse metadata as JSON object',
        );
      }
    } else {
      metadata = null;
    }

    const instructionsPayload = {
      setup: form.instructionsSetup.trim() || undefined,
      execution: parseMultiline(form.instructionsExecution),
      cues: parseMultiline(form.instructionsCues),
      commonMistakes: parseMultiline(form.instructionsMistakes),
      breathing: parseMultiline(form.instructionsBreathing),
      coachingTips: parseMultiline(form.instructionsCoaching),
    };

    const instructionsKeys = Object.entries(instructionsPayload).filter(
      ([, value]) =>
        (Array.isArray(value) && value.length > 0) || (typeof value === 'string' && value.length > 0),
    );

    const updatePayload: MovementDraftUpdateInput = {
      name,
      classification,
      primaryMuscles,
      equipment: parseList(form.equipment),
      secondaryMuscles: parseList(form.secondaryMuscles),
      progressionIds: parseList(form.progressionIds),
      regressionIds: parseList(form.regressionIds),
      tags: parseList(form.tags),
      recommendedRpe,
      slug: form.slug.trim() || undefined,
      metadata,
    };

    if (instructionsKeys.length > 0) {
      updatePayload.instructions = {
        setup: instructionsPayload.setup,
        execution: instructionsPayload.execution ?? undefined,
        cues: instructionsPayload.cues ?? undefined,
        commonMistakes: instructionsPayload.commonMistakes ?? undefined,
        breathing: instructionsPayload.breathing ?? undefined,
        coachingTips: instructionsPayload.coachingTips ?? undefined,
      };
    } else if (draft.instructions) {
      updatePayload.instructions = null;
    }

    return updatePayload;
  };

  const handleSave = async () => {
    if (!draft) return;
    try {
      setError(null);
      const payload = buildUpdatePayload();
      await onSave(draft.id, payload);
      setPublishMessage('Draft saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update draft');
    }
  };

  const handleSubmit = async () => {
    if (!draft) return;
    try {
      setError(null);
      await onSubmit(draft.id, notes.trim() ? notes.trim() : undefined);
      setPublishMessage('Submitted for review.');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit draft');
    }
  };

  const handleRequestChanges = async () => {
    if (!draft) return;
    if (!notes.trim()) {
      setError('Notes are required when requesting changes.');
      return;
    }
    try {
      setError(null);
      await onRequestChanges(draft.id, notes.trim());
      setPublishMessage('Requested changes from author.');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request changes');
    }
  };

  const handleApprove = async () => {
    if (!draft) return;
    try {
      setError(null);
      await onApprove(draft.id, notes.trim() ? notes.trim() : undefined);
      setPublishMessage('Draft approved.');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve draft');
    }
  };

  const handlePublish = async () => {
    if (!draft) return;
    try {
      setError(null);
      const payload = buildUpdatePayload();
      await onSave(draft.id, payload); // ensure latest fields persisted before publish
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes before publish');
      return;
    }

    try {
      const metadata = form.metadata.trim()
        ? (JSON.parse(form.metadata) as Record<string, unknown>)
        : null;
      const result = await onPublish(draft.id, {
        notes: notes.trim() || undefined,
        metadata,
      });
      setPublishMessage(`Published ${result.library.slug} v${result.library.version} successfully.`);
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish draft');
    }
  };

  if (!draft) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/40">
        <p className="text-sm text-slate-400">
          Select a draft from the left to review metadata, edit details, and advance its status.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className={`inline-flex items-center gap-2`}>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(draft.status)}`}>
              {movementStatusLabel(draft.status)}
            </span>
            <span className="text-xs text-slate-400">
              Updated {new Date(draft.updatedAt).toLocaleString()}
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-white">{draft.name}</h2>
          <p className="text-sm text-slate-400">
            Last edited by <span className="font-medium text-slate-200">{draft.updatedById}</span>
          </p>
        </div>
        <div className="rounded-md border border-slate-800 bg-slate-950 px-4 py-2 text-xs text-slate-400">
          <p>
            Reviewer: <span className="text-slate-200">{draft.reviewerId ?? '—'}</span>
          </p>
          <p>
            Reviewed at:{' '}
            <span className="text-slate-200">
              {draft.reviewedAt ? new Date(draft.reviewedAt).toLocaleString() : '—'}
            </span>
          </p>
          <p>
            Review notes: <span className="text-slate-200">{draft.reviewNotes ?? '—'}</span>
          </p>
        </div>
      </header>

      {error ? <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}
      {publishMessage ? (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          {publishMessage}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto pr-1">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Name
            <input
              value={form.name}
              onChange={handleChange('name')}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Slug
            <input
              value={form.slug}
              onChange={handleChange('slug')}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Classification
            <input
              value={form.classification}
              onChange={handleChange('classification')}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Recommended RPE
            <input
              value={form.recommendedRpe}
              onChange={handleChange('recommendedRpe')}
              placeholder="1-10"
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Equipment"
            placeholder="comma separated"
            value={form.equipment}
            onChange={handleChange('equipment')}
          />
          <Field
            label="Primary muscles"
            placeholder="comma separated"
            value={form.primaryMuscles}
            onChange={handleChange('primaryMuscles')}
            required
          />
          <Field
            label="Secondary muscles"
            placeholder="comma separated"
            value={form.secondaryMuscles}
            onChange={handleChange('secondaryMuscles')}
          />
          <Field
            label="Tags"
            placeholder="comma separated"
            value={form.tags}
            onChange={handleChange('tags')}
          />
          <Field
            label="Progression IDs"
            placeholder="comma separated"
            value={form.progressionIds}
            onChange={handleChange('progressionIds')}
          />
          <Field
            label="Regression IDs"
            placeholder="comma separated"
            value={form.regressionIds}
            onChange={handleChange('regressionIds')}
          />
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextArea
            label="Setup guidance"
            value={form.instructionsSetup}
            onChange={handleChange('instructionsSetup')}
          />
          <TextArea
            label="Execution steps (one per line)"
            value={form.instructionsExecution}
            onChange={handleChange('instructionsExecution')}
          />
          <TextArea
            label="Coaching cues (one per line)"
            value={form.instructionsCues}
            onChange={handleChange('instructionsCues')}
          />
          <TextArea
            label="Common mistakes (one per line)"
            value={form.instructionsMistakes}
            onChange={handleChange('instructionsMistakes')}
          />
          <TextArea
            label="Breathing (one per line)"
            value={form.instructionsBreathing}
            onChange={handleChange('instructionsBreathing')}
          />
          <TextArea
            label="Coaching tips (one per line)"
            value={form.instructionsCoaching}
            onChange={handleChange('instructionsCoaching')}
          />
        </section>

        <section>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Metadata (JSON)
            <textarea
              value={form.metadata}
              onChange={handleChange('metadata')}
              rows={6}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder='{"videoUrl": "...", "equipmentNotes": "..."}'
            />
          </label>
        </section>

        <section className="rounded-md border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="text-sm font-semibold text-white">Library snapshot</h3>
          <p className="mt-1 text-xs text-slate-400">
            Latest published version will appear after publishing. Use this panel to quickly confirm
            canonical metadata.
          </p>
          {draft.publishedMovementId ? (
            <div className="mt-3 space-y-2 text-xs text-slate-300">
              <p>
                Published movement ID:{' '}
                <span className="font-mono text-slate-200">{draft.publishedMovementId}</span>
              </p>
              <p>Primary: {formatList(draft.primaryMuscles)}</p>
              <p>Tags: {formatList(draft.tags)}</p>
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-500">Movement has not been published yet.</p>
          )}
        </section>
      </div>

      <section className="flex flex-col gap-3 rounded-md border border-slate-800 bg-slate-900/70 p-4">
        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Action notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Optional reviewer notes, publish changelog, or requested fixes."
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-800/60"
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save draft'}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-600/50"
            disabled={saving || !actionAvailability?.canSubmit}
          >
            {saving ? 'Working…' : 'Submit for review'}
          </button>
          <button
            type="button"
            onClick={handleRequestChanges}
            className="rounded-md bg-amber-500/30 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/40 disabled:cursor-not-allowed disabled:bg-amber-500/20"
            disabled={saving || !actionAvailability?.canRequestChanges}
          >
            Request changes
          </button>
          <button
            type="button"
            onClick={handleApprove}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-600/40"
            disabled={saving || !actionAvailability?.canApprove}
          >
            Approve
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-purple-600/40"
            disabled={saving || !actionAvailability?.canPublish}
          >
            Publish
          </button>
        </div>
      </section>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
};

const Field = ({ label, value, onChange, placeholder, required = false }: FieldProps) => (
  <label className="flex flex-col gap-2 text-sm text-slate-200">
    {label} {required ? <span className="text-rose-400">*</span> : null}
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  </label>
);

type TextAreaProps = {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
};

const TextArea = ({ label, value, onChange }: TextAreaProps) => (
  <label className="flex flex-col gap-2 text-sm text-slate-200">
    {label}
    <textarea
      value={value}
      onChange={onChange}
      rows={4}
      className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  </label>
);
