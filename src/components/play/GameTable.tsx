'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess, PieceSymbol } from 'chess.js';
import confetti from 'canvas-confetti';
import Board, { BoardArrow } from '@/components/board/Board';
import Coach from '@/components/ui/Coach';
import Modal from '@/components/ui/Modal';
import Mascot from '@/components/ui/Mascot';
import { Bot, chooseBotMove } from '@/lib/engine/bots';
import { getEngine, EngineLine } from '@/lib/engine/stockfish';
import { reviewMove, MoveReview, QUALITY_STYLE, MoveQuality, lineWinChance } from '@/lib/engine/coach';
import { capturedPieces, materialBalance, parseUci, PIECE_GLYPH, PIECE_NAME, PIECE_VALUE, toUci, uciToSan } from '@/lib/chess-utils';
import { useProgress } from '@/lib/progress';
import { sfx, moveSound } from '@/lib/sounds';

export interface TableProps {
  bot: Bot;
  color: 'w' | 'b';
  takebacks: boolean;
  startFen?: string;
  initialMoves?: string[];
  onExit: () => void;
  onRematch: () => void;
}

type Result = { outcome: 'win' | 'loss' | 'draw'; reason: string; ratingChange: number };

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function replay(startFen: string, moves: string[]): Chess {
  const g = new Chess(startFen);
  for (const m of moves) g.move(parseUci(m));
  return g;
}

function CapturedRow({ pieces, color, advantage }: { pieces: PieceSymbol[]; color: 'w' | 'b'; advantage: number }) {
  return (
    <div className="flex min-h-6 flex-wrap items-center text-xl leading-none">
      {pieces.map((p, i) => (
        <span key={i} className="-mr-1.5">{PIECE_GLYPH[color + p]}</span>
      ))}
      {advantage > 0 && <span className="ml-2.5 text-sm font-extrabold text-muted">+{advantage}</span>}
    </div>
  );
}

