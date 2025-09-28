import { connect } from 'nats';
import { PrismaClient } from '../prisma/generated/client';

const prisma = new PrismaClient();

// NATS connection
let nc: any = null;

async function connectNATS() {
  try {
    const natsUrl = process.env.NATS_URL || 'nats://localhost:4222';
    nc = await connect({ servers: natsUrl });
    console.log('Connected to NATS');
    
    // Subscribe to HRV raw data
    const hrvSub = nc.subscribe('hrv.raw-received');
    (async () => {
      for await (const msg of hrvSub) {
        try {
          const data = JSON.parse(msg.data.toString());
          await processHrvData(data);
        } catch (error) {
          console.error('Error processing HRV data:', error);
          // TODO: Send to DLQ
        }
      }
    })();
    
    // Subscribe to Sleep raw data
    const sleepSub = nc.subscribe('sleep.raw-received');
    (async () => {
      for await (const msg of sleepSub) {
        try {
          const data = JSON.parse(msg.data.toString());
          await processSleepData(data);
        } catch (error) {
          console.error('Error processing Sleep data:', error);
          // TODO: Send to DLQ
        }
      }
    })();
    
  } catch (err) {
    console.error('Failed to connect to NATS:', err);
    process.exit(1);
  }
}

async function processHrvData(data: any) {
  try {
    // Normalize HRV data
    const normalized = {
      userId: data.userId,
      date: new Date(data.date),
      rmssd: data.rmssd,
      lnRmssd: data.rmssd ? Math.log(data.rmssd) : null,
      capturedAt: new Date(data.capturedAt || Date.now())
    };
    
    // Upsert to database
    await prisma.hrvData.upsert({
      where: {
        userId_date: {
          userId: normalized.userId,
          date: normalized.date
        }
      },
      update: normalized,
      create: normalized
    });
    
    // Publish normalized event
    if (nc) {
      await nc.publish('hrv.normalized-stored', JSON.stringify(normalized));
    }
    
    console.log('HRV data normalized and stored:', normalized.userId, normalized.date);
  } catch (error) {
    console.error('Error normalizing HRV data:', error);
    throw error;
  }
}

async function processSleepData(data: any) {
  try {
    // Normalize Sleep data
    const normalized = {
      userId: data.userId,
      date: new Date(data.date),
      totalSleep: data.totalSleep,
      deepSleep: data.deepSleep,
      lightSleep: data.lightSleep,
      remSleep: data.remSleep,
      debtMin: data.debtMin || 0, // TODO: Calculate rolling deficit
      capturedAt: new Date(data.capturedAt || Date.now())
    };
    
    // Upsert to database
    await prisma.sleepData.upsert({
      where: {
        userId_date: {
          userId: normalized.userId,
          date: normalized.date
        }
      },
      update: normalized,
      create: normalized
    });
    
    // Publish normalized event
    if (nc) {
      await nc.publish('sleep.normalized-stored', JSON.stringify(normalized));
    }
    
    console.log('Sleep data normalized and stored:', normalized.userId, normalized.date);
  } catch (error) {
    console.error('Error normalizing Sleep data:', error);
    throw error;
  }
}

const start = async () => {
  try {
    await connectNATS();
    console.log('Normalize service started');
  } catch (err) {
    console.error('Failed to start normalize service:', err);
    process.exit(1);
  }
};

start();
