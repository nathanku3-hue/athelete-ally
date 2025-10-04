import type { PrismaClient } from '../prisma/generated/client';
import { endOfUtcDay, startOfUtcDay } from './utils/date';

export interface ReadinessRecord {
  userId: string;
  date: Date; // UTC date at 00:00:00
  score?: number; // 0..100
  incomplete?: boolean;
  components?: { hrvScore?: number; sleepScore?: number; notes?: string };
}

export interface Repo {
  getSleepForDate(userId: string, date: Date): Promise<{ durationMinutes: number; qualityScore?: number } | null>;
  getHrvForDate(userId: string, date: Date): Promise<{ lnRmssd: number } | null>;
  getHrvBaseline(userId: string, date: Date, lookbackDays: number): Promise<number[]>
  upsertReadiness(rec: ReadinessRecord): Promise<void>;
  getLatestReadiness(userId: string): Promise<ReadinessRecord | null>;
  getReadinessRange(userId: string, days: number): Promise<ReadinessRecord[]>;
}

export class PrismaRepo implements Repo {
  constructor(private prisma: PrismaClient) {}

  async getSleepForDate(userId: string, date: Date) {
    const rec = await this.prisma.sleepData.findUnique({
      where: { userId_date: { userId, date } },
      select: { durationMinutes: true, qualityScore: true },
    }).catch(async () => {
      // Some Prisma clients may not have compound unique; fallback to findFirst range
      return this.prisma.sleepData.findFirst({
        where: { userId, date: { gte: startOfUtcDay(date), lte: endOfUtcDay(date) } },
        select: { durationMinutes: true, qualityScore: true }
      });
    });
    return rec ? { durationMinutes: rec.durationMinutes, qualityScore: rec.qualityScore ?? undefined } : null;
  }

  async getHrvForDate(userId: string, date: Date) {
    const rec = await this.prisma.hrvData.findFirst({
      where: { userId, date: { gte: startOfUtcDay(date), lte: endOfUtcDay(date) } },
      select: { lnRmssd: true },
      orderBy: { date: 'desc' }
    });
    return rec && rec.lnRmssd != null ? { lnRmssd: rec.lnRmssd } : null;
  }

  async getHrvBaseline(userId: string, date: Date, lookbackDays: number) {
    const start = new Date(date);
    start.setUTCDate(start.getUTCDate() - lookbackDays);
    const rows = await this.prisma.hrvData.findMany({
      where: { userId, date: { gte: start, lt: date } },
      select: { lnRmssd: true },
      orderBy: { date: 'asc' }
    });
    return rows.filter(r => r.lnRmssd != null).map(r => r.lnRmssd as number);
  }

  async upsertReadiness(rec: ReadinessRecord) {
    await this.prisma.readinessData.upsert({
      where: { userId_date: { userId: rec.userId, date: rec.date } },
      create: {
        userId: rec.userId,
        date: rec.date,
        score: rec.score ?? 0,
        incomplete: rec.incomplete ?? false,
        components: rec.components as any,
      },
      update: {
        score: rec.score ?? 0,
        incomplete: rec.incomplete ?? false,
        components: rec.components as any,
      }
    });
  }

  async getLatestReadiness(userId: string) {
    const r = await this.prisma.readinessData.findFirst({
      where: { userId },
      orderBy: { date: 'desc' }
    });
    return r ? { userId: r.userId, date: r.date, score: r.score, incomplete: r.incomplete ?? undefined, components: (r as any).components ?? undefined } : null;
  }

  async getReadinessRange(userId: string, days: number) {
    const end = startOfUtcDay(new Date());
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (days - 1));
    const list = await this.prisma.readinessData.findMany({
      where: { userId, date: { gte: start, lte: end } },
      orderBy: { date: 'desc' }
    });
    return list.map(r => ({ userId: r.userId, date: r.date, score: r.score, incomplete: r.incomplete ?? undefined, components: (r as any).components ?? undefined }));
  }
}

export class InMemoryRepo implements Repo {
  private sleep = new Map<string, { durationMinutes: number; qualityScore?: number }>();
  private hrv = new Map<string, { lnRmssd: number }>();
  private readiness = new Map<string, ReadinessRecord>();

  private key(userId: string, date: Date) { return `${userId}|${date.toISOString().slice(0,10)}`; }

  async getSleepForDate(userId: string, date: Date) { return this.sleep.get(this.key(userId, date)) ?? null; }
  async getHrvForDate(userId: string, date: Date) { return this.hrv.get(this.key(userId, date)) ?? null; }
  async getHrvBaseline(userId: string, date: Date, lookbackDays: number) {
    const arr: number[] = [];
    for (let i = 1; i <= lookbackDays; i++) {
      const d = new Date(date); d.setUTCDate(d.getUTCDate() - i);
      const rec = this.hrv.get(this.key(userId, d)); if (rec) arr.push(rec.lnRmssd);
    }
    return arr.reverse();
  }
  async upsertReadiness(rec: ReadinessRecord) { this.readiness.set(this.key(rec.userId, rec.date), rec); }
  async getLatestReadiness(userId: string) {
    let latest: ReadinessRecord | null = null;
    for (const [k, v] of this.readiness.entries()) {
      if (k.startsWith(userId + '|') && (!latest || v.date > latest.date)) latest = v;
    }
    return latest;
  }
  async getReadinessRange(userId: string, days: number) {
    const end = startOfUtcDay(new Date());
    const start = new Date(end); start.setUTCDate(start.getUTCDate() - (days - 1));
    const res: ReadinessRecord[] = [];
    for (let dt = new Date(end); dt >= start; dt.setUTCDate(dt.getUTCDate() - 1)) {
      const rec = this.readiness.get(this.key(userId, dt)); if (rec) res.push(rec);
    }
    return res;
  }

  // helpers for tests
  seedSleep(userId: string, date: Date, durationMinutes: number, qualityScore?: number) { this.sleep.set(this.key(userId, date), { durationMinutes, qualityScore }); }
  seedHrv(userId: string, date: Date, lnRmssd: number) { this.hrv.set(this.key(userId, date), { lnRmssd }); }
}

