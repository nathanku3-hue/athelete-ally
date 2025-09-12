import { NatsConnection, JetStreamClient, JetStreamManager, ConsumerConfig, ConsumerInfo } from 'nats';
import { register, Counter, Histogram, Gauge } from 'prom-client';

// JetStream 消费指标
export const jetstreamMetrics = {
  // 消息消费总数
  messagesConsumed: new Counter({
    name: 'jetstream_messages_consumed_total',
    help: 'Total number of messages consumed from JetStream',
    labelNames: ['stream', 'consumer', 'status']
  }),

  // 消息处理持续时间
  messageProcessingDuration: new Histogram({
    name: 'jetstream_message_processing_duration_seconds',
    help: 'Duration of message processing',
    labelNames: ['stream', 'consumer', 'status'],
    buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  }),

  // 当前活跃消费者数
  activeConsumers: new Gauge({
    name: 'jetstream_active_consumers',
    help: 'Number of active consumers',
    labelNames: ['stream', 'consumer']
  }),

  // 消息重试次数
  messageRetries: new Counter({
    name: 'jetstream_message_retries_total',
    help: 'Total number of message retries',
    labelNames: ['stream', 'consumer', 'reason']
  }),

  // 消费者健康状态
  consumerHealth: new Gauge({
    name: 'jetstream_consumer_health',
    help: 'Consumer health status (1=healthy, 0=unhealthy)',
    labelNames: ['stream', 'consumer']
  })
};

// 注册指标
Object.values(jetstreamMetrics).forEach(metric => {
  register.registerMetric(metric);
});

export interface JetStreamConsumerOptions {
  stream: string;
  consumer: string;
  durable?: string;
  maxAckPending?: number;
  ackWait?: number;
  maxDeliver?: number;
  batchSize?: number;
  batchTimeout?: number;
  maxConcurrent?: number;
  enableHeartbeat?: boolean;
  heartbeatInterval?: number;
}

export class JetStreamConsumer {
  private nc: NatsConnection;
  private js: JetStreamClient;
  private jsm: JetStreamManager;
  private consumers = new Map<string, any>();
  private isHealthy = true;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(nc: NatsConnection, js: JetStreamClient, jsm: JetStreamManager) {
    this.nc = nc;
    this.js = js;
    this.jsm = jsm;
  }

  /**
   * 创建或获取消费者配置
   */
  private async ensureConsumer(options: JetStreamConsumerOptions): Promise<ConsumerInfo> {
    const { stream, consumer, durable, maxAckPending = 100, ackWait = 30000, maxDeliver = 3 } = options;
    
    try {
      // 尝试获取现有消费者
      const existing = await this.jsm.consumers.info(stream, consumer);
      return existing;
    } catch (error) {
      // 消费者不存在，创建新的
      const consumerConfig: ConsumerConfig = {
        durable_name: durable || consumer,
        ack_policy: 'Explicit' as any,
        ack_wait: ackWait,
        max_deliver: maxDeliver,
        max_ack_pending: maxAckPending,
        deliver_policy: 'All' as any,
        replay_policy: 'Instant' as any,
        // 启用心跳检测
        // heartbeat: options.enableHeartbeat ? (options.heartbeatInterval || 30000) : undefined,
        // 启用流控
        flow_control: true,
        // 启用空闲超时
        idle_heartbeat: options.enableHeartbeat ? (options.heartbeatInterval || 30000) : undefined
      };

      const consumerInfo = await this.jsm.consumers.add(stream, consumerConfig);
      console.log(`Created JetStream consumer: ${stream}/${consumer}`);
      return consumerInfo;
    }
  }

  /**
   * 启动消费者 - 使用正确的批处理模式
   */
  async startConsumer<T>(
    options: JetStreamConsumerOptions,
    handler: (message: T, ack: () => void, nak: () => void) => Promise<void>
  ): Promise<void> {
    const { stream, consumer, batchSize = 10, batchTimeout = 1000, maxConcurrent = 5 } = options;
    
    try {
      // 确保消费者存在
      await this.ensureConsumer(options);
      
      // 创建pull订阅
      const psub = await this.js.pullSubscribe(`${stream}.*`, {
        durable: options.durable || consumer,
        batch: batchSize,
        expires: batchTimeout
      } as any);

      // 设置健康状态
      this.isHealthy = true;
      jetstreamMetrics.consumerHealth.set({ stream, consumer }, 1);
      jetstreamMetrics.activeConsumers.inc({ stream, consumer });

      // 启动批处理消费循环
      this.startBatchProcessing(psub, stream, consumer, handler, batchSize, batchTimeout, maxConcurrent);
      
      // 存储消费者引用
      this.consumers.set(consumer, psub);
      
      console.log(`Started JetStream consumer: ${stream}/${consumer} with batchSize=${batchSize}, maxConcurrent=${maxConcurrent}`);
      
    } catch (error) {
      console.error(`Failed to start consumer ${stream}/${consumer}:`, error);
      this.isHealthy = false;
      jetstreamMetrics.consumerHealth.set({ stream, consumer }, 0);
      throw error;
    }
  }

