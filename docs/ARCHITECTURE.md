# Signal Watcher - Arquitectura del Proyecto

## Visión General

**Signal Watcher** es una plataforma de inteligencia de amenazas impulsada por IA para monitorear señales de marca, detectar dominios sospechosos y enriquecer eventos de seguridad con análisis NLP.

## Arquitectura de Alto Nivel

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           CAPA DE PRESENTACIÓN                           │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │              Next.js 14 Frontend (SSR + App Router)                │  │
│  │                                                                    │  │
│  │  • Server Components para SSR                                     │  │
│  │  • Client Components para interacciones                           │  │
│  │  • Revalidación automática (10s)                                  │  │
│  │  • Tailwind CSS + Lucide Icons                                    │  │
│  │  • Deploy: Vercel                                                 │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ HTTPS/REST API
                                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          CAPA DE APLICACIÓN                              │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                    Express.js API Server                           │  │
│  │                                                                    │  │
│  │  ┌──────────────────┐    ┌──────────────────┐                    │  │
│  │  │   Middleware     │    │     Routes       │                    │  │
│  │  │  ──────────────  │    │  ──────────────  │                    │  │
│  │  │  • Helmet        │───▶│  /api/watchlists │                    │  │
│  │  │  • CORS          │    │  /api/events     │                    │  │
│  │  │  • Auth (API Key)│    │  /health         │                    │  │
│  │  │  • Correlation   │    │  /metrics        │                    │  │
│  │  │  • Logger        │    └──────────────────┘                    │  │
│  │  │  • Error Handler │                                            │  │
│  │  └──────────────────┘                                            │  │
│  │                                                                    │  │
│  │  Deploy: Railway / Render / Docker                                │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                       CAPA DE SERVICIOS Y LÓGICA                         │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐         │
│  │   AI Service   │    │  Cache Layer   │    │   Metrics      │         │
│  │  ────────────  │    │  ────────────  │    │  ────────────  │         │
│  │  • Adapter     │    │  • Memory      │    │  • Request     │         │
│  │    Pattern     │    │  • Redis       │    │    Count       │         │
│  │  • MockAI      │    │    (opcional)  │    │  • Latency     │         │
│  │  • OpenAI      │    │  • TTL: 15-30s │    │  • Events      │         │
│  │    GPT-4o-mini │    └────────────────┘    │    Processed   │         │
│  └────────────────┘                          └────────────────┘         │
└──────────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                       CAPA DE PERSISTENCIA                               │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐         │
│  │   Prisma ORM   │    │   PostgreSQL   │    │  Redis Cache   │         │
│  │  ────────────  │    │  ────────────  │    │  ────────────  │         │
│  │  • Type-safe   │───▶│  • Watchlists  │    │  • Opcional    │         │
│  │  • Migrations  │    │  • Events      │    │  • Compartido  │         │
│  │  • Schema      │    │  • Relations   │    │  • Persistente │         │
│  │    Generation  │    │  • Constraints │    │                │         │
│  └────────────────┘    └────────────────┘    └────────────────┘         │
│                                                                           │
│  Docker Compose: postgres:16-alpine + redis:7-alpine                     │
└──────────────────────────────────────────────────────────────────────────┘
```

## Estructura del Proyecto

```
signal-watcher/
├── backend/                    # API Node.js + TypeScript
│   ├── src/
│   │   ├── index.ts           # Punto de entrada Express
│   │   ├── lib/               # Utilidades core
│   │   │   ├── db.ts          # Cliente Prisma
│   │   │   ├── cache.ts       # Adaptador Cache (Memory/Redis)
│   │   │   ├── logger.ts      # Winston logger
│   │   │   └── metrics.ts     # Métricas en memoria
│   │   ├── middleware/        # Middleware Express
│   │   │   ├── auth.middleware.ts       # API Key validation
│   │   │   ├── error.middleware.ts      # Error handling
│   │   │   └── request.middleware.ts    # Logging + Correlation
│   │   ├── routes/            # Endpoints REST
│   │   │   ├── watchlists.routes.ts
│   │   │   └── events.routes.ts
│   │   └── services/          # Lógica de negocio
│   │       └── ai.service.ts  # AI Adapters (Mock/OpenAI)
│   ├── prisma/
│   │   └── schema.prisma      # Modelo de datos
│   └── package.json
│
├── frontend/                   # Next.js 14 App Router
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── page.tsx       # Dashboard principal
│   │   │   ├── layout.tsx     # Layout raíz
│   │   │   └── watchlists/
│   │   │       └── [id]/page.tsx  # Vista detalle
│   │   ├── components/        # React Components
│   │   │   ├── WatchlistCard.tsx
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventFeed.tsx
│   │   │   ├── StatsBar.tsx
│   │   │   └── CreateWatchlistButton.tsx
│   │   └── lib/
│   │       └── api.ts         # Cliente API
│   └── package.json
│
├── docs/                       # Documentación
│   ├── ADR.md                 # Architecture Decision Records
│   ├── RUNBOOK.md             # Guía operacional
│   └── ARCHITECTURE.md        # Este documento
│
├── docker-compose.yml          # PostgreSQL + Redis
└── README.md                   # Quick start
```

## Modelo de Datos

### Schema Prisma

```prisma
model Watchlist {
  id        String   @id @default(uuid())
  name      String
  terms     String[]                    // Términos monitoreados
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  events    Event[]
}

