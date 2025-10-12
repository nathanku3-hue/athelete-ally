import {
  MovementCurationService,
  MovementCurationError,
} from '../../curation/movement-service.js';
import {
  MovementStageStatus,
  MovementAuditAction,
} from '../../../prisma/generated/client/index.js';

const actor = {
  id: 'curator-1',
  email: 'martina@example.com',
  role: 'curator',
};

const createMockClient = () => {
  const movementStaging = {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
  };

  const movementLibrary = {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
  };

  const movementAuditLog = {
    create: jest.fn(),
  };

  const tx = {
    movementStaging,
    movementLibrary,
    movementAuditLog,
  };

  const client = {
    movementStaging,
    movementLibrary,
    movementAuditLog,
    $transaction: jest.fn(async (callback: any) => callback(tx)),
  } as unknown as ConstructorParameters<typeof MovementCurationService>[0];

  return {
    client,
    movementStaging,
    movementLibrary,
    movementAuditLog,
  };
};

describe('MovementCurationService', () => {
  it('creates a draft movement and records audit trail', async () => {
    const { client, movementStaging, movementLibrary, movementAuditLog } = createMockClient();
    const service = new MovementCurationService(client as any);

    movementStaging.findUnique.mockResolvedValue(null);
    movementLibrary.findUnique.mockResolvedValue(null);
    const createdDraft = {
      id: 'draft-1',
      name: 'Bodyweight Squat',
      slug: 'bodyweight-squat',
      classification: 'strength',
      equipment: [],
      primaryMuscles: ['Quadriceps'],
      secondaryMuscles: [],
      recommendedRpe: null,
      progressionIds: [],
      regressionIds: [],
      tags: ['lower-body'],
      instructions: null,
      metadata: null,
      status: MovementStageStatus.DRAFT,
      reviewerId: null,
      reviewedAt: null,
      reviewNotes: null,
      publishedMovementId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: actor.id,
      updatedById: actor.id,
    };

    movementStaging.create.mockResolvedValue(createdDraft);

    const draft = await service.createDraft(
      {
        name: 'Bodyweight Squat',
        classification: 'strength',
        primaryMuscles: ['Quadriceps'],
        tags: ['lower-body'],
      },
      actor,
    );

    expect(draft).toEqual(createdDraft);
    expect(movementStaging.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: 'bodyweight-squat',
          status: MovementStageStatus.DRAFT,
          createdById: actor.id,
        }),
      }),
    );
    expect(movementAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: MovementAuditAction.CREATED,
          actorId: actor.id,
          movementStagingId: createdDraft.id,
          diff: expect.objectContaining({
            after: expect.objectContaining({
              slug: 'bodyweight-squat',
            }),
          }),
        }),
      }),
    );
  });

  it('updates a draft movement with slug de-duplication', async () => {
    const { client, movementStaging, movementLibrary, movementAuditLog } = createMockClient();
    const service = new MovementCurationService(client as any);

    const existingDraft = {
      id: 'draft-1',
      name: 'Bodyweight Squat',
      slug: 'bodyweight-squat',
      classification: 'strength',
      equipment: [],
      primaryMuscles: ['Quadriceps'],
      secondaryMuscles: [],
      recommendedRpe: null,
      progressionIds: [],
      regressionIds: [],
      tags: [],
      instructions: null,
      metadata: null,
      status: MovementStageStatus.DRAFT,
      reviewerId: null,
      reviewedAt: null,
      reviewNotes: null,
      publishedMovementId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: actor.id,
      updatedById: actor.id,
    };

    const updatedDraft = {
      ...existingDraft,
      tags: ['lower-body'],
      slug: 'bodyweight-squat-1',
      updatedAt: new Date(),
    };

    movementStaging.findUnique
      .mockResolvedValueOnce(existingDraft) // fetch existing
      .mockResolvedValueOnce(null); // staging slug check

    movementLibrary.findUnique
      .mockResolvedValueOnce({ id: 'other-movement' })
      .mockResolvedValue(null);
    movementStaging.update.mockResolvedValue(updatedDraft);

    const result = await service.updateDraft(
      existingDraft.id,
      {
        tags: ['Lower Body', 'lower body'],
        slug: 'bodyweight-squat',
      },
      actor,
    );

    expect(result.slug).toBe('bodyweight-squat-1');
    expect(movementStaging.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tags: { set: ['Lower Body'] },
          slug: 'bodyweight-squat-1',
          updatedById: actor.id,
        }),
      }),
    );

    expect(movementAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: MovementAuditAction.UPDATED,
          diff: expect.objectContaining({
            before: expect.objectContaining({ slug: 'bodyweight-squat' }),
            after: expect.objectContaining({ slug: 'bodyweight-squat-1' }),
          }),
        }),
      }),
    );
  });

  it('publishes an approved draft and creates library entry', async () => {
    const { client, movementStaging, movementLibrary, movementAuditLog } = createMockClient();
    const service = new MovementCurationService(client as any);

    const approvedDraft = {
      id: 'draft-2',
      name: 'Bench Press',
      slug: 'bench-press',
      classification: 'strength',
      equipment: ['Barbell'],
      primaryMuscles: ['Pectorals'],
      secondaryMuscles: ['Triceps'],
      recommendedRpe: 8,
      progressionIds: [],
      regressionIds: [],
      tags: ['upper-body'],
      instructions: null,
      metadata: { tempo: '32X1' },
      status: MovementStageStatus.APPROVED,
      reviewerId: actor.id,
      reviewedAt: new Date(),
      reviewNotes: 'Looks good',
      publishedMovementId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: actor.id,
      updatedById: actor.id,
    };

    const libraryRecord = {
      id: 'movement-lib-1',
      name: approvedDraft.name,
      slug: approvedDraft.slug,
      classification: approvedDraft.classification,
      equipment: approvedDraft.equipment,
      primaryMuscles: approvedDraft.primaryMuscles,
      secondaryMuscles: approvedDraft.secondaryMuscles,
      recommendedRpe: approvedDraft.recommendedRpe,
      progressionIds: approvedDraft.progressionIds,
      regressionIds: approvedDraft.regressionIds,
      tags: approvedDraft.tags,
      instructions: approvedDraft.instructions,
      metadata: approvedDraft.metadata,
      version: 1,
      stagingSourceId: approvedDraft.id,
      stagingSnapshot: {},
      publishedById: actor.id,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedDrafts: [],
      auditLogs: [],
    };

    const publishedDraft = {
      ...approvedDraft,
      status: MovementStageStatus.PUBLISHED,
      publishedMovementId: libraryRecord.id,
      updatedAt: new Date(),
    };

    movementStaging.findUnique.mockResolvedValue(approvedDraft);
    movementLibrary.findFirst.mockResolvedValue(null);
    movementLibrary.create.mockResolvedValue(libraryRecord);
    movementStaging.update.mockResolvedValue(publishedDraft);

    const result = await service.publishDraft(approvedDraft.id, actor, {
      notes: 'Published for launch',
    });

    expect(result.library.version).toBe(1);
    expect(result.draft.status).toBe(MovementStageStatus.PUBLISHED);

    expect(movementLibrary.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: approvedDraft.slug,
          version: 1,
          publishedById: actor.id,
        }),
      }),
    );

    const auditCalls = movementAuditLog.create.mock.calls;
    const publishAudit = auditCalls.find(
      ([args]) => args.data.action === MovementAuditAction.PUBLISHED,
    );
    const libraryAudit = auditCalls.find(
      ([args]) =>
        args.data.action === MovementAuditAction.CREATED &&
        args.data.movementLibraryId === libraryRecord.id,
    );

    expect(publishAudit).toBeDefined();
    expect(libraryAudit).toBeDefined();
  });

  it('rejects publishing when draft not approved', async () => {
    const { client, movementStaging } = createMockClient();
    const service = new MovementCurationService(client as any);

    const draft = {
      id: 'draft-3',
      name: 'Deadlift',
      slug: 'deadlift',
      classification: 'strength',
      equipment: ['Barbell'],
      primaryMuscles: ['Hamstrings'],
      secondaryMuscles: [],
      recommendedRpe: null,
      progressionIds: [],
      regressionIds: [],
      tags: [],
      instructions: null,
      metadata: null,
      status: MovementStageStatus.DRAFT,
      reviewerId: null,
      reviewedAt: null,
      reviewNotes: null,
      publishedMovementId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: actor.id,
      updatedById: actor.id,
    };

    movementStaging.findUnique.mockResolvedValue(draft);

    await expect(service.publishDraft(draft.id, actor)).rejects.toThrow(
      MovementCurationError,
    );
  });
});
