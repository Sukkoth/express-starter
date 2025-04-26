import { PrismaClient } from '@/libs/prisma/generated';
import { env } from '@libs/configs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
    errorFormat: 'pretty',
  });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
