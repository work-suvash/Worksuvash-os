import { useEffect, useState } from 'react';
import { Clipboard, Trash2, Copy } from 'lucide-react';

const KEY = 'workos-clipboard-history';

export function ClipboardManager() {
  const [history, setHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(history)); }, [history]);

  const capture = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      setHistory((h) => [text, ...h.filter((x) => x !== text)].slice(0, 50));
      setError(null);
    } catch (e: any) {
      setError('Clipboard read denied. Click in the page first, then try again.');
    }
  };

  const copyBack = (t: string) => navigator.clipboard?.writeText(t);
  const remove = (i: number) => setHistory((h) => h.filter((_, x) => x !== i));
  const clearAll = () => setHistory([]);

  return (
    <div className="h-full w-full flex flex-col bg-neutral-900 text-white">
      <div className="flex items-center gap-2 p-3 border-b border-white/10">
        <button onClick={capture} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/70 hover:bg-emerald-600 rounded text-sm">
          <Clipboard className="w-3.5 h-3.5" /> Capture clipboard
        </button>
        <button onClick={clearAll} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm">
          <Trash2 className="w-3.5 h-3.5" /> Clear
        </button>
      </div>
      {error && <div className="px-3 py-2 text-xs text-amber-300 bg-amber-900/30">{error}</div>}
      <div className="flex-1 overflow-auto p-2 space-y-1.5">
        {history.length === 0 && <div className="text-center text-white/40 text-sm pt-10">No history yet. Copy something, then capture.</div>}
        {history.map((item, i) => (
          <div key={i} className="group flex items-start gap-2 bg-black/30 hover:bg-black/40 rounded p-2">
            <pre className="flex-1 text-xs font-mono whitespace-pre-wrap break-words max-h-32 overflow-auto">{item}</pre>
            <button onClick={() => copyBack(item)} title="Copy" className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded">
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => remove(i)} title="Delete" className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600/40 rounded">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
export default ClipboardManager;
