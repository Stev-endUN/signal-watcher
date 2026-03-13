import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const db: PrismaClient = global.__prisma ?? new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
  ],
});

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = db;
}

db.$on('query' as never, (e: { query: string; duration: number }) => {
  if (process.env.LOG_QUERIES === 'true') {
    logger.debug('DB Query', { query: e.query, duration: e.duration });
  }
});
