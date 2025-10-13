"use client";

import { useState, type FormEvent } from 'react';
import type { MovementDraft, MovementDraftInput } from '@/lib/api/curation';

type MovementCreateFormProps = {
  onCreate: (input: MovementDraftInput) => Promise<MovementDraft>;
  onClose: () => void;
  pending: boolean;
};

type CreateFormState = {
  name: string;
  classification: string;
  primaryMuscles: string;
  secondaryMuscles: string;
  equipment: string;
  tags: string;
  recommendedRpe: string;
  setup: string;
  execution: string;
};

const parseList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const parseLines = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

export function MovementCreateForm({ onCreate, onClose, pending }: MovementCreateFormProps) {
  const [form, setForm] = useState<CreateFormState>({
    name: '',
    classification: '',
    primaryMuscles: '',
    secondaryMuscles: '',
    equipment: '',
    tags: '',
    recommendedRpe: '',
    setup: '',
    execution: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (key: keyof CreateFormState) => (event: FormEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: (event.target as HTMLInputElement).value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const name = form.name.trim();
    const classification = form.classification.trim();
    const primaryMuscles = parseList(form.primaryMuscles);

    if (!name) {
      setError('Name is required.');
      return;
    }

    if (!classification) {
      setError('Classification is required.');
      return;
    }

    if (primaryMuscles.length === 0) {
      setError('Provide at least one primary muscle.');
      return;
    }

    let recommendedRpe: number | undefined;
    if (form.recommendedRpe.trim()) {
      const parsed = Number(form.recommendedRpe);
      if (!Number.isFinite(parsed) || parsed < 1 || parsed > 10) {
        setError('Recommended RPE must be between 1 and 10.');
        return;
      }
      recommendedRpe = parsed;
    }

    const instructions =
      form.setup.trim() || form.execution.trim()
        ? {
            setup: form.setup.trim() || undefined,
            execution: parseLines(form.execution),
          }
        : undefined;

    try {
      await onCreate({
        name,
        classification,
        primaryMuscles,
        secondaryMuscles: parseList(form.secondaryMuscles),
        equipment: parseList(form.equipment),
        tags: parseList(form.tags),
        recommendedRpe,
        instructions,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create draft');
    }
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
      <h2 className="text-lg font-semibold text-white">Create new movement draft</h2>
      <p className="mt-1 text-xs text-slate-400">
        Provide enough metadata for curators to identify and validate the movement. Additional
        fields can be filled in later.
      </p>

      {error ? (
        <div className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <LabelledInput
          label="Name"
          value={form.name}
          onChange={handleChange('name')}
          required
        />
        <LabelledInput
          label="Classification"
          value={form.classification}
          onChange={handleChange('classification')}
          required
        />
        <LabelledInput
          label="Primary muscles"
          placeholder="comma separated"
          value={form.primaryMuscles}
          onChange={handleChange('primaryMuscles')}
          required
        />
        <LabelledInput
          label="Secondary muscles"
          placeholder="comma separated"
          value={form.secondaryMuscles}
          onChange={handleChange('secondaryMuscles')}
        />
        <LabelledInput
          label="Equipment"
          placeholder="comma separated"
          value={form.equipment}
          onChange={handleChange('equipment')}
        />
        <LabelledInput
          label="Tags"
          placeholder="comma separated"
          value={form.tags}
          onChange={handleChange('tags')}
        />
        <LabelledInput
          label="Recommended RPE"
          placeholder="1-10"
          value={form.recommendedRpe}
          onChange={handleChange('recommendedRpe')}
        />
        <div className="col-span-full grid grid-cols-1 gap-4 md:grid-cols-2">
          <LabelledTextarea
            label="Setup guidance"
            value={form.setup}
            onChange={handleChange('setup')}
            rows={4}
          />
          <LabelledTextarea
            label="Execution steps (one per line)"
            value={form.execution}
            onChange={handleChange('execution')}
            rows={4}
          />
        </div>
        <div className="col-span-full flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-600"
            disabled={pending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-600/50"
            disabled={pending}
          >
            {pending ? 'Creating…' : 'Create draft'}
          </button>
        </div>
      </form>
    </div>
  );
}

type InputProps<T extends HTMLInputElement | HTMLTextAreaElement> = {
  label: string;
  value: string;
  onChange: (event: FormEvent<T>) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
};

const LabelledInput = ({
  label,
  value,
  onChange,
  placeholder,
  required,
}: InputProps<HTMLInputElement>) => (
  <label className="flex flex-col gap-1.5 text-sm text-slate-200">
    {label} {required ? <span className="text-rose-400">*</span> : null}
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  </label>
);

const LabelledTextarea = ({
  label,
  value,
  onChange,
  rows = 4,
}: InputProps<HTMLTextAreaElement>) => (
  <label className="flex flex-col gap-1.5 text-sm text-slate-200">
    {label}
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  </label>
);

