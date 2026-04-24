import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, Settings as SettingsIcon, Trash2, Eye, EyeOff } from 'lucide-react';

interface Msg { role: 'user' | 'assistant' | 'system'; text: string; }
type Provider = 'offline' | 'openrouter' | 'openai' | 'anthropic' | 'gemini';

interface ProviderDef {
  id: Provider;
  label: string;
  models: string[];
  needsKey: boolean;
  keyHint: string;
}

const PROVIDERS: ProviderDef[] = [
  { id: 'offline', label: 'Offline (simulated)', models: ['local'], needsKey: false, keyHint: '' },
  { id: 'openrouter', label: 'OpenRouter (free models available)', needsKey: true, keyHint: 'sk-or-v1-...',
    models: [
      'meta-llama/llama-3.3-70b-instruct:free',
      'deepseek/deepseek-chat-v3.1:free',
      'google/gemini-2.0-flash-exp:free',
      'mistralai/mistral-small-3.2-24b-instruct:free',
      'qwen/qwen-2.5-72b-instruct:free',
      'openai/gpt-4o-mini',
      'anthropic/claude-3.5-sonnet',
    ] },
  { id: 'openai', label: 'OpenAI', needsKey: true, keyHint: 'sk-...',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  { id: 'anthropic', label: 'Anthropic (Claude)', needsKey: true, keyHint: 'sk-ant-...',
    models: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-latest'] },
  { id: 'gemini', label: 'Google Gemini', needsKey: true, keyHint: 'AIza...',
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'] },
];

const STORE = {
  msgs: 'workos-ai-msgs',
  provider: 'workos-ai-provider',
  model: 'workos-ai-model',
  keys: 'workos-ai-keys',
};

function loadJSON<T>(k: string, fallback: T): T {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; }
}

const OFFLINE_REPLIES = (input: string): string => {
  const i = input.toLowerCase();
  if (i.includes('hello') || i.includes('hi ')) return 'Hello! I am the local assistant. Add an API key in Settings to enable a real model.';
  if (i.includes('help')) return 'Open settings (gear icon) and pick a provider: OpenAI, Claude or Gemini.';
  return 'I am running in offline mode. Choose a provider and add a key in Settings to get smart replies.';
};

async function* streamOpenAICompatible(
  url: string, apiKey: string, model: string, msgs: Msg[], extraHeaders: Record<string, string> = {}
): AsyncGenerator<string> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, ...extraHeaders },
    body: JSON.stringify({
      model, stream: true,
      messages: msgs.map(m => ({ role: m.role, content: m.text })),
    }),
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  yield* parseSSE(res, (data) => {
    try { return JSON.parse(data).choices?.[0]?.delta?.content || ''; } catch { return ''; }
  });
}

async function* streamAnthropic(apiKey: string, model: string, msgs: Msg[]): AsyncGenerator<string> {
  const sys = msgs.filter(m => m.role === 'system').map(m => m.text).join('\n') || undefined;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model, max_tokens: 1024, stream: true, system: sys,
      messages: msgs.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.text })),
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  yield* parseSSE(res, (data) => {
    try {
      const j = JSON.parse(data);
      if (j.type === 'content_block_delta') return j.delta?.text || '';
    } catch { /* */ }
    return '';
  });
}

async function* streamGemini(apiKey: string, model: string, msgs: Msg[]): AsyncGenerator<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: msgs.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }],
      })),
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  yield* parseSSE(res, (data) => {
    try {
      const j = JSON.parse(data);
      return j.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch { return ''; }
  });
}

async function* parseSSE(res: Response, extract: (data: string) => string): AsyncGenerator<string> {
  const reader = res.body?.getReader(); if (!reader) return;
  const dec = new TextDecoder(); let buf = '';
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n'); buf = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (!data || data === '[DONE]') continue;
      const piece = extract(data);
      if (piece) yield piece;
    }
  }
}

