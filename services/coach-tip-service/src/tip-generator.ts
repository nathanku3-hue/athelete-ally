import { CoachTipPayload, CoachTipAction } from './types.js';
import { createLogger } from '@athlete-ally/logger';
import nodeAdapter from '@athlete-ally/logger/server';

// Initialize structured logger
const log = createLogger(nodeAdapter, {
  module: 'tip-generator',
  service: 'coach-tip-service'
});

export interface PlanScoringSummary {
  version: string;
  total: number;
  weights: {
    safety: number;
    compliance: number;
    performance: number;
  };
  factors: {
    safety: { score: number; weight: number; details: string };
    compliance: { score: number; weight: number; details: string };
    performance: { score: number; weight: number; details: string };
  };
  metadata: {
    generatedAt: string;
    planComplexity: string;
    recommendationsApplied: string[];
  };
}

export interface TipGenerationContext {
  planId: string;
  userId: string;
  planName: string;
  scoring: PlanScoringSummary;
}

interface TipCandidate {
  type: 'safety' | 'compliance' | 'performance' | 'general';
  priority: 'high' | 'medium' | 'low';
  message: string;
  actionType: CoachTipAction['actionType'];
  actionData?: any;
  scoringContext: {
    factorScore: number;
    threshold: number;
    improvementPotential: number;
  };
}

/**
 * Generates contextual coaching tips based on plan scoring data
 */
export class CoachTipGenerator {
  
  /**
   * Generate coaching tips from plan scoring context
   */
  generateTips(context: TipGenerationContext): CoachTipPayload | null {
    const { scoring, planId, userId } = context;

    if (!scoring) {
      log.warn('No scoring data available for plan', {
        planId,
        userId
      });
      return null;
    }

    const candidates = this.generateTipCandidates(scoring);

    log.debug('Generated tip candidates', {
      planId,
      candidatesCount: candidates.length
    });

    if (candidates.length === 0) {
      log.info('No candidates generated, using fallback tip', {
        planId
      });
      return this.generateFallbackTip(context);
    }

    // Select the highest priority tip
    const selectedTip = this.selectBestTip(candidates);

    log.debug('Selected best tip from candidates', {
      planId,
      selectedTipType: selectedTip.type,
      selectedTipPriority: selectedTip.priority,
      improvementPotential: selectedTip.scoringContext.improvementPotential
    });

    return {
      id: `tip-${planId}-${Date.now()}`,
      planId,
      userId,
      message: selectedTip.message,
      type: selectedTip.type,
      priority: selectedTip.priority,
      action: {
        actionType: selectedTip.actionType,
        data: selectedTip.actionData || {}
      },
      scoringContext: {
        totalScore: scoring.total,
        safetyScore: scoring.factors.safety.score,
        complianceScore: scoring.factors.compliance.score,
        performanceScore: scoring.factors.performance.score
      },
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };
  }

  private generateTipCandidates(scoring: PlanScoringSummary): TipCandidate[] {
    const candidates: TipCandidate[] = [];
    
    // Safety factor analysis
    candidates.push(...this.analyzeSafetyFactor(scoring.factors.safety));
    
    // Compliance factor analysis
    candidates.push(...this.analyzeComplianceFactor(scoring.factors.compliance));
    
    // Performance factor analysis
    candidates.push(...this.analyzePerformanceFactor(scoring.factors.performance));
    
    // Overall score analysis
    candidates.push(...this.analyzeOverallScore(scoring));
    
    return candidates;
  }

  private analyzeSafetyFactor(safety: PlanScoringSummary['factors']['safety']): TipCandidate[] {
    const candidates: TipCandidate[] = [];
    
    if (safety.score < 70) {
      candidates.push({
        type: 'safety',
        priority: 'high',
        message: 'Your plan has several safety concerns. Consider reducing training volume or intensity for the first 2 weeks.',
        actionType: 'modify_plan',
        actionData: { suggestion: 'reduce_volume', weeks: [1, 2] },
        scoringContext: {
          factorScore: safety.score,
          threshold: 70,
          improvementPotential: 70 - safety.score
        }
      });
    } else if (safety.score < 85) {
      candidates.push({
        type: 'safety',
        priority: 'medium', 
        message: 'Good safety foundation! Pay extra attention to proper form and warm-up routines.',
        actionType: 'emphasize_form',
        scoringContext: {
          factorScore: safety.score,
          threshold: 85,
          improvementPotential: 85 - safety.score
        }
      });
    }
    
    return candidates;
  }

