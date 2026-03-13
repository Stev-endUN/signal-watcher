'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Event, Watchlist, EventType } from '@/lib/api';
import { api } from '@/lib/api';
import EventCard from './EventCard';

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'suspicious_domain', label: 'Suspicious Domain' },
  { value: 'new_subdomain', label: 'New Subdomain' },
  { value: 'keyword_match', label: 'Keyword Match' },
  { value: 'phishing_campaign', label: 'Phishing Campaign' },
  { value: 'data_leak', label: 'Data Leak' },
  { value: 'brand_abuse', label: 'Brand Abuse' },
];

interface Props {
  events: Event[];
  watchlists: Watchlist[];
}

export default function EventFeed({ events: initialEvents, watchlists }: Props) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(false);
  const [selectedWatchlist, setSelectedWatchlist] = useState(watchlists[0]?.id || '');
  const [selectedType, setSelectedType] = useState<EventType>('suspicious_domain');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  async function simulate() {
    if (!selectedWatchlist) return;
    setLoading(true);
    setFeedback(null);
    try {
      await api.simulateEvent({ watchlistId: selectedWatchlist, type: selectedType });
      setFeedback({ type: 'success', msg: 'Event queued — AI analysis in progress (~1s)' });
      // Poll for updated events after AI enrichment
      setTimeout(async () => {
        const updated = await api.getEvents().catch(() => events);
        setEvents(updated);
        router.refresh();
        setLoading(false);
      }, 2500);
    } catch (err) {
      setFeedback({ type: 'error', msg: String(err) });
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Simulate Panel */}
      {watchlists.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-xs text-muted uppercase tracking-widest mb-3 font-mono">Simulate Signal</p>
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedWatchlist}
              onChange={(e) => setSelectedWatchlist(e.target.value)}
              className="bg-bg border border-border text-sm text-white rounded px-3 py-2 font-mono focus:outline-none focus:border-accent/60"
            >
              {watchlists.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as EventType)}
              className="bg-bg border border-border text-sm text-white rounded px-3 py-2 font-mono focus:outline-none focus:border-accent/60"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <button
              onClick={simulate}
              disabled={loading}
              className="flex items-center gap-2 bg-accent/10 hover:bg-accent/20 border border-accent/40 text-accent px-4 py-2 rounded text-sm font-mono transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-3.5 h-3.5" />
              {loading ? 'Processing...' : 'Fire Event'}
            </button>
          </div>

          {feedback && (
            <div className={`mt-2 flex items-center gap-2 text-xs font-mono ${feedback.type === 'success' ? 'text-accent' : 'text-danger'}`}>
              {feedback.type === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              {feedback.msg}
            </div>
          )}
        </div>
      )}

      {/* Events */}
      {events.length === 0 ? (
        <div className="border border-border rounded-lg p-8 text-center text-muted text-sm">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
          No signals yet. Create a watchlist and fire your first event.
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
