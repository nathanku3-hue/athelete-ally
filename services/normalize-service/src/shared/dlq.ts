/**
 * Dead Letter Queue (DLQ) utilities
 */

import type { JetStreamClient, JsMsg } from 'nats';
import type { FastifyBaseLogger } from 'fastify';
import { dlqMessagesCounter } from './metrics.js';

export type DLQReason = 'schema_invalid' | 'max_deliver' | 'non_retryable';

/**
 * Publishes a message to the DLQ with appropriate suffix
 */
export async function publishToDLQ(
  js: JetStreamClient,
  dlqSubjectPrefix: string,
  reason: DLQReason,
  message: JsMsg,
  consumer: string,
  logger: FastifyBaseLogger
): Promise<void> {
  const dlqSubject = `${dlqSubjectPrefix}.${reason.replace('_', '-')}`;

  try {
    await js.publish(dlqSubject, message.data as any, { headers: message.headers });
    dlqMessagesCounter.inc({ consumer, reason, subject: message.subject });
    logger.info(`[normalize] Sent message to DLQ: ${dlqSubject}`);
  } catch (dlqErr) {
    logger.error(`[normalize] Failed to publish to DLQ: ${JSON.stringify(dlqErr)}`);
    throw dlqErr;
  }
}
