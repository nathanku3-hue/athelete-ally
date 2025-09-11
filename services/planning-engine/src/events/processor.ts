import { EventBus } from '@athlete-ally/event-bus';
import { config } from '../config.js';
import { register, Counter, Histogram, Gauge } from 'prom-client';
import { Task, SubscriptionOptions } from '../types/index.js';

// 事件处理指标
export const eventProcessorMetrics = {
  // 事件处理总数
  eventsProcessed: new Counter({
    name: 'planning_engine_events_processed_total',
    help: 'Total number of events processed',
    labelNames: ['topic', 'status']
  }),

  // 事件处理持续时间
  eventProcessingDuration: new Histogram({
    name: 'planning_engine_event_processing_duration_seconds',
    help: 'Duration of event processing',
    labelNames: ['topic', 'status'],
    buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  }),

  // 并发处理数量
  concurrentProcessing: new Gauge({
    name: 'planning_engine_concurrent_processing',
    help: 'Number of events currently being processed',
    labelNames: ['topic']
  }),

  // 事件处理错误
  eventProcessingErrors: new Counter({
    name: 'planning_engine_event_processing_errors_total',
    help: 'Total number of event processing errors',
    labelNames: ['topic', 'error_type']
  })
};

// 注册指标
Object.values(eventProcessorMetrics).forEach(metric => {
  register.registerMetric(metric);
});

export class EventProcessor {
  private eventBus: EventBus;
  private isConnected = false;
  private activeSubscriptions = new Map<string, any>();
  private processingCount = new Map<string, number>();

  constructor() {
    this.eventBus = new EventBus();
  }

  async connect() {
    try {
      await this.eventBus.connect(config.NATS_URL);
      this.isConnected = true;
      console.log('Event processor connected to NATS');
    } catch (error) {
      console.error('Failed to connect event processor:', error);
      throw error;
    }
  }

  async subscribe<T>(
    topic: string, 
    handler: (task: Task<T>) => Promise<void>,
    options: SubscriptionOptions = {}
  ) {
    if (!this.isConnected) {
      throw new Error('Event processor not connected');
    }

    const { maxConcurrent = 10, enableConcurrencyControl = true } = options;
    
    // 初始化处理计数
    this.processingCount.set(topic, 0);

    const wrappedHandler = async (event: T) => {
      const task: Task<T> = {
        data: event,
        retries: 0,
        maxRetries: 3,
        createdAt: new Date()
      };

      const startTime = Date.now();
      
      try {
        // 并发控制
        if (enableConcurrencyControl) {
          const currentCount = this.processingCount.get(topic) || 0;
          if (currentCount >= maxConcurrent) {
            console.warn(`Concurrency limit reached for topic ${topic}, skipping event`);
            eventProcessorMetrics.eventProcessingErrors.inc({
              topic,
              error_type: 'concurrency_limit_exceeded'
            });
            return;
          }
        }

        // 更新并发计数
        this.processingCount.set(topic, (this.processingCount.get(topic) || 0) + 1);
        eventProcessorMetrics.concurrentProcessing.set(
          { topic },
          this.processingCount.get(topic) || 0
        );

        await handler(task);

        const duration = (Date.now() - startTime) / 1000;
        eventProcessorMetrics.eventProcessingDuration.observe(
          { topic, status: 'success' },
          duration
        );
        eventProcessorMetrics.eventsProcessed.inc({ topic, status: 'success' });

      } catch (error) {
        const duration = (Date.now() - startTime) / 1000;
        eventProcessorMetrics.eventProcessingDuration.observe(
          { topic, status: 'error' },
          duration
        );
        eventProcessorMetrics.eventsProcessed.inc({ topic, status: 'error' });
        eventProcessorMetrics.eventProcessingErrors.inc({
          topic,
          error_type: 'handler_error'
        });

        console.error(`Error processing ${topic} event:`, error);
        throw error;
      } finally {
        // 减少并发计数
        this.processingCount.set(topic, Math.max(0, (this.processingCount.get(topic) || 0) - 1));
        eventProcessorMetrics.concurrentProcessing.set(
          { topic },
          this.processingCount.get(topic) || 0
        );
      }
    };

    // 根据topic订阅相应的事件
    if (topic === 'onboarding_completed') {
      await this.eventBus.subscribeToOnboardingCompleted(wrappedHandler as any);
    } else if (topic === 'plan_generation_requested') {
      await this.eventBus.subscribeToPlanGenerationRequested(wrappedHandler as any);
    } else {
      throw new Error(`Unknown topic: ${topic}`);
    }

    this.activeSubscriptions.set(topic, { handler, options });
    console.log(`Subscribed to ${topic} events with maxConcurrent=${maxConcurrent}`);
  }

  startMetricsUpdate() {
    // 定期更新指标
    setInterval(() => {
      // 这里可以添加定期更新的逻辑
    }, config.METRICS_UPDATE_INTERVAL_MS);
  }

  isHealthy(): boolean {
    return this.isConnected && this.activeSubscriptions.size > 0;
  }

  getStatus() {
    return {
      connected: this.isConnected,
      activeSubscriptions: Array.from(this.activeSubscriptions.keys()),
      processingCount: Object.fromEntries(this.processingCount),
      metrics: {
        eventsProcessed: eventProcessorMetrics.eventsProcessed,
        eventProcessingDuration: eventProcessorMetrics.eventProcessingDuration,
        concurrentProcessing: eventProcessorMetrics.concurrentProcessing,
        eventProcessingErrors: eventProcessorMetrics.eventProcessingErrors
      }
    };
  }

  async disconnect() {
    if (this.eventBus) {
      await this.eventBus.close();
    }
    this.isConnected = false;
    this.activeSubscriptions.clear();
    this.processingCount.clear();
  }
}

export const eventProcessor = new EventProcessor();
