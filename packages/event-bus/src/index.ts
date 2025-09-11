import { connect, NatsConnection, JetStreamManager, JetStreamClient } from 'nats';
import { OnboardingCompletedEvent, PlanGeneratedEvent, PlanGenerationRequestedEvent, PlanGenerationFailedEvent, EVENT_TOPICS } from '@athlete-ally/contracts';

export class EventBus {
  private nc: NatsConnection | null = null;
  private js: JetStreamClient | null = null;
  private jsm: JetStreamManager | null = null;

  async connect(url: string = 'nats://localhost:4222') {
    this.nc = await connect({ servers: url });
    this.js = this.nc.jetstream();
    this.jsm = await this.nc.jetstreamManager();
    
    // Create streams if they don't exist
    await this.ensureStreams();
  }

  private async ensureStreams() {
    if (!this.jsm) throw new Error('JetStreamManager not initialized');

    const streams = [
      {
        name: 'ATHLETE_ALLY_EVENTS',
        subjects: ['athlete-ally.*'],
        retention: 'limits' as any,
        max_age: 24 * 60 * 60 * 1000 * 1000 * 1000, // 24 hours in nanoseconds
        max_msgs: 1000000,
      }
    ];

    for (const stream of streams) {
      try {
        await this.jsm.streams.add(stream);
      } catch (error) {
        // Stream might already exist
        console.log(`Stream ${stream.name} might already exist`);
      }
    }
  }

  async publishOnboardingCompleted(event: OnboardingCompletedEvent) {
    if (!this.js) throw new Error('JetStream not initialized');
    
    const data = JSON.stringify(event);
    await this.js.publish(EVENT_TOPICS.ONBOARDING_COMPLETED, new TextEncoder().encode(data));
    console.log('Published OnboardingCompleted event:', event.eventId);
  }

  async publishPlanGenerationRequested(event: PlanGenerationRequestedEvent) {
    if (!this.js) throw new Error('JetStream not initialized');
    
    const data = JSON.stringify(event);
    await this.js.publish(EVENT_TOPICS.PLAN_GENERATION_REQUESTED, new TextEncoder().encode(data));
    console.log('Published PlanGenerationRequested event:', event.eventId);
  }

  async publishPlanGenerated(event: PlanGeneratedEvent) {
    if (!this.js) throw new Error('JetStream not initialized');
    
    const data = JSON.stringify(event);
    await this.js.publish(EVENT_TOPICS.PLAN_GENERATED, new TextEncoder().encode(data));
    console.log('Published PlanGenerated event:', event.eventId);
  }

  async publishPlanGenerationFailed(event: PlanGenerationFailedEvent) {
    if (!this.js) throw new Error('JetStream not initialized');
    
    const data = JSON.stringify(event);
    await this.js.publish(EVENT_TOPICS.PLAN_GENERATION_FAILED, new TextEncoder().encode(data));
    console.log('Published PlanGenerationFailed event:', event.eventId);
  }

  async subscribeToOnboardingCompleted(callback: (event: OnboardingCompletedEvent) => Promise<void>) {
    if (!this.js) throw new Error('JetStream not initialized');

    const psub = await this.js.pullSubscribe(EVENT_TOPICS.ONBOARDING_COMPLETED, {
      durable: 'planning-engine-onboarding-sub',
    } as any);

    // 使用正确的pull消费模式 - 使用for await循环
    (async () => {
      for await (const m of psub) {
        try {
          const event = JSON.parse(new TextDecoder().decode(m.data)) as OnboardingCompletedEvent;
          await callback(event);
          m.ack();
        } catch (error) {
          console.error('Error processing OnboardingCompleted event:', error);
          m.nak();
        }
      }
    })();
  }

  async subscribeToPlanGenerationRequested(callback: (event: PlanGenerationRequestedEvent) => Promise<void>) {
    if (!this.js) throw new Error('JetStream not initialized');

    const psub = await this.js.pullSubscribe(EVENT_TOPICS.PLAN_GENERATION_REQUESTED, {
      durable: 'planning-engine-plan-gen-sub',
    } as any);

    // 使用正确的pull消费模式 - 使用for await循环
    (async () => {
      for await (const m of psub) {
        try {
          const event = JSON.parse(new TextDecoder().decode(m.data)) as PlanGenerationRequestedEvent;
          await callback(event);
          m.ack();
        } catch (error) {
          console.error('Error processing PlanGenerationRequested event:', error);
          m.nak();
        }
      }
    })();
  }

  async close() {
    if (this.nc) {
      await this.nc.close();
    }
  }
}

export const eventBus = new EventBus();