function EvalBar({ white, orientation, vertical }: { white: number; orientation: 'w' | 'b'; vertical: boolean }) {
  const mine = orientation === 'w' ? white : 1 - white;
  const pct = Math.round(Math.max(0.03, Math.min(0.97, mine)) * 100);
  if (vertical) {
    return (
      <div className="relative w-4 overflow-hidden rounded-full border-2 border-line bg-ink" title="Who's winning">
        <div className="absolute inset-x-0 bottom-0 bg-white transition-[height] duration-700 ease-out" style={{ height: `${pct}%`, background: orientation === 'w' ? '#fff' : '#22254a' }} />
        {orientation === 'b' && <div className="absolute inset-x-0 top-0 bg-white transition-[height] duration-700" style={{ height: `${100 - pct}%` }} />}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{mine > 0.6 ? '😄' : mine < 0.4 ? '😟' : '😐'}</span>
      <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-coral/70">
        <div className="absolute inset-y-0 left-0 rounded-full bg-mint transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/80" />
      </div>
    </div>
  );
}

function winLabel(mine: number) {
  if (mine > 0.9) return 'You are winning big! 🚀';
  if (mine > 0.65) return 'You are ahead! 😄';
  if (mine > 0.4) return 'It\'s a close game! ⚖️';
  if (mine > 0.15) return 'Your opponent is ahead. Stay focused! 💪';
  return 'Tough spot. Look for tricks! 🔍';
}

export default function GameTable({ bot, color, takebacks, startFen = START, initialMoves = [], onExit, onRematch }: TableProps) {
  const settings = useProgress((s) => s.settings);
  const recordGame = useProgress((s) => s.recordGame);
  const saveGame = useProgress((s) => s.saveGame);

  const [moves, setMoves] = useState<string[]>(initialMoves);
  const [thinking, setThinking] = useState(false);
  const [analysis, setAnalysis] = useState<{ fen: string; lines: EngineLine[] } | null>(null);
  const [evalWhite, setEvalWhite] = useState(0.5);
  const [review, setReview] = useState<MoveReview | null>(null);
  const [hint, setHint] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [undosUsed, setUndosUsed] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [showEnd, setShowEnd] = useState(false);
  const [botSays, setBotSays] = useState<string>(initialMoves.length ? 'Welcome back! Let\'s continue.' : bot.greeting);
  const [quality, setQuality] = useState<Record<MoveQuality, number>>({ best: 0, great: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0 });
  const [confirm, setConfirm] = useState<'resign' | null>(null);
  const [flipped, setFlipped] = useState(false);

  const token = useRef(0);
  const ended = useRef(false);

  const game = useMemo(() => replay(startFen, moves), [startFen, moves]);
  const fen = game.fen();
  const turn = game.turn();
  const myTurn = turn === color && !result;
  const history = useMemo(() => game.history({ verbose: true }), [game]);
  const last = history.length ? ([history[history.length - 1].from, history[history.length - 1].to] as [string, string]) : null;
  const orientation: 'white' | 'black' = (color === 'w') !== flipped ? 'white' : 'black';

  useEffect(() => {
    getEngine().preload();
  }, []);

  // ---------------------------------------------------------------- end game
  const finish = useCallback(
    (outcome: Result['outcome'], reason: string, g: Chess) => {
      if (ended.current) return;
      ended.current = true;
      token.current++;
      getEngine().cancelAll();
      const change = recordGame({ botId: bot.id, botRating: bot.rating, color, result: outcome, moves: g.history().length, pgn: g.pgn() });
      setResult({ outcome, reason, ratingChange: change });
      setBotSays(outcome === 'win' ? bot.loseLine : outcome === 'loss' ? bot.winLine : 'A draw! Good game!');
      if (outcome === 'win') {
        sfx.win();
        const end = Date.now() + 1200;
        const frame = () => {
          confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 } });
          confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 } });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      } else if (outcome === 'loss') sfx.lose();
      setTimeout(() => setShowEnd(true), 900);
    },
    [bot, color, recordGame],
  );

  const checkEnd = useCallback(
    (g: Chess) => {
      if (!g.isGameOver()) return false;
      if (g.isCheckmate()) finish(g.turn() === color ? 'loss' : 'win', 'by checkmate', g);
      else if (g.isStalemate()) finish('draw', 'by stalemate', g);
      else if (g.isInsufficientMaterial()) finish('draw', 'not enough pieces to checkmate', g);
      else if (g.isThreefoldRepetition()) finish('draw', 'by repetition', g);
      else finish('draw', 'by the 50-move rule', g);
      return true;
    },
    [color, finish],
  );

  // ------------------------------------------------------------ persistence
  useEffect(() => {
    if (result) return;
    saveGame({ botId: bot.id, color, startFen, moves, hintsUsed, undosUsed, savedAt: new Date().toISOString() });
  }, [moves, result, bot.id, color, startFen, hintsUsed, undosUsed, saveGame]);

  // ---------------------------------------------------------------- bot turn
  useEffect(() => {
    if (result || ended.current || turn === color) return;
    const my = ++token.current;
    setThinking(true);
    const started = Date.now();
    const current = fen;
    chooseBotMove(current, bot).then(async (mv) => {
      const wait = Math.max(0, 550 + Math.random() * 500 - (Date.now() - started));
      await new Promise((r) => setTimeout(r, wait));
      if (token.current !== my) return;
      const g = new Chess(current);
      let m;
      try {
        m = g.move(mv);
      } catch {
        return;
      }
      moveSound(m.san);
      setThinking(false);
      setHint(0);
      if (m.captured && PIECE_VALUE[m.captured] >= 3) setBotSays(['Yum, thanks for the snack! 😋', 'Got one!', `I'll take that ${PIECE_NAME[m.captured]}!`][Math.floor(Math.random() * 3)]);
      else if (m.san.includes('+')) setBotSays('Check! Watch your king!');
      setMoves((prev) => [...prev, toUci(m)]);
      checkEnd(g);
    });
  }, [fen, turn, color, bot, result, checkEnd]);

  // ------------------------------------------- analyse kid's turn (eval + hint)
  useEffect(() => {
    if (!myTurn) return;
    let cancelled = false;
    getEngine()
      .analyse(fen, { depth: 11 })
      .then((lines) => {
        if (cancelled || !lines.length) return;
        setAnalysis({ fen, lines });
        const mine = lineWinChance(lines[0], turn, color);
        setEvalWhite(color === 'w' ? mine : 1 - mine);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [fen, myTurn, turn, color]);

  // ------------------------------------------------------------- kid moves
  const onMove = (from: string, to: string, promotion?: string) => {
    if (!myTurn || thinking) return false;
    const g = new Chess(fen);
    let m;
    try {
      m = g.move({ from, to, promotion });
    } catch {
      return false;
    }
    const uci = toUci(m);
    moveSound(m.san);
    setHint(0);
    setReview(null);
    if (m.captured && PIECE_VALUE[m.captured] >= 3) setBotSays(['Ouch!', 'Hey, that was my ' + PIECE_NAME[m.captured] + '!', 'Nooo! 😱'][Math.floor(Math.random() * 3)]);
    setMoves((prev) => [...prev, uci]);
    if (checkEnd(g)) return true;
    if (settings.coachTips) {
      const before = analysis?.fen === fen ? analysis.lines : null;
      reviewMove(fen, uci, before)
        .then((r) => {
          if (!r || ended.current) return;
          setReview(r);
          setEvalWhite(r.evalAfter);
          setQuality((q) => ({ ...q, [r.quality]: q[r.quality] + 1 }));
        })
        .catch(() => {});
    }
    return true;
  };

  // ----------------------------------------------------------------- tools
  const bestMove = analysis?.fen === fen ? analysis.lines[0]?.move : undefined;
  const showHint = () => {
    if (!myTurn) return;
    if (hint === 0) setHintsUsed((h) => h + 1);
    setHint((h) => Math.min(2, h + 1));
  };

  const canUndo = takebacks && !result && moves.length > 0 && (moves.length > (color === 'b' ? 1 : 0));
  const undo = () => {
    if (!canUndo) return;
    token.current++;
    getEngine().cancelAll();
    setThinking(false);
    setReview(null);
    setHint(0);
    setUndosUsed((u) => u + 1);
    setMoves((prev) => {
      const g = replay(startFen, prev);
      // Remove the bot's reply too, so it's the kid's turn again.
      const n = g.turn() === color ? 2 : 1;
      return prev.slice(0, Math.max(color === 'b' ? 1 : 0, prev.length - n));
    });
    setBotSays('Okay, try again!');
  };

  const offerDraw = () => {
    const mine = color === 'w' ? evalWhite : 1 - evalWhite;
    if (history.length >= 30 && mine > 0.35 && mine < 0.65) finish('draw', 'by agreement', game);
    else setBotSays(mine <= 0.35 ? 'No thanks, I think I\'m winning! 😎' : 'Not yet! Let\'s keep playing!');
  };

  // ------------------------------------------------------------------ view
  const captured = capturedPieces(game);
  const botColor = color === 'w' ? 'b' : 'w';
  const myAdv = materialBalance(game, color);
  const arrows: BoardArrow[] = hint >= 2 && bestMove && myTurn ? [[bestMove.slice(0, 2), bestMove.slice(2, 4), 'rgba(140,124,240,0.9)']] : [];
  const pulse = hint >= 1 && bestMove && myTurn ? [bestMove.slice(0, 2)] : [];
  const mine = color === 'w' ? evalWhite : 1 - evalWhite;
  const coachText = result
    ? result.outcome === 'win'
      ? `You won ${result.reason}! Incredible! 🏆`
      : result.outcome === 'loss'
        ? `${bot.name} won ${result.reason}. Every loss teaches you something!`
        : `It's a draw ${result.reason}.`
    : hint === 1 && bestMove
      ? `💡 Try moving your **${PIECE_NAME[game.get(bestMove.slice(0, 2) as 'a1')?.type ?? 'p']}** on ${bestMove.slice(0, 2)}.`
      : hint === 2 && bestMove
        ? `💡 How about **${uciToSan(fen, bestMove)}**? Follow the purple arrow!`
        : review
          ? review.message
          : game.inCheck() && myTurn
            ? 'You\'re in **check**! Move your king, block, or capture the attacker.'
            : myTurn
              ? history.length === 0
                ? 'You go first! Try to control the center. 🎯'
                : 'Your move! Check for captures and threats first.'
              : `${bot.name} is thinking…`;
  const coachTone = review && !hint ? (['mistake', 'blunder'].includes(review.quality) ? 'bad' : ['best', 'great'].includes(review.quality) ? 'good' : 'default') : 'default';

  const movePairs: [string, string | undefined][] = [];
  const sans = history.map((h) => h.san);
  const offset = startFen.split(' ')[1] === 'b' ? 1 : 0;
  const padded = offset ? ['…', ...sans] : sans;
  for (let i = 0; i < padded.length; i += 2) movePairs.push([padded[i], padded[i + 1]]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 py-3 md:px-6 md:py-5">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2">
        <button className="btn btn-white btn-sm" onClick={onExit}>
          ← Lobby
        </button>
        <span className="chip">{settings.showEvalBar ? winLabel(mine) : `vs ${bot.name}`}</span>
        <button className="btn btn-white btn-sm" onClick={() => setFlipped((f) => !f)} aria-label="Flip board">
          🔄
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,600px)_1fr]">
        <div className="flex flex-col gap-2">
          {/* Opponent strip */}
          <div className="flex items-center gap-3 rounded-2xl border-2 border-line bg-paper px-3 py-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl text-3xl" style={{ background: `${bot.color}33` }}>{bot.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg leading-tight font-extrabold">
                {bot.name} <span className="text-sm text-muted">~{bot.rating}</span>
              </p>
              <CapturedRow pieces={captured[color]} color={color} advantage={-myAdv} />
            </div>
            {thinking && <span className="animate-pulse text-2xl">💭</span>}
          </div>
          <div className="relative rounded-2xl border-2 border-line bg-paper px-3 py-2 text-sm font-bold">
            <span className="absolute -top-2 left-6 h-3 w-3 rotate-45 border-t-2 border-l-2 border-line bg-paper" />
            {botSays}
          </div>

          <div className="flex gap-2">
            {settings.showEvalBar && (
              <div className="hidden sm:flex">
                <EvalBar white={evalWhite} orientation={orientation === 'white' ? 'w' : 'b'} vertical />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <Board fen={fen} orientation={orientation} movable={myTurn && !thinking ? color : null} onMove={onMove} lastMove={last} arrows={arrows} pulse={pulse} id="game-board" />
            </div>
          </div>
          {settings.showEvalBar && (
            <div className="sm:hidden">
              <EvalBar white={evalWhite} orientation={color} vertical={false} />
            </div>
          )}

          {/* Player strip */}
          <div className="flex items-center gap-3 rounded-2xl border-2 border-line bg-paper px-3 py-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-3xl">{useProgress.getState().profile.avatar}</span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg leading-tight font-extrabold">{useProgress.getState().profile.name || 'You'}</p>
              <CapturedRow pieces={captured[botColor]} color={botColor} advantage={myAdv} />
            </div>
            {myTurn && !thinking && <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-extrabold text-white uppercase">Your turn</span>}
          </div>
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-3">
          <Coach text={coachText} mood={result?.outcome === 'win' ? 'cheer' : result?.outcome === 'loss' ? 'sad' : review?.quality === 'blunder' ? 'wow' : hint ? 'think' : 'happy'} tone={coachTone} size={64}>
            {review && !result && !hint && (
              <span className="mt-1 block text-sm font-extrabold" style={{ color: QUALITY_STYLE[review.quality].color }}>
                {QUALITY_STYLE[review.quality].emoji} {QUALITY_STYLE[review.quality].label}
              </span>
            )}
          </Coach>
          {review?.canUndo && canUndo && !result && (
            <button className="btn btn-sun lk-pop" onClick={undo}>
              ↩️ Take it back and try again
            </button>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button className="btn btn-sky" onClick={showHint} disabled={!myTurn || thinking || !bestMove || hint >= 2}>
              💡 Hint
            </button>
            <button className="btn btn-white" onClick={undo} disabled={!canUndo}>
              ↩️ Undo
            </button>
            {result ? (
              <button className="btn btn-mint" onClick={() => setShowEnd(true)}>
                🏁 Result
              </button>
            ) : (
              <button className="btn btn-white" onClick={() => setConfirm('resign')}>
                🏳️ Menu
              </button>
            )}
          </div>

          <div className="card max-h-64 overflow-y-auto p-3">
            <p className="mb-2 text-xs font-extrabold tracking-wider text-muted uppercase">Moves</p>
            {movePairs.length === 0 ? (
              <p className="text-sm font-semibold text-muted">No moves yet.</p>
            ) : (
              <ol className="grid grid-cols-[2rem_1fr_1fr] gap-x-2 gap-y-0.5 font-mono text-sm">
                {movePairs.map(([a, b], i) => (
                  <li key={i} className="contents">
                    <span className="text-muted">{i + 1}.</span>
                    <span className="font-bold">{a}</span>
                    <span className="font-bold">{b ?? ''}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>

      {/* Menu */}
      <Modal open={confirm === 'resign'} onClose={() => setConfirm(null)}>
        <h2 className="text-center font-display text-2xl font-extrabold">Game menu</h2>
        <div className="mt-5 flex flex-col gap-2">
          <button className="btn btn-white" onClick={() => { setConfirm(null); offerDraw(); }}>
            🤝 Offer a draw
          </button>
          <button className="btn btn-coral" onClick={() => { setConfirm(null); finish('loss', 'by resignation', game); }}>
            🏳️ Resign this game
          </button>
          <button className="btn btn-ghost" onClick={() => setConfirm(null)}>
            Keep playing
          </button>
        </div>
      </Modal>

      {/* Result */}
      <Modal open={showEnd && !!result} onClose={() => setShowEnd(false)}>
        {result && (
          <div className="text-center">
            <div className="flex items-end justify-center gap-2">
              <Mascot mood={result.outcome === 'win' ? 'cheer' : result.outcome === 'loss' ? 'sad' : 'happy'} size={90} />
              <span className="mb-4 text-6xl">{bot.emoji}</span>
            </div>
            <h2 className="mt-2 font-display text-4xl font-extrabold">{result.outcome === 'win' ? 'You won! 🏆' : result.outcome === 'loss' ? 'Good try!' : 'Draw! 🤝'}</h2>
            <p className="font-bold text-muted">{result.reason.charAt(0).toUpperCase() + result.reason.slice(1)}</p>
            <p className="mt-3 rounded-2xl bg-cream px-3 py-2 font-semibold italic">{bot.emoji} &ldquo;{botSays}&rdquo;</p>
            <div className="mt-4 flex justify-center gap-2">
              <span className="chip text-base">
                Rating {result.ratingChange >= 0 ? '+' : ''}
                {result.ratingChange}
              </span>
              <span className="chip text-base">⭐ +{result.outcome === 'win' ? 40 : result.outcome === 'draw' ? 25 : 15} XP</span>
            </div>
            {settings.coachTips && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm font-bold">
                <div className="rounded-2xl bg-mint-soft p-2">
                  <p className="font-display text-2xl text-mint-dark">{quality.best + quality.great}</p>great moves
                </div>
                <div className="rounded-2xl bg-sky-soft p-2">
                  <p className="font-display text-2xl text-sky-dark">{quality.good + quality.inaccuracy}</p>okay moves
                </div>
                <div className="rounded-2xl bg-coral-soft p-2">
                  <p className="font-display text-2xl text-coral-dark">{quality.mistake + quality.blunder}</p>oopsies
                </div>
              </div>
            )}
            <div className="mt-6 flex flex-col gap-2">
              <button className="btn btn-lg btn-mint" onClick={onRematch}>
                Play again
              </button>
              <button className="btn btn-white" onClick={onExit}>
                Choose another opponent
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