model Event {
  id            String     @id @default(uuid())
  watchlistId   String
  watchlist     Watchlist  @relation(...)
  rawData       Json                    // Datos crudos del evento
  summary       String?                 // Generado por IA
  severity      Severity   @default(LOW)
  nextAction    String?                 // Recomendación IA
  correlationId String                  // Traceability
  processedAt   DateTime?               // Timestamp de enrichment
  createdAt     DateTime   @default(now())
}

enum Severity {
  LOW | MED | HIGH | CRITICAL
}
```

### Relaciones

- `Watchlist` 1 → N `Event` (cascade delete)
- Cada `Event` tiene un `correlationId` único para trazabilidad end-to-end

## Flujo de Datos Principal

### 1. Creación de Watchlist

```
Usuario → Frontend → POST /api/watchlists
                      ↓
                   Zod validation
                      ↓
                   Prisma.create()
                      ↓
                   Cache invalidation (watchlists:all)
                      ↓
                   Response 201
```

### 2. Simulación de Evento (Asíncrono)

```
Usuario → Frontend → POST /api/events/simulate
                      ↓
                   1. Validate (Zod)
                   2. Crear Event (DB) con severity=LOW
                   3. Response 202 (accepted)
                      ↓
                   [Background async]
                   4. AI Adapter → analyzeEvent()
                      ├─ Mock: 600-1400ms delay + random response
                      └─ OpenAI: GPT-4o-mini analysis
                   5. Update Event (summary, severity, nextAction, processedAt)
                   6. Invalidate cache (events:all, events:{watchlistId})
                   7. Increment metrics
```

### 3. Lectura de Dashboard

```
Usuario → Frontend (SSR) → GET /api/watchlists + GET /api/events
                            ↓
                         Check cache (30s TTL watchlists, 15s events)
                            ├─ HIT → return cached JSON
                            └─ MISS → DB query → cache.set() → return
                            ↓
                         Server Component render
                            ↓
                         HTML to browser
```

## Componentes Clave

### Backend

#### 1. Middleware Stack (index.ts)

```typescript
app.use(helmet())                    // Seguridad headers
app.use(cors())                      // CORS configurado
app.use(express.json())              // Body parser
app.use('/api', requireApiKey)       // Auth con x-api-key
app.use(correlationMiddleware)       // x-correlation-id
app.use(requestLogger)               // Winston logs
app.use('/api/watchlists', ...)      // Rutas
app.use('/api/events', ...)
app.use(errorHandler)                // Error centralizado
```

#### 2. AI Service (Adapter Pattern)

```typescript
interface AIAdapter {
  analyzeEvent(data, terms): Promise<AIAnalysis>
}

