# Runbook — Signal Watcher

## Health Check

```bash
curl http://localhost:3001/health
# → {"status":"ok","timestamp":"..."}
```

## Metrics

```bash
curl http://localhost:3001/metrics
# → {"requestCount":42,"errorCount":0,"eventsProcessed":7,"avgResponseTimeMs":45,"uptime":3600,"memoryMB":48}
```

## Database Migrations

```bash
cd backend
npx prisma migrate dev --name <migration-name>   # development
npx prisma migrate deploy                         # production
npx prisma studio                                 # GUI explorer
```

## Reset Database (dev only)

```bash
npx prisma migrate reset
```

## View Logs

Logs are structured JSON. In development they are colorized. Filter with jq:

```bash
npm run dev 2>&1 | grep '"level":"error"'
npm run dev 2>&1 | jq 'select(.correlationId != null)'
```

## Clear Cache

The in-memory cache resets on restart. For Redis:
```bash
redis-cli FLUSHDB
```

## Scale Backend

The backend is stateless (DB + Redis externalized). Scale horizontally behind a load balancer. Each instance connects to the same PostgreSQL and Redis.

## Rotate AI Provider

1. Set `AI_MODE=openai` in environment
2. Set `OPENAI_API_KEY=sk-...`
3. Restart backend — no code changes needed

## Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| `DATABASE_URL` connection refused | PostgreSQL not running | `docker compose up postgres` |
| Events stuck as "pending" | AI enrichment crashed | Check backend logs for `correlationId` |
| 429 from OpenAI | Rate limit exceeded | Switch to `AI_MODE=mock` temporarily |
| Frontend can't reach API | CORS misconfiguration | Add origin to `ALLOWED_ORIGINS` env var |