export function AiAssistant() {
  const envKey = (import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined) || '';
  const hasEnvKey = !!envKey;
  const [msgs, setMsgs] = useState<Msg[]>(() => loadJSON(STORE.msgs, [
    { role: 'assistant' as const, text: hasEnvKey
      ? 'Connected via OpenRouter. Pick a model in Settings or just start chatting.'
      : 'Hi — pick a provider and add an API key in Settings to enable real replies.' },
  ]));
  const [provider, setProvider] = useState<Provider>(() =>
    loadJSON(STORE.provider, hasEnvKey ? 'openrouter' as Provider : 'offline' as Provider));
  const [model, setModel] = useState<string>(() =>
    loadJSON(STORE.model, hasEnvKey ? 'meta-llama/llama-3.3-70b-instruct:free' : 'local'));
  const [keys, setKeys] = useState<Record<string, string>>(() => {
    const stored = loadJSON<Record<string, string>>(STORE.keys, {});
    if (hasEnvKey && !stored.openrouter) stored.openrouter = envKey;
    return stored;
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const def = PROVIDERS.find(p => p.id === provider)!;

  useEffect(() => { localStorage.setItem(STORE.msgs, JSON.stringify(msgs)); }, [msgs]);
  useEffect(() => { localStorage.setItem(STORE.provider, JSON.stringify(provider)); }, [provider]);
  useEffect(() => { localStorage.setItem(STORE.model, JSON.stringify(model)); }, [model]);
  useEffect(() => { localStorage.setItem(STORE.keys, JSON.stringify(keys)); }, [keys]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [msgs, loading]);

  const onProviderChange = (p: Provider) => {
    setProvider(p);
    const d = PROVIDERS.find(x => x.id === p)!;
    if (!d.models.includes(model)) setModel(d.models[0]);
  };

  const send = async () => {
    const text = input.trim(); if (!text || loading) return;
    setError(null); setInput('');
    const next: Msg[] = [...msgs, { role: 'user', text }];
    setMsgs(next);

    if (provider === 'offline') {
      setTimeout(() => setMsgs((m) => [...m, { role: 'assistant', text: OFFLINE_REPLIES(text) }]), 250);
      return;
    }

    const key = keys[provider];
    if (!key) {
      setError(`No API key set for ${def.label}. Open Settings to add one.`);
      setShowSettings(true);
      return;
    }

    setLoading(true);
    setMsgs((m) => [...m, { role: 'assistant', text: '' }]);
    try {
      const stream =
        provider === 'openai' ? streamOpenAICompatible('https://api.openai.com/v1/chat/completions', key, model, next) :
        provider === 'openrouter' ? streamOpenAICompatible('https://openrouter.ai/api/v1/chat/completions', key, model, next, {
          'HTTP-Referer': window.location.origin, 'X-Title': 'Work OS',
        }) :
        provider === 'anthropic' ? streamAnthropic(key, model, next) :
        streamGemini(key, model, next);
      let acc = '';
      for await (const chunk of stream) {
        acc += chunk;
        setMsgs((m) => { const c = [...m]; c[c.length - 1] = { role: 'assistant', text: acc }; return c; });
      }
      if (!acc) setMsgs((m) => { const c = [...m]; c[c.length - 1] = { role: 'assistant', text: '(empty response)' }; return c; });
    } catch (e: any) {
      setError(e.message || 'Request failed');
      setMsgs((m) => m.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => setMsgs([{ role: 'assistant', text: 'Chat cleared. How can I help?' }]);

  return (
    <div className="h-full w-full flex flex-col bg-neutral-900 text-white">
      <div className="p-3 border-b border-white/10 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span className="text-sm font-medium">AI Assistant</span>
        <span className="text-xs text-white/40 px-2 py-0.5 bg-white/10 rounded">
          {def.label}{provider !== 'offline' && ` · ${model}`}
        </span>
        <button onClick={clearChat} title="Clear chat" className="ml-auto p-1.5 hover:bg-white/10 rounded">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setShowSettings(s => !s)} title="Settings"
          className={`p-1.5 rounded ${showSettings ? 'bg-white/20' : 'hover:bg-white/10'}`}>
          <SettingsIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {showSettings && (
        <div className="p-4 border-b border-white/10 bg-black/30 space-y-3 text-sm">
          <div>
            <label className="text-xs text-white/60 block mb-1">Provider</label>
            <select value={provider} onChange={(e) => onProviderChange(e.target.value as Provider)}
              className="w-full bg-black/40 rounded px-2 py-1.5 outline-none">
              {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/60 block mb-1">Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)}
              className="w-full bg-black/40 rounded px-2 py-1.5 outline-none">
              {def.models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {def.needsKey && (
            <div>
              <label className="text-xs text-white/60 block mb-1">API Key</label>
              <div className="flex gap-2">
                <input type={showKey ? 'text' : 'password'} value={keys[provider] || ''}
                  onChange={(e) => setKeys({ ...keys, [provider]: e.target.value })}
                  placeholder={def.keyHint}
                  className="flex-1 bg-black/40 rounded px-2 py-1.5 outline-none font-mono text-xs" />
                <button onClick={() => setShowKey(s => !s)} className="p-2 bg-white/10 hover:bg-white/20 rounded">
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-xs text-white/40 mt-1">
                Stored in this browser only. Calls go directly from your browser to {def.label}.
              </p>
            </div>
          )}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-3">
        {msgs.filter(m => m.role !== 'system').map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
              m.role === 'user' ? 'bg-emerald-600/70' : 'bg-white/10'
            }`}>
              {m.text || <span className="text-white/40">…</span>}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-lg px-3 py-2 text-sm text-white/60">thinking…</div>
          </div>
        )}
      </div>

      {error && <div className="px-4 py-2 text-xs text-red-300 bg-red-900/30 border-t border-red-900/50">{error}</div>}

      <div className="p-3 border-t border-white/10 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          placeholder={loading ? 'Streaming reply...' : 'Ask anything...'}
          disabled={loading}
          className="flex-1 bg-black/40 rounded px-3 py-2 text-sm outline-none disabled:opacity-50" />
        <button onClick={send} disabled={loading || !input.trim()}
          className="px-3 bg-emerald-600/70 hover:bg-emerald-600 disabled:opacity-40 rounded">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
export default AiAssistant;
