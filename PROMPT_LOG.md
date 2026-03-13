# PROMPT_LOG.md — AI Usage History

This file documents all meaningful AI-assisted decisions made during development.

---

## Session 1 — Architecture Planning

**Prompt**: Design a full-stack Node.js + Next.js micro-product for threat signal monitoring with AI enrichment, Redis cache, structured logs, and CI/CD.

**Output**: Chose Express + Prisma + PostgreSQL for backend; Next.js App Router with SSR for frontend; adapter pattern for AI provider; in-memory cache with Redis-compatible interface for dev ergonomics.

---

## Session 2 — AI Adapter Design

**Prompt**: Design an AI adapter that supports mock mode for testing and a real OpenAI provider, with deterministic-ish mock responses for demos.

**Output**: `AIAdapter` interface with `MockAIAdapter` (deterministic response selection based on payload hash) and `OpenAIAdapter` (GPT-4o-mini with JSON mode). Factory function reads `AI_MODE` env var.

---

## Session 3 — Event Enrichment Flow

**Prompt**: Design the async enrichment pattern for events: accept HTTP 202 immediately, enrich with AI in background, persist result, invalidate cache.

**Output**: `POST /api/events/simulate` returns 202 with `eventId` and `correlationId`. Background async IIFE runs AI enrichment, updates DB record, invalidates cache entries. Frontend polls via `setTimeout` + `router.refresh()`.

---

## Session 4 — Observability

**Prompt**: Design correlation ID propagation from HTTP request through AI enrichment and into every log line.

**Output**: `correlationMiddleware` generates UUID per request, attaches to `req.correlationId` and response header. `createRequestLogger(correlationId)` creates child logger. Correlation ID stored in `Event` model for DB-level tracing.

---

## Session 5 — Frontend UX

**Prompt**: Design a dark terminal/threat-intel aesthetic for the dashboard using Tailwind, with severity color coding and a simulate panel.

**Output**: Dark color palette (`#0a0b0d` bg), JetBrains Mono + Syne fonts, severity-coded event cards (CRITICAL=red, HIGH=orange, MED=yellow, LOW=blue), scanline CSS overlay for atmosphere, animate-slide-up for new events.
