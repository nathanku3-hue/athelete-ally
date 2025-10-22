import { FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import { z, ZodError } from 'zod';
import { roleCheckMiddleware } from '@athlete-ally/shared';
import {
  movementCurationService,
  MovementCurationError,
  type CurationActor,
} from '../curation/movement-service.js';
import {
  movementDraftSchema,
  movementDraftUpdateSchema,
} from '../curation/movement-validation.js';
import { MovementStageStatus } from '../../prisma/generated/client/index.js';

const listDraftQuerySchema = z.object({
  status: z
    .union([
      z.nativeEnum(MovementStageStatus),
      z.array(z.nativeEnum(MovementStageStatus)),
    ])
    .optional(),
  search: z.string().trim().min(1).optional(),
  tag: z.string().trim().min(1).optional(),
  reviewerId: z.string().trim().min(1).optional(),
});

const idParamSchema = z.object({
  id: z.string().trim().min(1),
});

const notesSchema = z.object({
  notes: z.string().trim().max(1000).optional(),
});

const publishSchema = notesSchema.extend({
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

const requireCurator = roleCheckMiddleware(['curator', 'admin']);

const ensureArray = (value?: MovementStageStatus | MovementStageStatus[]) => {
  if (!value) return undefined;
  return Array.isArray(value) ? value : [value];
};

const toCurationActor = (user?: {
  userId?: string;
  email?: string;
  role?: string;
}): CurationActor => {
  if (!user?.userId) {
    throw new MovementCurationError('missing user context for curation action');
  }

  return {
    id: user.userId,
    email: user.email ?? `${user.userId}@unknown.local`,
    role: user.role,
  };
};

const handleRouteError = (
  request: FastifyRequest,
  reply: FastifyReply,
  error: unknown,
) => {
  if (error instanceof ZodError) {
    return reply.code(400).send({
      error: 'invalid_request',
      details: error.errors,
    });
  }

  if (error instanceof MovementCurationError) {
    const lowered = error.message.toLowerCase();
    if (lowered.includes('not found')) {
      return reply.code(404).send({
        error: 'not_found',
        message: error.message,
      });
    }
    return reply.code(400).send({
      error: 'invalid_state',
      message: error.message,
    });
  }

  request.log.error({ err: error }, 'movement curation route failed');
  return reply.code(500).send({
    error: 'internal_error',
    message: 'Unexpected error handling movement curation request',
  });
};

export async function movementCurationRoutes(app: FastifyInstance) {
  // Skip metrics sync during route registration unless explicitly enabled
  // This allows the server to start even if the movement_staging table doesn't exist yet
  if (process.env.ENABLE_CURATION_SYNC === 'true') {
    try {
      await movementCurationService.synchronizeDraftMetrics();
      app.log.info('movement curation metrics synchronized');
    } catch (error) {
      app.log.warn({ err: error }, 'failed to synchronize movement curation metrics');
    }
  } else {
    app.log.info('skipping movement curation metrics sync (ENABLE_CURATION_SYNC not set)');
  }

  app.addHook('preHandler', requireCurator);

  app.get('/movements', async (request, reply) => {
    try {
      const parsedQuery = listDraftQuerySchema.parse(request.query);
      const drafts = await movementCurationService.listDrafts({
        status: ensureArray(parsedQuery.status),
        search: parsedQuery.search,
        tag: parsedQuery.tag,
        reviewerId: parsedQuery.reviewerId,
      });

      return reply.send({ data: drafts });
    } catch (error) {
      return handleRouteError(request, reply, error);
    }
  });

  app.get('/movements/:id', async (request, reply) => {
    try {
      const params = idParamSchema.parse(request.params);
      const draft = await movementCurationService.getDraft(params.id);

      if (!draft) {
        return reply.code(404).send({
          error: 'not_found',
          message: 'Draft movement not found',
        });
      }

      return reply.send({ data: draft });
    } catch (error) {
      return handleRouteError(request, reply, error);
    }
  });

  app.post('/movements', async (request, reply) => {
    try {
      const body = movementDraftSchema.parse(request.body);
      const result = await movementCurationService.createDraft(body, toCurationActor(request.user));
      return reply.code(201).send({ data: result });
    } catch (error) {
      return handleRouteError(request, reply, error);
    }
  });

  app.patch('/movements/:id', async (request, reply) => {
    try {
      const params = idParamSchema.parse(request.params);
      const body = movementDraftUpdateSchema.parse(request.body);
      const result = await movementCurationService.updateDraft(
        params.id,
        body,
        toCurationActor(request.user),
      );
      return reply.send({ data: result });
    } catch (error) {
      return handleRouteError(request, reply, error);
    }
  });

  app.post('/movements/:id/submit', async (request, reply) => {
    try {
      const params = idParamSchema.parse(request.params);
      const body = notesSchema.parse(request.body ?? {});
      const result = await movementCurationService.submitForReview(
        params.id,
        toCurationActor(request.user),
        body.notes,
      );
      return reply.send({ data: result });
    } catch (error) {
      return handleRouteError(request, reply, error);
    }
  });

  app.post('/movements/:id/request-changes', async (request, reply) => {
    try {
      const params = idParamSchema.parse(request.params);
      const body = notesSchema.parse(request.body ?? {});
      if (!body.notes) {
        return reply.code(400).send({
          error: 'invalid_request',
          message: 'notes are required when requesting changes',
        });
      }
      const result = await movementCurationService.requestChanges(
        params.id,
        toCurationActor(request.user),
        body.notes,
      );
      return reply.send({ data: result });
    } catch (error) {
      return handleRouteError(request, reply, error);
    }
  });

  app.post('/movements/:id/approve', async (request, reply) => {
    try {
      const params = idParamSchema.parse(request.params);
      const body = notesSchema.parse(request.body ?? {});
      const result = await movementCurationService.approveDraft(
        params.id,
        toCurationActor(request.user),
        body.notes,
      );
      return reply.send({ data: result });
    } catch (error) {
      return handleRouteError(request, reply, error);
    }
  });

  app.post('/movements/:id/publish', async (request, reply) => {
    try {
      const params = idParamSchema.parse(request.params);
      const body = publishSchema.parse(request.body ?? {});
      const result = await movementCurationService.publishDraft(params.id, toCurationActor(request.user), {
        notes: body.notes,
        metadata: body.metadata ?? null,
      });
      return reply.send({ data: result });
    } catch (error) {
      return handleRouteError(request, reply, error);
    }
  });

  app.get('/library', async (request, reply) => {
    try {
      const searchSchema = z.object({
        search: z.string().trim().min(1).optional(),
      });
      const parsedQuery = searchSchema.parse(request.query);
      const library = await movementCurationService.listLibrary(parsedQuery.search);
      return reply.send({ data: library });
    } catch (error) {
      return handleRouteError(request, reply, error);
    }
  });
}
