import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/db';
import { cache } from '../lib/cache';
import { createAIAdapter } from '../services/ai.service';
import { AppError } from '../middleware/error.middleware';
import { incrementEventsProcessed } from '../lib/metrics';
import { createRequestLogger } from '../lib/logger';

const router = Router();
const ai = createAIAdapter();

const SimulateEventSchema = z.object({
  watchlistId: z.string().uuid(),
  type: z.enum(['suspicious_domain', 'new_subdomain', 'keyword_match', 'phishing_campaign', 'data_leak', 'brand_abuse']),
  details: z.record(z.unknown()).optional(),
});

// GET /events?watchlistId=
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const watchlistId = req.query.watchlistId as string | undefined;
    const cacheKey = `events:${watchlistId || 'all'}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      res.setHeader('x-cache', 'HIT');
      res.json(JSON.parse(cached));
      return;
    }

    const events = await db.event.findMany({
      where: watchlistId ? { watchlistId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { watchlist: { select: { name: true, terms: true } } },
    });

    await cache.set(cacheKey, JSON.stringify(events), 15);
    res.setHeader('x-cache', 'MISS');
    res.json(events);
  } catch (err) {
    next(err);
  }
});

// POST /events/simulate — simulate an incoming signal event
router.post('/simulate', async (req: Request, res: Response, next: NextFunction) => {
  const correlationId = uuidv4();
  const log = createRequestLogger(correlationId);

  try {
    const body = SimulateEventSchema.parse(req.body);

    const watchlist = await db.watchlist.findUnique({ where: { id: body.watchlistId } });
    if (!watchlist) throw new AppError(404, 'Watchlist not found', 'NOT_FOUND');

    log.info('Simulating event', { type: body.type, watchlistId: body.watchlistId });

    // Build raw event payload
    const rawData = {
      type: body.type,
      timestamp: new Date().toISOString(),
      source: 'signal-watcher-simulator',
      ...body.details,
    };

    // Create event record
    const event = await db.event.create({
      data: {
        watchlistId: body.watchlistId,
        rawData,
        correlationId,
        severity: 'LOW',
      },
    });

    // Async AI enrichment
    res.status(202).json({
      message: 'Event accepted, AI enrichment in progress',
      eventId: event.id,
      correlationId,
    });

    // Enrich in background
    (async () => {
      try {
        const analysis = await ai.analyzeEvent(rawData as Record<string, unknown>, watchlist.terms);
        await db.event.update({
          where: { id: event.id },
          data: {
            summary: analysis.summary,
            severity: analysis.severity,
            nextAction: analysis.nextAction,
            processedAt: new Date(),
          },
        });

        // Invalidate caches
        await cache.del(`events:all`);
        await cache.del(`events:${body.watchlistId}`);

        incrementEventsProcessed();
        log.info('Event enriched by AI', { eventId: event.id, severity: analysis.severity });
      } catch (err) {
        log.error('AI enrichment failed', { eventId: event.id, error: String(err) });
      }
    })();
  } catch (err) {
    next(err);
  }
});

// GET /events/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await db.event.findUnique({
      where: { id: req.params.id },
      include: { watchlist: { select: { name: true, terms: true } } },
    });
    if (!event) throw new AppError(404, 'Event not found', 'NOT_FOUND');
    res.json(event);
  } catch (err) {
    next(err);
  }
});

export default router;
