import { api } from '@/lib/api';
import WatchlistCard from '@/components/WatchlistCard';
import EventFeed from '@/components/EventFeed';
import StatsBar from '@/components/StatsBar';
import CreateWatchlistButton from '@/components/CreateWatchlistButton';

export const revalidate = 10;

export default async function DashboardPage() {
  const [watchlists, events] = await Promise.all([
    api.getWatchlists().catch(() => []),
    api.getEvents().catch(() => []),
  ]);

  const criticalCount = events.filter((e) => e.severity === 'CRITICAL').length;
  const highCount = events.filter((e) => e.severity === 'HIGH').length;
  const pendingCount = events.filter((e) => !e.processedAt).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">
            Threat Dashboard
          </h1>
          <p className="text-muted text-sm mt-1 font-mono">
            {watchlists.length} watchlists · {events.length} signals detected
          </p>
        </div>
        <CreateWatchlistButton />
      </div>

      {/* Stats */}
      <StatsBar
        total={events.length}
        critical={criticalCount}
        high={highCount}
        pending={pendingCount}
        watchlists={watchlists.length}
      />

      {/* Grid: Watchlists + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watchlists */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted border-b border-border pb-2">
            Watchlists
          </h2>
          {watchlists.length === 0 ? (
            <div className="border border-border rounded-lg p-6 text-center text-muted text-sm">
              No watchlists yet.<br />Create one to start monitoring.
            </div>
          ) : (
            watchlists.map((w) => <WatchlistCard key={w.id} watchlist={w} />)
          )}
        </div>

        {/* Event Feed */}
        <div className="lg:col-span-2">
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted border-b border-border pb-2 mb-4">
            Signal Feed
          </h2>
          <EventFeed events={events} watchlists={watchlists} />
        </div>
      </div>
    </div>
  );
}
