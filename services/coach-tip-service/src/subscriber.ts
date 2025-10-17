import { EventBus } from '@athlete-ally/event-bus';
import { PlanGeneratedEvent } from '@athlete-ally/contracts';
import { createLogger } from '@athlete-ally/logger';
import nodeAdapter from '@athlete-ally/logger/server';
import { CoachTipGenerator, TipGenerationContext, PlanScoringSummary } from './tip-generator.js';
import { TipStorage } from './tip-storage.js';
import {
  eventsReceivedCounter,
  tipGenerationDuration,
  scoringExtractionsCounter,
  ErrorType,
  recordSuccessfulProcessing,
  recordSkippedProcessing,
  recordProcessingError
} from './metrics.js';

// Initialize structured logger
const log = createLogger(nodeAdapter, {
  module: 'coach-tip-subscriber',
  service: 'coach-tip-service'
});

/**
 * Statistics for subscriber operations
 */
interface SubscriberStats {
  eventsReceived: number;
  tipsGenerated: number;
  tipsSkipped: number;
  errors: number;
  lastEventTimestamp: string | null;
  errorsByType: Record<string, number>;
  skipReasons: Record<string, number>;
}

export class CoachTipSubscriber {
  private eventBus: EventBus;
  private tipGenerator: CoachTipGenerator;
  private tipStorage: TipStorage;
  private isSubscribed = false;

  // Statistics tracking
  private stats: SubscriberStats = {
    eventsReceived: 0,
    tipsGenerated: 0,
    tipsSkipped: 0,
    errors: 0,
    lastEventTimestamp: null,
    errorsByType: {},
    skipReasons: {}
  };

  constructor(
    eventBus: EventBus,
    tipGenerator: CoachTipGenerator,
    tipStorage: TipStorage
  ) {
    this.eventBus = eventBus;
    this.tipGenerator = tipGenerator;
    this.tipStorage = tipStorage;
  }

