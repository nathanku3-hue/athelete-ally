/**
 * Sleep Consumer
 * Processes sleep raw data events from JetStream
 */

import { consumerOpts, JsMsg, JetStreamPullSubscription } from 'nats';
import type { FastifyInstance } from 'fastify';
import { EventBus, getStreamCandidates } from '@athlete-ally/event-bus';
import { EVENT_TOPICS } from '@athlete-ally/contracts';
import { eventValidator } from '@athlete-ally/event-bus';
import { SpanStatusCode } from '@opentelemetry/api';
import { PrismaClient } from '../../prisma/generated/client';
import { config, BATCH_SIZE, EXPIRES_MS, IDLE_BACKOFF_MS } from '../config.js';
import { telemetry, withExtractedContext, promSleepMessagesCounter, dlqMessagesCounter } from '../telemetry.js';
import { processSleepData } from '../processors/sleep-processor.js';

export class SleepConsumer {
  private running = true;
  private actualStreamName = '';

  constructor(
    private eventBus: EventBus,
    private prisma: PrismaClient,
    private logger: FastifyInstance['log']
  ) {}

  async start(): Promise<void> {
    const js = this.eventBus.getJetStream();
    const jsm = this.eventBus.getJetStreamManager();

    this.logger.info(`[normalize-sleep] DLQ subject prefix: ${config.sleep.dlqSubject}`);
    this.logger.info(`[normalize-sleep] Consumer: ${config.sleep.durable}, maxDeliver: ${config.sleep.maxDeliver}, ackWait: ${config.sleep.ackWaitMs}ms`);

    // Create OTel counters for Sleep metrics
    const sleepMessagesCounter = telemetry.meter.createCounter('normalize_sleep_messages_total', {
      description: 'Total number of Sleep messages processed by normalize service',
    });

    // Stream binding order: Use getStreamCandidates() for mode-aware stream selection
    const streamCandidates = getStreamCandidates();
    this.logger.info(`[normalize-service] Sleep stream candidates: ${streamCandidates.join(', ')}`);

    // Consumer creation strategy
    if (config.serviceManagesConsumers) {
      for (const streamName of streamCandidates) {
        try {
          await jsm.consumers.add(streamName, {
            durable_name: config.sleep.durable,
            filter_subject: EVENT_TOPICS.SLEEP_RAW_RECEIVED,
            ack_policy: 'explicit' as any,
            deliver_policy: 'all' as any,
            max_deliver: config.sleep.maxDeliver,
            ack_wait: config.sleep.ackWaitMs * 1_000_000,
            max_ack_pending: 1000
          });
          this.logger.info(`[normalize] Sleep consumer created on ${streamName}: ${config.sleep.durable}`);
          this.actualStreamName = streamName;
          break;
        } catch (e) {
          const error = e as Error;
          this.logger.info(`[normalize] Attempted to create Sleep consumer on ${streamName}: ${config.sleep.durable}. Error: ${error.message}. Trying next candidate.`);
          if (error.message.includes('consumer already exists')) {
            this.actualStreamName = streamName;
            this.logger.info(`[normalize] Consumer ${config.sleep.durable} already exists on ${streamName}, will bind to existing consumer.`);
            break;
          }
        }
      }
    } else {
      for (const streamName of streamCandidates) {
        try {
          await jsm.consumers.info(streamName, config.sleep.durable);
          this.actualStreamName = streamName;
          this.logger.info(`[normalize] Found existing Sleep consumer on ${streamName}: ${config.sleep.durable}`);
          break;
        } catch (e) {
          this.logger.info(`[normalize] Consumer ${config.sleep.durable} not found on ${streamName}. Trying next candidate.`);
        }
      }
    }

    if (!this.actualStreamName) {
      throw new Error('Failed to find Sleep consumer on any available stream.');
    }

    // Bind to existing durable consumer
    const opts = consumerOpts();
    opts.bind(this.actualStreamName, config.sleep.durable);
    opts.ackExplicit();
    opts.manualAck();
    opts.maxDeliver(config.sleep.maxDeliver);
    opts.ackWait(config.sleep.ackWaitMs);

    const sub = await js.pullSubscribe(EVENT_TOPICS.SLEEP_RAW_RECEIVED, opts) as JetStreamPullSubscription;
    this.logger.info(`[normalize] Sleep durable pull consumer bound: ${config.sleep.durable}, subject: ${EVENT_TOPICS.SLEEP_RAW_RECEIVED}, ackWait: ${config.sleep.ackWaitMs}ms, maxDeliver: ${config.sleep.maxDeliver}`);

    // Message handler function
    const handleSleepMessage = async (m: JsMsg) => {
      const info = m.info;
      const meta = {
        streamSeq: info?.streamSequence,
        deliverySeq: info?.deliverySequence,
        redeliveries: info?.deliveryCount || 0,
        subject: m.subject,
      };

      this.logger.info(`[normalize] Processing Sleep message: ${JSON.stringify(meta)}`);

      // Extract headers safely
      const hdrs = m.headers ? Object.fromEntries(
        Array.from(m.headers as Iterable<[string, string[]]>).map(([k, vals]) => [k, Array.isArray(vals) && vals.length ? vals[0] : ''])
      ) : {};

      await withExtractedContext(hdrs, async () => {
        await telemetry.tracer.startActiveSpan('normalize.sleep.consume', async (span) => {
          // Add JetStream metadata attributes
          span.setAttribute('messaging.system', 'nats');
          span.setAttribute('messaging.destination', EVENT_TOPICS.SLEEP_RAW_RECEIVED);
          span.setAttribute('messaging.operation', 'process');
          if (info.stream) span.setAttribute('messaging.nats.stream', info.stream);
          if (typeof info.streamSequence === 'number') span.setAttribute('messaging.nats.stream_sequence', info.streamSequence);
          if (typeof info.deliverySequence === 'number') span.setAttribute('messaging.nats.delivery_sequence', info.deliverySequence);
          if (typeof info.deliveryCount === 'number') span.setAttribute('messaging.redelivery_count', Math.max(0, info.deliveryCount - 1));

          try {
            const text = m.string();
            this.logger.debug(`[normalize] Sleep message text: ${text}`);
            const eventData = JSON.parse(text);
            this.logger.info(`[normalize] Sleep event data: ${JSON.stringify({ ...eventData, userId: 'present' })}`);

            // Validate event schema
            const validation = await eventValidator.validateEvent('sleep_raw_received', eventData as any);
            if (!validation.valid) {
              this.logger.warn(`[normalize] Sleep validation failed: ${JSON.stringify(validation.errors)}`);
              sleepMessagesCounter.add(1, { result: 'schema_invalid', subject: EVENT_TOPICS.SLEEP_RAW_RECEIVED, stream: this.actualStreamName, durable: config.sleep.durable });
              promSleepMessagesCounter.inc({ result: 'schema_invalid', subject: EVENT_TOPICS.SLEEP_RAW_RECEIVED, stream: this.actualStreamName, durable: config.sleep.durable });

              // Schema validation failure is non-retryable - send to DLQ
              try {
                await js.publish(`${config.sleep.dlqSubject}.schema-invalid`, m.data as any, { headers: m.headers });
                dlqMessagesCounter.inc({ consumer: 'sleep', reason: 'schema_invalid', subject: EVENT_TOPICS.SLEEP_RAW_RECEIVED });
                this.logger.info(`[normalize] Sent schema-invalid message to DLQ: ${config.sleep.dlqSubject}.schema-invalid`);
              } catch (dlqErr) {
                this.logger.error(`[normalize] Failed to publish to DLQ: ${JSON.stringify(dlqErr)}`);
              }
              m.term();
              span.setStatus({ code: SpanStatusCode.ERROR, message: 'schema validation failed' });
              span.end();
              return;
            }

            this.logger.info(`[normalize] Sleep validation passed, processing data...`);
            await processSleepData(eventData.payload, this.prisma, this.eventBus, this.logger);
            this.logger.info(`[normalize] Sleep data processed successfully`);
            m.ack();
            sleepMessagesCounter.add(1, { result: 'success', subject: EVENT_TOPICS.SLEEP_RAW_RECEIVED, stream: this.actualStreamName, durable: config.sleep.durable });
            promSleepMessagesCounter.inc({ result: 'success', subject: EVENT_TOPICS.SLEEP_RAW_RECEIVED, stream: this.actualStreamName, durable: config.sleep.durable });
            span.setStatus({ code: SpanStatusCode.OK });
          } catch (err: unknown) {
            const deliveries = info?.deliveryCount || 1;
            const attempt = deliveries;

            // Determine if error is retryable
            const isRetryable = (err: unknown): boolean => {
              const errMsg = err instanceof Error ? err.message : String(err);
              return errMsg.includes('ECONNREFUSED') ||
                     errMsg.includes('timeout') ||
                     errMsg.includes('ETIMEDOUT') ||
                     errMsg.includes('Connection') ||
                     errMsg.includes('ENOTFOUND');
            };

            if (attempt >= config.sleep.maxDeliver) {
              this.logger.error(`[normalize] maxDeliver reached, sending to DLQ: ${JSON.stringify({ dlqSubject: config.sleep.dlqSubject, attempt })}`);
              try {
                await js.publish(`${config.sleep.dlqSubject}.max-deliver`, m.data as any, { headers: m.headers });
                dlqMessagesCounter.inc({ consumer: 'sleep', reason: 'max_deliver', subject: EVENT_TOPICS.SLEEP_RAW_RECEIVED });
              } catch (dlqErr) {
                this.logger.error(`[normalize] Failed to publish to DLQ: ${JSON.stringify(dlqErr)}`);
              }
              m.term();
              sleepMessagesCounter.add(1, { result: 'dlq', subject: EVENT_TOPICS.SLEEP_RAW_RECEIVED, stream: this.actualStreamName, durable: config.sleep.durable });
              promSleepMessagesCounter.inc({ result: 'dlq', subject: EVENT_TOPICS.SLEEP_RAW_RECEIVED, stream: this.actualStreamName, durable: config.sleep.durable });
            } else if (isRetryable(err)) {
              this.logger.warn(`[normalize] Retryable error, NAK with delay: ${JSON.stringify({ attempt, maxDeliver: config.sleep.maxDeliver, error: err instanceof Error ? err.message : String(err) })}`);
              m.nak(5000);
              sleepMessagesCounter.add(1, { result: 'retry', subject: EVENT_TOPICS.SLEEP_RAW_RECEIVED, stream: this.actualStreamName, durable: config.sleep.durable });
              promSleepMessagesCounter.inc({ result: 'retry', subject: EVENT_TOPICS.SLEEP_RAW_RECEIVED, stream: this.actualStreamName, durable: config.sleep.durable });
            } else {
              this.logger.error(`[normalize] Non-retryable error, sending to DLQ: ${JSON.stringify({ dlqSubject: config.sleep.dlqSubject, error: err instanceof Error ? err.message : String(err) })}`);
              try {
                await js.publish(`${config.sleep.dlqSubject}.non-retryable`, m.data as any, { headers: m.headers });
                dlqMessagesCounter.inc({ consumer: 'sleep', reason: 'non_retryable', subject: EVENT_TOPICS.SLEEP_RAW_RECEIVED });
              } catch (dlqErr) {
                this.logger.error(`[normalize] Failed to publish to DLQ: ${JSON.stringify(dlqErr)}`);
              }
              m.term();
              sleepMessagesCounter.add(1, { result: 'dlq', subject: EVENT_TOPICS.SLEEP_RAW_RECEIVED, stream: this.actualStreamName, durable: config.sleep.durable });
              promSleepMessagesCounter.inc({ result: 'dlq', subject: EVENT_TOPICS.SLEEP_RAW_RECEIVED, stream: this.actualStreamName, durable: config.sleep.durable });
            }
            span.recordException(err);
            span.setStatus({ code: SpanStatusCode.ERROR, message: err instanceof Error ? err.message : 'Unknown error' });
          } finally {
            span.end();
          }
        });
      });
    };

    // Pull consumer loop
    (async () => {
      this.logger.info(`[normalize] Starting Sleep message processing loop...`);
      try {
        while (this.running) {
          try {
            await sub.pull({ batch: BATCH_SIZE, expires: EXPIRES_MS });

            let processed = 0;
            const deadline = Date.now() + EXPIRES_MS + 100;

            for await (const m of sub) {
              if (processed > 0 && processed % 3 === 0) {
                m.working();
              }
              await handleSleepMessage(m);
              processed++;
              if (processed >= BATCH_SIZE || Date.now() >= deadline) break;
            }

            if (processed === 0) {
              this.logger.info(`[normalize] No Sleep messages pulled, waiting...`);
            }
          } catch (err: unknown) {
            if (!this.running) break;
            this.logger.error(`[normalize] Sleep pull/process error: ${JSON.stringify(err)}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          await new Promise(resolve => setTimeout(resolve, IDLE_BACKOFF_MS));
        }
      } catch (err) {
        if (!this.running) {
          this.logger.info('[normalize] Sleep consumer loop stopped due to shutdown');
        } else {
          this.logger.error(`[normalize] Sleep consumer loop error: ${JSON.stringify(err)}`);
        }
      }
      this.logger.info('[normalize] Sleep message processing loop exited');
    })();
  }

  stop(): void {
    this.running = false;
  }
}
