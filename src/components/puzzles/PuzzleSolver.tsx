'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import Board from '@/components/board/Board';
import Coach from '@/components/ui/Coach';
import { MascotMood } from '@/components/ui/Mascot';
import { Puzzle, hintFor, titleFor, THEMES } from '@/lib/puzzles';
import { parseUci, toUci } from '@/lib/chess-utils';
import { sfx, moveSound } from '@/lib/sounds';

export interface PuzzleOutcome {
  success: boolean; // solved without mistakes or strong hints
  solved: boolean; // reached the end at all
}

interface Props {
  puzzle: Puzzle;
  onFinish: (o: PuzzleOutcome) => void;
  /** Rush mode: a single wrong move ends the puzzle. */
  strict?: boolean;
  onNext?: () => void;
  nextLabel?: string;
  compact?: boolean;
}

type Msg = { text: string; tone: 'default' | 'good' | 'bad' | 'info'; mood: MascotMood };

export default function PuzzleSolver({ puzzle, onFinish, strict = false, onNext, nextLabel = 'Next puzzle →', compact = false }: Props) {
  const start = useMemo(() => {
    const g = new Chess(puzzle.fen);
    let lastMove: [string, string] | null = null;
    if (puzzle.setup) {
      const m = g.move(parseUci(puzzle.setup));
      lastMove = [m.from, m.to];
    }
    return { fen: g.fen(), lastMove, solver: g.turn() };
  }, [puzzle]);

  const [fen, setFen] = useState(puzzle.setup ? puzzle.fen : start.fen);
  const [ply, setPly] = useState(0); // index into puzzle.moves
  const [last, setLast] = useState<[string, string] | null>(null);
  const [status, setStatus] = useState<'intro' | 'solving' | 'solved' | 'failed' | 'revealing'>(puzzle.setup ? 'intro' : 'solving');
  const [clean, setClean] = useState(true);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [hint, setHint] = useState(0);
  const [shake, setShake] = useState(false);
  const reported = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Animate the opponent's setup move.
  useEffect(() => {
    if (!puzzle.setup) return;
    const t = setTimeout(() => {
      setFen(start.fen);
      setLast(start.lastMove);
      const g = new Chess(puzzle.fen);
      moveSound(g.move(parseUci(puzzle.setup!)).san);
      setStatus('solving');
    }, 650);
    return () => clearTimeout(t);
  }, [puzzle, start]);

  const finish = (success: boolean, solved: boolean) => {
    if (reported.current) return;
    reported.current = true;
    onFinish({ success, solved });
  };

  const isFinalMateOk = (g: Chess, i: number) => i === puzzle.moves.length - 1 && puzzle.themes.includes('mate') && g.isCheckmate();

  const onMove = (from: string, to: string, promotion?: string) => {
    if (status !== 'solving') return false;
    const g = new Chess(fen);
    let m;
    try {
      m = g.move({ from, to, promotion });
    } catch {
      return false;
    }
    const uci = toUci(m);
    const expected = puzzle.moves[ply];
    const correct = uci === expected || (expected && uci.slice(0, 4) === expected.slice(0, 4) && !expected[4] && !promotion) || isFinalMateOk(g, ply);

    if (!correct) {
      sfx.wrong();
      setShake(true);
      later(() => setShake(false), 450);
      setClean(false);
      if (strict) {
        setStatus('failed');
        setMsg({ text: 'Oops! That wasn\'t it.', tone: 'bad', mood: 'sad' });
        finish(false, false);
        return false;
      }
      setMsg({ text: g.isCheckmate() ? 'Checkmate works too!' : 'Not quite, try again! 🤔', tone: 'bad', mood: 'think' });
      return false;
    }

    moveSound(m.san);
    setFen(g.fen());
    setLast([m.from, m.to]);
    setHint(0);
    const nextPly = ply + 1;
    if (nextPly >= puzzle.moves.length) {
      setStatus('solved');
      setPly(nextPly);
      setMsg({ text: clean ? pickPraise() : 'Solved! Next time try it without help. 💪', tone: 'good', mood: 'cheer' });
      later(() => sfx.correct(), 150);
      finish(clean, true);
      return true;
    }
    setMsg({ text: 'Yes! Keep going…', tone: 'good', mood: 'happy' });
    // Opponent's reply
    later(() => {
      const g2 = new Chess(g.fen());
      const r = g2.move(parseUci(puzzle.moves[nextPly]));
      moveSound(r.san);
      setFen(g2.fen());
      setLast([r.from, r.to]);
      setPly(nextPly + 1);
      setMsg({ text: 'Your move again!', tone: 'info', mood: 'happy' });
    }, 500);
    return true;
  };

  const reveal = () => {
    setClean(false);
    setStatus('revealing');
    finish(false, false);
    setMsg({ text: 'Here\'s the solution. Watch closely! 👀', tone: 'info', mood: 'think' });
    const g = new Chess(fen);
    let delay = 300;
    for (let i = ply; i < puzzle.moves.length; i++) {
      const u = puzzle.moves[i];
      later(() => {
        const m = g.move(parseUci(u));
        moveSound(m.san);
        setFen(g.fen());
        setLast([m.from, m.to]);
        if (i === puzzle.moves.length - 1) {
          setStatus('failed');
          setMsg({ text: 'Now you know the trick! You\'ll get the next one. 💪', tone: 'info', mood: 'happy' });
        }
      }, delay);
      delay += 800;
    }
  };

  const giveHint = () => {
    const h = hint + 1;
    setHint(h);
    if (h === 1) setMsg({ text: `💡 ${hintFor(puzzle)}`, tone: 'info', mood: 'think' });
    else {
      setClean(false);
      setMsg({ text: '💡 Try moving the glowing piece!', tone: 'info', mood: 'think' });
    }
  };

  const done = status === 'solved' || status === 'failed';
  const solverName = start.solver === 'w' ? 'White' : 'Black';
  const mainTheme = puzzle.themes.find((t) => THEMES[t] && t !== 'mate' && t !== 'check') ?? puzzle.themes[0];

  const header = (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className={`inline-block h-5 w-5 shrink-0 rounded-full border-2 border-ink/30 ${start.solver === 'w' ? 'bg-white' : 'bg-ink'}`} />
        <h2 className="font-display text-2xl leading-tight font-extrabold">{status === 'intro' ? 'Watch the move…' : titleFor(puzzle)}</h2>
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="chip">You play {solverName}</span>
        {mainTheme && THEMES[mainTheme] && done && (
          <span className="chip">
            {THEMES[mainTheme].icon} {THEMES[mainTheme].label}
          </span>
        )}
        {done && <span className="chip">★ {puzzle.rating}</span>}
      </div>
    </div>
  );

  return (
    <div className={`grid gap-4 ${compact ? '' : 'lg:grid-cols-[minmax(0,560px)_1fr] lg:items-start'}`}>
      <div className="lg:hidden">{header}</div>
      <div className={`mx-auto w-full max-w-[560px] ${shake ? 'lk-shake' : ''}`}>
        <Board
          fen={fen}
          orientation={start.solver === 'w' ? 'white' : 'black'}
          movable={status === 'solving' ? start.solver : null}
          onMove={onMove}
          lastMove={last}
          pulse={hint >= 2 && status === 'solving' ? [puzzle.moves[ply].slice(0, 2)] : []}
        />
      </div>
      <div className="flex flex-col gap-3">
        <div className="hidden lg:block">{header}</div>
        <Coach text={msg?.text ?? (puzzle.setup ? `Your opponent just moved. Find the best move for ${solverName}!` : `Find the best move for ${solverName}!`)} mood={msg?.mood ?? 'happy'} tone={msg?.tone ?? 'default'} size={60} />
        <div className="flex flex-wrap gap-2">
          {status === 'solving' && !strict && (
            <>
              <button className="btn btn-white btn-sm" onClick={giveHint}>
                💡 Hint
              </button>
              <button className="btn btn-ghost btn-sm" onClick={reveal}>
                Show solution
              </button>
            </>
          )}
          {done && onNext && (
            <button className="btn btn-mint btn-lg lk-pop" onClick={onNext} autoFocus>
              {nextLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const PRAISE = ['Brilliant! 🌟', 'You found it! 🎯', 'Super sharp! ⚡', 'Puzzle crushed! 💥', 'Genius move! 🧠', 'Amazing! 🏆'];
function pickPraise() {
  return PRAISE[Math.floor(Math.random() * PRAISE.length)];
}
