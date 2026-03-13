const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type Severity = 'LOW' | 'MED' | 'HIGH' | 'CRITICAL';

export interface Watchlist {
  id: string;
  name: string;
  terms: string[];
  createdAt: string;
  updatedAt: string;
  _count?: { events: number };
  events?: Event[];
}

export interface Event {
  id: string;
  watchlistId: string;
  rawData: Record<string, unknown>;
  summary: string | null;
  severity: Severity;
  nextAction: string | null;
  correlationId: string;
  processedAt: string | null;
  createdAt: string;
  watchlist?: { name: string; terms: string[] };
}

export type EventType =
  | 'suspicious_domain'
  | 'new_subdomain'
  | 'keyword_match'
  | 'phishing_campaign'
  | 'data_leak'
  | 'brand_abuse';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Watchlists
  getWatchlists: () => request<Watchlist[]>('/api/watchlists'),
  getWatchlist: (id: string) => request<Watchlist>(`/api/watchlists/${id}`),
  createWatchlist: (data: { name: string; terms: string[] }) =>
    request<Watchlist>('/api/watchlists', { method: 'POST', body: JSON.stringify(data) }),
  deleteWatchlist: (id: string) =>
    request<void>(`/api/watchlists/${id}`, { method: 'DELETE' }),

  // Events
  getEvents: (watchlistId?: string) =>
    request<Event[]>(`/api/events${watchlistId ? `?watchlistId=${watchlistId}` : ''}`),
  getEvent: (id: string) => request<Event>(`/api/events/${id}`),
  simulateEvent: (data: { watchlistId: string; type: EventType }) =>
    request<{ eventId: string; correlationId: string }>('/api/events/simulate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
