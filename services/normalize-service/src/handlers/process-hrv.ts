/**
 * HRV data processing handler
 */

import { PrismaClient } from '../../prisma/generated/client/index.js';
import { EventBus } from '@athlete-ally/event-bus';
import { HRVNormalizedStoredEvent } from '@athlete-ally/contracts';
import type { FastifyBaseLogger } from 'fastify';
import type { HRVPayload } from '../shared/types.js';

export async function processHrvData(
  payload: HRVPayload,
  prisma: PrismaClient,
  eventBus: EventBus,
  logger: FastifyBaseLogger
): Promise<void> {
  try {
    const { userId, date } = payload;

    // Contract compatibility: support both rMSSD (contract standard) and rmssd (legacy)
    const rmssd = payload.rMSSD ?? payload.rmssd;
    const lnRmssd = payload.lnRMSSD ?? payload.lnRmssd ?? (typeof rmssd === 'number' ? Math.log(rmssd) : null);

    if (!userId || !date || typeof rmssd !== 'number') {
      throw new Error('Invalid HRV payload: missing required fields');
    }

    // Calculate lnRmssd if not provided
    const calculatedLnRmssd = lnRmssd ?? Math.log(rmssd);

    // Upsert HRV data
    const row = await prisma.hrvData.upsert({
      where: {
        userId_date: {
          userId,
          date: new Date(date)
        }
      },
      update: {
        rmssd,
        lnRmssd: calculatedLnRmssd,
        capturedAt: new Date(),
        updatedAt: new Date()
      },
      create: {
        userId,
        date: new Date(date),
        rmssd,
        lnRmssd: calculatedLnRmssd,
        capturedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Publish normalized event
    const normalizedEvent: HRVNormalizedStoredEvent = {
      record: {
        userId: row.userId,
        date: typeof row.date === 'string' ? row.date : row.date.toISOString().split('T')[0],
        rMSSD: row.rmssd ?? 0, // Handle null case
        lnRMSSD: row.lnRmssd ?? 0, // Handle null case
        readinessScore: 0,
        vendor: 'oura',
        capturedAt: row.capturedAt.toISOString()
      }
    };

    await eventBus.publishHRVNormalizedStored(normalizedEvent);
    logger.info(`[normalize] HRV data upserted and event published for date ${date}`);
  } catch (error) {
    logger.error(`[normalize] Error processing HRV data: ${JSON.stringify(error)}`);
    throw error;
  }
}
