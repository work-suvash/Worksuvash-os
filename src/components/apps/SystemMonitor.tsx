import { useEffect, useState } from 'react';

interface Sample { t: number; cpu: number; ram: number; net: number; }

export function SystemMonitor() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [base] = useState(() => ({ cpu: 20 + Math.random() * 10, ram: 35 + Math.random() * 20 }));

  useEffect(() => {
    const tick = () => {
      const cpu = Math.max(2, Math.min(98, base.cpu + (Math.random() - 0.5) * 30));
      const ram = Math.max(10, Math.min(95, base.ram + (Math.random() - 0.5) * 8));
      const net = Math.max(0, Math.random() * 12);
      setSamples((s) => [...s.slice(-59), { t: Date.now(), cpu, ram, net }]);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [base]);

  const last = samples[samples.length - 1];
  const Bar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/70">{label}</span>
        <span className="font-mono text-white/90">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded overflow-hidden">
        <div className="h-full transition-all duration-300" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );

  const Chart = ({ data, color }: { data: number[]; color: string }) => {
    if (data.length < 2) return <div className="h-16" />;
    const max = Math.max(100, ...data);
    const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`).join(' ');
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-16">
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    );
  };

  return (
    <div className="h-full w-full bg-neutral-900 text-white p-4 overflow-auto space-y-4">
      <h2 className="text-lg font-medium">System Monitor</h2>
      {last && (
        <>
          <Bar label="CPU" value={last.cpu} color="#22c55e" />
          <Chart data={samples.map(s => s.cpu)} color="#22c55e" />
          <Bar label="Memory" value={last.ram} color="#3b82f6" />
          <Chart data={samples.map(s => s.ram)} color="#3b82f6" />
          <Bar label="Network (Mbps)" value={(last.net / 12) * 100} color="#a855f7" />
          <Chart data={samples.map(s => s.net)} color="#a855f7" />
        </>
      )}
      <div className="text-xs text-white/40 pt-2 border-t border-white/10">
        Simulated metrics, sampled every second.
      </div>
    </div>
  );
}
export default SystemMonitor;
