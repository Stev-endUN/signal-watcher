# Signal Watcher 🛰️

> AI-powered threat intelligence platform for monitoring brand signals, detecting suspicious domains, and enriching security events with NLP analysis.

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js 20 · TypeScript · Express · Prisma · PostgreSQL |
| Cache | In-memory (dev) / Redis (prod) |
| AI | Mock adapter (dev) / OpenAI GPT-4o-mini (prod) |
| Frontend | Next.js 14 · App Router · SSR · Tailwind CSS |
| DevOps | Docker Compose · GitHub Actions CI/CD · Vercel (frontend) |

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose

### 1. Start infrastructure

```bash
docker compose up postgres redis -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env          # edit DATABASE_URL if needed
npm install
npx prisma migrate dev --name init
npm run dev
# → API running at http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# → App running at http://localhost:3000
```

## API Reference

### Watchlists

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/watchlists` | List all watchlists |
| POST | `/api/watchlists` | Create watchlist |
| GET | `/api/watchlists/:id` | Get watchlist with events |
| PATCH | `/api/watchlists/:id` | Update watchlist |
| DELETE | `/api/watchlists/:id` | Delete watchlist |

### Events

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/events` | List all events (optionally `?watchlistId=`) |
| POST | `/api/events/simulate` | Simulate and enrich an event (202 async) |
| GET | `/api/events/:id` | Get event detail |

### Observability

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/metrics` | Request count, avg latency, events processed |

## Simulate an Event (cURL)

```bash
# Create watchlist
curl -X POST http://localhost:3001/api/watchlists \
  -H "Content-Type: application/json" \
  -d '{"name":"Brand Protection","terms":["acme.com","acmecorp"]}'

# Simulate event (use the watchlistId from above)
curl -X POST http://localhost:3001/api/events/simulate \
  -H "Content-Type: application/json" \
  -d '{"watchlistId":"<id>","type":"suspicious_domain"}'
```

## Enable Real AI

```bash
# In backend/.env
AI_MODE=openai
OPENAI_API_KEY=sk-...
```

## Deploy

**Frontend** → Push to GitHub, connect to Vercel. Set `NEXT_PUBLIC_API_URL`.

**Backend** → Build Docker image (`docker build -t signal-watcher-api ./backend`), deploy to Railway, Render, or any container service. Set all env vars from `.env.example`.

## Architecture

```
┌─────────────────┐         ┌───────────────────────────────┐
│   Next.js SSR   │ ──API── │  Express API                  │
│   (Vercel)      │         │  ├─ Correlation middleware     │
└─────────────────┘         │  ├─ Request logger             │
                            │  ├─ Zod validation             │
                            │  ├─ Error handler              │
                            │  ├─ /watchlists routes         │
                            │  └─ /events routes             │
                            │       └─ AI Adapter (async)    │
                            │           ├─ MockAIAdapter     │
                            │           └─ OpenAIAdapter     │
                            │  ├─ Prisma → PostgreSQL        │
                            │  └─ Cache → Redis / Memory     │
                            └───────────────────────────────┘
```

## Docs

- [Architecture Decisions](docs/ADR.md)
- [Runbook](docs/RUNBOOK.md)
- [AI Prompt Log](PROMPT_LOG.md)
