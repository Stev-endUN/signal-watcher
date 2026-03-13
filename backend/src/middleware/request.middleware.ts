import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../lib/logger';
import { incrementRequests, recordResponseTime } from '../lib/metrics';

export function correlationMiddleware(req: Request, res: Response, next: NextFunction) {
  const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
  res.setHeader('x-correlation-id', correlationId);
  (req as Request & { correlationId: string }).correlationId = correlationId;
  next();
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const correlationId = (req as Request & { correlationId: string }).correlationId;

  incrementRequests();

  res.on('finish', () => {
    const duration = Date.now() - start;
    recordResponseTime(duration);
    logger.info('HTTP request', {
      correlationId,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      durationMs: duration,
    });
  });

  next();
}