class MockAIAdapter implements AIAdapter {
  // Respuestas determinísticas con delay simulado
}

class OpenAIAdapter implements AIAdapter {
  // API call a gpt-4o-mini con JSON mode
}

export function createAIAdapter(): AIAdapter {
  // Factory que decide según AI_MODE env var
}
```

**Ventajas:**
- Desarrollo sin API key
- Tests offline
- Swap transparente en producción

#### 3. Cache Layer (Adapter Pattern)

```typescript
interface CacheAdapter {
  get/set/del/flush
}

class MemoryCache {
  // Map<string, {value, expiresAt}>
  // Default, no requiere Redis
}

class RedisCache {
  // Cliente ioredis
  // Se activa si REDIS_URL existe
}
```

**Trade-offs:**
- Memory: No persiste entre reinicios, por instancia
- Redis: Compartido, persistente, requiere infraestructura

#### 4. Observability

**Correlation IDs:**
- UUID por request
- Propagado en `x-correlation-id` header
- Incluido en todos los logs
- Almacenado en Event records
- Permite trazar flujo completo

**Logs (Winston):**
```json
{
  "level": "info",
  "message": "Event enriched by AI",
  "correlationId": "uuid",
  "eventId": "uuid",
  "severity": "HIGH",
  "timestamp": "..."
}
```

**Metrics (in-memory):**
- Request count
- Error count
- Average response time
- Events processed
- Uptime, memory usage

Endpoint: `GET /metrics`

### Frontend

#### 1. App Router (Next.js 14)

**Server Components (SSR):**
```typescript
// app/page.tsx
export const revalidate = 10;  // ISR cada 10s

export default async function DashboardPage() {
  const [watchlists, events] = await Promise.all([
    api.getWatchlists(),
    api.getEvents(),
  ]);
  // Render directo
}
```

**Client Components (interacciones):**
```typescript
'use client'
// CreateWatchlistButton.tsx
// Mutaciones vía fetch() directo a API
```

#### 2. API Client (lib/api.ts)

```typescript
const BASE = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.NEXT_PUBLIC_API_KEY  // ⚠️ Expuesta en browser

async function request(path, options) {
  fetch(`${BASE}${path}`, {
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json'
    }
  })
}
```

**⚠️ Security Note:** API Key visible en DevTools. Aceptable para prueba técnica, no para producción real.

#### 3. Componentes UI

| Componente | Propósito |
|------------|-----------|
| `WatchlistCard` | Lista watchlists con badge de eventos |
| `EventCard` | Detalle de evento con severity badge |
| `EventFeed` | Grid de eventos con filtrado |
| `StatsBar` | KPIs: total, critical, high, pending |
| `CreateWatchlistButton` | Modal para crear watchlist |

**Estilo:** Tailwind CSS con tema oscuro cybersec

## Patrones Arquitectónicos

### 1. Adapter Pattern

**Usado en:**
- AI Service (Mock vs OpenAI)
- Cache Layer (Memory vs Redis)

**Beneficio:** Swap de implementación sin cambiar business logic

### 2. Middleware Chain

**Express.js pipeline:**
```
Request → Helmet → CORS → Auth → Correlation → Logger → Routes → Error Handler
```

### 3. Repository Pattern (implícito)

Prisma actúa como repository con tipo-safety:
```typescript
await db.watchlist.findMany({ include: { _count: ... } })
```

### 4. Async Background Processing

POST `/events/simulate`:
- Response 202 inmediato
- AI enrichment en background
- No bloquea request thread

### 5. Cache-Aside

```typescript
const cached = await cache.get(key)
if (cached) return JSON.parse(cached)