  /**
   * 批处理消息消费 - 核心修复
   */
  private async startBatchProcessing<T>(
    psub: any,
    stream: string,
    consumer: string,
    handler: (message: T, ack: () => void, nak: () => void) => Promise<void>,
    batchSize: number,
    batchTimeout: number,
    maxConcurrent: number
  ): Promise<void> {
    let isProcessing = false;
    let currentConcurrency = 0;
    const processingQueue: Array<() => Promise<void>> = [];

    const processBatch = async () => {
      if (isProcessing || currentConcurrency >= maxConcurrent) {
        return;
      }

      isProcessing = true;
      
      try {
        // 拉取一批消息
        const messages = await psub.fetch({ max: batchSize, expires: batchTimeout });
        
        if (messages.length === 0) {
          return;
        }

        console.log(`Processing batch of ${messages.length} messages from ${stream}/${consumer}`);

        // 并发处理消息
        const processingPromises = messages.map(async (m: any) => {
          const startTime = Date.now();
          
          try {
            // 解析消息数据
            const eventData = JSON.parse(new TextDecoder().decode(m.data));
            
            // 创建ACK/NAK函数
            const ack = () => {
              m.ack();
              jetstreamMetrics.messagesConsumed.inc({ stream, consumer, status: 'success' });
            };
            
            const nak = () => {
              m.nak();
              jetstreamMetrics.messagesConsumed.inc({ stream, consumer, status: 'failed' });
            };

            // 处理消息
            await handler(eventData as T, ack, nak);
            
            const duration = (Date.now() - startTime) / 1000;
            jetstreamMetrics.messageProcessingDuration.observe(
              { stream, consumer, status: 'success' },
              duration
            );
            
          } catch (error) {
            const duration = (Date.now() - startTime) / 1000;
            jetstreamMetrics.messageProcessingDuration.observe(
              { stream, consumer, status: 'error' },
              duration
            );
            
            console.error(`Error processing message from ${stream}/${consumer}:`, error);
            
            // 根据错误类型决定是否重试
            if (this.shouldRetry(error)) {
              m.nak();
              jetstreamMetrics.messageRetries.inc({ stream, consumer, reason: 'handler_error' });
            } else {
              m.ack(); // 永久失败，确认消息
              jetstreamMetrics.messagesConsumed.inc({ stream, consumer, status: 'permanent_failure' });
            }
          }
        });

        // 等待所有消息处理完成
        await Promise.allSettled(processingPromises);
        
      } catch (error) {
        console.error(`Error in batch processing for ${stream}/${consumer}:`, error);
        jetstreamMetrics.messageRetries.inc({ stream, consumer, reason: 'batch_error' });
      } finally {
        isProcessing = false;
        
        // 处理队列中的下一个批次
        if (processingQueue.length > 0) {
          const nextBatch = processingQueue.shift();
          if (nextBatch) {
            setImmediate(nextBatch);
          }
        }
      }
    };

    // 启动连续批处理循环
    const processLoop = async () => {
      while (this.isHealthy) {
        try {
          await processBatch();
          
          // 短暂休眠避免CPU占用过高
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`Error in processing loop for ${stream}/${consumer}:`, error);
          await new Promise(resolve => setTimeout(resolve, 1000)); // 错误时等待更长时间
        }
      }
    };

    // 启动处理循环
    processLoop().catch(error => {
      console.error(`Fatal error in processing loop for ${stream}/${consumer}:`, error);
      this.isHealthy = false;
      jetstreamMetrics.consumerHealth.set({ stream, consumer }, 0);
    });
  }

  /**
   * 判断是否应该重试
   */
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

  /**
   * 启动心跳检测
   */
  startHeartbeat(interval: number = 30000): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (!this.isHealthy) {
        console.warn('JetStream consumer health check failed');
        jetstreamMetrics.consumerHealth.set({ stream: 'unknown', consumer: 'unknown' }, 0);
      }
    }, interval);
  }

  /**
   * 停止消费者
   */
  async stopConsumer(consumer: string): Promise<void> {
    const psub = this.consumers.get(consumer);
    if (psub) {
      await psub.unsubscribe();
      this.consumers.delete(consumer);
      jetstreamMetrics.activeConsumers.dec({ stream: 'unknown', consumer });
      console.log(`Stopped consumer: ${consumer}`);
    }
  }

  /**
   * 停止所有消费者
   */
  async stopAllConsumers(): Promise<void> {
    for (const [consumer, psub] of this.consumers) {
      try {
        await psub.unsubscribe();
        jetstreamMetrics.activeConsumers.dec({ stream: 'unknown', consumer });
      } catch (error) {
        console.error(`Error stopping consumer ${consumer}:`, error);
      }
    }
    
    this.consumers.clear();
    this.isHealthy = false;
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * 获取消费者状态
   */
  getStatus(): Record<string, any> {
    return {
      isHealthy: this.isHealthy,
      activeConsumers: Array.from(this.consumers.keys()),
      metrics: {
        messagesConsumed: jetstreamMetrics.messagesConsumed,
        messageProcessingDuration: jetstreamMetrics.messageProcessingDuration,
        activeConsumers: jetstreamMetrics.activeConsumers,
        messageRetries: jetstreamMetrics.messageRetries,
        consumerHealth: jetstreamMetrics.consumerHealth
      }
    };
  }
}
