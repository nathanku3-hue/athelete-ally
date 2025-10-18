import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { TipStorage } from '../tip-storage.js';

// Request schemas
const GetTipByPlanIdSchema = z.object({
  id: z.string().uuid('Plan ID must be a valid UUID')
});

const GetTipByTipIdSchema = z.object({
  tipId: z.string()
});

const GetUserTipsSchema = z.object({
  userId: z.string().uuid('User ID must be a valid UUID')
});

type GetTipByPlanIdRequest = FastifyRequest<{
  Params: z.infer<typeof GetTipByPlanIdSchema>;
}>;

type GetTipByTipIdRequest = FastifyRequest<{
  Params: z.infer<typeof GetTipByTipIdSchema>;
}>;

type GetUserTipsRequest = FastifyRequest<{
  Params: z.infer<typeof GetUserTipsSchema>;
}>;

/**
 * Register CoachTip API routes
 */
export async function registerCoachTipRoutes(
  fastify: FastifyInstance,
  tipStorage: TipStorage
) {
  
  /**
   * GET /v1/plans/:id/coach-tip
   * Retrieve coaching tip for a specific plan
   */
  fastify.get<{
    Params: { id: string };
  }>('/v1/plans/:id/coach-tip', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            planId: { type: 'string' },
            userId: { type: 'string' },
            message: { type: 'string' },
            type: { type: 'string' },
            priority: { type: 'string' },
            action: { type: 'object' },
            scoringContext: { type: 'object' },
            generatedAt: { type: 'string' },
            expiresAt: { type: 'string' },
            storedAt: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: GetTipByPlanIdRequest, reply: FastifyReply) => {
    const { id: planId } = request.params;
    
    try {
      fastify.log.info({ planId }, 'Retrieving CoachTip for plan');
      
      const tip = await tipStorage.getTipByPlanId(planId);
      
      if (!tip) {
        return reply.code(404).send({
          error: 'tip_not_found',
          message: `No coaching tip found for plan ${planId}`
        });
      }
      
      // Security check: Ensure user can only access their own tips
      // This would typically be done via authentication middleware
      // For now, we'll trust the planId lookup
      
      return reply.code(200).send(tip);
      
    } catch (error) {
      fastify.log.error({ error, planId }, 'Failed to retrieve CoachTip');
      return reply.code(500).send({
        error: 'retrieval_failed',
        message: 'Failed to retrieve coaching tip'
      });
    }
  });

  /**
   * GET /v1/coach-tips/:tipId
   * Retrieve coaching tip by tip ID
   */
  fastify.get<{
    Params: { tipId: string };
  }>('/v1/coach-tips/:tipId', {
    schema: {
      params: {
        type: 'object',
        required: ['tipId'],
        properties: {
          tipId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            planId: { type: 'string' },
            userId: { type: 'string' },
            message: { type: 'string' },
            type: { type: 'string' },
            priority: { type: 'string' },
            action: { type: 'object' },
            scoringContext: { type: 'object' },
            generatedAt: { type: 'string' },
            expiresAt: { type: 'string' },
            storedAt: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: GetTipByTipIdRequest, reply: FastifyReply) => {
    const { tipId } = request.params;
    
    try {
      fastify.log.info({ tipId }, 'Retrieving CoachTip by ID');
      
      const tip = await tipStorage.getTipById(tipId);
      
      if (!tip) {
        return reply.code(404).send({
          error: 'tip_not_found',
          message: `No coaching tip found with ID ${tipId}`
        });
      }
      
      return reply.code(200).send(tip);
      
    } catch (error) {
      fastify.log.error({ error, tipId }, 'Failed to retrieve CoachTip by ID');
      return reply.code(500).send({
        error: 'retrieval_failed',
        message: 'Failed to retrieve coaching tip'
      });
    }
  });

  /**
   * GET /v1/users/:userId/coach-tips
   * Get all active coaching tips for a user
   */
  fastify.get<{
    Params: { userId: string };
  }>('/v1/users/:userId/coach-tips', {
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string' }
        },
        required: ['userId']
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              planId: { type: 'string' },
              userId: { type: 'string' },
              message: { type: 'string' },
              type: { type: 'string' },
              priority: { type: 'string' },
              action: { type: 'object' },
              scoringContext: { type: 'object' },
              generatedAt: { type: 'string' },
              expiresAt: { type: 'string' },
              storedAt: { type: 'string' }
            }
          }
        }
      }
    }
  }, async (request: GetUserTipsRequest, reply: FastifyReply) => {
    const { userId } = request.params;
    
    try {
      fastify.log.info({ userId }, 'Retrieving all CoachTips for user');
      
      const tips = await tipStorage.getTipsByUserId(userId);
      
      return reply.code(200).send(tips);
      
    } catch (error) {
      fastify.log.error({ error, userId }, 'Failed to retrieve user CoachTips');
      return reply.code(500).send({
        error: 'retrieval_failed',
        message: 'Failed to retrieve user coaching tips'
      });
    }
  });

  /**
   * GET /v1/coach-tips/stats
   * Get storage statistics (internal endpoint)
   */
  fastify.get('/v1/coach-tips/stats', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            totalTips: { type: 'number' },
            expiredTips: { type: 'number' },
            activeTips: { type: 'number' },
            timestamp: { type: 'string' }
          }
        }
      }
    }
  }, async (_request, reply: FastifyReply) => {
    try {
      const stats = await tipStorage.getStats();
      
      return reply.code(200).send({
        ...stats,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      fastify.log.error({ error }, 'Failed to retrieve storage stats');
      return reply.code(500).send({
        error: 'stats_failed',
        message: 'Failed to retrieve storage statistics'
      });
    }
  });

  /**
   * POST /v1/coach-tips/cleanup
   * Clean up expired tips (internal endpoint)
   */
  fastify.post('/v1/coach-tips/cleanup', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            cleanedCount: { type: 'number' },
            timestamp: { type: 'string' }
          }
        }
      }
    }
  }, async (_request, reply: FastifyReply) => {
    try {
      const cleanedCount = await tipStorage.cleanupExpiredTips();
      
      return reply.code(200).send({
        cleanedCount,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      fastify.log.error({ error }, 'Failed to cleanup expired tips');
      return reply.code(500).send({
        error: 'cleanup_failed',
        message: 'Failed to cleanup expired tips'
      });
    }
  });

  fastify.log.info('CoachTip API routes registered');
}