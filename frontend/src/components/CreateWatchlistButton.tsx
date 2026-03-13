'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Shield } from 'lucide-react';
import { api } from '@/lib/api';

export default function CreateWatchlistButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [termsInput, setTermsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    const terms = termsInput.split(',').map((t) => t.trim()).filter(Boolean);
    if (!name || terms.length === 0) {
      setError('Name and at least one term are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.createWatchlist({ name, terms });
      setOpen(false);
      setName('');
      setTermsInput('');
      router.refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-accent/10 hover:bg-accent/20 border border-accent/50 text-accent px-4 py-2 rounded-lg text-sm font-mono transition-all"
      >
        <Plus className="w-4 h-4" />
        New Watchlist
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                <span className="font-display font-bold text-white">Create Watchlist</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-muted font-mono uppercase tracking-wider block mb-1.5">
                  Watchlist Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Brand Protection Q1"
                  className="w-full bg-bg border border-border rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-accent/60 placeholder:text-muted/40"
                />
              </div>

              <div>
                <label className="text-xs text-muted font-mono uppercase tracking-wider block mb-1.5">
                  Terms (comma-separated)
                </label>
                <textarea
                  value={termsInput}
                  onChange={(e) => setTermsInput(e.target.value)}
                  placeholder="acme.com, acme-brand, acmecorp"
                  rows={3}
                  className="w-full bg-bg border border-border rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-accent/60 placeholder:text-muted/40 resize-none"
                />
                <p className="text-xs text-muted mt-1">Enter domains, keywords, or brand names to monitor.</p>
              </div>

              {error && <p className="text-danger text-xs font-mono">{error}</p>}

              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full bg-accent/10 hover:bg-accent/20 border border-accent/50 text-accent py-2.5 rounded-lg text-sm font-mono transition-all disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Watchlist'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