  /**
   * Connect to the event bus and subscribe to plan_generated events
   */
  async connect(): Promise<void> {
    if (this.isSubscribed) {
      log.warn('CoachTip subscriber already subscribed');
      return;
    }

    try {
      // Subscribe to plan_generated events
      await this.eventBus.subscribeToPlanGenerated(
        this.handlePlanGenerated.bind(this)
      );

      log.info('CoachTip subscriber listening for plan_generated events');
      this.isSubscribed = true;
    } catch (error) {
      log.error('Failed to connect CoachTip subscriber', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * Disconnect from the event bus
   */
  async disconnect(): Promise<void> {
    if (!this.isSubscribed) {
      return;
    }

    try {
      // EventBus doesn't have explicit unsubscribe, connection will be closed on shutdown
      this.isSubscribed = false;
      log.info('CoachTip subscriber disconnected');
    } catch (error) {
      log.error('Error disconnecting CoachTip subscriber', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * Handle plan_generated events and generate coaching tips
   */
  private async handlePlanGenerated(event: PlanGeneratedEvent): Promise<void> {
    const startTime = Date.now();
    const correlationId = `${event.eventId}-${Date.now()}`;

    // Update stats
    this.stats.eventsReceived++;
    this.stats.lastEventTimestamp = new Date().toISOString();

    // Record metric
    eventsReceivedCounter.inc({ topic: 'plan_generated' });

    log.info('[CoachTip] Received plan_generated event', {
      correlationId,
      eventId: event.eventId,
      planId: event.planId,
      userId: event.userId,
      stage: 'event_received'
    });

    try {
      // Extract scoring data from the enriched event payload
      const planData = (event as any).planData;

      log.info('[CoachTip] Extracting scoring data', {
        correlationId,
        planId: event.planId,
        stage: 'extracting_scoring',
        hasPlanData: !!planData
      });

      const scoring = this.extractScoringData(planData);

      if (!scoring) {
        const duration = (Date.now() - startTime) / 1000;
        this.recordSkip('no_scoring_data', correlationId, event.planId, duration);

        log.info('[CoachTip] No scoring data found, skipping tip generation', {
          correlationId,
          planId: event.planId,
          stage: 'skipped',
          reason: 'no_scoring_data'
        });
        return;
      }

      log.info('[CoachTip] Scoring data extracted successfully', {
        correlationId,
        planId: event.planId,
        stage: 'scoring_extracted',
        totalScore: scoring.total,
        safetyScore: scoring.factors.safety.score,
        complianceScore: scoring.factors.compliance.score,
        performanceScore: scoring.factors.performance.score
      });

      // Check if tip already exists for this plan
      log.info('[CoachTip] Checking for existing tip', {
        correlationId,
        planId: event.planId,
        stage: 'checking_existing'
      });

      const existingTip = await this.tipStorage.getTipByPlanId(event.planId);
      if (existingTip) {
        const duration = (Date.now() - startTime) / 1000;
        this.recordSkip('tip_already_exists', correlationId, event.planId, duration);

        log.info('[CoachTip] Tip already exists, skipping generation', {
          correlationId,
          planId: event.planId,
          existingTipId: existingTip.id,
          stage: 'skipped',
          reason: 'tip_already_exists'
        });
        return;
      }

      // Generate coaching tip
      const tipContext: TipGenerationContext = {
        planId: event.planId,
        userId: event.userId,
        planName: event.planName || 'Training Plan',
        scoring
      };

      log.info('[CoachTip] Generating coaching tip', {
        correlationId,
        planId: event.planId,
        stage: 'generating_tip'
      });

      const genStart = Date.now();
      const coachTip = this.tipGenerator.generateTips(tipContext);
      const genDuration = (Date.now() - genStart) / 1000;

      if (!coachTip) {
        const duration = (Date.now() - startTime) / 1000;

        // Record as error since generation returned null unexpectedly
        this.recordError(
          new Error('Tip generation returned null'),
          ErrorType.TIP_GENERATION_FAILED,
          'tip_generation',
          correlationId,
          event.planId,
          duration
        );

        log.warn('[CoachTip] Tip generation returned null', {
          correlationId,
          planId: event.planId,
          stage: 'generation_failed',
          reason: 'no_tip_generated'
        });
        return;
      }

      // Record successful generation
      tipGenerationDuration.observe({ status: 'success' }, genDuration);

      log.info('[CoachTip] Coaching tip generated successfully', {
        correlationId,
        planId: event.planId,
        tipId: coachTip.id,
        tipType: coachTip.type,
        tipPriority: coachTip.priority,
        generationDurationMs: Math.round(genDuration * 1000),
        stage: 'tip_generated'
      });

      // Store the generated tip
      log.info('[CoachTip] Storing tip in Redis', {
        correlationId,
        planId: event.planId,
        tipId: coachTip.id,
        stage: 'storing_tip'
      });

      await this.tipStorage.storeTip(coachTip);

      // Update stats and record metrics
      const totalDuration = (Date.now() - startTime) / 1000;
      this.stats.tipsGenerated++;
      recordSuccessfulProcessing(coachTip.type, coachTip.priority, totalDuration);

      log.info('[CoachTip] Tip generated and stored successfully', {
        correlationId,
        eventId: event.eventId,
        planId: event.planId,
        userId: event.userId,
        tipId: coachTip.id,
        tipType: coachTip.type,
        tipPriority: coachTip.priority,
        processingDurationMs: Math.round(totalDuration * 1000),
        stage: 'completed'
      });

    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      const errorType = this.classifyAndRecordError(error);

      this.recordError(
        error,
        errorType,
        'event_processing',
        correlationId,
        event.planId,
        duration
      );

      log.error('[CoachTip] Failed to process plan_generated event', {
        correlationId,
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        errorType,
        eventId: event.eventId,
        planId: event.planId,
        userId: event.userId,
        stage: 'error'
      });

      // Re-throw to trigger retry mechanisms in EventBus
      throw error;
    }
  }

  /**
   * Extract scoring data from plan data payload
   * Handles both full PlanScoringSummary format and simplified test format
   */
  private extractScoringData(planData: any): PlanScoringSummary | null {
    try {
      if (!planData || !planData.scoring) {
        scoringExtractionsCounter.inc({ status: 'missing' });
        return null;
      }

      const scoring = planData.scoring;

      // Validate basic scoring structure
      if (!this.isValidScoringData(scoring)) {
        scoringExtractionsCounter.inc({ status: 'invalid' });
        log.warn('Invalid scoring data structure', {
          scoring: JSON.stringify(scoring)
        });
        return null;
      }

      // Check if this is simplified format (missing weights/metadata)
      // Common in test events and basic plan_generated events
      if (scoring.factors && !scoring.weights) {
        log.debug('Converting simplified scoring format to PlanScoringSummary');

        const adapted: PlanScoringSummary = {
          version: '1.0',
          total: scoring.total || 0,
          weights: {
            safety: 0.4,
            compliance: 0.3,
            performance: 0.3
          },
          factors: {
            safety: {
              score: scoring.factors.safety.score,
              weight: 0.4,
              details: this.extractDetails(scoring.factors.safety)
            },
            compliance: {
              score: scoring.factors.compliance.score,
              weight: 0.3,
              details: this.extractDetails(scoring.factors.compliance)
            },
            performance: {
              score: scoring.factors.performance.score,
              weight: 0.3,
              details: this.extractDetails(scoring.factors.performance)
            }
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            planComplexity: 'medium',
            recommendationsApplied: []
          }
        };

        scoringExtractionsCounter.inc({ status: 'success' });
        return adapted;
      }

      // Already in full PlanScoringSummary format
      scoringExtractionsCounter.inc({ status: 'success' });
      return scoring as PlanScoringSummary;
    } catch (error) {
      scoringExtractionsCounter.inc({ status: 'error' });
      log.error('Error extracting scoring data', {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Extract details string from factor data
   * Handles both 'reasons' array and 'details' string formats
   */
  private extractDetails(factor: any): string {
    if (factor.details && typeof factor.details === 'string') {
      return factor.details;
    }
    if (factor.reasons && Array.isArray(factor.reasons)) {
      return factor.reasons.join('; ');
    }
    return '';
  }

  /**
   * Validate that scoring data has required structure
   */
  private isValidScoringData(scoring: any): boolean {
    return (
      scoring &&
      typeof scoring.total === 'number' &&
      scoring.factors &&
      scoring.factors.safety &&
      scoring.factors.compliance &&
      scoring.factors.performance &&
      typeof scoring.factors.safety.score === 'number' &&
      typeof scoring.factors.compliance.score === 'number' &&
      typeof scoring.factors.performance.score === 'number'
    );
  }

  /**
   * Classify error type based on error characteristics
   */
  private classifyAndRecordError(error: unknown): ErrorType {
    if (!error) return ErrorType.UNKNOWN_ERROR;

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorLower = errorMessage.toLowerCase();

    // Redis errors
    if (errorLower.includes('redis') || errorLower.includes('connection')) {
      return ErrorType.REDIS_CONNECTION_ERROR;
    }

    // Schema validation errors
    if (errorLower.includes('schema') || errorLower.includes('validation')) {
      return ErrorType.SCHEMA_VALIDATION_FAILED;
    }

    // Tip generation errors
    if (errorLower.includes('tip generation') || errorLower.includes('generatetips')) {
      return ErrorType.TIP_GENERATION_FAILED;
    }

    // Storage errors
    if (errorLower.includes('storage') || errorLower.includes('store')) {
      return ErrorType.STORAGE_ERROR;
    }

    // Missing data errors
    if (errorLower.includes('scoring') || errorLower.includes('missing')) {
      return ErrorType.MISSING_SCORING_DATA;
    }

    return ErrorType.UNKNOWN_ERROR;
  }

  /**
   * Record a skipped event with stats and metrics
   */
  private recordSkip(
    reason: string,
    correlationId: string,
    planId: string,
    duration: number
  ): void {
    this.stats.tipsSkipped++;
    this.stats.skipReasons[reason] = (this.stats.skipReasons[reason] || 0) + 1;

    recordSkippedProcessing(reason, duration);

    log.debug('[CoachTip] Event processing skipped', {
      correlationId,
      planId,
      reason
    });
  }

  /**
   * Record an error with stats and metrics
   */
  private recordError(
    error: unknown,
    errorType: ErrorType,
    stage: string,
    correlationId: string,
    planId: string,
    duration: number
  ): void {
    this.stats.errors++;
    this.stats.errorsByType[errorType] = (this.stats.errorsByType[errorType] || 0) + 1;

    recordProcessingError(error, stage, duration);

    log.error('[CoachTip] Error during event processing', {
      correlationId,
      planId,
      errorType,
      stage
    });
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.isSubscribed;
  }

  /**
   * Get processing statistics
   */
  getStats(): SubscriberStats & { isConnected: boolean; timestamp: string } {
    return {
      isConnected: this.isSubscribed,
      timestamp: new Date().toISOString(),
      eventsReceived: this.stats.eventsReceived,
      tipsGenerated: this.stats.tipsGenerated,
      tipsSkipped: this.stats.tipsSkipped,
      errors: this.stats.errors,
      lastEventTimestamp: this.stats.lastEventTimestamp,
      errorsByType: { ...this.stats.errorsByType },
      skipReasons: { ...this.stats.skipReasons }
    };
  }

  /**
   * Reset statistics (useful for testing)
   */
  resetStats(): void {
    this.stats = {
      eventsReceived: 0,
      tipsGenerated: 0,
      tipsSkipped: 0,
      errors: 0,
      lastEventTimestamp: null,
      errorsByType: {},
      skipReasons: {}
    };
  }
}
