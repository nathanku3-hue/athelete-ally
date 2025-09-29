import { EventBus } from '@athlete-ally/event-bus';
import { EVENT_TOPICS, HRVNormalizedStoredEvent } from '@athlete-ally/contracts';
import { PrismaClient } from '../prisma/generated/client';
import { ReadinessCalculator } from './readinessCalculator';

export class EventHandlers {
  private eventBus: EventBus;
  private prisma: PrismaClient;
  private readinessCalculator: ReadinessCalculator;

  constructor(eventBus: EventBus, prisma: PrismaClient) {
    this.eventBus = eventBus;
    this.prisma = prisma;
    this.readinessCalculator = new ReadinessCalculator(prisma);
  }

  /**
   * Subscribe to HRV normalized events and process readiness calculations
   */
  async subscribeToHrvNormalizedEvents(): Promise<void> {
    if (!this.eventBus) {
      throw new Error('EventBus not initialized');
    }

    // Subscribe to HRV normalized-stored events
    const subscription = await (this.eventBus as any).js.pullSubscribe(EVENT_TOPICS.HRV_NORMALIZED_STORED, {
      durable: 'insights-engine-hrv-normalized',
      batch: 10,
      expires: 1000
    });

    console.log('Subscribed to HRV normalized events');

    // Process events in batches
    (async () => {
      while (true) {
        try {
          const messages = await subscription.fetch({ max: 10, expires: 1000 });
          
          if (messages.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
            continue;
          }

          console.log(`Processing batch of ${messages.length} HRV normalized events`);

          // Process messages concurrently
          const processingPromises = messages.map(async (msg: any) => {
            try {
              const eventData = JSON.parse(new TextDecoder().decode(msg.data));
              
              // Validate event structure
              if (!eventData.record || !eventData.record.userId || !eventData.record.rMSSD) {
                console.error('Invalid HRV normalized event structure:', eventData);
                await msg.nak();
                return;
              }

              await this.processHrvNormalizedEvent(eventData);
              await msg.ack();
              
            } catch (error) {
              console.error('Error processing HRV normalized event:', error);
              await msg.nak();
            }
          });

          await Promise.all(processingPromises);

        } catch (error) {
          console.error('Error in HRV normalized event processing loop:', error);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    })();
  }

  /**
   * Process a single HRV normalized event
   */
  private async processHrvNormalizedEvent(eventData: HRVNormalizedStoredEvent): Promise<void> {
    try {
      const { record } = eventData;
      const { userId, date, rMSSD, capturedAt } = record;

      console.log(`Processing HRV normalized event for user ${userId}, date ${date}`);

      // Calculate readiness score
      const readinessResult = await this.readinessCalculator.calculateReadiness({
        userId,
        currentRMSSD: rMSSD,
        currentDate: date,
        capturedAt
      });

      // Store readiness score (idempotent upsert)
      await this.prisma.readinessScore.upsert({
        where: {
          userId_date: {
            userId,
            date: new Date(date)
          }
        },
        update: {
          score: readinessResult.score,
          hrvDelta: readinessResult.hrvDelta,
          trend3d: readinessResult.trend3d,
          dataFreshness: readinessResult.dataFreshness
        },
        create: {
          userId,
          date: new Date(date),
          score: readinessResult.score,
          hrvDelta: readinessResult.hrvDelta,
          trend3d: readinessResult.trend3d,
          dataFreshness: readinessResult.dataFreshness
        }
      });

      console.log(`Readiness score calculated and stored: ${readinessResult.score} for user ${userId}`);

    } catch (error) {
      console.error('Error processing HRV normalized event:', error);
      throw error;
    }
  }
}
