import { useMemo, useState } from 'react';

export function RegexTester() {
  const [pattern, setPattern] = useState('\\b\\w+@\\w+\\.\\w+\\b');
  const [flags, setFlags] = useState('gi');
  const [text, setText] = useState('Email me at hello@example.com or test@dev.io');

  const { matches, error, highlighted } = useMemo(() => {
    try {
      const re = new RegExp(pattern, flags.replace(/[^gimsuy]/g, ''));
      const m: { match: string; index: number }[] = [];
      if (re.global) {
        let r; while ((r = re.exec(text)) !== null) { m.push({ match: r[0], index: r.index }); if (r[0] === '') break; }
      } else {
        const r = re.exec(text); if (r) m.push({ match: r[0], index: r.index });
      }
      let out: any[] = []; let cur = 0;
      m.forEach((mm, i) => {
        if (mm.index > cur) out.push(text.slice(cur, mm.index));
        out.push(<mark key={i} className="bg-yellow-500/40 text-yellow-200 rounded px-0.5">{mm.match}</mark>);
        cur = mm.index + mm.match.length;
      });
      if (cur < text.length) out.push(text.slice(cur));
      return { matches: m, error: null as string | null, highlighted: out };
    } catch (e: any) { return { matches: [], error: e.message, highlighted: [text] }; }
  }, [pattern, flags, text]);

  return (
    <div className="h-full w-full flex flex-col bg-neutral-900 text-white p-3 gap-3">
      <div className="flex gap-2 items-center text-sm font-mono">
        <span className="text-white/40">/</span>
        <input value={pattern} onChange={(e) => setPattern(e.target.value)}
          className="flex-1 bg-black/40 px-2 py-1 rounded outline-none" spellCheck={false} />
        <span className="text-white/40">/</span>
        <input value={flags} onChange={(e) => setFlags(e.target.value)}
          className="w-20 bg-black/40 px-2 py-1 rounded outline-none" spellCheck={false} />
      </div>
      {error && <div className="text-red-400 text-xs font-mono">{error}</div>}
      <textarea value={text} onChange={(e) => setText(e.target.value)}
        className="bg-black/40 text-sm font-mono p-3 rounded outline-none resize-none h-40"
        spellCheck={false} />
      <div className="flex-1 min-h-0 overflow-auto bg-black/30 rounded p-3 text-sm whitespace-pre-wrap font-mono">
        {highlighted}
      </div>
      <div className="text-xs text-white/60">
        {matches.length} match{matches.length === 1 ? '' : 'es'}
      </div>
    </div>
  );
}
export default RegexTester;
