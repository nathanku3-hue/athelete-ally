import { connect, NatsConnection, JetStreamManager, JetStreamClient } from 'nats';
import { OnboardingCompletedEvent, PlanGeneratedEvent, PlanGenerationRequestedEvent, PlanGenerationFailedEvent, HRVRawReceivedEvent, HRVNormalizedStoredEvent, EVENT_TOPICS } from '@athlete-ally/contracts';
import { eventValidator, ValidationResult } from './validator.js';
import { config, nanos, getStreamConfigs, AppStreamConfig } from './config.js';
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

/** Compare arrays ignoring order */
function sameSet(a: string[], b: string[]): boolean {
  const A = new Set(a);
  const B = new Set(b);
  if (A.size !== B.size) return false;
  for (const x of A) if (!B.has(x)) return false;
  return true;
}

/** Determine if stream needs update (subjects/retention/replicas/etc.) */
export function streamNeedsUpdate(existing: any, desired: AppStreamConfig): boolean {
  const ex = existing.config;
  const d = desired;

  const subjectsChanged = !sameSet(ex.subjects ?? [], d.subjects);
  const ageChanged = Number(ex.max_age ?? 0) !== nanos(d.maxAgeMs);
  const replChanged = Number(ex.num_replicas ?? 1) !== d.replicas;
  const storageChanged = (ex.storage ?? "file") !== (d.storage ?? "file");
  const discardChanged = (ex.discard ?? "old") !== (d.discard ?? "old");
  const dupeChanged = Number(ex.duplicate_window ?? 0) !== nanos(d.duplicateWindowMs ?? 120_000);
  const compChanged = Boolean(ex.compression) !== Boolean(d.compression);

  return subjectsChanged || ageChanged || replChanged || storageChanged ||
         discardChanged || dupeChanged || compChanged;
}

/** Ensure stream exists with desired config (update-if-different) */
export async function ensureStream(jsm: any, cfg: AppStreamConfig): Promise<void> {
  // Build strict config with only supported fields
  const desired = {
    name: cfg.name,
    subjects: cfg.subjects,
    retention: "limits",
    max_age: nanos(cfg.maxAgeMs),
    storage: cfg.storage ?? "file",
    discard: cfg.discard ?? "old",
    duplicate_window: nanos(cfg.duplicateWindowMs ?? 120_000),
    replicas: cfg.replicas,
  };

  try {
    const info = await jsm.streams.info(cfg.name);

    if (streamNeedsUpdate(info, cfg)) {
      console.log(`[event-bus] Updating stream: ${cfg.name}`);
      await jsm.streams.update(cfg.name, desired);
      console.log(`[event-bus] Stream updated: ${cfg.name}`);
    } else {
      console.log(`[event-bus] Stream up-to-date: ${cfg.name}`);
    }
  } catch (err: any) {
    if (String(err?.message || "").includes("stream not found") ||
        String(err?.message || "").includes("not found")) {
      console.log(`[event-bus] Creating stream: ${cfg.name}`);
      
      // Try creating with full config first
      try {
        await jsm.streams.add(desired);
        console.log(`[event-bus] Stream created: ${cfg.name}`);
        return;
      } catch (createErr: any) {
        // Handle invalid JSON error (err_code 10025) with fallback retries
        if (createErr?.api_error?.err_code === 10025) {
          console.log(`[event-bus] Invalid JSON error creating stream ${cfg.name}, trying fallback configs...`);
          
          // Retry 1: Remove duplicate_window (older servers don't support it)
          const fallback1 = { ...desired };
          delete (fallback1 as any).duplicate_window;
          try {
            await jsm.streams.add(fallback1);
            console.log(`[event-bus] Stream created with fallback config (no duplicate_window): ${cfg.name}`);
            return;
          } catch (fallback1Err: any) {
            if (fallback1Err?.api_error?.err_code === 10025) {
              // Retry 2: Remove discard (last resort)
              const fallback2 = { ...fallback1 };
              delete (fallback2 as any).discard;
              try {
                await jsm.streams.add(fallback2);
                console.log(`[event-bus] Stream created with minimal config (no duplicate_window, no discard): ${cfg.name}`);
                return;
              } catch (fallback2Err: any) {
                console.error(`[event-bus] Failed to create stream ${cfg.name} even with minimal config:`, fallback2Err);
                throw fallback2Err;
              }
            } else {
              throw fallback1Err;
            }
          }
        } else {
          throw createErr;
        }
      }
    } else {
      console.error(`[event-bus] Failed to ensure stream ${cfg.name}:`, err);
      throw err;
    }
  }
}

