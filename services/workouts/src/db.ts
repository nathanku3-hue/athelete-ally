import { PrismaClient } from '../prisma/generated/client';
import { createPrismaClient } from '@athlete-ally/database-utils';

export const prisma = createPrismaClient(PrismaClient);