  private analyzeComplianceFactor(compliance: PlanScoringSummary['factors']['compliance']): TipCandidate[] {
    const candidates: TipCandidate[] = [];
    
    if (compliance.score < 75) {
      candidates.push({
        type: 'compliance',
        priority: 'high',
        message: 'This plan might be challenging to stick with. Consider shorter sessions or fewer weekly workouts initially.',
        actionType: 'adjust_schedule',
        actionData: { suggestion: 'reduce_frequency', alternative: 'shorter_sessions' },
        scoringContext: {
          factorScore: compliance.score,
          threshold: 75,
          improvementPotential: 75 - compliance.score
        }
      });
    } else if (compliance.score < 90) {
      candidates.push({
        type: 'compliance',
        priority: 'medium',
        message: 'Solid plan! Set up your workout schedule in advance and prepare your equipment to stay consistent.',
        actionType: 'schedule_prep',
        scoringContext: {
          factorScore: compliance.score,
          threshold: 90,
          improvementPotential: 90 - compliance.score
        }
      });
    }
    
    return candidates;
  }

  private analyzePerformanceFactor(performance: PlanScoringSummary['factors']['performance']): TipCandidate[] {
    const candidates: TipCandidate[] = [];
    
    if (performance.score >= 90) {
      candidates.push({
        type: 'performance',
        priority: 'low',
        message: 'Excellent performance potential! Focus on progressive overload and track your improvements weekly.',
        actionType: 'track_progress',
        actionData: { frequency: 'weekly', metrics: ['strength', 'volume'] },
        scoringContext: {
          factorScore: performance.score,
          threshold: 90,
          improvementPotential: 0
        }
      });
    } else if (performance.score < 75) {
      candidates.push({
        type: 'performance',
        priority: 'medium',
        message: 'Good foundation! Consider adding more exercise variety or adjusting rep ranges for better results.',
        actionType: 'enhance_variety',
        actionData: { suggestion: 'add_exercises', focus: 'variety' },
        scoringContext: {
          factorScore: performance.score,
          threshold: 75,
          improvementPotential: 75 - performance.score
        }
      });
    }
    
    return candidates;
  }

  private analyzeOverallScore(scoring: PlanScoringSummary): TipCandidate[] {
    const candidates: TipCandidate[] = [];
    
    if (scoring.total >= 90) {
      candidates.push({
        type: 'general',
        priority: 'low',
        message: 'Outstanding plan! Stay consistent and listen to your body for optimal results.',
        actionType: 'stay_consistent',
        scoringContext: {
          factorScore: scoring.total,
          threshold: 90,
          improvementPotential: 0
        }
      });
    } else if (scoring.total < 70) {
      candidates.push({
        type: 'general',
        priority: 'high',
        message: 'This plan needs some adjustments. Consider consulting with a trainer for personalized modifications.',
        actionType: 'seek_guidance',
        scoringContext: {
          factorScore: scoring.total,
          threshold: 70,
          improvementPotential: 70 - scoring.total
        }
      });
    }
    
    return candidates;
  }

  private selectBestTip(candidates: TipCandidate[]): TipCandidate {
    // Sort by priority (high > medium > low) then by improvement potential
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    
    candidates.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return b.scoringContext.improvementPotential - a.scoringContext.improvementPotential;
    });
    
    return candidates[0];
  }

  private generateFallbackTip(context: TipGenerationContext): CoachTipPayload {
    return {
      id: `tip-${context.planId}-${Date.now()}`,
      planId: context.planId,
      userId: context.userId,
      message: 'Great work on creating your training plan! Focus on consistency and proper form for the best results.',
      type: 'general',
      priority: 'low',
      action: {
        actionType: 'stay_consistent',
        data: {}
      },
      scoringContext: {
        totalScore: 0,
        safetyScore: 0,
        complianceScore: 0,
        performanceScore: 0
      },
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  }
}