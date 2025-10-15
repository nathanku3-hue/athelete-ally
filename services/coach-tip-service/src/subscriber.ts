import { EventBus } from '@athlete-ally/event-bus';
import { PlanGeneratedEvent } from '@athlete-ally/contracts';
import { CoachTipGenerator, TipGenerationContext, PlanScoringSummary } from './tip-generator.js';
import { TipStorage } from './tip-storage.js';

export class CoachTipSubscriber {
  private eventBus: EventBus;
  private tipGenerator: CoachTipGenerator;
  private tipStorage: TipStorage;
  private isSubscribed = false;

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
      console.warn('CoachTip subscriber already subscribed');
      return;
    }

    try {
      // Subscribe to plan_generated events
      await this.eventBus.subscribeToPlanGenerated(
        this.handlePlanGenerated.bind(this)
      );
      
      console.info('CoachTip subscriber listening for plan_generated events');
      this.isSubscribed = true;
    } catch (error) {
      console.error('Failed to connect CoachTip subscriber:', error);
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
      console.info('CoachTip subscriber disconnected');
    } catch (error) {
      console.error('Error disconnecting CoachTip subscriber:', error);
      throw error;
    }
  }

  /**
   * Handle plan_generated events and generate coaching tips
   */
  private async handlePlanGenerated(event: PlanGeneratedEvent): Promise<void> {
    
    console.info({
      eventId: event.eventId,
      planId: event.planId,
      userId: event.userId
    }, 'Processing plan_generated event for CoachTip generation');

    try {
      // Extract scoring data from the enriched event payload
      const planData = (event as any).planData;
      const scoring = this.extractScoringData(planData);
      
      if (!scoring) {
        console.info({ planId: event.planId }, 'No scoring data found, skipping tip generation');
        return;
      }

      // Check if tip already exists for this plan
      const existingTip = await this.tipStorage.getTipByPlanId(event.planId);
      if (existingTip) {
        console.info({ planId: event.planId }, 'CoachTip already exists for plan, skipping generation');
        return;
      }

      // Generate coaching tip
      const tipContext: TipGenerationContext = {
        planId: event.planId,
        userId: event.userId,
        planName: event.planName || 'Training Plan',
        scoring
      };

      const coachTip = this.tipGenerator.generateTips(tipContext);
      
      if (!coachTip) {
        console.warn({ planId: event.planId }, 'No coaching tip generated');
        return;
      }

      // Store the generated tip
      await this.tipStorage.storeTip(coachTip);
      
      console.info({
        tipId: coachTip.id,
        planId: event.planId,
        userId: event.userId,
        tipType: coachTip.type,
        tipPriority: coachTip.priority
      }, 'CoachTip generated and stored successfully');

    } catch (error) {
      console.error({
        error: error instanceof Error ? error.message : String(error),
        eventId: event.eventId,
        planId: event.planId,
        userId: event.userId
      }, 'Failed to process plan_generated event for CoachTip generation');
      
      // Re-throw to trigger retry mechanisms
      throw error;
    }
  }

  /**
   * Extract scoring data from plan data payload
   */
  private extractScoringData(planData: any): PlanScoringSummary | null {
    if (!planData || !planData.scoring) {
      return null;
    }

    const scoring = planData.scoring;
    
    // Validate scoring structure
    if (!this.isValidScoringData(scoring)) {
      console.warn('Invalid scoring data structure:', scoring);
      return null;
    }

    return scoring as PlanScoringSummary;
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
   * Get connection status
   */
  isConnected(): boolean {
    return this.isSubscribed;
  }

  /**
   * Get processing statistics 
   */
  getStats() {
    return {
      isConnected: this.isSubscribed,
      timestamp: new Date().toISOString()
    };
  }
}