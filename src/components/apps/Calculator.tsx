import { useState } from 'react';
import { useAppContext } from '../AppContext';

type Mode = 'standard' | 'dev';

export function Calculator() {
  const { accentColor } = useAppContext();
  const [display, setDisplay] = useState('0');
  const [expr, setExpr] = useState('');
  const [mode, setMode] = useState<Mode>('standard');

  const append = (v: string) => {
    setExpr((e) => e + v);
    setDisplay((d) => (d === '0' || d === 'Error' ? v : d + v));
  };
  const clear = () => { setExpr(''); setDisplay('0'); };
  const evaluate = () => {
    try {
      // eslint-disable-next-line no-new-func
      const r = Function(`"use strict"; return (${expr || display})`)();
      const out = String(r);
      setDisplay(out); setExpr(out);
    } catch { setDisplay('Error'); setExpr(''); }
  };

  const value = (() => {
    const n = Number(display);
    if (!isFinite(n) || isNaN(n)) return null;
    return Math.trunc(n);
  })();

  const stdKeys = ['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'];

  return (
    <div className="h-full w-full flex flex-col bg-neutral-900 text-white p-3 gap-3 select-none">
      <div className="flex gap-2 text-xs">
        {(['standard','dev'] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-3 py-1 rounded ${mode===m?'bg-white/20':'bg-white/5 hover:bg-white/10'}`}>
            {m}
          </button>
        ))}
      </div>
      <div className="bg-black/40 rounded-md p-3 text-right font-mono">
        <div className="text-xs text-white/40 truncate h-4">{expr}</div>
        <div className="text-3xl truncate">{display}</div>
      </div>
      {mode === 'dev' && value !== null && (
        <div className="text-xs font-mono space-y-1 bg-black/30 rounded-md p-2">
          <div>HEX: <span className="text-emerald-400">{value.toString(16).toUpperCase()}</span></div>
          <div>BIN: <span className="text-emerald-400">{value.toString(2)}</span></div>
          <div>OCT: <span className="text-emerald-400">{value.toString(8)}</span></div>
        </div>
      )}
      <div className="grid grid-cols-4 gap-2 flex-1">
        <button onClick={clear} className="col-span-2 bg-red-600/70 hover:bg-red-600 rounded">C</button>
        <button onClick={() => { setExpr(e => e.slice(0,-1)); setDisplay(d => d.length<=1 ? '0' : d.slice(0,-1)); }} className="bg-white/10 hover:bg-white/20 rounded">⌫</button>
        <button onClick={() => append('(')} className="bg-white/10 hover:bg-white/20 rounded">(</button>
        {stdKeys.map(k => (
          <button key={k} onClick={() => k === '=' ? evaluate() : append(k)}
            style={k === '=' ? { background: accentColor } : undefined}
            className={`rounded font-medium ${k==='='?'text-white':'bg-white/10 hover:bg-white/20'} ${'/*-+'.includes(k)?'text-amber-300':''}`}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
export default Calculator;
