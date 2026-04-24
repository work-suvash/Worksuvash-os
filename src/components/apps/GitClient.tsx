import { useEffect, useState } from 'react';
import { GitBranch, GitCommit, ArrowUp, ArrowDown } from 'lucide-react';

interface Commit { id: string; message: string; author: string; time: number; }
const KEY = 'workos-git';

export function GitClient() {
  type State = { branch: string; commits: Commit[]; staged: string[]; ahead: number; behind: number };
  const [s, setS] = useState<State>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '');
      if (saved && saved.branch) return saved as State;
    } catch { /* ignore */ }
    return {
      branch: 'main',
      commits: [{ id: 'a1b2c3d', message: 'Initial commit', author: 'you', time: Date.now() - 86400000 }],
      staged: ['README.md', 'src/app.tsx'],
      ahead: 0,
      behind: 0,
    };
  });
  const [msg, setMsg] = useState('');

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(s)); }, [s]);

  const commit = () => {
    if (!msg.trim() || s.staged.length === 0) return;
    setS({
      ...s,
      commits: [{ id: Math.random().toString(16).slice(2, 9), message: msg, author: 'you', time: Date.now() }, ...s.commits],
      staged: [],
      ahead: s.ahead + 1,
    });
    setMsg('');
  };
  const push = () => setS({ ...s, ahead: 0 });
  const pull = () => {
    if (s.behind === 0) {
      setS({ ...s, behind: Math.floor(Math.random() * 3) });
      return;
    }
    setS({ ...s, behind: 0 });
  };

  return (
    <div className="h-full w-full flex bg-neutral-900 text-white">
      <div className="w-64 border-r border-white/10 p-3 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <GitBranch className="w-4 h-4 text-emerald-400" />
          <span>{s.branch}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={pull} className="flex-1 flex items-center justify-center gap-1 text-xs bg-white/10 hover:bg-white/20 rounded py-1.5">
            <ArrowDown className="w-3 h-3" /> Pull {s.behind > 0 && `(${s.behind})`}
          </button>
          <button onClick={push} disabled={s.ahead === 0}
            className="flex-1 flex items-center justify-center gap-1 text-xs bg-emerald-600/70 hover:bg-emerald-600 disabled:opacity-40 rounded py-1.5">
            <ArrowUp className="w-3 h-3" /> Push {s.ahead > 0 && `(${s.ahead})`}
          </button>
        </div>
        <div>
          <div className="text-xs text-white/60 mb-1">Staged ({s.staged.length})</div>
          <div className="space-y-1 text-xs font-mono">
            {s.staged.length === 0 && <div className="text-white/40">Nothing to commit.</div>}
            {s.staged.map(f => <div key={f} className="text-emerald-300">+ {f}</div>)}
          </div>
        </div>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)}
          placeholder="Commit message..."
          className="w-full bg-black/40 rounded p-2 text-xs h-20 outline-none resize-none" />
        <button onClick={commit} disabled={!msg.trim() || s.staged.length === 0}
          className="w-full bg-emerald-600/70 hover:bg-emerald-600 disabled:opacity-40 rounded py-1.5 text-sm">
          Commit
        </button>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <div className="text-xs text-white/60 mb-2">History</div>
        <div className="space-y-1">
          {s.commits.map(c => (
            <div key={c.id} className="flex items-start gap-2 bg-black/30 rounded p-2 text-sm">
              <GitCommit className="w-4 h-4 mt-0.5 text-amber-400" />
              <div className="flex-1 min-w-0">
                <div className="truncate">{c.message}</div>
                <div className="text-xs text-white/40 font-mono">{c.id} · {c.author} · {new Date(c.time).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default GitClient;
