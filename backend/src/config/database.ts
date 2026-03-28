import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { logger } from '../utils/logger';

const connectionString = process.env.DATABASE_URL!;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const SLOW_QUERY_THRESHOLD_MS = parseInt(process.env.SLOW_QUERY_THRESHOLD_MS || '500', 10)

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });

// Track slow queries
prisma.$on('query', (e) => {
  if (e.duration >= SLOW_QUERY_THRESHOLD_MS) {
    logger.warn('Slow database query detected', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
      threshold: `${SLOW_QUERY_THRESHOLD_MS}ms`,
      target: e.target,
    })
  }
})

prisma.$on('error', (e) => {
  logger.error('Prisma error', { message: e.message, target: e.target })
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
