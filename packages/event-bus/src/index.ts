import { connect, NatsConnection, JetStreamManager, JetStreamClient } from 'nats';
import { OnboardingCompletedEvent, PlanGeneratedEvent, PlanGenerationRequestedEvent, PlanGenerationFailedEvent, EVENT_TOPICS } from '@athlete-ally/contracts';
import { eventValidator, ValidationResult } from './validator.js';
import { config } from './config.js';
import { register, Counter, Histogram } from 'prom-client';

// Event Bus 指标
export const eventBusMetrics = {
  // 事件发布总数
  eventsPublished: new Counter({
    name: 'event_bus_events_published_total',
    help: 'Total number of events published',
    labelNames: ['topic', 'status']
  }),

  // 事件消费总数
  eventsConsumed: new Counter({
    name: 'event_bus_events_consumed_total',
    help: 'Total number of events consumed',
    labelNames: ['topic', 'status']
  }),

  // Schema 校验指标
  schemaValidation: new Counter({
    name: 'event_bus_schema_validation_total',
    help: 'Total number of schema validations',
    labelNames: ['topic', 'status']
  }),

  // Schema 校验失败
  schemaValidationFailures: new Counter({
    name: 'event_bus_schema_validation_failures_total',
    help: 'Total number of schema validation failures',
    labelNames: ['topic', 'error_type']
  }),

  // 事件处理持续时间
  eventProcessingDuration: new Histogram({
    name: 'event_bus_event_processing_duration_seconds',
    help: 'Duration of event processing',
    labelNames: ['topic', 'operation', 'status'],
    buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  }),

  // 事件被拒绝
  eventsRejected: new Counter({
    name: 'event_bus_events_rejected_total',
    help: 'Total number of events rejected',
    labelNames: ['topic', 'reason']
  })
};

// 注册指标
Object.values(eventBusMetrics).forEach(metric => {
  register.registerMetric(metric);
});

export class EventBus {
  private nc: NatsConnection | null = null;
  private js: JetStreamClient | null = null;
  private jsm: JetStreamManager | null = null;

