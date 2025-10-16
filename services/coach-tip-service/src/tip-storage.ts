import { CoachTipPayload } from '@athlete-ally/shared-types/coach-tip';
import { Redis } from 'ioredis';
import { createLogger } from '@athlete-ally/logger';
import nodeAdapter from '@athlete-ally/logger/server';
import { recordRedisOperation } from './metrics.js';

// Initialize structured logger
const log = createLogger(nodeAdapter, {
  module: 'tip-storage',
  service: 'coach-tip-service'
});

export interface StoredCoachTip extends CoachTipPayload {
  storedAt: string;
  isExpired?: boolean;
}

/**
 * Storage system for coaching tips with Redis caching and persistence
 */
export class TipStorage {
  private redis: Redis;
  private keyPrefix = 'coach-tip:';
  private planIndexPrefix = 'plan-tips:';

  constructor(redis: Redis) {
    this.redis = redis;
  }

  /**
   * Store a coaching tip with expiration handling
   */
  async storeTip(tip: CoachTipPayload): Promise<void> {
    const startTime = Date.now();

    try {
      const storedTip: StoredCoachTip = {
        ...tip,
        storedAt: new Date().toISOString()
      };

      const tipKey = this.getTipKey(tip.id);
      const planKey = this.getPlanKey(tip.planId);

      // Store tip data
      await this.redis.set(tipKey, JSON.stringify(storedTip));

      // Index by planId for quick retrieval
      await this.redis.set(planKey, tip.id);

      // Set expiration based on tip's expiresAt
      if (tip.expiresAt) {
        const expirationTime = new Date(tip.expiresAt).getTime();
        const ttlSeconds = Math.floor((expirationTime - Date.now()) / 1000);

        if (ttlSeconds > 0) {
          await this.redis.expire(tipKey, ttlSeconds);
          await this.redis.expire(planKey, ttlSeconds);
        }
      }

      const duration = (Date.now() - startTime) / 1000;
      recordRedisOperation('store_tip', true, duration);

      log.info('CoachTip stored successfully', {
        tipId: tip.id,
        planId: tip.planId,
        userId: tip.userId,
        expiresAt: tip.expiresAt,
        durationMs: Math.round(duration * 1000)
      });

    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      recordRedisOperation('store_tip', false, duration, error);

      log.error('Failed to store CoachTip', {
        error: error instanceof Error ? error.message : String(error),
        tipId: tip.id,
        planId: tip.planId
      });
      throw error;
    }
  }

  /**
   * Retrieve a coaching tip by planId
   */
  async getTipByPlanId(planId: string): Promise<StoredCoachTip | null> {
    const startTime = Date.now();

    try {
      const planKey = this.getPlanKey(planId);
      const tipId = await this.redis.get(planKey);

      if (!tipId) {
        const duration = (Date.now() - startTime) / 1000;
        recordRedisOperation('get_tip_by_plan', true, duration);
        return null;
      }

      const result = await this.getTipById(tipId);
      const duration = (Date.now() - startTime) / 1000;
      recordRedisOperation('get_tip_by_plan', true, duration);

      return result;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      recordRedisOperation('get_tip_by_plan', false, duration, error);

      log.error('Failed to retrieve CoachTip by planId', {
        error: error instanceof Error ? error.message : String(error),
        planId
      });
      throw error;
    }
  }

  /**
   * Retrieve a coaching tip by tipId
   */
  async getTipById(tipId: string): Promise<StoredCoachTip | null> {
    const startTime = Date.now();

    try {
      const tipKey = this.getTipKey(tipId);
      const tipData = await this.redis.get(tipKey);

      if (!tipData) {
        const duration = (Date.now() - startTime) / 1000;
        recordRedisOperation('get_tip_by_id', true, duration);
        return null;
      }

      const tip: StoredCoachTip = JSON.parse(tipData);

      // Check if tip is expired
      if (tip.expiresAt && new Date(tip.expiresAt) < new Date()) {
        tip.isExpired = true;
        // Clean up expired tip
        await this.deleteTip(tipId, tip.planId);
        const duration = (Date.now() - startTime) / 1000;
        recordRedisOperation('get_tip_by_id', true, duration);
        return null;
      }

      const duration = (Date.now() - startTime) / 1000;
      recordRedisOperation('get_tip_by_id', true, duration);
      return tip;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      recordRedisOperation('get_tip_by_id', false, duration, error);

      log.error('Failed to retrieve CoachTip by tipId', {
        error: error instanceof Error ? error.message : String(error),
        tipId
      });
      throw error;
    }
  }

