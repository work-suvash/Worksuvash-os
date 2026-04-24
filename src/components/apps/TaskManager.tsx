import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';

interface Card { id: string; text: string; }
interface Column { id: string; title: string; cards: Card[]; }

const KEY = 'workos-kanban';
const initial: Column[] = [
  { id: 'todo', title: 'To Do', cards: [{ id: '1', text: 'Plan the OS' }, { id: '2', text: 'Design icons' }] },
  { id: 'doing', title: 'In Progress', cards: [{ id: '3', text: 'Build apps' }] },
  { id: 'done', title: 'Done', cards: [{ id: '4', text: 'Setup project' }] },
];

export function TaskManager() {
  const [columns, setColumns] = useState<Column[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '') || initial; } catch { return initial; }
  });
  const [drag, setDrag] = useState<{ from: string; cardId: string } | null>(null);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(columns)); }, [columns]);

  const addCard = (colId: string) => {
    const text = prompt('Card text:'); if (!text) return;
    setColumns((cs) => cs.map(c => c.id === colId ? { ...c, cards: [...c.cards, { id: Date.now().toString(), text }] } : c));
  };
  const removeCard = (colId: string, cardId: string) =>
    setColumns((cs) => cs.map(c => c.id === colId ? { ...c, cards: c.cards.filter(k => k.id !== cardId) } : c));

  const onDrop = (toCol: string) => {
    if (!drag) return;
    setColumns((cs) => {
      const fromCol = cs.find(c => c.id === drag.from); if (!fromCol) return cs;
      const card = fromCol.cards.find(k => k.id === drag.cardId); if (!card) return cs;
      return cs.map(c => {
        if (c.id === drag.from) return { ...c, cards: c.cards.filter(k => k.id !== drag.cardId) };
        if (c.id === toCol) return { ...c, cards: [...c.cards, card] };
        return c;
      });
    });
    setDrag(null);
  };

  return (
    <div className="h-full w-full bg-neutral-900 text-white p-4 overflow-auto">
      <div className="flex gap-3 h-full min-w-max">
        {columns.map(col => (
          <div key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(col.id)}
            className="w-64 shrink-0 bg-black/30 rounded-lg p-2 flex flex-col gap-2">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="font-medium text-sm">{col.title} <span className="text-white/40 text-xs">({col.cards.length})</span></span>
              <button onClick={() => addCard(col.id)} className="p-1 hover:bg-white/10 rounded"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            <div className="space-y-2 flex-1 min-h-12">
              {col.cards.map(card => (
                <div key={card.id} draggable
                  onDragStart={() => setDrag({ from: col.id, cardId: card.id })}
                  className="group bg-neutral-800 hover:bg-neutral-700 rounded p-2 text-sm flex items-start gap-2 cursor-move">
                  <span className="flex-1">{card.text}</span>
                  <button onClick={() => removeCard(col.id, card.id)} className="opacity-0 group-hover:opacity-100 hover:text-red-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default TaskManager;
