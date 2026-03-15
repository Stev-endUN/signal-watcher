# Architecture Decision Records

## ADR-001 — Express over Fastify

**Decision**: Use Express.js as the HTTP framework.

**Context**: Both Express and Fastify are valid choices. The team has broader Express familiarity and the ecosystem of middleware (helmet, cors) is mature.

**Consequences**: Slightly lower raw throughput than Fastify but negligible at this scale. Faster onboarding for contributors.

---

## ADR-002 — Prisma over raw SQL / Knex

**Decision**: Use Prisma ORM with PostgreSQL.

**Context**: The data model is relational and typed. Prisma provides type-safe queries, auto-migrations, and an excellent DX. At this scale, the abstraction overhead is acceptable.

**Consequences**: Migration workflow tied to Prisma CLI. Schema changes require `prisma migrate dev`.

---

## ADR-003 — In-memory cache con soporte opcional de Redis

**Decision**: Implementar un adaptador de cache con dos modos: in-memory (por defecto) y Redis (cuando `REDIS_URL` está configurado).

**Context**: Redis añade valor real en producción (persistencia entre reinicios, cache compartido entre instancias) pero introduce costos operativos. El patrón de adaptador permite escalar sin cambiar código.

**Estado actual**: In-memory en producción. Para activar Redis basta con agregar `REDIS_URL` como variable de entorno.

**Consequences**: Cache no persiste entre reinicios en modo in-memory. Para escalar horizontalmente se recomienda activar Redis.
---

## ADR-004 — AI adapter pattern with mock mode

**Decision**: Implement an `AIAdapter` interface with two concrete implementations: `MockAIAdapter` and `OpenAIAdapter`.

**Context**: The prueba técnica requires functional AI without mandating a real API key. The adapter pattern allows tests to run fully offline and lets the real provider be swapped without touching business logic.

**Consequences**: Mock responses are deterministic-ish (based on payload size) to feel realistic. Set `AI_MODE=openai` + `OPENAI_API_KEY` to go live.

---

## ADR-005 — Next.js App Router with SSR

**Decision**: Use Next.js 14 App Router with Server Components for data fetching.

**Context**: App Router with `fetch` in Server Components gives us SSR with automatic deduplication and revalidation (`revalidate = 10`). No client-side data fetching libraries needed for initial load.

**Consequences**: Mutations (create watchlist, simulate event) use Client Components with direct API calls. This creates a clean Server/Client boundary.

---

## ADR-006 — Correlation IDs for full-stack traceability

**Decision**: Generate a UUID correlation ID per request in the backend middleware, propagate it in response headers, and include it in all log lines and event records.

**Context**: Without correlation IDs, debugging multi-service flows is difficult. Every log line and DB record carries the ID.

**Consequences**: Correlation IDs in the Event model allow tracing an event from simulation → AI enrichment → storage in a single query.

---

## ADR-007 — API Key expuesta en frontend

**Decision**: Usar `NEXT_PUBLIC_API_KEY` para autenticar requests del frontend al backend.

**Context**: Next.js expone variables `NEXT_PUBLIC_` en el browser. Esto significa que la API Key es visible en DevTools.

**Consecuencias**: La key protege contra abuso casual y automatizado, pero no contra alguien determinado que inspeccione el código del browser. Para mayor seguridad se recomienda migrar a Route Handlers de Next.js (Opción B) donde la key vive solo en el servidor.

**Estado actual**: Aceptado como trade-off pragmático. Revisión pendiente si el proyecto escala.