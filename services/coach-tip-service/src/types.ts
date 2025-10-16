/**
 * Internal types for CoachTip service
 * These differ from the public API types in @athlete-ally/shared-types
 */

export type CoachTipType = 'safety' | 'compliance' | 'performance' | 'general';
export type CoachTipPriority = 'high' | 'medium' | 'low';

export interface CoachTipAction {
  actionType: string;
  data: Record<string, any>;
}

export interface CoachTipScoringContext {
  totalScore: number;
  safetyScore: number;
  complianceScore: number;
  performanceScore: number;
}

/**
 * Internal payload format for generated coaching tips
 */
export interface CoachTipPayload {
  id: string;
  planId: string;
  userId: string;
  message: string;
  type: CoachTipType;
  priority: CoachTipPriority;
  action: CoachTipAction;
  scoringContext: CoachTipScoringContext;
  generatedAt: string;
  expiresAt: string;
}

/**
 * Stored tip with additional metadata
 */
export interface StoredCoachTip extends CoachTipPayload {
  storedAt: string;
  isExpired?: boolean;
}
