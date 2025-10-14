/**
 * Sleep data processor
 * Processes and stores sleep quality data
 */

import { PrismaClient } from '../../prisma/generated/client';
import { EventBus } from '@athlete-ally/event-bus';
import { SleepNormalizedStoredEvent, EVENT_TOPICS } from '@athlete-ally/contracts';
import type { FastifyInstance } from 'fastify';

interface SleepPayload {
  userId: string;
  date: string;
  durationMinutes: number;
  capturedAt?: string;
  raw?: Record<string, unknown>;
}

export async function processSleepData(
  payload: SleepPayload,
  prisma: PrismaClient,
  eventBus: EventBus,
  logger: FastifyInstance['log']
): Promise<void> {
  try {
    const { userId, date, durationMinutes, capturedAt, raw } = payload;

    if (!userId || !date || typeof durationMinutes !== 'number') {
      throw new Error('Invalid Sleep payload: missing required fields');
    }

    // Determine vendor from raw data if available
    const vendor = (raw && typeof raw === 'object' && 'source' in raw && typeof raw.source === 'string')
      ? raw.source
      : 'unknown';

    // Extract qualityScore if available in raw data
    const qualityScore = (raw && typeof raw === 'object' && 'qualityScore' in raw && typeof raw.qualityScore === 'number')
      ? Math.min(100, Math.max(0, raw.qualityScore))
      : null;

    // Upsert Sleep data
    const row = await prisma.sleepData.upsert({
      where: {
        userId_date: {
          userId,
          date: new Date(date)
        }
      },
      update: {
        durationMinutes,
        qualityScore,
        vendor,
        capturedAt: capturedAt ? new Date(capturedAt) : new Date(),
        updatedAt: new Date()
      },
      create: {
        userId,
        date: new Date(date),
        durationMinutes,
        qualityScore,
        vendor,
        capturedAt: capturedAt ? new Date(capturedAt) : new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Publish normalized event
    const normalizedEvent: SleepNormalizedStoredEvent = {
      record: {
        userId: row.userId,
        date: typeof row.date === 'string' ? row.date : row.date.toISOString().split('T')[0],
        durationMinutes: row.durationMinutes,
        qualityScore: row.qualityScore ?? undefined,
        vendor: (row.vendor === 'oura' || row.vendor === 'whoop') ? row.vendor : 'unknown',
        capturedAt: row.capturedAt.toISOString()
      }
    };

    await eventBus.publishSleepNormalizedStored(normalizedEvent);
    logger.info(`[normalize] published ${EVENT_TOPICS.SLEEP_NORMALIZED_STORED} userId=${row.userId} date=${typeof row.date === 'string' ? row.date : row.date.toISOString().split('T')[0]}`);
    logger.info(`[normalize] Sleep data upserted and event published for date ${date}`);
  } catch (error) {
    logger.error(`[normalize] Error processing Sleep data: ${JSON.stringify(error)}`);
    throw error;
  }
}
