import { useEffect, useRef, useState } from 'react';
import { Square as SquareIcon, Circle as CircleIcon, Type, Trash2, Download } from 'lucide-react';

type Tool = 'rect' | 'circle' | 'text';
interface Shape {
  id: string; type: Tool; x: number; y: number; w: number; h: number; color: string; text?: string;
}

export function ImageEditor() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [tool, setTool] = useState<Tool>('rect');
  const [color, setColor] = useState('#6366f1');

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = '#1f2937'; ctx.fillRect(0, 0, c.width, c.height);
    shapes.forEach(s => {
      ctx.fillStyle = s.color;
      if (s.type === 'rect') ctx.fillRect(s.x, s.y, s.w, s.h);
      else if (s.type === 'circle') {
        ctx.beginPath(); ctx.arc(s.x + s.w/2, s.y + s.h/2, Math.min(s.w, s.h)/2, 0, Math.PI*2); ctx.fill();
      } else if (s.type === 'text') {
        ctx.font = `${Math.max(16, s.h)}px sans-serif`; ctx.fillText(s.text || '', s.x, s.y + s.h);
      }
    });
  }, [shapes]);

  const addShape = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    const text = tool === 'text' ? prompt('Text:') || 'Text' : undefined;
    setShapes((s) => [...s, { id: String(Date.now()), type: tool, x, y, w: 80, h: tool === 'text' ? 24 : 60, color, text }]);
  };

  const exportPng = () => {
    const c = ref.current; if (!c) return;
    const a = document.createElement('a'); a.download = 'image.png'; a.href = c.toDataURL('image/png'); a.click();
  };

  return (
    <div className="h-full w-full flex flex-col bg-neutral-900 text-white">
      <div className="p-2 border-b border-white/10 flex items-center gap-2 text-sm">
        {([['rect',SquareIcon],['circle',CircleIcon],['text',Type]] as const).map(([t, Icon]) => (
          <button key={t} onClick={() => setTool(t)}
            className={`p-2 rounded ${tool===t?'bg-white/20':'bg-white/5 hover:bg-white/10'}`}>
            <Icon className="w-4 h-4" />
          </button>
        ))}
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer bg-transparent" />
        <span className="text-xs text-white/60 ml-2">Click on the canvas to place a shape.</span>
        <button onClick={() => setShapes([])} className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded">
          <Trash2 className="w-3.5 h-3.5" /> Clear
        </button>
        <button onClick={exportPng} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600/70 hover:bg-emerald-600 rounded">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        <canvas ref={ref} width={800} height={500} onClick={addShape}
          className="bg-neutral-800 rounded shadow-lg cursor-crosshair max-w-full" />
      </div>
    </div>
  );
}
export default ImageEditor;
