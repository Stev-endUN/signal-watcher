import { api } from '@/lib/api';
import EventCard from '@/components/EventCard';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 5;

export default async function WatchlistPage({ params }: { params: { id: string } }) {
  const watchlist = await api.getWatchlist(params.id).catch(() => null);
  if (!watchlist) notFound();

  const events = watchlist.events || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-muted hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent" />
          <h1 className="font-display text-2xl font-bold text-white">{watchlist.name}</h1>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {watchlist.terms.map((term) => (
          <span key={term} className="text-sm bg-surface border border-border px-3 py-1 rounded font-mono text-accent">
            {term}
          </span>
        ))}
      </div>

      <div>
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted border-b border-border pb-2 mb-4">
          Events ({events.length})
        </h2>
        {events.length === 0 ? (
          <p className="text-muted text-sm">No events yet for this watchlist.</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