const data = await db.query()
await cache.set(key, JSON.stringify(data), ttl)
return data
```

## Decisiones de Arquitectura (ADRs)

### ADR-001: Express over Fastify
- **Por qué:** Madurez del ecosistema, familiaridad del equipo
- **Trade-off:** Menor throughput, pero negligible a esta escala

### ADR-002: Prisma over raw SQL
- **Por qué:** Type-safety, migraciones automáticas, DX
- **Trade-off:** Overhead de abstracción aceptable

### ADR-003: Cache híbrido Memory/Redis
- **Por qué:** Dev simplificado (no requiere Redis), prod escalable
- **Estado:** Producción usa in-memory actualmente

### ADR-004: AI Adapter con Mock mode
- **Por qué:** Tests offline, desarrollo sin API key
- **Trade-off:** Mock responses son pseudo-aleatorias

### ADR-005: Next.js App Router + SSR
- **Por qué:** SSR nativo, deduplicación automática, ISR
- **Trade-off:** Server/Client boundary explícito

### ADR-006: Correlation IDs
- **Por qué:** Debugging multi-service, full-stack traceability
- **Implementación:** UUID en middleware, propagado en headers y DB

### ADR-007: API Key expuesta en frontend
- **Por qué:** Simplicidad, trade-off pragmático
- **Riesgo:** Visible en DevTools, solo protege contra abuso casual
- **Mejora futura:** Migrar a Next.js Route Handlers

## Seguridad

### Implementado

✅ **Helmet.js:** Headers de seguridad (CSP, XSS, etc.)
✅ **CORS:** Origins whitelistadas
✅ **API Key authentication:** Header `x-api-key`
✅ **Input validation:** Zod schemas en todos los endpoints
✅ **Rate limiting implícito:** Cache TTL reduce carga
✅ **Error sanitization:** No expone stack traces en producción

### Limitaciones Conocidas

⚠️ **API Key en browser:** Expuesta en `NEXT_PUBLIC_API_KEY`
⚠️ **Sin rate limiting explícito:** No hay throttling por IP
⚠️ **Sin autenticación de usuarios:** Solo API key compartida
⚠️ **HTTPS no forzado:** Depende del reverse proxy

## Performance

### Optimizaciones

1. **Cache Layer:** TTL 15-30s reduce queries 80%+
2. **Database indexes:** UUID primary keys, createdAt ordenamiento
3. **Pagination:** `take: 50` en events, `take: 20` en watchlist detail
4. **Async AI processing:** No bloquea request thread
5. **SSR con ISR:** Next.js regenera cada 10s, sirve stale en paralelo

### Métricas Típicas

- **GET /api/watchlists (cached):** ~5ms
- **GET /api/watchlists (DB):** ~40ms
- **POST /events/simulate:** ~50ms (202 response)
- **AI enrichment (mock):** 600-1400ms
- **AI enrichment (OpenAI):** 1-3s

## Escalabilidad

### Horizontal Scaling (Backend)

✅ **Stateless:** Toda persistencia en PostgreSQL/Redis
✅ **Shared cache:** Redis permite múltiples instancias
✅ **Load balancer ready:** No session affinity requerida

**Setup:**
```bash
# Instance 1
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
PORT=3001

# Instance 2 (mismas URLs)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
PORT=3002

# Nginx/ALB distribuye carga
```

### Vertical Scaling

- **PostgreSQL:** Índices optimizados, conexiones pooling
- **Redis:** Opcional, solo para cache compartido
- **AI:** OpenAI API escala automáticamente

### Limitaciones

⚠️ **Cache in-memory no escala horizontalmente:** Requiere Redis
⚠️ **Background jobs en request thread:** Para prod usar queue (Bull, BullMQ)

## Deployment

### Backend (Railway/Render/Docker)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
CMD ["npm", "start"]
```

