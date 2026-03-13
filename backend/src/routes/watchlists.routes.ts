import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { cache } from '../lib/cache';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../lib/logger';

const router = Router();

const CreateWatchlistSchema = z.object({
  name: z.string().min(1).max(100),
  terms: z.array(z.string().min(1).max(200)).min(1).max(50),
});

const UpdateWatchlistSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  terms: z.array(z.string().min(1).max(200)).min(1).max(50).optional(),
});

// GET /watchlists
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'watchlists:all';
    const cached = await cache.get(cacheKey);
    if (cached) {
      res.setHeader('x-cache', 'HIT');
      res.json(JSON.parse(cached));
      return;
    }

    const watchlists = await db.watchlist.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { events: true } } },
    });

    await cache.set(cacheKey, JSON.stringify(watchlists), 30);
    res.setHeader('x-cache', 'MISS');
    res.json(watchlists);
  } catch (err) {
    next(err);
  }
});

// GET /watchlists/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const cacheKey = `watchlists:${id}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      res.setHeader('x-cache', 'HIT');
      res.json(JSON.parse(cached));
      return;
    }

    const watchlist = await db.watchlist.findUnique({
      where: { id },
      include: { events: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });

    if (!watchlist) throw new AppError(404, 'Watchlist not found', 'NOT_FOUND');

    await cache.set(cacheKey, JSON.stringify(watchlist), 30);
    res.setHeader('x-cache', 'MISS');
    res.json(watchlist);
  } catch (err) {
    next(err);
  }
});

// POST /watchlists
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = CreateWatchlistSchema.parse(req.body);
    const watchlist = await db.watchlist.create({ data: body });
    await cache.del('watchlists:all');
    logger.info('Watchlist created', { watchlistId: watchlist.id, name: watchlist.name });
    res.status(201).json(watchlist);
  } catch (err) {
    next(err);
  }
});

// PATCH /watchlists/:id
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const body = UpdateWatchlistSchema.parse(req.body);

    const exists = await db.watchlist.findUnique({ where: { id } });
    if (!exists) throw new AppError(404, 'Watchlist not found', 'NOT_FOUND');

    const watchlist = await db.watchlist.update({ where: { id }, data: body });
    await cache.del('watchlists:all');
    await cache.del(`watchlists:${id}`);
    res.json(watchlist);
  } catch (err) {
    next(err);
  }
});

// DELETE /watchlists/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const exists = await db.watchlist.findUnique({ where: { id } });
    if (!exists) throw new AppError(404, 'Watchlist not found', 'NOT_FOUND');

    await db.watchlist.delete({ where: { id } });
    await cache.del('watchlists:all');
    await cache.del(`watchlists:${id}`);
    logger.info('Watchlist deleted', { watchlistId: id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
