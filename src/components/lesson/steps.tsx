'use client';

import { useCallback, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { Chess } from 'chess.js';
import Board, { SquareMark } from '@/components/board/Board';
import Coach from '@/components/ui/Coach';
import { MascotMood } from '@/components/ui/Mascot';
import {
  TalkStep, QuizStep, FindStep, TapStep, StarsStep, MoveStep, PlayStep, LessonStep,
} from '@/lib/curriculum/types';
import { checkLessonMove } from '@/lib/curriculum/goals';
import { miniMoves, parsePlacement, toPlacement, attackedBy, Board as MiniBoard } from '@/lib/curriculum/mini-moves';
import { sfx, moveSound } from '@/lib/sounds';
import { getEngine } from '@/lib/engine/stockfish';
import { getBestMove, generateDifficultyLevels } from '@/lib/chess-ai';
import { parseUci, PIECE_NAME } from '@/lib/chess-utils';

export interface StepProps {
  onDone: () => void;
  onMistake: () => void;
}

type Feedback = { tone: 'good' | 'bad' | 'info' | 'default'; text: string; mood: MascotMood } | null;

/** Shared two-column layout: board on the left, coach and controls on the right. */
function Layout({ board, say, feedback, children }: { board?: ReactNode; say: string; feedback?: Feedback; children?: ReactNode }) {
  return (
    <div className={`mx-auto grid w-full max-w-6xl gap-4 px-4 ${board ? 'lg:grid-cols-[minmax(0,560px)_1fr] lg:items-start' : 'max-w-2xl'}`}>
      {board && <div className="order-2 mx-auto w-full max-w-[560px] lg:order-1">{board}</div>}
      <div className="order-1 flex flex-col gap-3 lg:order-2 lg:pt-4">
        <Coach text={feedback?.text ?? say} mood={feedback?.mood ?? 'happy'} tone={feedback?.tone ?? 'default'} size={board ? 64 : 96} />
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
export function Talk({ step, onDone }: { step: TalkStep } & StepProps) {
  useEffect(() => onDone(), [onDone]);
  return (
    <Layout
      say={step.say}
      board={step.fen ? <Board fen={step.fen} arrows={step.arrows} highlights={step.highlights} /> : undefined}
    />
  );
}

// ---------------------------------------------------------------------------
export function Quiz({ step, onDone, onMistake }: { step: QuizStep } & StepProps) {
  const [picked, setPicked] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const feedback: Feedback = solved
    ? { tone: 'good', text: `Correct! ${step.explain}`, mood: 'cheer' }
    : picked.length
      ? { tone: 'bad', text: 'Not quite. Try again! 🤔', mood: 'think' }
      : null;
  return (
    <Layout say={step.say} feedback={feedback} board={step.fen ? <Board fen={step.fen} arrows={step.arrows} highlights={step.highlights} /> : undefined}>
      <div className="grid gap-2 sm:grid-cols-2">
        {step.options.map((opt, i) => {
          const wrong = picked.includes(i) && i !== step.answer;
          const right = solved && i === step.answer;
          return (
            <button
              key={opt}
              disabled={solved || wrong}
              onClick={() => {
                if (i === step.answer) {
                  setSolved(true);
                  sfx.correct();
                  onDone();
                } else {
                  setPicked((p) => [...p, i]);
                  sfx.wrong();
                  onMistake();
                }
              }}
              className={`card px-5 py-4 text-left font-display text-xl font-extrabold transition ${
                right ? 'border-mint bg-mint-soft' : wrong ? 'lk-shake border-coral bg-coral-soft opacity-70' : 'card-hover'
              }`}
            >
              {right ? '✅ ' : wrong ? '❌ ' : ''}
              {opt}
            </button>
          );
        })}
      </div>
    </Layout>
  );
}

// ---------------------------------------------------------------------------
export function Find({ step, onDone, onMistake }: { step: FindStep } & StepProps) {
  const [index, setIndex] = useState(0);
  const [marks, setMarks] = useState<Record<string, SquareMark>>({});
  const [flash, setFlash] = useState<string | null>(null);
  const done = index >= step.squares.length;
  const target = step.squares[Math.min(index, step.squares.length - 1)];

  const tap = (sq: string) => {
    if (done) return;
    if (sq === target) {
      sfx.star();
      setMarks((m) => ({ ...m, [sq]: 'found' }));
      const next = index + 1;
      setIndex(next);
      if (next >= step.squares.length) {
        sfx.correct();
        onDone();
      }
    } else {
      sfx.wrong();
      onMistake();
      setFlash(sq);
      setTimeout(() => setFlash(null), 600);
    }
  };
  const allMarks = flash ? { ...marks, [flash]: 'bad' as SquareMark } : marks;
  return (
    <Layout
      say={step.say}
      feedback={done ? { tone: 'good', text: 'You\'re a map reader! 🗺️', mood: 'cheer' } : flash ? { tone: 'bad', text: `That's **${flash}**. Look for **${target}**!`, mood: 'think' } : null}
      board={<Board fen="8/8/8/8/8/8/8/8 w - - 0 1" onSquareTap={tap} marks={allMarks} />}
    >
      {!done && (
        <div className="card flex items-center justify-between px-5 py-4">
          <span className="font-bold text-muted">Find the square</span>
          <span className="font-display text-5xl font-extrabold text-primary">{target}</span>
          <span className="chip">{index + 1}/{step.squares.length}</span>
        </div>
      )}
    </Layout>
  );
}

// ---------------------------------------------------------------------------
export function Tap({ step, onDone, onMistake }: { step: TapStep } & StepProps) {
  const targets = useMemo(() => miniMoves(parsePlacement(step.fen), step.from), [step]);
  const [found, setFound] = useState<string[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const done = found.length === targets.length;

  const tap = (sq: string) => {
    if (done || found.includes(sq)) return;
    if (targets.includes(sq)) {
      sfx.star();
      const next = [...found, sq];
      setFound(next);
      if (next.length === targets.length) {
        sfx.correct();
        onDone();
      }
    } else if (sq !== step.from) {
      sfx.wrong();
      onMistake();
      setFlash(sq);
      setTimeout(() => setFlash(null), 600);
    }
  };
  const marks: Record<string, SquareMark> = {};
  for (const f of found) marks[f] = 'found';
  if (flash) marks[flash] = 'bad';
  return (
    <Layout
      say={step.say}
      feedback={done ? { tone: 'good', text: step.explain, mood: 'cheer' } : flash ? { tone: 'bad', text: 'The piece can\'t go there. Try another square!', mood: 'think' } : null}
      board={<Board fen={step.fen} onSquareTap={tap} marks={marks} highlights={[step.from]} />}
    >
      <div className="card flex items-center justify-between px-5 py-3">
        <span className="font-bold text-muted">Squares found</span>
        <span className="font-display text-3xl font-extrabold text-mint">
          {found.length}/{targets.length}
        </span>
      </div>
    </Layout>
  );
}

// ---------------------------------------------------------------------------
export function Stars({ step, onDone, onMistake }: { step: StarsStep } & StepProps) {
  const initialHero = step.hero ?? Object.entries(parsePlacement(step.fen)).find(([, p]) => p === p.toUpperCase())?.[0] ?? 'a1';
  const [board, setBoard] = useState<MiniBoard>(() => parsePlacement(step.fen));
  const [hero, setHero] = useState(initialHero);
  const [left, setLeft] = useState<string[]>(step.stars);
  const [moves, setMoves] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [danger, setDanger] = useState<string[]>([]);
  const done = left.length === 0;

  const reset = () => {
    setBoard(parsePlacement(step.fen));
    setHero(initialHero);
    setLeft(step.stars);
    setMoves(0);
    setFeedback(null);
    setDanger([]);
  };

  const legal = useCallback((sq: string) => (sq === hero && !done ? miniMoves(board, sq) : []), [board, hero, done]);

  const move = (from: string, to: string) => {
    const b: MiniBoard = { ...board };
    let piece = b[from];
    const captured = !!b[to];
    delete b[from];
    if (piece === 'P' && to[1] === '8') piece = 'Q';
    b[to] = piece;
    if (step.guarded && attackedBy(b, false).has(to)) {
      sfx.wrong();
      onMistake();
      const attackers = Object.entries(board)
        .filter(([s, p]) => p === p.toLowerCase() && miniMoves({ ...b, [s]: p }, s).includes(to))
        .map(([s]) => s);
      setDanger([to, ...attackers]);
      setFeedback({ tone: 'bad', text: 'Danger! An enemy piece guards that square. Pick a safe one!', mood: 'wow' });
      setTimeout(() => setDanger([]), 1200);
      return false;
    }
    if (captured) sfx.capture();
    else sfx.move();
    const nextLeft = left.filter((s) => s !== to);
    if (nextLeft.length < left.length) setTimeout(() => sfx.star(), 120);
    const nextMoves = moves + 1;
    setBoard(b);
    setHero(to);
    setLeft(nextLeft);
    setMoves(nextMoves);
    if (nextLeft.length === 0) {
      const perfect = nextMoves <= step.par;
      setFeedback({ tone: 'good', text: perfect ? `Perfect! All stars in just ${nextMoves} moves! 🌟` : `All stars collected! Can you do it in ${step.par} moves next time?`, mood: 'cheer' });
      if (!perfect) onMistake();
      setTimeout(() => sfx.correct(), 250);
      onDone();
    } else {
      setFeedback(null);
    }
    return true;
  };

  const marks: Record<string, SquareMark> = {};
  for (const d of danger) marks[d] = 'bad';
  return (
    <Layout say={step.say} feedback={feedback} board={<Board fen={`${toPlacement(board)} w - - 0 1`} movable="w" legalMoves={legal} onMove={move} stars={left} marks={marks} pulse={moves === 0 ? [hero] : []} />}>
      <div className="card flex items-center justify-between px-5 py-3">
        <span className="font-bold text-muted">
          ⭐ {step.stars.length - left.length}/{step.stars.length}
        </span>
        <span className="font-bold text-muted">
          Moves: <span className="font-display text-2xl font-extrabold text-ink">{moves}</span> <span className="text-sm">(best {step.par})</span>
        </span>
        <button className="btn btn-white btn-sm" onClick={reset}>
          ↺ Retry
        </button>
      </div>
    </Layout>
  );
}

// ---------------------------------------------------------------------------
export function MoveTask({ step, onDone, onMistake }: { step: MoveStep } & StepProps) {
  const [fen, setFen] = useState(step.fen);
  const [phase, setPhase] = useState(0); // index into [step, ...then]
  const [last, setLast] = useState<[string, string] | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(false);
  const me = useMemo(() => new Chess(step.fen).turn(), [step.fen]);
  const stage = phase === 0 ? { accept: step.accept, goal: step.goal, say: step.say } : step.then![phase - 1];

  const onMove = (from: string, to: string, promotion?: string) => {
    if (done) return false;
    const uci = from + to + (promotion ?? '');
    // Auto-queen when the lesson only lists queen promotions.
    const candidates = promotion ? [uci] : [uci, `${uci}q`];
    const tryUci = candidates.find((u) => {
      try {
        return !!new Chess(fen).move(parseUci(u));
      } catch {
        return false;
      }
    });
    if (!tryUci) return false;
    const res = checkLessonMove(fen, tryUci, stage.accept, stage.goal);
    if (!res.ok) {
      sfx.wrong();
      onMistake();
      setShake(true);
      setTimeout(() => setShake(false), 450);
      const text =
        res.reason === 'stalemate'
          ? 'Oh no, that\'s **stalemate**: a draw! Find a move that gives check.'
          : res.reason === 'hanging'
            ? step.wrong ?? 'Hmm, something can still be captured there. Try again!'
            : step.wrong ?? 'Not quite! Try again. 🤔';
      setFeedback({ tone: 'bad', text, mood: 'think' });
      return false;
    }
    const g = new Chess(fen);
    const m = g.move(parseUci(tryUci));
    moveSound(m.san);
    setFen(g.fen());
    setLast([from, to]);
    const followUp = step.then?.[phase];
    if (followUp) {
      setFeedback({ tone: 'good', text: 'Yes! 👍', mood: 'happy' });
      setTimeout(() => {
        const g2 = new Chess(g.fen());
        const r = g2.move(parseUci(followUp.reply));
        moveSound(r.san);
        setFen(g2.fen());
        setLast([r.from, r.to]);
        setPhase(phase + 1);
        setHintLevel(0);
        setFeedback({ tone: 'info', text: followUp.say, mood: 'happy' });
      }, 700);
    } else {
      setDone(true);
      setFeedback({ tone: 'good', text: step.success, mood: 'cheer' });
      setTimeout(() => sfx.correct(), 200);
      onDone();
    }
    return true;
  };

  const hintSquare = stage.accept?.[0]?.slice(0, 2);
  return (
    <Layout
      say={stage.say}
      feedback={feedback}
      board={
        <div className={shake ? 'lk-shake' : ''}>
          <Board fen={fen} orientation={me === 'w' ? 'white' : 'black'} movable={done ? null : me} onMove={onMove} lastMove={last} arrows={phase === 0 && !last ? step.arrows : []} highlights={phase === 0 ? step.highlights : []} pulse={hintLevel >= 2 && hintSquare ? [hintSquare] : []} />
        </div>
      }
    >
      {!done && (
        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-white btn-sm"
            onClick={() => {
              setHintLevel((h) => h + 1);
              setFeedback({ tone: 'info', text: `💡 ${step.hint}`, mood: 'think' });
            }}
          >
            💡 Hint
          </button>
          <span className="self-center text-sm font-bold text-muted">You play {me === 'w' ? 'White' : 'Black'}</span>
        </div>
      )}
    </Layout>
  );
}

// ---------------------------------------------------------------------------
export function PlayTask({ step, onDone, onMistake }: { step: PlayStep } & StepProps) {
  const [fen, setFen] = useState(step.fen);
  const [last, setLast] = useState<[string, string] | null>(null);
  const [myMoves, setMyMoves] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [status, setStatus] = useState<'playing' | 'won' | 'failed'>('playing');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const me = useMemo(() => new Chess(step.fen).turn(), [step.fen]);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    getEngine().preload();
    return () => {
      alive.current = false;
    };
  }, []);

  const fail = (text: string) => {
    setStatus('failed');
    setFeedback({ tone: 'bad', text, mood: 'sad' });
    sfx.lose();
    onMistake();
  };

  const reply = async (current: string) => {
    setThinking(true);
    let uci: string | null = null;
    try {
      const lines = await getEngine().analyse(current, { depth: 12 });
      uci = lines[0]?.move ?? null;
    } catch {
      const mv = getBestMove(new Chess(current), generateDifficultyLevels()[6]);
      uci = mv ? mv.from + mv.to + (mv.promotion ?? '') : null;
    }
    if (!alive.current || !uci) return;
    await new Promise((r) => setTimeout(r, 350));
    const g = new Chess(current);
    const m = g.move(parseUci(uci));
    moveSound(m.san);
    setFen(g.fen());
    setLast([m.from, m.to]);
    setThinking(false);
    if (m.captured && (m.captured === 'q' || m.captured === 'r')) {
      fail(`Oh no, the king captured your ${PIECE_NAME[m.captured]}! Keep it away from the enemy king, or protect it.`);
      return;
    }
    if (g.isGameOver()) fail('The game ended in a draw. Let\'s try again!');
  };

  const onMove = (from: string, to: string, promotion?: string) => {
    if (status !== 'playing' || thinking) return false;
    const g = new Chess(fen);
    let m;
    try {
      m = g.move({ from, to, promotion: promotion ?? 'q' });
    } catch {
      return false;
    }
    moveSound(m.san);
    setFen(g.fen());
    setLast([from, to]);
    const n = myMoves + 1;
    setMyMoves(n);
    if (step.goal === 'mate' && g.isCheckmate()) {
      setStatus('won');
      setFeedback({ tone: 'good', text: step.success, mood: 'cheer' });
      sfx.win();
      onDone();
      return true;
    }
    if (step.goal === 'promote' && m.isPromotion()) {
      setStatus('won');
      setFeedback({ tone: 'good', text: step.success, mood: 'cheer' });
      sfx.win();
      onDone();
      return true;
    }
    if (g.isStalemate()) {
      fail('Oops, **stalemate**! The king had no moves but wasn\'t in check. Try again and leave him a square!');
      return true;
    }
    if (g.isGameOver()) {
      fail('That position is a draw now. Try again!');
      return true;
    }
    if (n >= step.maxMoves) {
      fail(`You used all ${step.maxMoves} moves. Try again, you're getting closer!`);
      return true;
    }
    reply(g.fen());
    return true;
  };

  const restart = () => {
    setFen(step.fen);
    setLast(null);
    setMyMoves(0);
    setStatus('playing');
    setFeedback(null);
  };

  return (
    <Layout say={step.say} feedback={feedback} board={<Board fen={fen} orientation={me === 'w' ? 'white' : 'black'} movable={status === 'playing' && !thinking ? me : null} onMove={onMove} lastMove={last} />}>
      <div className="card flex items-center justify-between px-5 py-3">
        <span className="font-bold text-muted">{thinking ? '🤔 Computer is thinking…' : status === 'playing' ? 'Your move!' : status === 'won' ? '🏆 Goal reached!' : 'Try again'}</span>
        <span className="font-bold text-muted">
          Moves: <span className="font-display text-2xl font-extrabold text-ink">{myMoves}</span>/{step.maxMoves}
        </span>
      </div>
      <div className="flex gap-2">
        {status !== 'won' && (
          <button className="btn btn-white btn-sm" onClick={restart}>
            ↺ Restart
          </button>
        )}
        {status === 'playing' && (
          <button className="btn btn-white btn-sm" onClick={() => setFeedback({ tone: 'info', text: `💡 ${step.hint}`, mood: 'think' })}>
            💡 Hint
          </button>
        )}
      </div>
    </Layout>
  );
}

export function StepView({ step, onDone, onMistake }: { step: LessonStep } & StepProps) {
  switch (step.kind) {
    case 'talk':
      return <Talk step={step} onDone={onDone} onMistake={onMistake} />;
    case 'quiz':
      return <Quiz step={step} onDone={onDone} onMistake={onMistake} />;
    case 'find':
      return <Find step={step} onDone={onDone} onMistake={onMistake} />;
    case 'tap':
      return <Tap step={step} onDone={onDone} onMistake={onMistake} />;
    case 'stars':
      return <Stars step={step} onDone={onDone} onMistake={onMistake} />;
    case 'move':
      return <MoveTask step={step} onDone={onDone} onMistake={onMistake} />;
    case 'play':
      return <PlayTask step={step} onDone={onDone} onMistake={onMistake} />;
  }
}
