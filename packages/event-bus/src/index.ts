import { connect, NatsConnection, JetStreamManager, JetStreamClient, consumerOpts, createInbox } from 'nats';
import { OnboardingCompletedEvent, PlanGeneratedEvent, PlanGenerationRequestedEvent, PlanGenerationFailedEvent, HRVRawReceivedEvent, HRVNormalizedStoredEvent, SleepRawReceivedEvent, SleepNormalizedStoredEvent, EVENT_TOPICS } from '@athlete-ally/contracts';
import { eventValidator } from './validator.js';
import { nanos, getStreamConfigs, AppStreamConfig } from './config.js';
import { register, Counter, Histogram, Gauge } from 'prom-client';
import { createLogger } from '@athlete-ally/logger';
import nodeAdapter from '@athlete-ally/logger/server';

const log = createLogger(nodeAdapter, { module: 'event-bus', service: (typeof process !== 'undefined' && process.env && process.env.APP_NAME) || 'package' });

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
  }),

  // NAK 次数（可重试）
  eventsNak: new Counter({
    name: 'event_bus_events_nak_total',
    help: 'Total number of events NAKed (retry requested)',
    labelNames: ['topic', 'reason']
  }),

  // 永久 ACK 次数（不可重试错误）
  eventsAckPermanent: new Counter({
    name: 'event_bus_events_ack_permanent_total',
    help: 'Total number of events ACKed permanently after error',
    labelNames: ['topic']
  }),

  // Consumer lag（服务端待投递 + 等待确认）
  consumerLag: new Gauge({
    name: 'event_bus_consumer_lag',
    help: 'Consumer lag (num_pending + ack_pending)',
    labelNames: ['topic', 'durable']
  }),

  // 等待确认的消息数
  consumerAckPending: new Gauge({
    name: 'event_bus_consumer_ack_pending',
    help: 'Number of ack pending messages for the consumer',
    labelNames: ['topic', 'durable']
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
export function streamNeedsUpdate(existing: unknown, desired: AppStreamConfig): boolean {
  if (!existing || typeof existing !== 'object' || !('config' in existing)) {
    return true;
  }
  const ex = existing.config as Record<string, unknown>;
  const d = desired;

  const subjectsChanged = !sameSet((ex.subjects ?? []) as string[], d.subjects);
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
export async function ensureStream(jsm: JetStreamManager, cfg: AppStreamConfig): Promise<void> {
  // Build strict config with only supported fields
  const desired = {
    name: cfg.name,
    subjects: cfg.subjects,
    retention: "limits" as const,
    max_age: nanos(cfg.maxAgeMs),
    storage: (cfg.storage ?? "file") as "file" | "memory",
    discard: (cfg.discard ?? "old") as "old" | "new",
    duplicate_window: nanos(cfg.duplicateWindowMs ?? 120_000),
    replicas: cfg.replicas,
  };

  try {
    const info = await jsm.streams.info(cfg.name);

    if (streamNeedsUpdate(info, cfg)) {
      log.warn(`[event-bus] Updating stream: ${cfg.name}`);
      await jsm.streams.update(cfg.name, desired as never);
      log.warn(`[event-bus] Stream updated: ${cfg.name}`);
    } else {
      log.warn(`[event-bus] Stream up-to-date: ${cfg.name}`);
    }
  } catch (err: unknown) {
    const errObj = err as { message?: string };
    if (String(errObj.message || "").includes("stream not found") ||
        String(errObj.message || "").includes("not found")) {
      log.warn(`[event-bus] Creating stream: ${cfg.name}`);

      // Try creating with full config first
      try {
        await jsm.streams.add(desired as never);
        log.warn(`[event-bus] Stream created: ${cfg.name}`);
        return;
      } catch (createErr: unknown) {
        // Handle invalid JSON error (err_code 10025) with fallback retries
        const createErrObj = createErr as { api_error?: { err_code?: number } };
        if (createErrObj.api_error?.err_code === 10025) {
          log.warn(`[event-bus] Invalid JSON error creating stream ${cfg.name}, trying fallback configs...`);

          // Retry 1: Remove duplicate_window (older servers don't support it)
          const fallback1 = { ...desired };
          delete (fallback1 as Record<string, unknown>).duplicate_window;
          try {
            await jsm.streams.add(fallback1 as never);
            log.warn(`[event-bus] Stream created with fallback config (no duplicate_window): ${cfg.name}`);
            return;
          } catch (fallback1Err: unknown) {
            const fallback1ErrObj = fallback1Err as { api_error?: { err_code?: number } };
            if (fallback1ErrObj.api_error?.err_code === 10025) {
              // Retry 2: Remove discard (last resort)
              const fallback2 = { ...fallback1 };
              delete (fallback2 as Record<string, unknown>).discard;
              try {
                await jsm.streams.add(fallback2 as never);
                log.warn(`[event-bus] Stream created with minimal config (no duplicate_window, no discard): ${cfg.name}`);
                return;
              } catch (fallback2Err: unknown) {
                log.error(`[event-bus] Failed to create stream ${cfg.name} even with minimal config: ${JSON.stringify(fallback2Err)}`);
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
      log.error(`[event-bus] Failed to ensure stream ${cfg.name}: ${JSON.stringify(err)}`);
      throw err;
    }
  }
}

/** Ensure all configured streams exist */
export async function ensureAllStreams(jsm: JetStreamManager): Promise<void> {
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
  private async publishEvent(topic: string, event: unknown, natsTopic: string) {
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
        
        log.error(`Schema validation failed for ${topic} event: ${JSON.stringify(validation.errors)}`);
        throw new Error(`Schema validation failed: ${validation.message}`);
      }
      
      eventBusMetrics.schemaValidation.inc({ topic, status: 'success' });
      
      const data = JSON.stringify(event);
      log.warn(`Publishing to subject: ${natsTopic}`);
      await this.js.publish(natsTopic, new TextEncoder().encode(data));
      
      const duration = (Date.now() - startTime) / 1000;
      eventBusMetrics.eventProcessingDuration.observe({
        topic,
        operation: 'publish',
        status: 'success'
      }, duration);
      
      eventBusMetrics.eventsPublished.inc({ topic, status: 'success' });
      log.warn(`Published ${topic} event`, { eventId: (event as { eventId?: string }).eventId });
      
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

  async connect(url: string = 'nats://localhost:4223', options?: { manageStreams?: boolean }) {
    log.warn(`Connecting to NATS at: ${url}`);
    this.nc = await connect({ servers: url });
    this.js = this.nc.jetstream();
    this.jsm = await this.nc.jetstreamManager();

    // Create streams if they don't exist (unless explicitly disabled)
    const manageStreams = options?.manageStreams ?? (process.env.FEATURE_SERVICE_MANAGES_STREAMS !== 'false');

    if (manageStreams) {
      log.warn('[event-bus] Managing streams (FEATURE_SERVICE_MANAGES_STREAMS enabled)');
      await this.ensureStreams();
    } else {
      log.warn('[event-bus] Stream management disabled (FEATURE_SERVICE_MANAGES_STREAMS=false)');
    }

    log.warn('Connected to EventBus');
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

  async publishSleepRawReceived(event: SleepRawReceivedEvent) {
    await this.publishEvent('sleep_raw_received', event, EVENT_TOPICS.SLEEP_RAW_RECEIVED);
  }

  async publishSleepNormalizedStored(event: SleepNormalizedStoredEvent) {
    await this.publishEvent('sleep_normalized_stored', event, EVENT_TOPICS.SLEEP_NORMALIZED_STORED);
  }

  async subscribeToOnboardingCompleted(callback: (event: OnboardingCompletedEvent) => Promise<void>) {
    if (!this.js) throw new Error('JetStream not initialized');

    const psub = await this.js.pullSubscribe(EVENT_TOPICS.ONBOARDING_COMPLETED, {
      durable: 'planning-engine-onboarding-sub',
      batch: 10,
      expires: 1000
    } as never);

    const topic = 'onboarding_completed';

    // 使用正确的批量pull消费模式 - 修复消息丢失问题
    (async () => {
      while (true) {
        try {
          // 批量拉取消息
          const messages = await (psub as unknown as { fetch: (opts: { max: number; expires: number }) => Promise<unknown[]> }).fetch({ max: 10, expires: 1000 });
          
          if (messages.length === 0) {
            // 没有消息时短暂休眠
            await new Promise(resolve => setTimeout(resolve, 100));
            continue;
          }

          log.warn(`Processing batch of ${messages.length} OnboardingCompleted events`);

          // 并发处理消息
          const processingPromises = messages.map(async (m: unknown) => {
            const msg = m as { data: Uint8Array; ack: () => void; nak: () => void };
            const startTime = Date.now();

            try {
              const eventData = JSON.parse(new TextDecoder().decode(msg.data));
              
              // Schema 校验
              const validation = await eventValidator.validateEvent(topic, eventData);
              eventBusMetrics.schemaValidation.inc({ topic, status: 'attempted' });
              
              if (!validation.valid) {
                eventBusMetrics.schemaValidationFailures.inc({ 
                  topic, 
                  error_type: 'validation_failed' 
                });
                eventBusMetrics.eventsRejected.inc({ topic, reason: 'schema_validation_failed' });
                
                log.error(`Schema validation failed for received OnboardingCompleted event: ${JSON.stringify(validation.errors)}`);
                msg.nak();
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
              msg.ack();
              
            } catch (error) {
              const duration = (Date.now() - startTime) / 1000;
              eventBusMetrics.eventProcessingDuration.observe({
                topic,
                operation: 'consume',
                status: 'error'
              }, duration);
              
              eventBusMetrics.eventsConsumed.inc({ topic, status: 'error' });
              if (error instanceof Error) {
                log.error(`Error processing OnboardingCompleted event: ${error.message}`);
                log.error(`Stack: ${error.stack}`);
              } else {
                log.error(`Error processing OnboardingCompleted event: ${JSON.stringify(error)}`);
              }
              
              // 根据错误类型决定是否重试
              if (this.shouldRetry(error)) {
                msg.nak();
              } else {
                msg.ack(); // 永久失败，确认消息
              }
            }
          });

          // 等待所有消息处理完成
          await Promise.allSettled(processingPromises);
          
        } catch (error) {
          if (error instanceof Error) {
            log.error(`Error in OnboardingCompleted batch processing: ${error.message}`);
            log.error(`Stack: ${error.stack}`);
          } else {
            log.error(`Error in OnboardingCompleted batch processing: ${JSON.stringify(error)}`);
          }
          // 错误时等待更长时间
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    })();
  }

  private shouldRetry(error: unknown): boolean {
    // 临时错误可以重试
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'TIMEOUT' || error.code === 'CONNECTION_ERROR') {
        return true;
      }

      // 业务逻辑错误不重试
      if (error.code === 'VALIDATION_ERROR' || error.code === 'BUSINESS_LOGIC_ERROR') {
        return false;
      }
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
    } as never);

    const topic = 'plan_generation_requested';

    // 使用正确的批量pull消费模式 - 修复消息丢失问题
    (async () => {
      while (true) {
        try {
          // 批量拉取消息
          const messages = await (psub as unknown as { fetch: (opts: { max: number; expires: number }) => Promise<unknown[]> }).fetch({ max: 10, expires: 1000 });
          
          if (messages.length === 0) {
            // 没有消息时短暂休眠
            await new Promise(resolve => setTimeout(resolve, 100));
            continue;
          }

          log.warn(`Processing batch of ${messages.length} PlanGenerationRequested events`);

          // 并发处理消息
          const processingPromises = messages.map(async (m: unknown) => {
            const msg = m as { data: Uint8Array; ack: () => void; nak: () => void };
            const startTime = Date.now();

            try {
              const eventData = JSON.parse(new TextDecoder().decode(msg.data));
              
              // Schema 校验
              const validation = await eventValidator.validateEvent(topic, eventData);
              eventBusMetrics.schemaValidation.inc({ topic, status: 'attempted' });
              
              if (!validation.valid) {
                eventBusMetrics.schemaValidationFailures.inc({ 
                  topic, 
                  error_type: 'validation_failed' 
                });
                eventBusMetrics.eventsRejected.inc({ topic, reason: 'schema_validation_failed' });
                
                log.error(`Schema validation failed for received PlanGenerationRequested event: ${JSON.stringify(validation.errors)}`);
                msg.nak();
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
              msg.ack();
              
            } catch (error) {
              const duration = (Date.now() - startTime) / 1000;
              eventBusMetrics.eventProcessingDuration.observe({
                topic,
                operation: 'consume',
                status: 'error'
              }, duration);
              
              eventBusMetrics.eventsConsumed.inc({ topic, status: 'error' });
              if (error instanceof Error) {
                log.error(`Error processing PlanGenerationRequested event: ${error.message}`);
                log.error(`Stack: ${error.stack}`);
              } else {
                log.error(`Error processing PlanGenerationRequested event: ${JSON.stringify(error)}`);
              }
              
              // 根据错误类型决定是否重试
              if (this.shouldRetry(error)) {
                msg.nak();
              } else {
                msg.ack(); // 永久失败，确认消息
              }
            }
          });

          // 等待所有消息处理完成
          await Promise.allSettled(processingPromises);
          
        } catch (error) {
          if (error instanceof Error) {
            log.error(`Error in PlanGenerationRequested batch processing: ${error.message}`);
            log.error(`Stack: ${error.stack}`);
          } else {
            log.error(`Error in PlanGenerationRequested batch processing: ${JSON.stringify(error)}`);
          }
          // 错误时等待更长时间
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    })();
  }

  async subscribeToPlanGenerated(callback: (event: PlanGeneratedEvent) => Promise<void>) {
    if (!this.js) throw new Error('JetStream not initialized');

    const topic = 'plan_generated';
    const durableName = 'coach-tip-plan-gen-consumer';

    log.warn(`[event-bus] Starting PlanGenerated push subscription`);

    // Use push subscription with consumerOpts (proven pattern)
    const opts = consumerOpts()
      .durable(durableName)
      .ackExplicit()
      .filterSubject(EVENT_TOPICS.PLAN_GENERATED)
      .deliverTo(createInbox());

    const sub = await this.js.subscribe(EVENT_TOPICS.PLAN_GENERATED, opts);

    log.warn(`[event-bus] PlanGenerated subscription created successfully`);

    // Consumer lag metrics (every 5s)
    (async () => {
      try {
        const streamName = 'ATHLETE_ALLY_EVENTS';
        const jsm = this.jsm || (this.nc ? await this.nc.jetstreamManager() : null);
        if (jsm) {
          setInterval(async () => {
            try {
              const info = await jsm.consumers.info(streamName, durableName);
              const lag = Number(info.num_pending || 0) + Number(info.num_ack_pending || 0);
              eventBusMetrics.consumerLag.set({ topic, durable: durableName }, lag);
              eventBusMetrics.consumerAckPending.set({ topic, durable: durableName }, Number(info.num_ack_pending || 0));
            } catch {
              // ignore metric fetch errors
            }
          }, 5000);
        }
      } catch {
        // ignore
      }
    })();

    // Process messages with async iterator
    (async () => {
      try {
        for await (const msg of sub) {
          const startTime = Date.now();

          try {
            const eventData = JSON.parse(new TextDecoder().decode(msg.data));

            // Schema validation
            const validation = await eventValidator.validateEvent(topic, eventData);
            eventBusMetrics.schemaValidation.inc({ topic, status: 'attempted' });

            if (!validation.valid) {
              eventBusMetrics.schemaValidationFailures.inc({
                topic,
                error_type: 'validation_failed'
              });
              eventBusMetrics.eventsRejected.inc({ topic, reason: 'schema_validation_failed' });

              log.error(`Schema validation failed for received PlanGenerated event: ${JSON.stringify(validation.errors)}`);
              msg.nak();
              continue;
            }

            eventBusMetrics.schemaValidation.inc({ topic, status: 'success' });

            const event = eventData as PlanGeneratedEvent;

            log.warn(`Processing PlanGenerated event: ${event.eventId}`);

            await callback(event);

            const duration = (Date.now() - startTime) / 1000;
            eventBusMetrics.eventProcessingDuration.observe({
              topic,
              operation: 'consume',
              status: 'success'
            }, duration);

            eventBusMetrics.eventsConsumed.inc({ topic, status: 'success' });
            msg.ack();

          } catch (error) {
            const duration = (Date.now() - startTime) / 1000;
            eventBusMetrics.eventProcessingDuration.observe({
              topic,
              operation: 'consume',
              status: 'error'
            }, duration);

            eventBusMetrics.eventsConsumed.inc({ topic, status: 'error' });

            if (error instanceof Error) {
              log.error(`Error processing PlanGenerated event: ${error.message}`);
              log.error(`Stack: ${error.stack}`);
            } else {
              log.error(`Error processing PlanGenerated event: ${JSON.stringify(error)}`);
            }

            // Determine retry based on error type
            if (this.shouldRetry(error)) {
              eventBusMetrics.eventsNak.inc({ topic, reason: 'retryable_error' });
              msg.nak();
            } else {
              eventBusMetrics.eventsAckPermanent.inc({ topic });
              msg.ack(); // Permanent failure, acknowledge message
            }
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          log.error(`Error in PlanGenerated subscription iterator: ${error.message}`);
          log.error(`Stack: ${error.stack}`);
        } else {
          log.error(`Error in PlanGenerated subscription iterator: ${JSON.stringify(error)}`);
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
        log.warn(`[event-bus] Consumer ${consumerConfig.durable_name} config differs, updating...`);
        await this.jsm.consumers.add(streamName, consumerConfig as never);
        log.warn(`[event-bus] Consumer ${consumerConfig.durable_name} updated successfully`);
      } else {
        log.warn(`[event-bus] Consumer ${consumerConfig.durable_name} already exists with correct config`);
      }
    } catch (error: unknown) {
      const is404 = error && typeof error === 'object' && 'code' in error && error.code === '404';
      const isNotFound = error && typeof error === 'object' && 'message' in error &&
                         typeof error.message === 'string' && error.message.includes('not found');

      if (is404 || isNotFound) {
        // Consumer doesn't exist, create it
        log.warn(`[event-bus] Creating new consumer ${consumerConfig.durable_name} on stream ${streamName}`);
        await this.jsm.consumers.add(streamName, consumerConfig as never);
        log.warn(`[event-bus] Consumer ${consumerConfig.durable_name} created successfully`);
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

// Export stream mode utilities
export { getStreamMode, getStreamCandidates } from './config.js';





