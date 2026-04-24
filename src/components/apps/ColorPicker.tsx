import { useState } from 'react';

function hexToRgb(hex: string) {
  const m = hex.replace('#','').match(/.{1,2}/g);
  if (!m || m.length < 3) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(m[0],16), g: parseInt(m[1],16), b: parseInt(m[2],16) };
}

export function ColorPicker() {
  const [color, setColor] = useState('#6366f1');
  const [color2, setColor2] = useState('#ec4899');
  const [angle, setAngle] = useState(135);
  const [copied, setCopied] = useState('');
  const rgb = hexToRgb(color);
  const gradient = `linear-gradient(${angle}deg, ${color}, ${color2})`;

  const copy = (v: string) => {
    navigator.clipboard?.writeText(v).then(() => { setCopied(v); setTimeout(() => setCopied(''), 1200); });
  };

  return (
    <div className="h-full w-full flex flex-col bg-neutral-900 text-white p-4 gap-4 overflow-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm text-white/70">Color 1</div>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
            className="w-full h-24 rounded cursor-pointer bg-transparent" />
          <div className="text-xs font-mono space-y-1">
            <button onClick={() => copy(color)} className="block w-full text-left bg-black/30 hover:bg-black/50 rounded px-2 py-1">
              HEX: {color.toUpperCase()} {copied===color && '✓'}
            </button>
            <button onClick={() => copy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)} className="block w-full text-left bg-black/30 hover:bg-black/50 rounded px-2 py-1">
              RGB: rgb({rgb.r}, {rgb.g}, {rgb.b})
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-white/70">Color 2</div>
          <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)}
            className="w-full h-24 rounded cursor-pointer bg-transparent" />
          <div className="text-xs">
            <label className="text-white/60">Angle: {angle}°</label>
            <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-sm text-white/70">Gradient Preview</div>
        <div className="h-32 rounded-lg" style={{ background: gradient }} />
        <button onClick={() => copy(`background: ${gradient};`)}
          className="w-full bg-black/30 hover:bg-black/50 rounded px-3 py-2 text-xs font-mono text-left">
          background: {gradient};
        </button>
      </div>
    </div>
  );
}
export default ColorPicker;
