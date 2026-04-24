/**
 * Browser Home — the new-tab / homepage of Work OS Browser.
 *
 * Clean, minimal, professional. Greeting, live clock, search bar,
 * and bookmark tiles (TypeFlow pinned by default).
 */

import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Globe, Keyboard, ArrowUpRight } from 'lucide-react';
import type { WebsiteProps } from '../types';

interface BookmarkTile {
  id: string;
  name: string;
  url: string;
  hint: string;
  icon: React.ReactNode;
  gradient: string;
}

const BOOKMARKS: BookmarkTile[] = [
  {
    id: 'typeflow',
    name: 'TypeFlow',
    url: 'typeflow.io',
    hint: 'Master the keyboard',
    icon: <Keyboard className="w-6 h-6 text-white" />,
    gradient: 'from-violet-500 to-indigo-600',
  },
];

function getGreeting(hour: number) {
  if (hour < 5) return 'Working late';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 22) return 'Good evening';
  return 'Working late';
}

export function BrowserHome({ onNavigate, owner }: WebsiteProps) {
  const [now, setNow] = useState(() => new Date());
  const [query, setQuery] = useState('');

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000 * 30);
    return () => window.clearInterval(id);
  }, []);

  const time = useMemo(
    () =>
      now.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    [now]
  );

  const dateLine = useMemo(
    () =>
      now.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    [now]
  );

  const greeting = getGreeting(now.getHours());
  const userLabel = owner && owner !== 'guest' ? `, ${owner}` : '';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    onNavigate?.(q);
    setQuery('');
  }

  return (
    <div className="min-h-full w-full bg-[#0b0d12] text-slate-100 relative overflow-hidden">
      {/* Soft ambient glow background */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.18), transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(139,92,246,0.12), transparent 60%)',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-3xl px-6 pt-20 pb-16 flex flex-col items-center">
        {/* Clock */}
        <div className="text-center mb-8">
          <div className="text-7xl font-light tracking-tight tabular-nums text-white">
            {time}
          </div>
          <div className="mt-2 text-sm uppercase tracking-[0.2em] text-slate-400">
            {dateLine}
          </div>
        </div>

        {/* Greeting */}
        <h1 className="text-2xl font-medium text-slate-200 mb-8 text-center">
          {greeting}
          <span className="text-violet-400">{userLabel}</span>
        </h1>

        {/* Search / URL bar */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-12">
          <div className="group flex items-center gap-3 bg-white/[0.04] hover:bg-white/[0.06] focus-within:bg-white/[0.08] border border-white/10 hover:border-white/20 focus-within:border-violet-400/50 rounded-full px-5 py-3 transition-all shadow-lg shadow-black/20">
            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-violet-300 transition-colors shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or type a URL"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="flex-1 bg-transparent text-base text-white placeholder:text-slate-500 outline-none"
            />
            {query && (
              <button
                type="submit"
                className="text-xs uppercase tracking-widest font-semibold text-violet-300 hover:text-violet-200 px-2"
              >
                Go
              </button>
            )}
          </div>
        </form>

        {/* Bookmarks */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xs uppercase tracking-[0.18em] text-slate-500 font-medium">
              Bookmarks
            </h2>
            <span className="text-xs text-slate-600">{BOOKMARKS.length} pinned</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {BOOKMARKS.map((b) => (
              <button
                key={b.id}
                onClick={() => onNavigate?.(b.url)}
                className="group relative flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/15 transition-all"
                title={b.hint}
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${b.gradient} flex items-center justify-center shadow-lg shadow-black/30 group-hover:scale-105 transition-transform`}
                >
                  {b.icon}
                </div>
                <div className="text-sm font-medium text-slate-200 group-hover:text-white truncate max-w-full">
                  {b.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-full">
                  {b.url}
                </div>
                <ArrowUpRight className="absolute top-2 right-2 w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}

            {/* Add bookmark placeholder */}
            <button
              type="button"
              disabled
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed border-white/10 text-slate-600 cursor-not-allowed"
              title="Add bookmark (coming soon)"
            >
              <div className="w-14 h-14 rounded-xl border border-dashed border-white/10 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div className="text-sm font-medium">Add</div>
              <div className="text-[10px]">Coming soon</div>
            </button>
          </div>
        </section>

        {/* Footer line */}
        <div className="mt-16 flex items-center gap-2 text-xs text-slate-600">
          <Globe className="w-3.5 h-3.5" />
          Work OS Browser · Home
        </div>
      </div>
    </div>
  );
}
