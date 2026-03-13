// Simple in-memory metrics (replace with Prometheus in production)
interface Metrics {
  requestCount: number;
  errorCount: number;
  eventsProcessed: number;
  avgResponseTimeMs: number;
  responseTimes: number[];
}

const metrics: Metrics = {
  requestCount: 0,
  errorCount: 0,
  eventsProcessed: 0,
  avgResponseTimeMs: 0,
  responseTimes: [],
};

export function incrementRequests() {
  metrics.requestCount++;
}

export function incrementErrors() {
  metrics.errorCount++;
}

export function incrementEventsProcessed() {
  metrics.eventsProcessed++;
}

export function recordResponseTime(ms: number) {
  metrics.responseTimes.push(ms);
  if (metrics.responseTimes.length > 1000) metrics.responseTimes.shift();
  const sum = metrics.responseTimes.reduce((a, b) => a + b, 0);
  metrics.avgResponseTimeMs = Math.round(sum / metrics.responseTimes.length);
}

export function getMetrics() {
  return {
    requestCount: metrics.requestCount,
    errorCount: metrics.errorCount,
    eventsProcessed: metrics.eventsProcessed,
    avgResponseTimeMs: metrics.avgResponseTimeMs,
    uptime: process.uptime(),
    memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
  };
}