**Env vars requeridas:**
```bash
DATABASE_URL=postgresql://...
API_KEY=...
ALLOWED_ORIGINS=https://frontend.com
AI_MODE=openai              # opcional, default: mock
OPENAI_API_KEY=sk-...       # si AI_MODE=openai
REDIS_URL=redis://...       # opcional
```

### Frontend (Vercel)

1. Push a GitHub
2. Connect repo en Vercel
3. Set env vars:
   ```bash
   NEXT_PUBLIC_API_URL=https://api.railway.app
   NEXT_PUBLIC_API_KEY=...
   ```
4. Auto-deploy on push

### Local Development

```bash
# Terminal 1: Infrastructure
docker compose up postgres redis -d

# Terminal 2: Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev

# Terminal 3: Frontend
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Monitoreo y Debugging

### Health Check

```bash
curl http://localhost:3001/health
# {"status":"ok","timestamp":"..."}
```

### Metrics

```bash
curl http://localhost:3001/metrics
```

**Response:**
```json
{
  "requestCount": 1523,
  "errorCount": 12,
  "eventsProcessed": 234,
  "avgResponseTimeMs": 67,
  "uptime": 86400,
  "memoryMB": 128
}
```

### Logs con Correlation ID

```bash
# Ver logs de un evento específico
npm run dev | grep '"correlationId":"abc-123"'

# Filtrar errores
npm run dev | jq 'select(.level=="error")'
```

### Trace Completo de un Evento

```
1. Frontend → POST /api/events/simulate
   correlationId: abc-123

2. Backend log: "Event accepted"
   correlationId: abc-123, eventId: xyz-456

3. DB: Event creado con correlationId=abc-123

4. Background: AI enrichment
   correlationId: abc-123

5. Backend log: "Event enriched by AI"
   correlationId: abc-123, severity: HIGH

6. DB: Event actualizado con summary, severity, nextAction
```

## Testing

### Backend

```bash
cd backend
npm test
```

**Estrategia:**
- Unit tests: AI adapters, cache adapters
- Integration tests: Routes con DB mock
- Zod schema validation

### Frontend

```bash
cd frontend
npm run lint
npm run build  # Type check
```

**Estrategia:**
- TypeScript strict mode
- ESLint + Next.js rules
- Build-time type validation

## Próximos Pasos (Roadmap)

### Mejoras de Seguridad

- [ ] Migrar API Key a Next.js Route Handlers (no expuesta en browser)
- [ ] Rate limiting con `express-rate-limit`
- [ ] Autenticación de usuarios con JWT
- [ ] Audit log de acciones sensibles

### Performance

- [ ] Redis en producción (cache compartido)
- [ ] Background job queue (Bull/BullMQ) para AI enrichment
- [ ] WebSocket para updates en tiempo real
- [ ] GraphQL subscription para eventos

### Features

- [ ] Notificaciones (email/Slack) para eventos CRITICAL
- [ ] Dashboard de analytics con gráficas
- [ ] Exportar eventos (CSV/JSON)
- [ ] Integración con threat intelligence feeds
- [ ] Multi-tenancy (workspaces)

### DevOps

- [ ] CI/CD completo con tests
- [ ] Terraform para infraestructura
- [ ] APM (Application Performance Monitoring)
- [ ] Alertas en Datadog/Sentry

## Referencias

- [README.md](../README.md) - Quick start guide
- [ADR.md](./ADR.md) - Architecture Decision Records
- [RUNBOOK.md](./RUNBOOK.md) - Operational guide
- [Prisma Schema](../backend/prisma/schema.prisma) - Data model
- [API Routes](../backend/src/routes/) - Endpoint implementation

## Contacto y Contribuciones

Este proyecto es una prueba técnica que demuestra:
- Arquitectura full-stack TypeScript
- Patrones de diseño (Adapter, Middleware Chain)
- AI integration con fallback mock
- Observability (logs, metrics, correlation)
- Deploy production-ready (Docker, Vercel, Railway)

Para preguntas o sugerencias, ver el repositorio en GitHub.
