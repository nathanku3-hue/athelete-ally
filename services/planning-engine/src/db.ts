// Use explicit index.js for Node16 ESM resolution and to allow TS to pick up
// the colocated index.d.ts from the Prisma generated client folder.
// This avoids TS2307 during type-check when moduleResolution is node16.
import { PrismaClient } from '../prisma/generated/client/index.js';

export const prisma = new PrismaClient();

