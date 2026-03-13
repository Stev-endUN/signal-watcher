'use client';

import { Clock, Cpu, ArrowRight } from 'lucide-react';
import type { Event } from '@/lib/api';

const SEVERITY_LABELS = {
  CRITICAL: '● CRITICAL',
  HIGH: '▲ HIGH',
  MED: '◆ MED',
  LOW: '○ LOW',
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  suspicious_domain: 'SUSPICIOUS DOMAIN',
  new_subdomain: 'NEW SUBDOMAIN',
  keyword_match: 'KEYWORD MATCH',
  phishing_campaign: 'PHISHING CAMPAIGN',
  data_leak: 'DATA LEAK',
  brand_abuse: 'BRAND ABUSE',
};

export default function EventCard({ event }: { event: Event }) {
  const raw = event.rawData as { type?: string };
  const typeLabel = EVENT_TYPE_LABELS[raw.type || ''] || raw.type?.toUpperCase() || 'EVENT';
  const date = new Date(event.createdAt).toLocaleString();
  const isPending = !event.processedAt;

  return (
    <div className={`border rounded-lg p-4 transition-all animate-slide-up severity-${event.severity}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-xs font-mono font-bold shrink-0 severity-${event.severity}`}>
            {SEVERITY_LABELS[event.severity]}
          </span>
          <span className="text-xs text-muted font-mono truncate">{typeLabel}</span>
          {event.watchlist && (
            <span className="text-xs bg-surface border border-border px-1.5 py-0.5 rounded text-muted font-mono shrink-0">
              {event.watchlist.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-muted text-xs font-mono shrink-0">
          <Clock className="w-3 h-3" />
          {date}
        </div>
      </div>

      {isPending ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted font-mono">
          <Cpu className="w-3.5 h-3.5 animate-pulse" />
          AI analysis in progress...
        </div>
      ) : (
        <>
          {event.summary && (
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">{event.summary}</p>
          )}
          {event.nextAction && (
            <div className="mt-3 flex items-start gap-2 text-xs font-mono border-t border-current/20 pt-3">
              <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="text-slate-400">{event.nextAction}</span>
            </div>
          )}
        </>
      )}

      <div className="mt-2 text-xs text-muted/50 font-mono">
        corr: {event.correlationId.slice(0, 8)}...
      </div>
    </div>
  );
}
