export interface OuraTokenRecord {
  userId: string;
  accessToken: string;
  refreshToken: string;
  scope?: string;
  expiresAt?: number; // epoch ms
}

export interface TokenStore {
  put(rec: OuraTokenRecord): Promise<void>;
  get(userId: string): Promise<OuraTokenRecord | null>;
  update(userId: string, patch: Partial<OuraTokenRecord>): Promise<void>;
}

// In-memory dev store (non-persistent). Do NOT use in production.
export class MemoryTokenStore implements TokenStore {
  private m = new Map<string, OuraTokenRecord>();
  async put(rec: OuraTokenRecord) { this.m.set(rec.userId, rec); }
  async get(userId: string) { return this.m.get(userId) || null; }
  async update(userId: string, patch: Partial<OuraTokenRecord>) {
    const cur = this.m.get(userId); if (!cur) return; this.m.set(userId, { ...cur, ...patch });
  }
}

// Optional: Postgres-backed store (lazy import to avoid test deps)
export class PostgresTokenStore implements TokenStore {
  private prisma: any;
  constructor(prismaClient?: any) { this.prisma = prismaClient; }
  private async ensurePrisma() {
    if (!this.prisma) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { PrismaClient } = require('@prisma/client');
      this.prisma = new PrismaClient();
    }
  }
  async put(rec: OuraTokenRecord) {
    await this.ensurePrisma();
    await this.prisma.ouraToken.upsert({
      where: { userId: rec.userId },
      update: { accessToken: rec.accessToken, refreshToken: rec.refreshToken, scope: rec.scope || null, expiresAt: rec.expiresAt || null },
      create: { userId: rec.userId, accessToken: rec.accessToken, refreshToken: rec.refreshToken, scope: rec.scope || null, expiresAt: rec.expiresAt || null },
    });
  }
  async get(userId: string) {
    await this.ensurePrisma();
    const row = await this.prisma.ouraToken.findUnique({ where: { userId } });
    if (!row) return null;
    return { userId: row.userId, accessToken: row.accessToken, refreshToken: row.refreshToken, scope: row.scope || undefined, expiresAt: row.expiresAt || undefined } as OuraTokenRecord;
  }
  async update(userId: string, patch: Partial<OuraTokenRecord>) {
    await this.ensurePrisma();
    await this.prisma.ouraToken.update({ where: { userId }, data: patch });
  }
}

export function getTokenStore(): TokenStore {
  const mode = (process.env.OURA_TOKEN_STORE || 'memory').toLowerCase();
  if (mode === 'postgres') return new PostgresTokenStore();
  return new MemoryTokenStore();
}

