/**
 * HRV Consumer
 * Processes HRV raw data events from JetStream
 */

import { consumerOpts, JsMsg, JetStreamPullSubscription } from 'nats';
import type { FastifyInstance } from 'fastify';
import { EventBus, getStreamCandidates } from '@athlete-ally/event-bus';
import { EVENT_TOPICS } from '@athlete-ally/contracts';
import { eventValidator } from '@athlete-ally/event-bus';
import { SpanStatusCode } from '@opentelemetry/api';
import { PrismaClient } from '../../prisma/generated/client';
import { config, BATCH_SIZE, EXPIRES_MS, IDLE_BACKOFF_MS } from '../config.js';
import { telemetry, withExtractedContext, promHrvMessagesCounter, dlqMessagesCounter } from '../telemetry.js';
import { processHrvData } from '../processors/hrv-processor.js';

export class HRVConsumer {
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

    this.logger.info(`[normalize-hrv] DLQ subject prefix: ${config.hrv.dlqSubject}`);
    this.logger.info(`[normalize-hrv] Consumer: ${config.hrv.durable}, maxDeliver: ${config.hrv.maxDeliver}, ackWait: ${config.hrv.ackWaitMs}ms`);

    // Create OTel counters for HRV metrics
    const hrvMessagesCounter = telemetry.meter.createCounter('normalize_hrv_messages_total', {
      description: 'Total number of HRV messages processed by normalize service',
    });

    // Stream binding order: Use getStreamCandidates() for mode-aware stream selection
    const streamCandidates = getStreamCandidates();
    this.logger.info(`[normalize-service] Stream candidates: ${streamCandidates.join(', ')}`);

    // Consumer creation strategy
    if (config.serviceManagesConsumers) {
      for (const streamName of streamCandidates) {
        try {
          await jsm.consumers.add(streamName, {
            durable_name: config.hrv.durable,
            filter_subject: EVENT_TOPICS.HRV_RAW_RECEIVED,
            ack_policy: 'explicit' as any,
            deliver_policy: 'all' as any,
            max_deliver: config.hrv.maxDeliver,
            ack_wait: config.hrv.ackWaitMs * 1_000_000, // Convert ms to ns
            max_ack_pending: 1000
          });
          this.logger.info(`[normalize] HRV consumer created on ${streamName}: ${config.hrv.durable}`);
          this.actualStreamName = streamName;
          break;
        } catch (e) {
          const error = e as Error;
          this.logger.info(`[normalize] Attempted to create HRV consumer on ${streamName}: ${config.hrv.durable}. Error: ${error.message}. Trying next candidate.`);
          if (error.message.includes('consumer already exists')) {
            this.actualStreamName = streamName;
            this.logger.info(`[normalize] Consumer ${config.hrv.durable} already exists on ${streamName}, will bind to existing consumer.`);
            break;
          }
        }
      }
    } else {
      for (const streamName of streamCandidates) {
        try {
          await jsm.consumers.info(streamName, config.hrv.durable);
          this.actualStreamName = streamName;
          this.logger.info(`[normalize] Found existing HRV consumer on ${streamName}: ${config.hrv.durable}`);
          break;
        } catch (e) {
          this.logger.info(`[normalize] Consumer ${config.hrv.durable} not found on ${streamName}. Trying next candidate.`);
        }
      }
    }

    if (!this.actualStreamName) {
      throw new Error('Failed to find HRV consumer on any available stream. Ensure EventBus has created the consumer or set FEATURE_SERVICE_MANAGES_CONSUMERS=false to disable consumer creation.');
    }

    // Bind to existing durable consumer
    const opts = consumerOpts();
    opts.bind(this.actualStreamName, config.hrv.durable);
    opts.ackExplicit();
    opts.manualAck();
    opts.maxDeliver(config.hrv.maxDeliver);
    opts.ackWait(config.hrv.ackWaitMs);

