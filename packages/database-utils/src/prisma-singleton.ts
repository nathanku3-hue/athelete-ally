/**
 * Generic Prisma Client Singleton Factory
 *
 * Creates a singleton instance of any Prisma Client to prevent
 * connection exhaustion in development with hot-reload.
 *
 * @example
 * ```ts
 * import { PrismaClient } from '../prisma/generated/client/index.js';
 * import { createPrismaClient } from '@athlete-ally/database-utils';
 *
 * export const prisma = createPrismaClient(PrismaClient);
 * ```
 */

/**
 * Interface for any Prisma Client constructor
 */
interface PrismaClientConstructor<T = unknown> {
  new (): T;
}

/**
 * Creates a singleton Prisma client instance
 *
 * @param PrismaClientClass - The Prisma Client class constructor
 * @param globalKey - Optional key for storing in globalThis (defaults to 'prisma')
 * @returns Singleton instance of the Prisma Client
 */
export function createPrismaClient<T>(
  PrismaClientClass: PrismaClientConstructor<T>,
  globalKey: string = 'prisma'
): T {
  const globalForPrisma = globalThis as unknown as {
    [key: string]: T | undefined;
  };

  const client = globalForPrisma[globalKey] ?? new PrismaClientClass();

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma[globalKey] = client;
  }

  return client;
}
