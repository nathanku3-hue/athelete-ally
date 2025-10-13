import {
  MovementAuditAction,
  MovementStageStatus,
  Prisma,
  type MovementLibrary,
  type MovementStaging,
  type PrismaClient,
} from '../../prisma/generated/client/index.js';
import { prisma } from '../db.js';
import {
  MovementDraftInput,
  MovementDraftUpdateInput,
  movementDraftSchema,
  movementDraftUpdateSchema,
} from './movement-validation.js';
import { normalizeStringList, toMovementSlug } from './movement-utils.js';
import { movementCurationMetrics } from './movement-metrics.js';

export interface CurationActor {
  id: string;
  email: string;
  role?: string;
}

export interface MovementDraftListFilter {
  status?: MovementStageStatus[];
  search?: string;
  tag?: string;
  reviewerId?: string;
}

export interface PublishOptions {
  notes?: string;
  metadata?: Record<string, unknown> | null;
}

export class MovementCurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MovementCurationError';
  }
}

type TransactionClient = Prisma.TransactionClient;

const MAX_SLUG_ATTEMPTS = 25;

const toNullableJson = (
  value: unknown,
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue => {
  if (value === undefined || value === null) {
    return Prisma.DbNull;
  }
  return value as Prisma.InputJsonValue;
};

const ensureUniqueSlug = async (
  tx: TransactionClient,
  base: string,
  excludeDraftId?: string,
) => {
  let attempt = 0;
  let candidate = base;

  while (attempt < MAX_SLUG_ATTEMPTS) {
    const draftMatch = await tx.movementStaging.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (draftMatch && draftMatch.id !== excludeDraftId) {
      attempt += 1;
      candidate = `${base}-${attempt}`;
      continue;
    }

    const libraryMatch = await tx.movementLibrary.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (libraryMatch) {
      attempt += 1;
      candidate = `${base}-${attempt}`;
      continue;
    }

    return candidate;
  }

  throw new MovementCurationError('Unable to allocate a unique slug for movement');
};

const normalizeDraftPayload = (input: MovementDraftInput) => {
  return {
    name: input.name.trim(),
    slug: input.slug?.trim(),
    classification: input.classification.trim(),
    equipment: normalizeStringList(input.equipment),
    primaryMuscles: normalizeStringList(input.primaryMuscles),
    secondaryMuscles: normalizeStringList(input.secondaryMuscles),
  recommendedRpe: input.recommendedRpe ?? null,
  progressionIds: normalizeStringList(input.progressionIds),
  regressionIds: normalizeStringList(input.regressionIds),
  tags: normalizeStringList(input.tags),
  instructions: input.instructions,
  metadata: input.metadata,
};
};

const normalizeUpdatePayload = (input: MovementDraftUpdateInput) => {
  const data: Prisma.MovementStagingUpdateInput = {};

  if (input.name !== undefined) {
    data.name = input.name.trim();
  }

  if (input.slug !== undefined) {
    data.slug = input.slug.trim();
  }

  if (input.classification !== undefined) {
    data.classification = input.classification.trim();
  }

  if (input.equipment !== undefined) {
    data.equipment = { set: normalizeStringList(input.equipment) };
  }

  if (input.primaryMuscles !== undefined) {
    data.primaryMuscles = { set: normalizeStringList(input.primaryMuscles) };
  }

  if (input.secondaryMuscles !== undefined) {
    data.secondaryMuscles = { set: normalizeStringList(input.secondaryMuscles) };
  }

  if (input.recommendedRpe !== undefined) {
    data.recommendedRpe = input.recommendedRpe ?? null;
  }

  if (input.progressionIds !== undefined) {
    data.progressionIds = { set: normalizeStringList(input.progressionIds) };
  }

  if (input.regressionIds !== undefined) {
    data.regressionIds = { set: normalizeStringList(input.regressionIds) };
  }

  if (input.tags !== undefined) {
    data.tags = { set: normalizeStringList(input.tags) };
  }

  if (input.instructions !== undefined) {
    data.instructions = toNullableJson(input.instructions);
  }

  if (input.metadata !== undefined) {
    data.metadata = toNullableJson(input.metadata);
  }

  return data;
};

const shapeStagingForAudit = (movement: MovementStaging) => ({
  id: movement.id,
  name: movement.name,
  slug: movement.slug,
  classification: movement.classification,
  equipment: movement.equipment,
  primaryMuscles: movement.primaryMuscles,
  secondaryMuscles: movement.secondaryMuscles,
  recommendedRpe: movement.recommendedRpe,
  progressionIds: movement.progressionIds,
  regressionIds: movement.regressionIds,
  tags: movement.tags,
  instructions: movement.instructions,
  metadata: movement.metadata,
  status: movement.status,
  reviewerId: movement.reviewerId,
  reviewedAt: movement.reviewedAt,
  reviewNotes: movement.reviewNotes,
  publishedMovementId: movement.publishedMovementId,
});

const shapeLibraryForAudit = (movement: MovementLibrary) => ({
  id: movement.id,
  name: movement.name,
  slug: movement.slug,
  classification: movement.classification,
  equipment: movement.equipment,
  primaryMuscles: movement.primaryMuscles,
  secondaryMuscles: movement.secondaryMuscles,
  recommendedRpe: movement.recommendedRpe,
  progressionIds: movement.progressionIds,
  regressionIds: movement.regressionIds,
  tags: movement.tags,
  instructions: movement.instructions,
  metadata: movement.metadata,
  version: movement.version,
  publishedById: movement.publishedById,
  publishedAt: movement.publishedAt,
  stagingSourceId: movement.stagingSourceId,
});

const recordAuditEvent = async (
  tx: TransactionClient,
  params: {
    action: MovementAuditAction;
    actor: CurationActor;
    stagingMovement?: MovementStaging;
    libraryMovement?: MovementLibrary;
    notes?: string;
    diff?: Record<string, unknown>;
    metadata?: Record<string, unknown> | null;
  },
) => {
  await tx.movementAuditLog.create({
    data: {
      action: params.action,
      actorId: params.actor.id,
      actorEmail: params.actor.email,
      actorRole: params.actor.role,
      movementStagingId: params.stagingMovement?.id,
      movementLibraryId: params.libraryMovement?.id,
      diff: toNullableJson(params.diff),
      notes: params.notes ?? null,
      metadata: toNullableJson(params.metadata),
    },
  });
};

export class MovementCurationService {
  constructor(private readonly client: PrismaClient = prisma) {}

  private async refreshDraftStatusMetrics(tx: TransactionClient) {
    const staging = tx.movementStaging as typeof tx.movementStaging & {
      groupBy?: (args: unknown) => Promise<Array<{ status: MovementStageStatus; _count: { status: number } }>>;
    };

    if (typeof staging.groupBy !== 'function') {
      return;
    }

    const grouped = await staging.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    movementCurationMetrics.setDraftStatusCounts(
      grouped.map((entry) => ({
        status: entry.status,
        count: entry._count.status,
      })),
    );
  }

  async synchronizeDraftMetrics() {
    const staging = this.client.movementStaging as typeof this.client.movementStaging & {
      groupBy?: (args: unknown) => Promise<Array<{ status: MovementStageStatus; _count: { status: number } }>>;
    };

    if (typeof staging.groupBy !== 'function') {
      return;
    }

    const grouped = await staging.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    movementCurationMetrics.setDraftStatusCounts(
      grouped.map((entry) => ({
        status: entry.status,
        count: entry._count.status,
      })),
    );
  }

  async createDraft(payload: MovementDraftInput, actor: CurationActor) {
    const parsed = movementDraftSchema.parse(payload);
    const normalized = normalizeDraftPayload(parsed);

    return this.client.$transaction(async (tx) => {
      const baseSlug = normalized.slug ?? toMovementSlug(normalized.name);
      const uniqueSlug = await ensureUniqueSlug(tx, baseSlug);

      const draft = await tx.movementStaging.create({
        data: {
          name: normalized.name,
          slug: uniqueSlug,
          classification: normalized.classification,
          equipment: normalized.equipment,
          primaryMuscles: normalized.primaryMuscles,
          secondaryMuscles: normalized.secondaryMuscles,
          recommendedRpe: normalized.recommendedRpe,
          progressionIds: normalized.progressionIds,
          regressionIds: normalized.regressionIds,
          tags: normalized.tags,
          instructions: toNullableJson(normalized.instructions),
          metadata: toNullableJson(normalized.metadata),
          status: MovementStageStatus.DRAFT,
          createdById: actor.id,
          updatedById: actor.id,
        },
      });

      await recordAuditEvent(tx, {
        action: MovementAuditAction.CREATED,
        actor,
        stagingMovement: draft,
        diff: { after: shapeStagingForAudit(draft) },
      });

      movementCurationMetrics.recordDraftCreated();
      await this.refreshDraftStatusMetrics(tx);

      return draft;
    });
  }

  async updateDraft(id: string, payload: MovementDraftUpdateInput, actor: CurationActor) {
    const parsed = movementDraftUpdateSchema.parse(payload);
    const changes = normalizeUpdatePayload(parsed);

    if (Object.keys(changes).length === 0) {
      throw new MovementCurationError('No changes provided for draft update');
    }

    return this.client.$transaction(async (tx) => {
      const existing = await tx.movementStaging.findUnique({ where: { id } });

      if (!existing) {
        throw new MovementCurationError('Draft movement not found');
      }

      if (existing.status === MovementStageStatus.PUBLISHED) {
        throw new MovementCurationError('Published movements cannot be edited');
      }

      let slugToPersist: string | undefined;
      if (changes.slug) {
        const base = toMovementSlug(String(changes.slug));
        slugToPersist = await ensureUniqueSlug(tx, base, existing.id);
      }

      const updated = await tx.movementStaging.update({
        where: { id },
        data: {
          ...changes,
          slug: slugToPersist ?? changes.slug ?? undefined,
          updatedById: actor.id,
        },
      });

      await recordAuditEvent(tx, {
        action: MovementAuditAction.UPDATED,
        actor,
        stagingMovement: updated,
        diff: {
          before: shapeStagingForAudit(existing),
          after: shapeStagingForAudit(updated),
        },
      });

      return updated;
    });
  }

  async submitForReview(id: string, actor: CurationActor, notes?: string) {
    return this.transitionStatus(
      id,
      MovementStageStatus.READY_FOR_REVIEW,
      actor,
      MovementAuditAction.REVIEW_SUBMITTED,
      { reviewerId: null, reviewedAt: null, reviewNotes: notes ?? null },
      notes,
    );
  }

  async requestChanges(id: string, actor: CurationActor, notes: string) {
    return this.transitionStatus(
      id,
      MovementStageStatus.CHANGES_REQUESTED,
      actor,
      MovementAuditAction.REJECTED,
      { reviewerId: actor.id, reviewedAt: new Date(), reviewNotes: notes },
      notes,
    );
  }

  async approveDraft(id: string, actor: CurationActor, notes?: string) {
    return this.transitionStatus(
      id,
      MovementStageStatus.APPROVED,
      actor,
      MovementAuditAction.APPROVED,
      { reviewerId: actor.id, reviewedAt: new Date(), reviewNotes: notes ?? null },
      notes,
    );
  }

  async publishDraft(id: string, actor: CurationActor, options: PublishOptions = {}) {
    return this.client.$transaction(async (tx) => {
      const draft = await tx.movementStaging.findUnique({ where: { id } });

      if (!draft) {
        movementCurationMetrics.recordPublishAttempt('failure', { reason: 'not_found' });
        throw new MovementCurationError('Draft movement not found');
      }

      if (
        draft.status !== MovementStageStatus.APPROVED &&
        draft.status !== MovementStageStatus.READY_FOR_REVIEW
      ) {
        movementCurationMetrics.recordPublishAttempt('failure', {
          reason: 'invalid_status',
          from: draft.status,
        });
        throw new MovementCurationError('Draft must be approved before publishing');
      }

      const latestVersion = await tx.movementLibrary.findFirst({
        where: { slug: draft.slug },
        orderBy: { version: 'desc' },
        select: { version: true },
      });

      const nextVersion = (latestVersion?.version ?? 0) + 1;

      const libraryRecord = await tx.movementLibrary.create({
        data: {
          name: draft.name,
          slug: draft.slug,
          classification: draft.classification,
          equipment: draft.equipment,
          primaryMuscles: draft.primaryMuscles,
          secondaryMuscles: draft.secondaryMuscles,
          recommendedRpe: draft.recommendedRpe,
          progressionIds: draft.progressionIds,
          regressionIds: draft.regressionIds,
          tags: draft.tags,
          instructions: toNullableJson(draft.instructions),
          metadata: toNullableJson(options.metadata ?? draft.metadata),
          version: nextVersion,
          stagingSourceId: draft.id,
          stagingSnapshot: toNullableJson(shapeStagingForAudit(draft)),
          publishedById: actor.id,
        },
      });

      const updatedDraft = await tx.movementStaging.update({
        where: { id },
        data: {
          status: MovementStageStatus.PUBLISHED,
          reviewerId: actor.id,
          reviewedAt: new Date(),
          reviewNotes: options.notes ?? null,
          publishedMovementId: libraryRecord.id,
          updatedById: actor.id,
        },
      });

      await recordAuditEvent(tx, {
        action: MovementAuditAction.PUBLISHED,
        actor,
        stagingMovement: updatedDraft,
        diff: {
          before: shapeStagingForAudit(draft),
          after: shapeStagingForAudit(updatedDraft),
          libraryVersion: nextVersion,
        },
        notes: options.notes,
        metadata: options.metadata ?? null,
      });

      await recordAuditEvent(tx, {
        action: MovementAuditAction.CREATED,
        actor,
        libraryMovement: libraryRecord,
        diff: { after: shapeLibraryForAudit(libraryRecord) },
        metadata: options.metadata ?? null,
      });

      movementCurationMetrics.recordStatusTransition(draft.status, MovementStageStatus.PUBLISHED);
      movementCurationMetrics.recordPublishAttempt('success', { from: draft.status });
      await this.refreshDraftStatusMetrics(tx);

      return { draft: updatedDraft, library: libraryRecord };
    });
  }

  async transitionStatus(
    id: string,
    nextStatus: MovementStageStatus,
    actor: CurationActor,
    action: MovementAuditAction,
    additionalUpdates: Partial<Pick<MovementStaging, 'reviewerId' | 'reviewedAt' | 'reviewNotes'>>,
    notes?: string,
  ) {
    return this.client.$transaction(async (tx) => {
      const existing = await tx.movementStaging.findUnique({ where: { id } });

      if (!existing) {
        throw new MovementCurationError('Draft movement not found');
      }

      if (existing.status === MovementStageStatus.PUBLISHED) {
        throw new MovementCurationError('Published movements cannot change status');
      }

      const updateData: Prisma.MovementStagingUpdateInput = {
        status: nextStatus,
        updatedById: actor.id,
      };

      if (Object.prototype.hasOwnProperty.call(additionalUpdates, 'reviewerId')) {
        updateData.reviewerId = additionalUpdates.reviewerId ?? null;
      }

      if (Object.prototype.hasOwnProperty.call(additionalUpdates, 'reviewedAt')) {
        updateData.reviewedAt = additionalUpdates.reviewedAt ?? null;
      }

      if (Object.prototype.hasOwnProperty.call(additionalUpdates, 'reviewNotes')) {
        updateData.reviewNotes = additionalUpdates.reviewNotes ?? null;
      }

      const updated = await tx.movementStaging.update({
        where: { id },
        data: updateData,
      });

      await recordAuditEvent(tx, {
        action,
        actor,
        stagingMovement: updated,
        diff: {
          before: shapeStagingForAudit(existing),
          after: shapeStagingForAudit(updated),
        },
        notes,
      });

      movementCurationMetrics.recordStatusTransition(existing.status, nextStatus);
      await this.refreshDraftStatusMetrics(tx);

      return updated;
    });
  }

  async getDraft(id: string) {
    return this.client.movementStaging.findUnique({ where: { id } });
  }

  async listDrafts(filter: MovementDraftListFilter = {}) {
    return this.client.movementStaging.findMany({
      where: {
        status: filter.status ? { in: filter.status } : undefined,
        reviewerId: filter.reviewerId,
        tags: filter.tag ? { has: filter.tag } : undefined,
        OR: filter.search
          ? [
              { name: { contains: filter.search, mode: 'insensitive' } },
              { classification: { contains: filter.search, mode: 'insensitive' } },
              { tags: { has: filter.search } },
            ]
          : undefined,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async listLibrary(search?: string) {
    return this.client.movementLibrary.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { classification: { contains: search, mode: 'insensitive' } },
              { tags: { has: search } },
            ],
          }
        : undefined,
      orderBy: [
        { slug: 'asc' },
        { version: 'desc' },
      ],
    });
  }

  async getDraftBySlug(slug: string) {
    return this.client.movementStaging.findUnique({ where: { slug } });
  }

  async getLatestLibraryMovement(slug: string) {
    return this.client.movementLibrary.findFirst({
      where: { slug },
      orderBy: { version: 'desc' },
    });
  }
}

export const movementCurationService = new MovementCurationService();
