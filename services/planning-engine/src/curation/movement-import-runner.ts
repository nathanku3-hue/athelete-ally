import { promises as fs } from 'node:fs';
import path from 'node:path';
import type {
  MovementLibrary,
  MovementStaging,
} from '../../prisma/generated/client/index.js';
import {
  MovementStageStatus,
} from '../../prisma/generated/client/index.js';
import {
  movementDraftSchema,
  MovementDraftInput,
} from './movement-validation.js';
import { MovementCurationService, type CurationActor } from './movement-service.js';
import { toMovementSlug } from './movement-utils.js';

export type ImportFormat = 'json' | 'csv';

export interface MovementImportOptions {
  dryRun?: boolean;
  submitForReview?: boolean;
  publishApproved?: boolean;
  updateExisting?: boolean;
  reviewerId?: string;
}

export interface MovementImportResultItem {
  slug: string;
  id?: string;
  action: 'created' | 'updated' | 'skipped' | 'error';
  message?: string;
}

export interface MovementImportSummary {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  items: MovementImportResultItem[];
}

const listLikeRegex = /[,;|]/;

const parseList = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (!listLikeRegex.test(trimmed)) {
      return [trimmed];
    }

    return trimmed
      .split(listLikeRegex)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }

  return undefined;
};

const parseNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const parseJsonObject = (value: unknown): Record<string, unknown> | undefined => {
  if (!value) return undefined;
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return undefined;
    }
  }
  return undefined;
};

const parseInstructions = (value: unknown) => {
  const parsed = parseJsonObject(value);
  if (!parsed) return undefined;

  const instructionsSchema = movementDraftSchema.shape.instructions
    .unwrap()
    .unwrap();

  const result = instructionsSchema.safeParse(parsed);
  if (!result.success) return undefined;
  return result.data;
};

const coerceRecord = (record: Record<string, unknown>) => {
  const normalized: Record<string, unknown> = { ...record };
  const listFields = [
    'equipment',
    'primaryMuscles',
    'secondaryMuscles',
    'progressionIds',
    'regressionIds',
    'tags',
  ];

  for (const key of listFields) {
    if (key in normalized) {
      const list = parseList(normalized[key]);
      if (list !== undefined) {
        normalized[key] = list;
      }
    }
  }

  if ('recommendedRpe' in normalized) {
    const value = parseNumber(normalized.recommendedRpe);
    if (value !== undefined) normalized.recommendedRpe = value;
  }

  if ('metadata' in normalized) {
    const value = parseJsonObject(normalized.metadata);
    if (value !== undefined) normalized.metadata = value;
  }

  if ('instructions' in normalized) {
    const value = parseInstructions(normalized.instructions);
    if (value !== undefined) normalized.instructions = value;
  }

  return normalized;
};

const parseRowValues = (row: string) => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i += 1) {
    const char = row[i];
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());

  return values;
};

const rowToObject = (headers: string[], row: string) => {
  const values = parseRowValues(row);
  const result: Record<string, string> = {};
  headers.forEach((header, index) => {
    result[header] = values[index] ?? '';
  });
  return result;
};

const parseCsv = (content: string) => {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  const headerNames = parseRowValues(lines[0]);

  const dataLines = lines.slice(1);
  return dataLines.map((line) => rowToObject(headerNames, line));
};

export class MovementImportRunner {
  constructor(
    private readonly service: MovementCurationService,
    private readonly actor: CurationActor,
    private readonly options: MovementImportOptions = {},
  ) {}

  async loadRecords(filePath: string, format: ImportFormat) {
    const resolvedPath = path.resolve(process.cwd(), filePath);
    const content = await fs.readFile(resolvedPath, 'utf8');

    if (format === 'json') {
      const parsed = JSON.parse(content);
      const movements = Array.isArray(parsed) ? parsed : parsed.movements;
      if (!Array.isArray(movements)) {
        throw new Error('JSON input must be an array or contain a "movements" array');
      }
      return movements.map((record) => coerceRecord(record as Record<string, unknown>));
    }

    const rows = parseCsv(content);
    return rows.map((record) => coerceRecord(record));
  }

  prepareDraft(record: Record<string, unknown>): MovementDraftInput {
    const parsed = movementDraftSchema.parse(record);
    return {
      ...parsed,
      slug: parsed.slug ?? toMovementSlug(parsed.name),
    };
  }

  async import(filePath: string, format: ImportFormat): Promise<MovementImportSummary> {
    const dryRun = Boolean(this.options.dryRun);
    const submitForReview = Boolean(this.options.submitForReview);
    const publishApproved = Boolean(this.options.publishApproved);
    const updateExisting = Boolean(this.options.updateExisting);

    const records = await this.loadRecords(filePath, format);

    const seenSlugs = new Set<string>();
    const prepared: { draft: MovementDraftInput; raw: Record<string, unknown> }[] = [];

    for (const record of records) {
      const draft = this.prepareDraft(record);
      const slug = draft.slug ?? toMovementSlug(draft.name);
      if (seenSlugs.has(slug)) {
        throw new Error(`Duplicate slug "${slug}" detected in import file`);
      }
      seenSlugs.add(slug);
      prepared.push({ draft: { ...draft, slug }, raw: record });
    }

    const summary: MovementImportSummary = {
      total: prepared.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      items: [],
    };

    for (const { draft } of prepared) {
      try {
        const existingDraft = await this.service.getDraftBySlug(draft.slug!);
        const latestPublished = await this.service.getLatestLibraryMovement(draft.slug!);

        if (!updateExisting && existingDraft) {
          summary.skipped += 1;
          summary.items.push({
            slug: draft.slug!,
            id: existingDraft.id,
            action: 'skipped',
            message: 'Draft already exists. Use --update to overwrite.',
          });
          continue;
        }

        if (!updateExisting && latestPublished) {
          summary.skipped += 1;
          summary.items.push({
            slug: draft.slug!,
            id: latestPublished.id,
            action: 'skipped',
            message: 'Published movement exists. Use --update to stage new draft.',
          });
          continue;
        }

        if (dryRun) {
          summary.created += existingDraft ? 0 : 1;
          summary.updated += existingDraft ? 1 : 0;
          summary.items.push({
            slug: draft.slug!,
            id: existingDraft?.id ?? undefined,
            action: existingDraft ? 'updated' : 'created',
            message: 'Dry run - no database changes applied',
          });
          continue;
        }

        let resultDraft: MovementStaging;
        let action: 'created' | 'updated';

        if (existingDraft) {
          resultDraft = await this.service.updateDraft(existingDraft.id, draft, this.actor);
          action = 'updated';
          summary.updated += 1;
        } else {
          resultDraft = await this.service.createDraft(draft, this.actor);
          action = 'created';
          summary.created += 1;
        }

        let published: MovementLibrary | undefined;
        if (submitForReview) {
          await this.service.submitForReview(resultDraft.id, this.actor, 'Import pipeline submission');
        }

        if (publishApproved) {
          if (resultDraft.status !== MovementStageStatus.APPROVED) {
            await this.service.approveDraft(resultDraft.id, this.actor, 'Auto-approved via import pipeline');
          }
          const publishResult = await this.service.publishDraft(resultDraft.id, this.actor, {
            notes: 'Published via import pipeline',
          });
          published = publishResult.library;
        }

        summary.items.push({
          slug: draft.slug!,
          id: published?.id ?? resultDraft.id,
          action,
        });
      } catch (error) {
        summary.errors += 1;
        summary.items.push({
          slug: draft.slug ?? draft.name,
          action: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return summary;
  }
}
