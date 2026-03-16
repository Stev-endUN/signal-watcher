import { logger } from './logger';
import type { Redis as RedisClient } from 'ioredis';
interface CacheEntry {
  value: string;
  expiresAt: number | null;
}

interface CacheAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  flush(): Promise<void>;
}

// ─── In-Memory Adapter ────────────────────────────────────────────────────────
class MemoryCache implements CacheAdapter {
  private store = new Map<string, CacheEntry>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async flush(): Promise<void> {
    this.store.clear();
  }
}

// ─── Redis Adapter ────────────────────────────────────────────────────────────
class RedisCache implements CacheAdapter {
  private client: RedisClient;

  constructor(redisUrl: string) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
const Redis = require('ioredis');
    this.client = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });

    this.client.on('error', (err: Error) => {
      logger.warn('Redis connection error', { error: err.message });
    });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async flush(): Promise<void> {
    await this.client.flushdb();
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────
function createCache(): CacheAdapter {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    logger.info('Cache initialized (Redis mode)', { url: redisUrl.replace(/:\/\/.*@/, '://***@') });
    return new RedisCache(redisUrl);
  }

  logger.info('Cache initialized (in-memory mode — set REDIS_URL for Redis)');
  return new MemoryCache();
}

export const cache = createCache();