  /**
   * Delete a coaching tip
   */
  async deleteTip(tipId: string, planId: string): Promise<void> {
    const startTime = Date.now();

    try {
      const tipKey = this.getTipKey(tipId);
      const planKey = this.getPlanKey(planId);

      await Promise.all([
        this.redis.del(tipKey),
        this.redis.del(planKey)
      ]);

      const duration = (Date.now() - startTime) / 1000;
      recordRedisOperation('delete_tip', true, duration);

      log.info('CoachTip deleted', {
        tipId,
        planId,
        durationMs: Math.round(duration * 1000)
      });

    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      recordRedisOperation('delete_tip', false, duration, error);

      log.error('Failed to delete CoachTip', {
        error: error instanceof Error ? error.message : String(error),
        tipId,
        planId
      });
      throw error;
    }
  }

  /**
   * Get all active tips for a user (across all plans)
   */
  async getTipsByUserId(userId: string): Promise<StoredCoachTip[]> {
    const startTime = Date.now();

    try {
      // This is a more expensive operation, used sparingly
      const keys = await this.redis.keys(`${this.keyPrefix}*`);
      const tips: StoredCoachTip[] = [];

      for (const key of keys) {
        const tipData = await this.redis.get(key);
        if (tipData) {
          const tip: StoredCoachTip = JSON.parse(tipData);

          if (tip.userId === userId) {
            // Check if expired
            if (tip.expiresAt && new Date(tip.expiresAt) < new Date()) {
              await this.deleteTip(tip.id, tip.planId);
              continue;
            }

            tips.push(tip);
          }
        }
      }

      const duration = (Date.now() - startTime) / 1000;
      recordRedisOperation('get_tips_by_user', true, duration);

      return tips.sort((a, b) =>
        new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
      );

    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      recordRedisOperation('get_tips_by_user', false, duration, error);

      log.error('Failed to retrieve CoachTips by userId', {
        error: error instanceof Error ? error.message : String(error),
        userId
      });
      throw error;
    }
  }

  /**
   * Clean up expired tips
   */
  async cleanupExpiredTips(): Promise<number> {
    const startTime = Date.now();

    try {
      const keys = await this.redis.keys(`${this.keyPrefix}*`);
      let cleanedCount = 0;

      for (const key of keys) {
        const tipData = await this.redis.get(key);
        if (tipData) {
          const tip: StoredCoachTip = JSON.parse(tipData);

          if (tip.expiresAt && new Date(tip.expiresAt) < new Date()) {
            await this.deleteTip(tip.id, tip.planId);
            cleanedCount++;
          }
        }
      }

      const duration = (Date.now() - startTime) / 1000;
      recordRedisOperation('cleanup_expired', true, duration);

      log.info('Expired CoachTips cleaned up', {
        cleanedCount,
        durationMs: Math.round(duration * 1000)
      });
      return cleanedCount;

    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      recordRedisOperation('cleanup_expired', false, duration, error);

      log.error('Failed to cleanup expired CoachTips', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    totalTips: number;
    expiredTips: number;
    activeTips: number;
  }> {
    const startTime = Date.now();

    try {
      const keys = await this.redis.keys(`${this.keyPrefix}*`);
      let totalTips = 0;
      let expiredTips = 0;
      let activeTips = 0;

      for (const key of keys) {
        const tipData = await this.redis.get(key);
        if (tipData) {
          totalTips++;
          const tip: StoredCoachTip = JSON.parse(tipData);

          if (tip.expiresAt && new Date(tip.expiresAt) < new Date()) {
            expiredTips++;
          } else {
            activeTips++;
          }
        }
      }

      const duration = (Date.now() - startTime) / 1000;
      recordRedisOperation('get_stats', true, duration);

      return {
        totalTips,
        expiredTips,
        activeTips
      };

    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      recordRedisOperation('get_stats', false, duration, error);

      log.error('Failed to get storage stats', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  private getTipKey(tipId: string): string {
    return `${this.keyPrefix}${tipId}`;
  }

  private getPlanKey(planId: string): string {
    return `${this.planIndexPrefix}${planId}`;
  }
}