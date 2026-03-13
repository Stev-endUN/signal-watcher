'use client';

interface Props {
  total: number;
  critical: number;
  high: number;
  pending: number;
  watchlists: number;
}

export default function StatsBar({ total, critical, high, pending, watchlists }: Props) {
  const stats = [
    { label: 'Total Signals', value: total, color: 'text-white' },
    { label: 'Critical', value: critical, color: 'text-danger' },
    { label: 'High', value: high, color: 'text-warn' },
    { label: 'Pending Analysis', value: pending, color: 'text-info' },
    { label: 'Watchlists', value: watchlists, color: 'text-accent' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-surface border border-border rounded-lg p-4">
          <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
          <div className="text-xs text-muted mt-1 font-mono uppercase tracking-wider">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
