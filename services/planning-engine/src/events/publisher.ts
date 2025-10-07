import { EventBus } from '@athlete-ally/event-bus';
import { config } from '../config.js';
import { register, Counter, Histogram } from 'prom-client';

// 事件发布指标
export const eventPublisherMetrics = {
  // 事件发布总数
  eventsPublished: new Counter({
    name: 'planning_engine_events_published_total',
    help: 'Total number of events published',
    labelNames: ['topic', 'status']
  }),

  // 事件发布持续时间
  eventPublishingDuration: new Histogram({
    name: 'planning_engine_event_publishing_duration_seconds',
    help: 'Duration of event publishing',
    labelNames: ['topic', 'status'],
    buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  }),

  // 事件发布错误
  eventPublishingErrors: new Counter({
    name: 'planning_engine_event_publishing_errors_total',
    help: 'Total number of event publishing errors',
    labelNames: ['topic', 'error_type']
  })
};

// 注册指标
Object.values(eventPublisherMetrics).forEach(metric => {
  register.registerMetric(metric);
});

export class EventPublisher {
  private eventBus: EventBus;
  private isConnected = false;

  constructor() {
    this.eventBus = new EventBus();
  }

  async connect() {
    try {
      await this.eventBus.connect(config.NATS_URL);
      this.isConnected = true;
      console.log('Event publisher connected to NATS');
    } catch (error) {
      console.error('Failed to connect event publisher:', error);
      throw error;
    }
  }

  private async publishWithMetrics<_T>(
    topic: string,
    publishFn: () => Promise<void>
  ) {
    if (!this.isConnected) {
      throw new Error('Event publisher not connected');
    }

    const startTime = Date.now();
    
    try {
      await publishFn();
      
      const duration = (Date.now() - startTime) / 1000;
      eventPublisherMetrics.eventPublishingDuration.observe(
        { topic, status: 'success' },
        duration
      );
      eventPublisherMetrics.eventsPublished.inc({ topic, status: 'success' });
      
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      eventPublisherMetrics.eventPublishingDuration.observe(
        { topic, status: 'error' },
        duration
      );
      eventPublisherMetrics.eventsPublished.inc({ topic, status: 'error' });
      eventPublisherMetrics.eventPublishingErrors.inc({
        topic,
        error_type: 'publish_error'
      });
      
      console.error(`Error publishing ${topic} event:`, error);
      throw error;
    }
  }

  async publishOnboardingCompleted(event: any) {
    await this.publishWithMetrics('onboarding_completed', async () => {
      await this.eventBus.publishOnboardingCompleted(event);
    });
  }

  async publishPlanGenerationRequested(event: any) {
    await this.publishWithMetrics('plan_generation_requested', async () => {
      await this.eventBus.publishPlanGenerationRequested(event);
    });
  }

  async publishPlanGenerated(event: any) {
    await this.publishWithMetrics('plan_generated', async () => {
      await this.eventBus.publishPlanGenerated(event);
    });
  }

  async publishPlanGenerationFailed(event: any) {
    await this.publishWithMetrics('plan_generation_failed', async () => {
      await this.eventBus.publishPlanGenerationFailed(event);
    });
  }

  isHealthy(): boolean {
    return this.isConnected;
  }

  getStatus() {
    return {
      connected: this.isConnected,
      metrics: {
        eventsPublished: eventPublisherMetrics.eventsPublished,
        eventPublishingDuration: eventPublisherMetrics.eventPublishingDuration,
        eventPublishingErrors: eventPublisherMetrics.eventPublishingErrors
      }
    };
  }

  async disconnect() {
    await this.eventBus.close();
    this.isConnected = false;
  }
}

export const eventPublisher = new EventPublisher();
