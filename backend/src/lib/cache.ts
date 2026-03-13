import { logger } from './logger';

// In-memory cache that mimics Redis interface
// Replace with `ioredis` for production
interface CacheEntry {
  value: string;
  expiresAt: number | null;
}

const store = new Map<string, CacheEntry>();

export const cache = {
  async get(key: string): Promise<string | null> {
    const entry = store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.value;
  },

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  },

  async del(key: string): Promise<void> {
    store.delete(key);
  },

  async flush(): Promise<void> {
    store.clear();
  },
};

// Periodic cleanup of expired keys
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt && now > entry.expiresAt) {
      store.delete(key);
    }
  }
}, 60_000);

logger.info('Cache initialized (in-memory mode — configure Redis for production)');
