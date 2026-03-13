import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';
import { incrementErrors } from '../lib/metrics';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const correlationId = res.getHeader('x-correlation-id') as string;
  incrementErrors();

  if (err instanceof ZodError) {
    logger.warn('Validation error', { correlationId, errors: err.errors });
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
    return;
  }

  if (err instanceof AppError) {
    logger.warn('Application error', { correlationId, code: err.code, message: err.message });
    res.status(err.statusCode).json({
      error: err.code || 'APP_ERROR',
      message: err.message,
    });
    return;
  }

  logger.error('Unhandled error', { correlationId, error: err.message, stack: err.stack });
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
}