    const sub = await js.pullSubscribe(EVENT_TOPICS.HRV_RAW_RECEIVED, opts) as JetStreamPullSubscription;
    this.logger.info(`[normalize] HRV durable pull consumer bound: ${config.hrv.durable}, subject: ${EVENT_TOPICS.HRV_RAW_RECEIVED}, ackWait: ${config.hrv.ackWaitMs}ms, maxDeliver: ${config.hrv.maxDeliver}`);

    // Message handler function
    const handleHrvMessage = async (m: JsMsg) => {
      const info = m.info;
      const meta = {
        streamSeq: info?.streamSequence,
        deliverySeq: info?.deliverySequence,
        redeliveries: info?.deliveryCount || 0,
        subject: m.subject,
      };

      this.logger.info(`[normalize] Processing HRV message: ${JSON.stringify(meta)}`);

      // Extract headers safely
      const hdrs = m.headers ? Object.fromEntries(
        Array.from(m.headers as Iterable<[string, string[]]>).map(([k, vals]) => [k, Array.isArray(vals) && vals.length ? vals[0] : ''])
      ) : {};

      await withExtractedContext(hdrs, async () => {
        await telemetry.tracer.startActiveSpan('normalize.hrv.consume', async (span) => {
          // Add JetStream metadata attributes
          span.setAttribute('messaging.system', 'nats');
          span.setAttribute('messaging.destination', EVENT_TOPICS.HRV_RAW_RECEIVED);
          span.setAttribute('messaging.operation', 'process');
          if (info.stream) span.setAttribute('messaging.nats.stream', info.stream);
          if (typeof info.streamSequence === 'number') span.setAttribute('messaging.nats.stream_sequence', info.streamSequence);
          if (typeof info.deliverySequence === 'number') span.setAttribute('messaging.nats.delivery_sequence', info.deliverySequence);
          if (typeof info.deliveryCount === 'number') span.setAttribute('messaging.redelivery_count', Math.max(0, info.deliveryCount - 1));

          try {
            const text = m.string();
            this.logger.debug(`[normalize] HRV message text: ${text}`);
            const eventData = JSON.parse(text);
            this.logger.info(`[normalize] HRV event data: ${JSON.stringify({ ...eventData, userId: 'present' })}`);

            // Validate event schema
            const validation = await eventValidator.validateEvent('hrv_raw_received', eventData as any);
            if (!validation.valid) {
              this.logger.warn(`[normalize] HRV validation failed: ${JSON.stringify(validation.errors)}`);
              hrvMessagesCounter.add(1, { result: 'schema_invalid', subject: EVENT_TOPICS.HRV_RAW_RECEIVED, stream: this.actualStreamName, durable: config.hrv.durable });
              promHrvMessagesCounter.inc({ result: 'schema_invalid', subject: EVENT_TOPICS.HRV_RAW_RECEIVED, stream: this.actualStreamName, durable: config.hrv.durable });

              // Schema validation failure is non-retryable - send to DLQ
              try {
                await js.publish(`${config.hrv.dlqSubject}.schema-invalid`, m.data as any, { headers: m.headers });
                dlqMessagesCounter.inc({ consumer: 'hrv', reason: 'schema_invalid', subject: EVENT_TOPICS.HRV_RAW_RECEIVED });
                this.logger.info(`[normalize] Sent schema-invalid message to DLQ: ${config.hrv.dlqSubject}.schema-invalid`);
              } catch (dlqErr) {
                this.logger.error(`[normalize] Failed to publish to DLQ: ${JSON.stringify(dlqErr)}`);
              }
              m.term();
              span.setStatus({ code: SpanStatusCode.ERROR, message: 'schema validation failed' });
              span.end();
              return;
            }

            this.logger.info(`[normalize] HRV validation passed, processing data...`);
            await processHrvData(eventData.payload, this.prisma, this.eventBus, this.logger);
            this.logger.info(`[normalize] HRV data processed successfully`);
            m.ack();
            hrvMessagesCounter.add(1, { result: 'success', subject: EVENT_TOPICS.HRV_RAW_RECEIVED, stream: this.actualStreamName, durable: config.hrv.durable });
            promHrvMessagesCounter.inc({ result: 'success', subject: EVENT_TOPICS.HRV_RAW_RECEIVED, stream: this.actualStreamName, durable: config.hrv.durable });
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

            if (attempt >= config.hrv.maxDeliver) {
              this.logger.error(`[normalize] maxDeliver reached, sending to DLQ: ${JSON.stringify({ dlqSubject: config.hrv.dlqSubject, attempt })}`);
              try {
                await js.publish(`${config.hrv.dlqSubject}.max-deliver`, m.data as any, { headers: m.headers });
                dlqMessagesCounter.inc({ consumer: 'hrv', reason: 'max_deliver', subject: EVENT_TOPICS.HRV_RAW_RECEIVED });
              } catch (dlqErr) {
                this.logger.error(`[normalize] Failed to publish to DLQ: ${JSON.stringify(dlqErr)}`);
              }
              m.term();
              hrvMessagesCounter.add(1, { result: 'dlq', subject: EVENT_TOPICS.HRV_RAW_RECEIVED, stream: this.actualStreamName, durable: config.hrv.durable });
              promHrvMessagesCounter.inc({ result: 'dlq', subject: EVENT_TOPICS.HRV_RAW_RECEIVED, stream: this.actualStreamName, durable: config.hrv.durable });
            } else if (isRetryable(err)) {
              this.logger.warn(`[normalize] Retryable error, NAK with delay: ${JSON.stringify({ attempt, maxDeliver: config.hrv.maxDeliver, error: err instanceof Error ? err.message : String(err) })}`);
              m.nak(5000);
              hrvMessagesCounter.add(1, { result: 'retry', subject: EVENT_TOPICS.HRV_RAW_RECEIVED, stream: this.actualStreamName, durable: config.hrv.durable });
              promHrvMessagesCounter.inc({ result: 'retry', subject: EVENT_TOPICS.HRV_RAW_RECEIVED, stream: this.actualStreamName, durable: config.hrv.durable });
            } else {
              this.logger.error(`[normalize] Non-retryable error, sending to DLQ: ${JSON.stringify({ dlqSubject: config.hrv.dlqSubject, error: err instanceof Error ? err.message : String(err) })}`);
              try {
                await js.publish(`${config.hrv.dlqSubject}.non-retryable`, m.data as any, { headers: m.headers });
                dlqMessagesCounter.inc({ consumer: 'hrv', reason: 'non_retryable', subject: EVENT_TOPICS.HRV_RAW_RECEIVED });
              } catch (dlqErr) {
                this.logger.error(`[normalize] Failed to publish to DLQ: ${JSON.stringify(dlqErr)}`);
              }
              m.term();
              hrvMessagesCounter.add(1, { result: 'dlq', subject: EVENT_TOPICS.HRV_RAW_RECEIVED, stream: this.actualStreamName, durable: config.hrv.durable });
              promHrvMessagesCounter.inc({ result: 'dlq', subject: EVENT_TOPICS.HRV_RAW_RECEIVED, stream: this.actualStreamName, durable: config.hrv.durable });
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
      this.logger.info(`[normalize] Starting HRV message processing loop...`);
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
              await handleHrvMessage(m);
              processed++;
              if (processed >= BATCH_SIZE || Date.now() >= deadline) break;
            }

            if (processed === 0) {
              this.logger.info(`[normalize] No messages pulled, waiting...`);
            }
          } catch (err: unknown) {
            if (!this.running) break;
            this.logger.error(`[normalize] Pull/process error: ${JSON.stringify(err)}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          await new Promise(resolve => setTimeout(resolve, IDLE_BACKOFF_MS));
        }
      } catch (err) {
        if (!this.running) {
          this.logger.info('[normalize] HRV consumer loop stopped due to shutdown');
        } else {
          this.logger.error(`[normalize] HRV consumer loop error: ${JSON.stringify(err)}`);
        }
      }
      this.logger.info('[normalize] HRV message processing loop exited');
    })();
  }

  stop(): void {
    this.running = false;
  }
}
