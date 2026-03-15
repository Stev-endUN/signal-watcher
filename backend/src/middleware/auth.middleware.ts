import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

export function requireApiKey(req: Request, _res: Response, next: NextFunction) {
  const validKey = process.env.API_KEY;

  // Sin API_KEY configurada, permite todo (modo dev)
  if (!validKey) return next();

  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== validKey) {
    throw new AppError(401, 'Invalid or missing API key', 'UNAUTHORIZED');
  }

  next();
}
