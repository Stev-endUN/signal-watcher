'use client';

import Link from 'next/link';
import { Shield, ChevronRight } from 'lucide-react';
import type { Watchlist } from '@/lib/api';

export default function WatchlistCard({ watchlist }: { watchlist: Watchlist }) {
  return (
    <Link href={`/watchlists/${watchlist.id}`}>
      <div className="group bg-surface border border-border hover:border-accent/40 rounded-lg p-4 transition-all duration-200 cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent shrink-0" />
            <span className="text-sm font-semibold text-white truncate">{watchlist.name}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted group-hover:text-accent transition-colors shrink-0" />
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {watchlist.terms.slice(0, 4).map((term) => (
            <span
              key={term}
              className="text-xs bg-bg border border-border px-2 py-0.5 rounded font-mono text-muted"
            >
              {term}
            </span>
          ))}
          {watchlist.terms.length > 4 && (
            <span className="text-xs text-muted px-1">+{watchlist.terms.length - 4}</span>
          )}
        </div>

        <div className="mt-3 text-xs text-muted font-mono">
          {watchlist._count?.events ?? 0} events
        </div>
      </div>
    </Link>
  );
}
