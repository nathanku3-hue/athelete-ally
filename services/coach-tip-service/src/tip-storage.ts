import { CoachTipPayload } from '@athlete-ally/shared-types/coach-tip';
import { Redis } from 'ioredis';

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

      console.info({
        tipId: tip.id,
        planId: tip.planId,
        userId: tip.userId,
        expiresAt: tip.expiresAt
      }, 'CoachTip stored successfully');

    } catch (error) {
      console.error({
        error: error instanceof Error ? error.message : String(error),
        tipId: tip.id,
        planId: tip.planId
      }, 'Failed to store CoachTip');
      throw error;
    }
  }

  /**
   * Retrieve a coaching tip by planId
   */
  async getTipByPlanId(planId: string): Promise<StoredCoachTip | null> {
    try {
      const planKey = this.getPlanKey(planId);
      const tipId = await this.redis.get(planKey);
      
      if (!tipId) {
        return null;
      }

      return await this.getTipById(tipId);
    } catch (error) {
      console.error({
        error: error instanceof Error ? error.message : String(error),
        planId
      }, 'Failed to retrieve CoachTip by planId');
      throw error;
    }
  }

  /**
   * Retrieve a coaching tip by tipId
   */
  async getTipById(tipId: string): Promise<StoredCoachTip | null> {
    try {
      const tipKey = this.getTipKey(tipId);
      const tipData = await this.redis.get(tipKey);
      
      if (!tipData) {
        return null;
      }

      const tip: StoredCoachTip = JSON.parse(tipData);
      
      // Check if tip is expired
      if (tip.expiresAt && new Date(tip.expiresAt) < new Date()) {
        tip.isExpired = true;
        // Clean up expired tip
        await this.deleteTip(tipId, tip.planId);
        return null;
      }

      return tip;
    } catch (error) {
      console.error({
        error: error instanceof Error ? error.message : String(error),
        tipId
      }, 'Failed to retrieve CoachTip by tipId');
      throw error;
    }
  }

  /**
   * Delete a coaching tip
   */
  async deleteTip(tipId: string, planId: string): Promise<void> {
    try {
      const tipKey = this.getTipKey(tipId);
      const planKey = this.getPlanKey(planId);
      
      await Promise.all([
        this.redis.del(tipKey),
        this.redis.del(planKey)
      ]);

      console.info({
        tipId,
        planId
      }, 'CoachTip deleted');

    } catch (error) {
      console.error({
        error: error instanceof Error ? error.message : String(error),
        tipId,
        planId
      }, 'Failed to delete CoachTip');
      throw error;
    }
  }

  /**
   * Get all active tips for a user (across all plans)
   */
  async getTipsByUserId(userId: string): Promise<StoredCoachTip[]> {
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
      
      return tips.sort((a, b) => 
        new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
      );
      
    } catch (error) {
      console.error({
        error: error instanceof Error ? error.message : String(error),
        userId
      }, 'Failed to retrieve CoachTips by userId');
      throw error;
    }
  }

  /**
   * Clean up expired tips
   */
  async cleanupExpiredTips(): Promise<number> {
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
      
      console.info({ cleanedCount }, 'Expired CoachTips cleaned up');
      return cleanedCount;
      
    } catch (error) {
      console.error('Failed to cleanup expired CoachTips:', error);
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
      
      return {
        totalTips,
        expiredTips,
        activeTips
      };
      
    } catch (error) {
      console.error('Failed to get storage stats:', error);
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