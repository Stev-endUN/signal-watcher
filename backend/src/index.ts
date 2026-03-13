import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { correlationMiddleware, requestLogger } from './middleware/request.middleware';
import { errorHandler } from './middleware/error.middleware';
import watchlistsRouter from './routes/watchlists.routes';
import eventsRouter from './routes/events.routes';
import { getMetrics } from './lib/metrics';
import { logger } from './lib/logger';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Security & Parsing ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ─── Observability ────────────────────────────────────────────────────────────
app.use(correlationMiddleware);
app.use(requestLogger);
// ─── Root Endpoint ───────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    name: 'Signal Watcher API',
    version: '1.0.0',
    status: 'running',
    docs: {
      health: '/health',
      metrics: '/metrics',
      watchlists: '/api/watchlists',
      events: '/api/events',
    },
  });
});
// ─── Health & Metrics ─────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/metrics', (_req, res) => {
  res.json(getMetrics());
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/watchlists', watchlistsRouter);
app.use('/api/events', eventsRouter);

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(Number(PORT), '0.0.0.0', () => {
  logger.info(`Signal Watcher API running`, { port: PORT, env: process.env.NODE_ENV || 'development' });
});

export default app;
