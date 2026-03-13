import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Signal Watcher — Threat Intelligence Platform',
  description: 'Monitor brand signals, detect threats, AI-powered analysis',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="scanline min-h-screen bg-bg text-slate-200">
        <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
            <span className="font-display text-lg font-bold tracking-wide text-white">
              SIGNAL<span className="text-accent">WATCHER</span>
            </span>
          </div>
          <span className="text-xs text-muted font-mono">AI-POWERED THREAT INTELLIGENCE</span>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
