/**
 * Oura Consumer
 * Processes Oura vendor webhook events from JetStream
 */

import { consumerOpts, JsMsg } from 'nats';
import type { FastifyInstance } from 'fastify';
import { EventBus } from '@athlete-ally/event-bus';
import { eventValidator } from '@athlete-ally/event-bus';
import { SpanStatusCode } from '@opentelemetry/api';
import { config } from '../config.js';
import { telemetry, withExtractedContext, dlqMessagesCounter } from '../telemetry.js';

export class OuraConsumer {
  constructor(
    private eventBus: EventBus,
    private logger: FastifyInstance['log']
  ) {}

  async start(): Promise<void> {
    const js = this.eventBus.getJetStream();
    const jsm = this.eventBus.getJetStreamManager();
    const subj = 'vendor.oura.webhook.received';

    // Create OTel counters for metrics
    const messagesCounter = telemetry.meter.createCounter('normalize_messages_total', {
      description: 'Total number of messages processed by normalize service',
    });
    const redeliveriesCounter = telemetry.meter.createCounter('normalize_redeliveries_total', {
      description: 'Total number of message redeliveries',
    });

    try {
      const stream = await (jsm as any).streams.find(subj);
      this.logger.info(`[normalize] Oura subject stream: ${JSON.stringify(stream)}`);
    } catch {
      this.logger.warn(`[normalize] Oura subject stream not found; ensure JetStream stream includes ${subj}`);
    }

    const opts = consumerOpts();
    opts.durable(config.oura.durable);
    opts.deliverAll();
    opts.ackExplicit();
    opts.manualAck();
    opts.maxDeliver(config.oura.maxDeliver);
    opts.ackWait(config.oura.ackWaitMs);
    const sub = await js.pullSubscribe(subj, opts);

    (async () => {
      for await (const m of sub) {
        const msg = m as JsMsg;
        const hdrs = msg.headers ? Object.fromEntries(
          Array.from(msg.headers as Iterable<[string, string[]]>).map(([k, vals]) => [k, Array.isArray(vals) && vals.length ? vals[0] : ''])
        ) : {};

        await withExtractedContext(hdrs, async () => {
          await telemetry.tracer.startActiveSpan('normalize.oura.consume', async (span) => {
            span.setAttribute('messaging.system', 'nats');
            span.setAttribute('messaging.destination', subj);
            span.setAttribute('messaging.operation', 'process');

            // Add JetStream metadata attributes
            const info = msg.info;
            if (info.stream) span.setAttribute('messaging.nats.stream', info.stream);
            if (typeof info.streamSequence === 'number') span.setAttribute('messaging.nats.stream_sequence', info.streamSequence);
            if (typeof info.deliverySequence === 'number') span.setAttribute('messaging.nats.delivery_sequence', info.deliverySequence);
            if (typeof info.deliveryCount === 'number') span.setAttribute('messaging.redelivery_count', Math.max(0, info.deliveryCount - 1));

            try {
              const text = msg.string();
              if (!text || text[0] !== '{') {
                this.logger.warn('Oura webhook payload is not valid JSON');
                messagesCounter.add(1, { result: 'schema_invalid', subject: subj });
                msg.term();
                span.setStatus({ code: SpanStatusCode.ERROR, message: 'Oura webhook payload is not valid JSON' });
                span.end();
                return;
              }
              const eventData = JSON.parse(text);
              this.logger.info(`Oura webhook event: ${JSON.stringify(eventData)}`);

              // Validate event schema
              const validation = await eventValidator.validateEvent('vendor_oura_webhook_received', eventData as any);
              if (!validation.valid) {
                this.logger.warn(`Oura webhook validation failed: ${JSON.stringify(validation.errors)}`);
                messagesCounter.add(1, { result: 'schema_invalid', subject: subj });
                // Schema validation failure is non-retryable - send to DLQ
                try {
                  await js.publish(config.oura.dlqSubject, msg.data as any, { headers: msg.headers });
                  dlqMessagesCounter.inc({ consumer: 'oura', reason: 'schema_invalid', subject: subj });
                } catch (dlqErr) {
                  this.logger.error(`Failed to publish to DLQ: ${JSON.stringify(dlqErr)}`);
                }
                msg.term();
                span.setStatus({ code: SpanStatusCode.ERROR, message: 'Oura webhook validation failed' });
                span.end();
                return;
              }

              // Process Oura webhook data
              msg.ack();
              messagesCounter.add(1, { result: 'success', subject: subj });
              span.setStatus({ code: SpanStatusCode.OK });
            } catch (err: unknown) {
              const deliveries = (msg.info && typeof msg.info.deliveryCount === 'number') ? msg.info.deliveryCount : (msg.redelivered ? 2 : 1);
              const attempt = deliveries;
              redeliveriesCounter.add(1, { subject: subj, attempt: attempt.toString() });

              // Determine if error is retryable
              const isRetryable = (err: unknown): boolean => {
                const errMsg = err instanceof Error ? err.message : String(err);
                return errMsg.includes('ECONNREFUSED') ||
                       errMsg.includes('timeout') ||
                       errMsg.includes('ETIMEDOUT') ||
                       errMsg.includes('Connection') ||
                       errMsg.includes('ENOTFOUND');
              };

              if (attempt >= config.oura.maxDeliver) {
                this.logger.error(`maxDeliver reached, sending to DLQ: ${JSON.stringify({ dlqSubject: config.oura.dlqSubject, attempt })}`);
                try {
                  await js.publish(config.oura.dlqSubject, msg.data as any, { headers: msg.headers });
                  dlqMessagesCounter.inc({ consumer: 'oura', reason: 'max_deliver', subject: subj });
                } catch (dlqErr) {
                  this.logger.error(`Failed to publish to DLQ: ${JSON.stringify(dlqErr)}`);
                }
                msg.term();
                messagesCounter.add(1, { result: 'dlq', subject: subj });
              } else if (isRetryable(err)) {
                this.logger.warn(`Retryable error, NAK with delay: ${JSON.stringify({ attempt, maxDeliver: config.oura.maxDeliver, error: err instanceof Error ? err.message : String(err) })}`);
                msg.nak(5000);
                messagesCounter.add(1, { result: 'retry', subject: subj });
              } else {
                this.logger.error(`Non-retryable error, sending to DLQ: ${JSON.stringify({ dlqSubject: config.oura.dlqSubject, error: err instanceof Error ? err.message : String(err) })}`);
                try {
                  await js.publish(config.oura.dlqSubject, msg.data as any, { headers: msg.headers });
                  dlqMessagesCounter.inc({ consumer: 'oura', reason: 'non_retryable', subject: subj });
                } catch (dlqErr) {
                  this.logger.error(`Failed to publish to DLQ: ${JSON.stringify(dlqErr)}`);
                }
                msg.term();
                messagesCounter.add(1, { result: 'dlq', subject: subj });
              }
              span.recordException(err);
              span.setStatus({ code: SpanStatusCode.ERROR, message: err instanceof Error ? err.message : 'Unknown error' });
            } finally {
              span.end();
            }
          });
        });
      }
    })();
  }
}
