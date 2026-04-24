/**
 * TypeFlow - In-game typing trainer site
 *
 * A typing practice site inspired by TypingClub, redesigned with a
 * darker, glassy aesthetic that fits Work OS. Lessons → type prompt →
 * see WPM, accuracy, and time.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { WebsiteContainer, WebsiteLayout, WebsiteHeader, WebsiteFooter } from '../components/WebsiteLayout';
import type { WebsiteProps } from '../types';
import {
  Keyboard,
  Trophy,
  Timer,
  Target,
  Zap,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Lock,
} from 'lucide-react';

type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface Lesson {
  id: number;
  title: string;
  difficulty: Difficulty;
  description: string;
  text: string;
}

const LESSONS: Lesson[] = [
  {
    id: 1,
    title: 'Home Row Basics',
    difficulty: 'beginner',
    description: 'Learn the foundation: a s d f j k l ;',
    text: 'asdf jkl; asdf jkl; sad lad fad ask sad ask jak lad fall salsa',
  },
  {
    id: 2,
    title: 'Common Short Words',
    difficulty: 'beginner',
    description: 'The most used short English words.',
    text: 'the and you that for not are with his they have this from one had',
  },
  {
    id: 3,
    title: 'Capitalization & Punctuation',
    difficulty: 'intermediate',
    description: 'Mix shift, periods, and commas into your flow.',
    text: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.',
  },
  {
    id: 4,
    title: 'Numbers Row',
    difficulty: 'intermediate',
    description: 'Build muscle memory for digits.',
    text: '1 2 3 4 5 6 7 8 9 0 in 2026 there were 47 ships and 1284 sailors arriving on day 9',
  },
  {
    id: 5,
    title: 'Symbols & Code',
    difficulty: 'advanced',
    description: 'Brackets, slashes, and operators used in code.',
    text: 'const x = (a + b) / 2; if (x > 0 && x < 100) { return "ok"; } else { return "no"; }',
  },
  {
    id: 6,
    title: 'Speed Run',
    difficulty: 'expert',
    description: 'A long passage. Push your WPM to the limit.',
    text:
      'Practice does not make perfect; only perfect practice makes perfect. The mind learns through repetition, and the fingers follow what the mind insists upon. Consistency beats intensity, and discipline beats motivation. Type with intention, not with speed alone.',
  },
];

const DIFFICULTY_STYLES: Record<Difficulty, { label: string; chip: string; bar: string }> = {
  beginner: {
    label: 'Beginner',
    chip: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    bar: 'bg-emerald-400',
  },
  intermediate: {
    label: 'Intermediate',
    chip: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    bar: 'bg-sky-400',
  },
  advanced: {
    label: 'Advanced',
    chip: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    bar: 'bg-violet-400',
  },
  expert: {
    label: 'Expert',
    chip: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    bar: 'bg-rose-400',
  },
};

export function TypeFlow({ params, onNavigate }: WebsiteProps) {
  const lessonIdParam = params?.lesson ? parseInt(params.lesson, 10) : null;
  const lesson = lessonIdParam ? LESSONS.find((l) => l.id === lessonIdParam) : null;

  if (lesson) {
    return <LessonView lesson={lesson} onBack={() => onNavigate?.('typeflow.io')} />;
  }

  return <HomeView onNavigate={onNavigate} />;
}

function HomeView({ onNavigate }: { onNavigate?: (url: string) => void }) {
  return (
    <WebsiteLayout bg="bg-[#0b0d12]" className="text-slate-100 min-h-full flex flex-col">
      <WebsiteHeader
        bg="bg-[#0b0d12]/90 backdrop-blur"
        border={false}
        logo={
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Keyboard className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-lg tracking-tight">TypeFlow</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400">
                Master the Keyboard
              </div>
            </div>
          </div>
        }
        nav={
          <ul className="flex items-center justify-center gap-6 text-sm text-slate-300">
            <li className="hover:text-white cursor-pointer">Lessons</li>
            <li className="hover:text-white cursor-pointer">Practice</li>
            <li className="hover:text-white cursor-pointer">Stats</li>
            <li className="hover:text-white cursor-pointer">About</li>
          </ul>
        }
        actions={
          <button className="text-sm bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 text-white font-medium px-4 py-2 rounded-md shadow shadow-indigo-500/20 transition-colors">
            Sign in
          </button>
        }
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at top left, rgba(139,92,246,0.25), transparent 60%), radial-gradient(ellipse at bottom right, rgba(59,130,246,0.20), transparent 60%)',
          }}
        />
        <WebsiteContainer size="lg" className="relative">
          <div className="grid @4xl:grid-cols-2 gap-10 items-center py-12">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-violet-300 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full mb-5">
                <Zap className="w-3 h-3" />
                Type smarter, not harder
              </div>
              <h1 className="text-4xl @3xl:text-5xl font-bold tracking-tight leading-[1.05] mb-4">
                Build typing speed that <span className="text-violet-400">actually</span> sticks.
              </h1>
              <p className="text-slate-400 text-base mb-7 max-w-md">
                Bite-sized lessons, instant feedback on every keystroke, and a clean focus mode
                designed for long sessions. No popups. No ads. Just flow.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate?.('typeflow.io?lesson=1')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 text-white font-semibold px-5 py-3 rounded-lg shadow-lg shadow-indigo-500/20 transition-colors"
                >
                  Start lesson 1
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate?.('typeflow.io?lesson=6')}
                  className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 text-slate-200 font-semibold px-5 py-3 rounded-lg transition-colors"
                >
                  Try speed run
                </button>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                <Stat label="Lessons" value={String(LESSONS.length)} />
                <Stat label="Avg gain" value="+22 WPM" />
                <Stat label="Sessions" value="2-5 min" />
              </div>
            </div>

            <KeyboardArt />
          </div>
        </WebsiteContainer>
      </section>

      {/* Lessons */}
      <section className="flex-1">
        <WebsiteContainer size="lg">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Lessons</h2>
              <p className="text-slate-400 text-sm">Pick where you want to start. Progress is saved on your device.</p>
            </div>
            <div className="hidden @2xl:flex items-center gap-2 text-xs text-slate-400">
              <Trophy className="w-4 h-4 text-amber-400" />
              0 / {LESSONS.length} completed
            </div>
          </div>

          <div className="grid @2xl:grid-cols-2 @5xl:grid-cols-3 gap-4">
            {LESSONS.map((l) => {
              const style = DIFFICULTY_STYLES[l.difficulty];
              return (
                <button
                  key={l.id}
                  onClick={() => onNavigate?.(`typeflow.io?lesson=${l.id}`)}
                  className="group text-left bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-violet-500/40 rounded-xl p-5 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="text-xs text-slate-500 font-mono">
                      Lesson {String(l.id).padStart(2, '0')}
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-wider border px-2 py-0.5 rounded ${style.chip}`}
                    >
                      {style.label}
                    </span>
                  </div>
                  <div className="font-semibold text-lg mb-1 group-hover:text-white">{l.title}</div>
                  <div className="text-sm text-slate-400 mb-4">{l.description}</div>
                  <div className="flex items-center justify-between">
                    <div className="h-1.5 bg-white/5 rounded-full flex-1 mr-3 overflow-hidden">
                      <div className={`h-full w-0 ${style.bar}`} />
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
                  </div>
                </button>
              );
            })}

            {/* Locked teaser */}
            <div className="rounded-xl border border-dashed border-white/10 p-5 flex flex-col items-center justify-center text-center text-slate-500">
              <Lock className="w-5 h-5 mb-2" />
              <div className="text-sm font-medium">More lessons coming soon</div>
              <div className="text-xs">Custom drills, dictionary mode, code mode.</div>
            </div>
          </div>
        </WebsiteContainer>
      </section>

      <WebsiteFooter bg="bg-black/40 border-t border-white/5">
        <WebsiteContainer size="lg" className="py-0 px-0 flex flex-col @2xl:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>© 2026 TypeFlow · Built inside Work OS</div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 cursor-pointer">Privacy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms</span>
            <span className="hover:text-slate-300 cursor-pointer">Contact</span>
          </div>
        </WebsiteContainer>
      </WebsiteFooter>
    </WebsiteLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
      <div className="text-lg font-bold tracking-tight">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-slate-500">{label}</div>
    </div>
  );
}

function KeyboardArt() {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];
  const homeKeys = new Set(['A', 'S', 'D', 'F', 'J', 'K', 'L']);
  return (
    <div className="hidden @4xl:block">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 shadow-2xl shadow-violet-500/10">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex justify-center gap-1.5 mb-1.5"
            style={{ paddingLeft: `${i * 14}px` }}
          >
            {row.map((k) => (
              <div
                key={k}
                className={`w-9 h-9 rounded-md border text-xs font-mono flex items-center justify-center ${
                  homeKeys.has(k)
                    ? 'bg-violet-500/20 border-violet-400/40 text-violet-200'
                    : 'bg-white/5 border-white/10 text-slate-300'
                }`}
              >
                {k}
              </div>
            ))}
          </div>
        ))}
        <div className="flex justify-center mt-1.5">
          <div className="w-56 h-9 rounded-md bg-white/5 border border-white/10" />
        </div>
      </div>
    </div>
  );
}

/* ----------------------- Lesson / Typing Engine ----------------------- */

interface LessonViewProps {
  lesson: Lesson;
  onBack: () => void;
}

function LessonView({ lesson, onBack }: LessonViewProps) {
  const [input, setInput] = useState('');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // tick the timer while typing
  useEffect(() => {
    if (!startedAt || done) return;
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [startedAt, done]);

  // autofocus
  useEffect(() => {
    inputRef.current?.focus();
  }, [lesson.id]);

  const target = lesson.text;
  const elapsedSec = startedAt ? Math.max(0.001, (now - startedAt) / 1000) : 0;

  const { correctCount, errorCount } = useMemo(() => {
    let correct = 0;
    let errors = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === target[i]) correct++;
      else errors++;
    }
    return { correctCount: correct, errorCount: errors };
  }, [input, target]);

  const totalTyped = input.length;
  const accuracy = totalTyped === 0 ? 100 : Math.round((correctCount / totalTyped) * 100);
  const wpm = Math.max(0, Math.round((correctCount / 5) / (elapsedSec / 60 || 1)));
  const progress = Math.min(100, Math.round((input.length / target.length) * 100));

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (done) return;
    const value = e.target.value;
    if (!startedAt) setStartedAt(Date.now());
    if (value.length > target.length) return;
    setInput(value);
    if (value.length === target.length) {
      setDone(true);
      setNow(Date.now());
    }
  }

  function reset() {
    setInput('');
    setStartedAt(null);
    setNow(Date.now());
    setDone(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <WebsiteLayout bg="bg-[#0b0d12]" className="text-slate-100 min-h-full flex flex-col">
      <WebsiteHeader
        bg="bg-[#0b0d12]/90 backdrop-blur"
        border={false}
        logo={
          <button onClick={onBack} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Keyboard className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight text-left">
              <div className="font-bold text-lg tracking-tight group-hover:text-violet-300 transition-colors">
                TypeFlow
              </div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400">
                Lesson {String(lesson.id).padStart(2, '0')}
              </div>
            </div>
          </button>
        }
        actions={
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 text-sm border border-white/10 hover:border-white/30 text-slate-200 px-3 py-2 rounded-md transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
        }
      />

      <WebsiteContainer size="md" className="flex-1 w-full">
        <div className="mb-5">
          <div className="text-xs uppercase tracking-widest text-violet-300 mb-1">
            {DIFFICULTY_STYLES[lesson.difficulty].label} drill
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{lesson.title}</h1>
          <p className="text-slate-400 text-sm">{lesson.description}</p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <StatTile icon={<Zap className="w-3.5 h-3.5" />} label="WPM" value={String(wpm)} accent="text-violet-300" />
          <StatTile icon={<Target className="w-3.5 h-3.5" />} label="Accuracy" value={`${accuracy}%`} accent={accuracy >= 95 ? 'text-emerald-300' : accuracy >= 80 ? 'text-amber-300' : 'text-rose-300'} />
          <StatTile icon={<Timer className="w-3.5 h-3.5" />} label="Time" value={`${elapsedSec.toFixed(1)}s`} accent="text-sky-300" />
          <StatTile icon={<Trophy className="w-3.5 h-3.5" />} label="Errors" value={String(errorCount)} accent="text-rose-300" />
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-5">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Typing area */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="cursor-text rounded-xl border border-white/10 bg-white/[0.02] p-6 leading-relaxed font-mono text-lg select-none"
        >
          <PromptText target={target} input={input} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleChange}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="absolute opacity-0 pointer-events-none"
          aria-label="Typing input"
        />

        {/* Result */}
        {done && (
          <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 flex items-center gap-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-emerald-200">Lesson complete</div>
              <div className="text-sm text-emerald-300/80">
                {wpm} WPM · {accuracy}% accuracy · {elapsedSec.toFixed(1)}s · {errorCount} errors
              </div>
            </div>
            <button
              onClick={reset}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold px-4 py-2 rounded-md transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-slate-500">
          Tip: keep your eyes on the prompt, not on your fingers.
        </div>
      </WebsiteContainer>
    </WebsiteLayout>
  );
}

function StatTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest ${accent}`}>
        {icon}
        {label}
      </div>
      <div className="text-xl font-bold mt-0.5 tabular-nums">{value}</div>
    </div>
  );
}

function PromptText({ target, input }: { target: string; input: string }) {
  return (
    <div>
      {target.split('').map((ch, i) => {
        const typed = input[i];
        let cls = 'text-slate-500';
        if (typed != null) {
          cls = typed === ch ? 'text-emerald-300' : 'text-rose-400 underline decoration-rose-500/60';
        }
        const isCursor = i === input.length;
        return (
          <span
            key={i}
            className={`${cls} ${isCursor ? 'border-l-2 border-violet-400 -ml-[2px] animate-pulse' : ''}`}
          >
            {ch === ' ' && typed != null && typed !== ch ? '·' : ch}
          </span>
        );
      })}
    </div>
  );
}
