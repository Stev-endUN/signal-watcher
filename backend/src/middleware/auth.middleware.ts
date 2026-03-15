import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

export function requireApiKey(req: Request, _res: Response, next: NextFunction) {
  // Allow CORS preflight requests
  if (req.method === 'OPTIONS') return next();

  const validKey = process.env.API_KEY;
  if (!validKey) return next();

  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== validKey) {
    throw new AppError(401, 'Invalid or missing API key', 'UNAUTHORIZED');
  }

  next();
}