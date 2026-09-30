'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useProgress, todayKey } from '@/lib/progress';
import { Puzzle, loadBank, pickAdaptive, dailySet, rushPuzzle, THEMES } from '@/lib/puzzles';
import PuzzleSolver, { PuzzleOutcome } from '@/components/puzzles/PuzzleSolver';
import Mascot from '@/components/ui/Mascot';
import Modal from '@/components/ui/Modal';
import { sfx } from '@/lib/sounds';

type Mode = 'train' | 'daily' | 'rush' | 'themes';

const MODES: { id: Mode; label: string; icon: string }[] = [
  { id: 'train', label: 'Training', icon: '🎯' },
  { id: 'daily', label: 'Daily 5', icon: '📅' },
  { id: 'rush', label: 'Rush', icon: '⚡' },
  { id: 'themes', label: 'Themes', icon: '🗂️' },
];

function RatingBadge({ delta }: { delta: number | null }) {
  const rating = useProgress((s) => s.puzzles.rating);
  return (
    <span className="chip bg-primary-soft text-lg text-primary">
      ★ {rating}
      {delta !== null && delta !== 0 && (
        <span key={`${rating}`} className={`lk-pop text-sm ${delta > 0 ? 'text-mint-dark' : 'text-coral-dark'}`}>
          {delta > 0 ? `+${delta}` : delta}
        </span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
function Training({ bank, theme, onClearTheme }: { bank: Puzzle[]; theme?: string; onClearTheme: () => void }) {
  const record = useProgress((s) => s.recordPuzzle);
  const streak = useProgress((s) => s.puzzles.streak);
  const [delta, setDelta] = useState<number | null>(null);
  // Puzzles shown this session (mutable set kept for the component's lifetime).
  const [sessionSeen] = useState(() => new Set<string>());
  const choose = useCallback(() => {
    const s = useProgress.getState().puzzles;
    const p = pickAdaptive(bank, { rating: s.rating, seen: new Set(s.seen), themeStats: s.themes, theme, exclude: sessionSeen });
    sessionSeen.add(p.id);
    return p;
  }, [bank, theme, sessionSeen]);
  const [puzzle, setPuzzle] = useState<Puzzle>(() => choose());

  const onFinish = (o: PuzzleOutcome) => {
    const change = record({ id: puzzle.id, rating: puzzle.rating, themes: puzzle.themes, success: o.success });
    setDelta(change);
    if (o.success && (useProgress.getState().puzzles.streak % 5 === 0)) {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <RatingBadge delta={delta} />
        <span className="chip">🔥 {streak} in a row</span>
        {theme && THEMES[theme] && (
          <button className="chip border-primary/40 bg-primary-soft text-primary" onClick={onClearTheme}>
            {THEMES[theme].icon} {THEMES[theme].label} ✕
          </button>
        )}
      </div>
      <PuzzleSolver
        key={puzzle.id}
        puzzle={puzzle}
        onFinish={onFinish}
        onNext={() => {
          setDelta(null);
          setPuzzle(choose());
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
function Daily({ bank }: { bank: Puzzle[] }) {
  const rating = useProgress((s) => s.puzzles.rating);
  const record = useProgress((s) => s.recordPuzzle);
  const doneIds = useProgress((s) => s.puzzles.dailyDone[todayKey()] ?? []);
  // Freeze today's set on first render so it doesn't shift as the rating changes.
  const [set] = useState(() => dailySet(bank, rating));
  const [index, setIndex] = useState(() => {
    const i = set.findIndex((p) => !doneIds.includes(p.id));
    return i === -1 ? 0 : i;
  });
  const allDone = set.every((p) => doneIds.includes(p.id));
  const puzzle = set[index];

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        {set.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setIndex(i)}
            className={`flex h-11 w-11 items-center justify-center rounded-2xl border-2 font-display text-lg font-extrabold transition ${
              doneIds.includes(p.id) ? 'border-mint bg-mint text-white' : i === index ? 'border-primary bg-primary-soft text-primary' : 'border-line bg-paper text-muted'
            }`}
            aria-label={`Puzzle ${i + 1}`}
          >
            {doneIds.includes(p.id) ? '✓' : i + 1}
          </button>
        ))}
        {allDone && <span className="ml-2 font-display text-lg font-extrabold text-mint-dark">All done today! 🎉</span>}
      </div>
      <PuzzleSolver
        key={puzzle.id}
        puzzle={puzzle}
        onFinish={(o) => {
          if (o.solved) record({ id: puzzle.id, rating: puzzle.rating, themes: puzzle.themes, success: o.success, daily: todayKey() });
          if (!o.solved) record({ id: puzzle.id, rating: puzzle.rating, themes: puzzle.themes, success: false });
        }}
        onNext={index < set.length - 1 ? () => setIndex(index + 1) : undefined}
      />
      {!allDone && index === set.length - 1 && <p className="mt-3 text-center font-semibold text-muted">Come back tomorrow for 5 new puzzles!</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
const RUSH_TIME = 180;

function Rush({ bank }: { bank: Puzzle[] }) {
  const recordRush = useProgress((s) => s.recordRush);
  const best = useProgress((s) => s.puzzles.rushBest);
  const [state, setState] = useState<'ready' | 'running' | 'over'>('ready');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(RUSH_TIME);
  const [index, setIndex] = useState(0);
  const used = useRef(new Set<string>());
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);

  const next = useCallback(
    (i: number) => {
      const p = rushPuzzle(bank, i, used.current);
      used.current.add(p.id);
      setPuzzle(p);
      setIndex(i);
    },
    [bank],
  );

  const end = useCallback(
    (finalScore: number) => {
      setState('over');
      recordRush(finalScore);
      sfx.win();
      if (finalScore > 0) confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    },
    [recordRush],
  );

  const scoreRef = useRef(0);
  useEffect(() => {
    if (state !== 'running') return;
    const deadline = Date.now() + RUSH_TIME * 1000;
    const t = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTime(left);
      if (left <= 0) {
        clearInterval(t);
        end(scoreRef.current);
      }
    }, 250);
    return () => clearInterval(t);
  }, [state, end]);

  const start = () => {
    scoreRef.current = 0;
    used.current = new Set();
    setScore(0);
    setLives(3);
    setTime(RUSH_TIME);
    setState('running');
    next(0);
  };

  if (state === 'ready' || !puzzle) {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <p className="text-6xl">⚡</p>
        <h2 className="mt-2 font-display text-3xl font-extrabold">Puzzle Rush</h2>
        <p className="mt-2 text-lg font-semibold text-muted">Solve as many puzzles as you can in 3 minutes. They get harder and harder! You have 3 lives. ❤️❤️❤️</p>
        <p className="mt-3 font-bold">Your best: {best}</p>
        <button className="btn btn-lg btn-sun mt-6" onClick={start}>
          Start Rush!
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={`chip text-lg ${time <= 20 ? 'border-coral text-coral-dark' : ''}`}>
          ⏱ {Math.floor(Math.max(0, time) / 60)}:{String(Math.max(0, time) % 60).padStart(2, '0')}
        </span>
        <span className="chip text-lg">✅ {score}</span>
        <span className="chip text-lg">{'❤️'.repeat(lives)}{'🤍'.repeat(3 - lives)}</span>
      </div>
      <PuzzleSolver
        key={`${puzzle.id}-${index}`}
        puzzle={puzzle}
        strict
        onFinish={(o) => {
          if (state !== 'running') return;
          if (o.success) {
            const s = score + 1;
            scoreRef.current = s;
            setScore(s);
            setTimeout(() => next(index + 1), 700);
          } else {
            const l = lives - 1;
            setLives(l);
            if (l <= 0) setTimeout(() => end(score), 600);
            else setTimeout(() => next(index + 1), 900);
          }
        }}
      />
      <Modal open={state === 'over'} onClose={() => setState('ready')}>
        <div className="text-center">
          <Mascot mood="cheer" size={100} className="mx-auto" />
          <h2 className="mt-2 font-display text-3xl font-extrabold">Rush over!</h2>
          <p className="mt-1 font-display text-6xl font-extrabold text-primary">{score}</p>
          <p className="font-bold text-muted">{score >= best && score > 0 ? '🏆 New personal best!' : `Best: ${best}`}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button className="btn btn-sun" onClick={start}>
              Play again
            </button>
            <button className="btn btn-white" onClick={() => setState('ready')}>
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ---------------------------------------------------------------------------
function Themes({ bank, onPick }: { bank: Puzzle[]; onPick: (t: string) => void }) {
  const stats = useProgress((s) => s.puzzles.themes);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of bank) for (const t of p.themes) c[t] = (c[t] ?? 0) + 1;
    return c;
  }, [bank]);
  const list = Object.entries(THEMES).filter(([id]) => (counts[id] ?? 0) > 0 || id === 'mateIn1' || id === 'mateIn2');
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {list.map(([id, t]) => {
        const s = stats[id];
        const pct = s && s.ok + s.fail > 0 ? Math.round((s.ok / (s.ok + s.fail)) * 100) : null;
        return (
          <button key={id} className="card card-hover flex items-center gap-4 p-4 text-left" onClick={() => onPick(id)}>
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cream text-3xl">{t.icon}</span>
            <span className="flex-1">
              <span className="block font-display text-xl font-extrabold">{t.label}</span>
              <span className="block text-sm font-semibold text-muted">{t.blurb}</span>
              {pct !== null && <span className="mt-1 block text-xs font-extrabold text-mint-dark">{pct}% solved</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
function PuzzlesInner() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = (params.get('mode') as Mode) || 'train';
  const [mode, setMode] = useState<Mode>(MODES.some((m) => m.id === initial) ? initial : 'train');
  const [theme, setTheme] = useState<string | undefined>(params.get('theme') ?? undefined);
  const [bank, setBank] = useState<Puzzle[] | null>(null);
  const solved = useProgress((s) => s.puzzles.solved);

  useEffect(() => {
    loadBank().then(setBank);
  }, []);

  const switchMode = (m: Mode) => {
    setMode(m);
    router.replace(m === 'train' ? '/puzzles' : `/puzzles?mode=${m}`, { scroll: false });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 md:px-8 md:py-8">
      <header className="mb-3 flex flex-wrap items-end justify-between gap-3 sm:mb-5">
        <div>
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Puzzles</h1>
          <p className="hidden text-lg font-semibold text-muted sm:block">{solved} solved so far. Puzzles get harder as you get better!</p>
        </div>
      </header>
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto sm:mb-6">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => switchMode(m.id)}
            className={`flex shrink-0 items-center gap-2 rounded-2xl border-2 px-4 py-2.5 font-display text-lg font-extrabold transition ${
              mode === m.id ? 'border-primary bg-primary text-white shadow-[0_4px_0_var(--color-primary-dark)]' : 'border-line bg-paper text-muted hover:text-ink'
            }`}
          >
            <span>{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>
      {!bank ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <Mascot mood="think" size={90} className="animate-float" />
          <p className="font-display text-lg font-bold text-muted">Finding puzzles for you…</p>
        </div>
      ) : mode === 'train' ? (
        <Training key={theme ?? 'all'} bank={bank} theme={theme} onClearTheme={() => setTheme(undefined)} />
      ) : mode === 'daily' ? (
        <Daily bank={bank} />
      ) : mode === 'rush' ? (
        <Rush bank={bank} />
      ) : (
        <Themes
          bank={bank}
          onPick={(t) => {
            setTheme(t);
            switchMode('train');
          }}
        />
      )}
    </div>
  );
}

export default function PuzzlesPage() {
  return (
    <Suspense>
      <PuzzlesInner />
    </Suspense>
  );
}
