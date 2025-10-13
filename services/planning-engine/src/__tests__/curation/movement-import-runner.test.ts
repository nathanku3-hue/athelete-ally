import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { MovementImportRunner } from '../../curation/movement-import-runner.js';
import type { MovementCurationService } from '../../curation/movement-service.js';
import { MovementStageStatus } from '../../../prisma/generated/client/index.js';

const createTempFile = async (content: string, extension = '.json') => {
  const filePath = path.join(os.tmpdir(), `movement-import-${Date.now()}-${Math.random()}${extension}`);
  await fs.writeFile(filePath, content, 'utf8');
  return filePath;
};

const actor = {
  id: 'curator-actor',
  email: 'curator@example.com',
  role: 'curator' as const,
};

const createServiceMock = () => ({
  getDraftBySlug: jest.fn(),
  getLatestLibraryMovement: jest.fn(),
  createDraft: jest.fn(),
  updateDraft: jest.fn(),
  submitForReview: jest.fn(),
  approveDraft: jest.fn(),
  publishDraft: jest.fn(),
}) as unknown as jest.Mocked<MovementCurationService>;

describe('MovementImportRunner', () => {
  it('performs dry-run without calling create/update', async () => {
    const file = await createTempFile(
      JSON.stringify([
        {
          name: 'Goblet Squat',
          classification: 'strength',
          primaryMuscles: ['Quadriceps'],
        },
      ]),
    );

    const service = createServiceMock();
    service.getDraftBySlug.mockResolvedValue(null);
    service.getLatestLibraryMovement.mockResolvedValue(null);

    const runner = new MovementImportRunner(service, actor, {
      dryRun: true,
      updateExisting: false,
    });

    const summary = await runner.import(file, 'json');

    expect(summary.created).toBe(1);
    expect(summary.updated).toBe(0);
    expect(service.createDraft).not.toHaveBeenCalled();
    expect(service.updateDraft).not.toHaveBeenCalled();
  });

  it('updates existing draft when updateExisting enabled', async () => {
    const file = await createTempFile(
      JSON.stringify([
        {
          name: 'Goblet Squat',
          slug: 'goblet-squat',
          classification: 'strength',
          primaryMuscles: ['Quadriceps'],
        },
      ]),
    );

    const service = createServiceMock();
    service.getDraftBySlug.mockResolvedValue({
      id: 'draft-123',
      slug: 'goblet-squat',
      status: MovementStageStatus.DRAFT,
    } as any);
    service.getLatestLibraryMovement.mockResolvedValue(null);
    service.updateDraft.mockResolvedValue({
      id: 'draft-123',
      slug: 'goblet-squat',
      status: MovementStageStatus.DRAFT,
    } as any);

    const runner = new MovementImportRunner(service, actor, {
      updateExisting: true,
    });

    const summary = await runner.import(file, 'json');

    expect(summary.updated).toBe(1);
    expect(service.updateDraft).toHaveBeenCalledWith('draft-123', expect.any(Object), actor);
  });

  it('throws error for duplicate slugs within the same file', async () => {
    const file = await createTempFile(
      JSON.stringify([
        {
          name: 'Goblet Squat',
          classification: 'strength',
          primaryMuscles: ['Quadriceps'],
        },
        {
          name: 'Goblet Squat',
          classification: 'strength',
          primaryMuscles: ['Quadriceps'],
        },
      ]),
    );

    const service = createServiceMock();
    const runner = new MovementImportRunner(service, actor, {
      updateExisting: true,
    });

    await expect(runner.import(file, 'json')).rejects.toThrow(/duplicate slug/i);
  });
});