  // 通用发布方法
  private async publishEvent(topic: string, event: any, natsTopic: string) {
    if (!this.js) throw new Error('JetStream not initialized');
    
    const startTime = Date.now();
    
    try {
      // Schema 校验
      const validation = await eventValidator.validateEvent(topic, event);
      eventBusMetrics.schemaValidation.inc({ topic, status: 'attempted' });
      
      if (!validation.valid) {
        eventBusMetrics.schemaValidationFailures.inc({ 
          topic, 
          error_type: 'validation_failed' 
        });
        eventBusMetrics.eventsRejected.inc({ topic, reason: 'schema_validation_failed' });
        
        console.error(`Schema validation failed for ${topic} event:`, validation.errors);
        throw new Error(`Schema validation failed: ${validation.message}`);
      }
      
      eventBusMetrics.schemaValidation.inc({ topic, status: 'success' });
      
      const data = JSON.stringify(event);
      await this.js.publish(natsTopic, new TextEncoder().encode(data));
      
      const duration = (Date.now() - startTime) / 1000;
      eventBusMetrics.eventProcessingDuration.observe({
        topic,
        operation: 'publish',
        status: 'success'
      }, duration);
      
      eventBusMetrics.eventsPublished.inc({ topic, status: 'success' });
      console.log(`Published ${topic} event:`, event.eventId);
      
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      eventBusMetrics.eventProcessingDuration.observe({
        topic,
        operation: 'publish',
        status: 'error'
      }, duration);
      
      eventBusMetrics.eventsPublished.inc({ topic, status: 'error' });
      throw error;
    }
  }

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
    await this.publishEvent('onboarding_completed', event, EVENT_TOPICS.ONBOARDING_COMPLETED);
  }

  async publishPlanGenerationRequested(event: PlanGenerationRequestedEvent) {
    await this.publishEvent('plan_generation_requested', event, EVENT_TOPICS.PLAN_GENERATION_REQUESTED);
  }

  async publishPlanGenerated(event: PlanGeneratedEvent) {
    await this.publishEvent('plan_generated', event, EVENT_TOPICS.PLAN_GENERATED);
  }

  async publishPlanGenerationFailed(event: PlanGenerationFailedEvent) {
    await this.publishEvent('plan_generation_failed', event, EVENT_TOPICS.PLAN_GENERATION_FAILED);
  }

  async subscribeToOnboardingCompleted(callback: (event: OnboardingCompletedEvent) => Promise<void>) {
    if (!this.js) throw new Error('JetStream not initialized');

    const psub = await this.js.pullSubscribe(EVENT_TOPICS.ONBOARDING_COMPLETED, {
      durable: 'planning-engine-onboarding-sub',
    } as any);

    const topic = 'onboarding_completed';

    // 使用正确的pull消费模式 - 使用for await循环
    (async () => {
      for await (const m of psub) {
        const startTime = Date.now();
        
        try {
          const eventData = JSON.parse(new TextDecoder().decode(m.data));
          
          // Schema 校验
          const validation = await eventValidator.validateEvent(topic, eventData);
          eventBusMetrics.schemaValidation.inc({ topic, status: 'attempted' });
          
          if (!validation.valid) {
            eventBusMetrics.schemaValidationFailures.inc({ 
              topic, 
              error_type: 'validation_failed' 
            });
            eventBusMetrics.eventsRejected.inc({ topic, reason: 'schema_validation_failed' });
            
            console.error('Schema validation failed for received OnboardingCompleted event:', validation.errors);
            m.nak();
            continue;
          }
          
          eventBusMetrics.schemaValidation.inc({ topic, status: 'success' });
          
          const event = eventData as OnboardingCompletedEvent;
          await callback(event);
          
          const duration = (Date.now() - startTime) / 1000;
          eventBusMetrics.eventProcessingDuration.observe({
            topic,
            operation: 'consume',
            status: 'success'
          }, duration);
          
          eventBusMetrics.eventsConsumed.inc({ topic, status: 'success' });
          m.ack();
          
        } catch (error) {
          const duration = (Date.now() - startTime) / 1000;
          eventBusMetrics.eventProcessingDuration.observe({
            topic,
            operation: 'consume',
            status: 'error'
          }, duration);
          
          eventBusMetrics.eventsConsumed.inc({ topic, status: 'error' });
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

    const topic = 'plan_generation_requested';

    // 使用正确的pull消费模式 - 使用for await循环
    (async () => {
      for await (const m of psub) {
        const startTime = Date.now();
        
        try {
          const eventData = JSON.parse(new TextDecoder().decode(m.data));
          
          // Schema 校验
          const validation = await eventValidator.validateEvent(topic, eventData);
          eventBusMetrics.schemaValidation.inc({ topic, status: 'attempted' });
          
          if (!validation.valid) {
            eventBusMetrics.schemaValidationFailures.inc({ 
              topic, 
              error_type: 'validation_failed' 
            });
            eventBusMetrics.eventsRejected.inc({ topic, reason: 'schema_validation_failed' });
            
            console.error('Schema validation failed for received PlanGenerationRequested event:', validation.errors);
            m.nak();
            continue;
          }
          
          eventBusMetrics.schemaValidation.inc({ topic, status: 'success' });
          
          const event = eventData as PlanGenerationRequestedEvent;
          await callback(event);
          
          const duration = (Date.now() - startTime) / 1000;
          eventBusMetrics.eventProcessingDuration.observe({
            topic,
            operation: 'consume',
            status: 'success'
          }, duration);
          
          eventBusMetrics.eventsConsumed.inc({ topic, status: 'success' });
          m.ack();
          
        } catch (error) {
          const duration = (Date.now() - startTime) / 1000;
          eventBusMetrics.eventProcessingDuration.observe({
            topic,
            operation: 'consume',
            status: 'error'
          }, duration);
          
          eventBusMetrics.eventsConsumed.inc({ topic, status: 'error' });
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

  // 获取 Prometheus 指标
  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  // 获取校验器状态
  getValidatorStatus() {
    return eventValidator.getCacheStatus();
  }
}

export const eventBus = new EventBus();