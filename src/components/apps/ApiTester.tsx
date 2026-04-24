import { useState } from 'react';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export function ApiTester() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [headers, setHeaders] = useState('Content-Type: application/json');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<{ status: number; time: number; body: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'headers' | 'body'>('headers');

  const send = async () => {
    setLoading(true); setError(null); setResponse(null);
    const t0 = performance.now();
    try {
      const h: Record<string, string> = {};
      headers.split('\n').forEach((line) => {
        const idx = line.indexOf(':'); if (idx > 0) h[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      });
      const init: RequestInit = { method, headers: h };
      if (method !== 'GET' && method !== 'DELETE' && body) init.body = body;
      const res = await fetch(url, init);
      const text = await res.text();
      let pretty = text; try { pretty = JSON.stringify(JSON.parse(text), null, 2); } catch { /* not json */ }
      setResponse({ status: res.status, time: Math.round(performance.now() - t0), body: pretty });
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-full w-full flex flex-col bg-neutral-900 text-white">
      <div className="p-3 border-b border-white/10 flex gap-2">
        <select value={method} onChange={(e) => setMethod(e.target.value)}
          className="bg-black/40 px-2 rounded text-sm font-mono outline-none">
          {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input value={url} onChange={(e) => setUrl(e.target.value)}
          className="flex-1 bg-black/40 px-3 py-1.5 rounded text-sm font-mono outline-none" />
        <button onClick={send} disabled={loading}
          className="px-4 py-1.5 bg-emerald-600/70 hover:bg-emerald-600 rounded text-sm disabled:opacity-50">
          {loading ? '...' : 'Send'}
        </button>
      </div>
      <div className="flex border-b border-white/10 text-xs">
        {(['headers','body'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2 ${tab===t?'border-b-2 border-emerald-500 text-white':'text-white/60'}`}>{t}</button>
        ))}
      </div>
      {tab === 'headers' ? (
        <textarea value={headers} onChange={(e) => setHeaders(e.target.value)}
          placeholder="Header: value"
          className="h-32 bg-black/30 px-3 py-2 text-xs font-mono outline-none resize-none" spellCheck={false} />
      ) : (
        <textarea value={body} onChange={(e) => setBody(e.target.value)}
          placeholder='{"key": "value"}'
          className="h-32 bg-black/30 px-3 py-2 text-xs font-mono outline-none resize-none" spellCheck={false} />
      )}
      <div className="flex-1 min-h-0 flex flex-col border-t border-white/10">
        <div className="p-2 text-xs font-mono flex gap-3 border-b border-white/10 bg-black/20">
          {response && (
            <>
              <span className={response.status < 400 ? 'text-emerald-400' : 'text-red-400'}>{response.status}</span>
              <span className="text-white/60">{response.time}ms</span>
            </>
          )}
          {error && <span className="text-red-400">{error}</span>}
          {!response && !error && <span className="text-white/40">No response yet.</span>}
        </div>
        <pre className="flex-1 overflow-auto p-3 text-xs font-mono bg-black/30 whitespace-pre-wrap">
          {response?.body || ''}
        </pre>
      </div>
    </div>
  );
}
export default ApiTester;
