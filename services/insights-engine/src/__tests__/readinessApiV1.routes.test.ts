import Fastify from "fastify";
import { readinessApiV1Routes } from "../routes/readinessApiV1";

// Mock Prisma client used inside the route module
jest.mock("../../prisma/generated/client", () => {
  const sleepData: any = new Map<string, any>();
  const hrvData: any = new Map<string, any>();
  const readinessData: any = new Map<string, any>();
  const key = (userId:string, date: Date) => `${userId}:${date.toISOString().slice(0,10)}`;
  class PrismaClient {
    sleepData = {
      async findUnique({ where: { userId_date: { userId, date } } }: any) { return sleepData.get(key(userId, date)) || null },
      async findFirst({ where: { userId }, orderBy: { date }, select: { date: sel } }: any) {
        const items = Array.from(sleepData.values()).filter((v:any)=>v.userId===userId).sort((a:any,b:any)=> b.date.getTime()-a.date.getTime());
        return items[0] ? { date: items[0].date } : null;
      },
      async findMany({ where: { userId }, orderBy: { date }, take, select: { date: sel } }: any) {
        const items = Array.from(sleepData.values()).filter((v:any)=>v.userId===userId).sort((a:any,b:any)=> b.date.getTime()-a.date.getTime());
        return items.slice(0,take).map(v=>({ date: v.date }));
      },
    };
    hrvData = {
      async findUnique({ where: { userId_date: { userId, date } } }: any) { return hrvData.get(key(userId, date)) || null },
      async findFirst({ where: { userId }, orderBy: { date }, select: { date: sel } }: any) {
        const items = Array.from(hrvData.values()).filter((v:any)=>v.userId===userId).sort((a:any,b:any)=> b.date.getTime()-a.date.getTime());
        return items[0] ? { date: items[0].date } : null;
      },
      async findMany({ where: { userId }, orderBy: { date }, take, select: { date: sel } }: any) {
        const items = Array.from(hrvData.values()).filter((v:any)=>v.userId===userId).sort((a:any,b:any)=> b.date.getTime()-a.date.getTime());
        return items.slice(0,take).map(v=>({ date: v.date }));
      },
    };
    readinessData = {
      async findUnique({ where: { userId_date: { userId, date } } }: any) { return readinessData.get(key(userId, date)) || null },
      async upsert({ where: { userId_date: { userId, date } }, update, create }: any) {
        const k = key(userId, date);
        const existing = readinessData.get(k);
        if (existing) { readinessData.set(k, { ...existing, ...update }); return readinessData.get(k); }
        readinessData.set(k, { userId, date, ...create }); return readinessData.get(k);
      }
    };
  }
  // Expose maps for test seeding
  (PrismaClient as any)._maps = { sleepData, hrvData, readinessData, key };
  return { PrismaClient };
});

function seedNormalized(userId: string, isoDate: string) {
  const { PrismaClient }: any = require("../../prisma/generated/client");
  const { sleepData, hrvData, key } = (PrismaClient as any)._maps;
  const d = new Date(isoDate + 'T00:00:00Z');
  sleepData.set(key(userId, d), { userId, date: d, durationMinutes: 420 });
  hrvData.set(key(userId, d), { userId, date: d, lnRmssd: Math.log(50) });
}

function clearAll() {
  const { PrismaClient }: any = require("../../prisma/generated/client");
  const maps = (PrismaClient as any)._maps;
  maps.sleepData.clear(); maps.hrvData.clear(); maps.readinessData.clear();
}

describe("readinessApiV1 routes", () => {
  afterEach(() => clearAll());

  test("latest returns incomplete stub when inputs missing, then upgrades on re-compute", async () => {
    const app = Fastify();
    await app.register(readinessApiV1Routes, { prefix: "/api/v1/readiness" });
    const userId = "u1";
    // No normalized data → incomplete true
    let res = await app.inject({ method: 'GET', url: `/api/v1/readiness/${userId}/latest` });
    expect(res.statusCode).toBe(200);
    const body1 = res.json();
    expect(body1.userId).toBe(userId);
    expect(body1.incomplete).toBe(true);

    // Seed normalized for today and re-run → complete
    const today = new Date().toISOString().slice(0,10);
    seedNormalized(userId, today);
    res = await app.inject({ method: 'GET', url: `/api/v1/readiness/${userId}/latest` });
    expect(res.statusCode).toBe(200);
    const body2 = res.json();
    expect(body2.incomplete).toBe(false);
    expect(typeof body2.score).toBe('number');
  });

  test("range returns array sorted desc with days bound", async () => {
    const app = Fastify();
    await app.register(readinessApiV1Routes, { prefix: "/api/v1/readiness" });
    const userId = "u2";
    seedNormalized(userId, '2024-01-01');
    seedNormalized(userId, '2024-01-03');
    const res = await app.inject({ method: 'GET', url: `/api/v1/readiness/${userId}?days=2` });
    expect(res.statusCode).toBe(200);
    const arr = res.json();
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBeGreaterThan(0);
    const dates = arr.map((r:any)=> r.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });
});
