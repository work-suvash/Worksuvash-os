import { useMemo, useState } from 'react';

export function JsonViewer() {
  const [input, setInput] = useState('{\n  "hello": "world",\n  "items": [1, 2, 3]\n}');
  const [indent, setIndent] = useState(2);

  const result = useMemo(() => {
    try {
      const parsed = JSON.parse(input);
      return { ok: true as const, formatted: JSON.stringify(parsed, null, indent), parsed };
    } catch (e: any) {
      return { ok: false as const, error: e.message };
    }
  }, [input, indent]);

  return (
    <div className="h-full w-full flex flex-col bg-neutral-900 text-white">
      <div className="flex items-center gap-2 p-2 border-b border-white/10 text-xs">
        <span className="text-white/60">Indent:</span>
        {[2,4].map(n => (
          <button key={n} onClick={() => setIndent(n)}
            className={`px-2 py-0.5 rounded ${indent===n?'bg-white/20':'bg-white/5 hover:bg-white/10'}`}>{n}</button>
        ))}
        <button onClick={() => result.ok && setInput(result.formatted)}
          className="ml-auto px-3 py-1 rounded bg-emerald-600/70 hover:bg-emerald-600 disabled:opacity-40"
          disabled={!result.ok}>Format</button>
        <button onClick={() => result.ok && setInput(JSON.stringify(result.parsed))}
          className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-40"
          disabled={!result.ok}>Minify</button>
        <span className={result.ok ? 'text-emerald-400' : 'text-red-400'}>
          {result.ok ? '✓ valid' : '✗ invalid'}
        </span>
      </div>
      <div className="flex-1 grid grid-cols-2 min-h-0 divide-x divide-white/10">
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          className="bg-black/30 text-sm font-mono p-3 outline-none resize-none"
          spellCheck={false} />
        <pre className="bg-black/40 text-sm font-mono p-3 overflow-auto whitespace-pre-wrap">
          {result.ok ? result.formatted : <span className="text-red-400">{result.error}</span>}
        </pre>
      </div>
    </div>
  );
}
export default JsonViewer;