/** Ensure all configured streams exist */
export async function ensureAllStreams(jsm: any): Promise<void> {
  const configs = getStreamConfigs();
  for (const cfg of configs) {
    await ensureStream(jsm, cfg);
  }
}

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
      console.log(`Publishing to subject: ${natsTopic}`);
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

  async connect(url: string = 'nats://localhost:4223') {
    console.log(`Connecting to NATS at: ${url}`);
    this.nc = await connect({ servers: url });
    this.js = this.nc.jetstream();
    this.jsm = await this.nc.jetstreamManager();
    
    // Create streams if they don't exist
    await this.ensureStreams();
    console.log('Connected to EventBus');
  }

  private async ensureStreams() {
    if (!this.jsm) throw new Error('JetStreamManager not initialized');

    // Use new multi-stream-aware function
    await ensureAllStreams(this.jsm);
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

  async publishHRVRawReceived(event: HRVRawReceivedEvent) {
    await this.publishEvent('hrv_raw_received', event, EVENT_TOPICS.HRV_RAW_RECEIVED);
  }

  async publishHRVNormalizedStored(event: HRVNormalizedStoredEvent) {
    await this.publishEvent('hrv_normalized_stored', event, EVENT_TOPICS.HRV_NORMALIZED_STORED);
  }

  async subscribeToOnboardingCompleted(callback: (event: OnboardingCompletedEvent) => Promise<void>) {
    if (!this.js) throw new Error('JetStream not initialized');

    const psub = await this.js.pullSubscribe(EVENT_TOPICS.ONBOARDING_COMPLETED, {
      durable: 'planning-engine-onboarding-sub',
      batch: 10,
      expires: 1000
    } as any);

    const topic = 'onboarding_completed';

    // 使用正确的批量pull消费模式 - 修复消息丢失问题
    (async () => {
      while (true) {
        try {
          // 批量拉取消息
          const messages = await (psub as any).fetch({ max: 10, expires: 1000 });
          
          if (messages.length === 0) {
            // 没有消息时短暂休眠
            await new Promise(resolve => setTimeout(resolve, 100));
            continue;
          }

          console.log(`Processing batch of ${messages.length} OnboardingCompleted events`);

          // 并发处理消息
          const processingPromises = messages.map(async (m: any) => {
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
                return;
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
              
              // 根据错误类型决定是否重试
              if (this.shouldRetry(error)) {
                m.nak();
              } else {
                m.ack(); // 永久失败，确认消息
              }
            }
          });

          // 等待所有消息处理完成
          await Promise.allSettled(processingPromises);
          
        } catch (error) {
          console.error('Error in OnboardingCompleted batch processing:', error);
          // 错误时等待更长时间
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    })();
  }

  private shouldRetry(error: any): boolean {
    // 临时错误可以重试
    if (error.code === 'TIMEOUT' || error.code === 'CONNECTION_ERROR') {
      return true;
    }
    
    // 业务逻辑错误不重试
    if (error.code === 'VALIDATION_ERROR' || error.code === 'BUSINESS_LOGIC_ERROR') {
      return false;
    }
    
    // 默认重试
    return true;
  }

  async subscribeToPlanGenerationRequested(callback: (event: PlanGenerationRequestedEvent) => Promise<void>) {
    if (!this.js) throw new Error('JetStream not initialized');

    const psub = await this.js.pullSubscribe(EVENT_TOPICS.PLAN_GENERATION_REQUESTED, {
      durable: 'planning-engine-plan-gen-sub',
      batch: 10,
      expires: 1000
    } as any);

    const topic = 'plan_generation_requested';

    // 使用正确的批量pull消费模式 - 修复消息丢失问题
    (async () => {
      while (true) {
        try {
          // 批量拉取消息
          const messages = await (psub as any).fetch({ max: 10, expires: 1000 });
          
          if (messages.length === 0) {
            // 没有消息时短暂休眠
            await new Promise(resolve => setTimeout(resolve, 100));
            continue;
          }

          console.log(`Processing batch of ${messages.length} PlanGenerationRequested events`);

          // 并发处理消息
          const processingPromises = messages.map(async (m: any) => {
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
                return;
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
              
              // 根据错误类型决定是否重试
              if (this.shouldRetry(error)) {
                m.nak();
              } else {
                m.ack(); // 永久失败，确认消息
              }
            }
          });

          // 等待所有消息处理完成
          await Promise.allSettled(processingPromises);
          
        } catch (error) {
          console.error('Error in PlanGenerationRequested batch processing:', error);
          // 错误时等待更长时间
          await new Promise(resolve => setTimeout(resolve, 1000));
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

  // 类型化的 getter 方法 - 在连接后使用
  getNatsConnection(): NatsConnection {
    if (!this.nc) throw new Error('EventBus not connected');
    return this.nc;
  }

  getJetStream(): JetStreamClient {
    if (!this.js) throw new Error('EventBus not connected');
    return this.js;
  }

  /**
   * Ensure a JetStream consumer exists with the desired configuration
   * @param streamName - The stream name
   * @param consumerConfig - Consumer configuration
   * @returns Promise<void>
   */
  async ensureConsumer(streamName: string, consumerConfig: {
    durable_name: string;
    filter_subject: string;
    ack_policy: 'explicit' | 'none' | 'all';
    deliver_policy: 'all' | 'last' | 'new' | 'by_start_sequence' | 'by_start_time' | 'last_per_subject';
    max_deliver: number;
    ack_wait: number;
    max_ack_pending: number;
  }): Promise<void> {
    if (!this.jsm) throw new Error('JetStream manager not initialized');

    try {
      // Try to get existing consumer info
      const existingConsumer = await this.jsm.consumers.info(streamName, consumerConfig.durable_name);
      
      // Check if configuration needs updating
      const needsUpdate = 
        existingConsumer.config.filter_subject !== consumerConfig.filter_subject ||
        existingConsumer.config.ack_policy !== consumerConfig.ack_policy ||
        existingConsumer.config.deliver_policy !== consumerConfig.deliver_policy ||
        existingConsumer.config.max_deliver !== consumerConfig.max_deliver ||
        existingConsumer.config.ack_wait !== consumerConfig.ack_wait ||
        existingConsumer.config.max_ack_pending !== consumerConfig.max_ack_pending;

      if (needsUpdate) {
        console.log(`[event-bus] Consumer ${consumerConfig.durable_name} config differs, updating...`);
        await this.jsm.consumers.add(streamName, consumerConfig as any);
        console.log(`[event-bus] Consumer ${consumerConfig.durable_name} updated successfully`);
      } else {
        console.log(`[event-bus] Consumer ${consumerConfig.durable_name} already exists with correct config`);
      }
    } catch (error: any) {
      if (error.code === '404' || error.message?.includes('not found')) {
        // Consumer doesn't exist, create it
        console.log(`[event-bus] Creating new consumer ${consumerConfig.durable_name} on stream ${streamName}`);
        await this.jsm.consumers.add(streamName, consumerConfig as any);
        console.log(`[event-bus] Consumer ${consumerConfig.durable_name} created successfully`);
      } else {
        throw error;
      }
    }
  }

  getJetStreamManager(): JetStreamManager {
    if (!this.jsm) throw new Error('EventBus not connected');
    return this.jsm;
  }
}

export const eventBus = new EventBus();

// Export validator for services that need direct schema validation
export { eventValidator } from './validator.js';



