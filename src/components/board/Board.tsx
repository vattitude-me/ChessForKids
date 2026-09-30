'use client';

import { useMemo, useState, useCallback, CSSProperties, ReactNode } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { useProgress, BOARD_THEMES } from '@/lib/progress';
import { kingSquare } from '@/lib/chess-utils';
import { sfx } from '@/lib/sounds';

export type BoardArrow = [string, string] | [string, string, string];
export type SquareMark = 'good' | 'bad' | 'hint' | 'target' | 'found';

export interface BoardProps {
  fen: string;
  orientation?: 'white' | 'black';
  /** Which colour the user may move ('w' | 'b'). null = board is read-only. */
  movable?: 'w' | 'b' | null;
  /** Custom move generator (mini-games). Defaults to chess.js legal moves. */
  legalMoves?: (square: string) => string[];
  /** Called with from/to (and promotion). Return false to reject the move. */
  onMove?: (from: string, to: string, promotion?: string) => boolean | void;
  /** Tap mode: every square click is forwarded here instead of moving pieces. */
  onSquareTap?: (square: string) => void;
  lastMove?: [string, string] | null;
  arrows?: BoardArrow[];
  highlights?: string[];
  marks?: Record<string, SquareMark>;
  stars?: string[];
  /** Squares that should wiggle (e.g. hint piece). */
  pulse?: string[];
  showCoords?: boolean;
  id?: string;
  className?: string;
  overlay?: ReactNode;
}

const PROMO_PIECES = ['q', 'r', 'b', 'n'] as const;
const PROMO_GLYPH: Record<string, [string, string]> = { q: ['♕', '♛'], r: ['♖', '♜'], b: ['♗', '♝'], n: ['♘', '♞'] };

function safeChess(fen: string): Chess | null {
  try {
    return new Chess(fen);
  } catch {
    return null;
  }
}

export default function Board({
  fen,
  orientation = 'white',
  movable = null,
  legalMoves,
  onMove,
  onSquareTap,
  lastMove,
  arrows = [],
  highlights = [],
  marks = {},
  stars = [],
  pulse = [],
  showCoords = true,
  id = 'lk-board',
  className = '',
  overlay,
}: BoardProps) {
  const theme = useProgress((s) => BOARD_THEMES[s.settings.boardTheme] ?? BOARD_THEMES.meadow);
  const showLegal = useProgress((s) => s.settings.showLegalMoves);
  const [selected, setSelected] = useState<string | null>(null);
  const [promo, setPromo] = useState<{ from: string; to: string; color: 'w' | 'b' } | null>(null);
  const [prevFen, setPrevFen] = useState(fen);

  // Reset selection whenever the position changes (render-time state adjustment).
  if (prevFen !== fen) {
    setPrevFen(fen);
    setSelected(null);
    setPromo(null);
  }

  const game = useMemo(() => safeChess(fen), [fen]);

  const pieceAt = useCallback(
    (sq: string): string | null => {
      if (game) {
        const p = game.get(sq as Square);
        return p ? p.color + p.type : null;
      }
      // Parse placement manually for king-less mini boards.
      const rows = fen.split(' ')[0].split('/');
      const rank = 8 - +sq[1];
      const fileIdx = sq.charCodeAt(0) - 97;
      let f = 0;
      for (const ch of rows[rank] ?? '') {
        if (/\d/.test(ch)) f += +ch;
        else {
          if (f === fileIdx) return (ch === ch.toUpperCase() ? 'w' : 'b') + ch.toLowerCase();
          f++;
        }
      }
      return null;
    },
    [game, fen],
  );

  const destinations = useCallback(
    (sq: string): string[] => {
      if (legalMoves) return legalMoves(sq);
      if (!game) return [];
      return game.moves({ square: sq as Square, verbose: true }).map((m) => m.to);
    },
    [legalMoves, game],
  );

  const canPick = useCallback(
    (sq: string) => {
      if (!movable || onSquareTap) return false;
      const p = pieceAt(sq);
      if (!p || p[0] !== movable) return false;
      if (game && !legalMoves && game.turn() !== movable) return false;
      return destinations(sq).length > 0;
    },
    [movable, onSquareTap, pieceAt, game, legalMoves, destinations],
  );

  const attempt = useCallback(
    (from: string, to: string): boolean => {
      if (!onMove) return false;
      if (!destinations(from).includes(to)) return false;
      const p = pieceAt(from);
      if (game && !legalMoves && p && p[1] === 'p' && (to[1] === '8' || to[1] === '1')) {
        setPromo({ from, to, color: p[0] as 'w' | 'b' });
        setSelected(null);
        return false;
      }
      setSelected(null);
      const res = onMove(from, to);
      return res !== false;
    },
    [onMove, destinations, pieceAt, game, legalMoves],
  );

  const handleSquareClick = useCallback(
    ({ square }: { square: string }) => {
      if (onSquareTap) {
        onSquareTap(square);
        return;
      }
      if (promo) return;
      if (selected && selected !== square && destinations(selected).includes(square)) {
        attempt(selected, square);
        return;
      }
      if (canPick(square)) {
        setSelected(square === selected ? null : square);
        sfx.select();
      } else {
        setSelected(null);
      }
    },
    [onSquareTap, promo, selected, destinations, attempt, canPick],
  );

  const handleDrop = useCallback(
    ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) => {
      if (!targetSquare || sourceSquare === targetSquare) return false;
      return attempt(sourceSquare, targetSquare);
    },
    [attempt],
  );

  const targets = useMemo(() => (selected ? destinations(selected) : []), [selected, destinations]);
  const checkSq = useMemo(() => (game && game.inCheck() ? kingSquare(game, game.turn()) : null), [game]);

  const squareRenderer = useCallback(
    ({ square, children }: { square: string; children?: ReactNode }) => {
      const style: CSSProperties = { width: '100%', height: '100%', position: 'relative' };
      const layers: CSSProperties[] = [];
      if (lastMove && (lastMove[0] === square || lastMove[1] === square)) layers.push({ background: 'rgba(255, 214, 10, 0.42)' });
      if (highlights.includes(square)) layers.push({ background: 'rgba(76, 154, 255, 0.45)' });
      if (selected === square) layers.push({ background: 'rgba(255, 196, 0, 0.6)' });
      const mark = marks[square];
      if (mark === 'good') layers.push({ background: 'rgba(31, 184, 106, 0.55)' });
      if (mark === 'found') layers.push({ background: 'rgba(255, 200, 61, 0.7)', boxShadow: 'inset 0 0 0 3px rgba(222, 162, 26, 0.9)' });
      if (mark === 'bad') layers.push({ background: 'rgba(229, 72, 77, 0.55)' });
      if (mark === 'hint') layers.push({ background: 'rgba(140, 124, 240, 0.55)' });
      if (checkSq === square) layers.push({ background: 'radial-gradient(circle, rgba(255,40,40,0.9) 0%, rgba(255,40,40,0.5) 40%, rgba(255,40,40,0) 75%)' });
      const isTarget = showLegal && targets.includes(square);
      const occupied = !!pieceAt(square);
      return (
        <div style={style} className={pulse.includes(square) ? 'lk-pulse' : undefined}>
          {layers.map((l, i) => (
            <div key={i} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...l }} />
          ))}
          {stars.includes(square) && !occupied && (
            <div className="lk-star" aria-label="star">⭐</div>
          )}
          {stars.includes(square) && occupied && <div className="lk-star-ring" />}
          {mark === 'target' && <div className="lk-target" />}
          {children}
          {isTarget && (occupied ? <div className="lk-capture-ring" /> : <div className="lk-dot" />)}
        </div>
      );
    },
    [lastMove, highlights, selected, marks, checkSq, showLegal, targets, pieceAt, stars, pulse],
  );

  const options = useMemo(
    () => ({
      id,
      position: fen.split(' ')[0],
      boardOrientation: orientation,
      showNotation: showCoords,
      animationDurationInMs: 220,
      allowDragging: !!movable && !onSquareTap,
      canDragPiece: ({ square }: { square: string | null }) => !!square && canPick(square),
      onPieceDrop: handleDrop,
      onSquareClick: handleSquareClick,
      onPieceClick: ({ square }: { square: string | null }) => square && handleSquareClick({ square }),
      squareRenderer,
      arrows: arrows.map(([a, b, c]) => ({ startSquare: a, endSquare: b, color: c ?? 'rgba(255, 140, 0, 0.85)' })),
      allowDrawingArrows: false,
      darkSquareStyle: { backgroundColor: theme.dark },
      lightSquareStyle: { backgroundColor: theme.light },
      darkSquareNotationStyle: { color: theme.light, fontWeight: 700 },
      lightSquareNotationStyle: { color: theme.dark, fontWeight: 700 },
      boardStyle: { borderRadius: '14px', overflow: 'hidden' },
    }),
    [id, fen, orientation, showCoords, movable, onSquareTap, canPick, handleDrop, handleSquareClick, squareRenderer, arrows, theme],
  );

  return (
    <div className={`lk-board relative w-full select-none ${className}`}>
      <Chessboard options={options} />
      {promo && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[14px] bg-black/35 backdrop-blur-[2px]">
          <div className="lk-pop rounded-2xl bg-white p-4 shadow-xl">
            <p className="mb-3 text-center font-display text-lg font-bold text-ink">Choose your new piece!</p>
            <div className="flex gap-2">
              {PROMO_PIECES.map((p) => (
                <button
                  key={p}
                  className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-line bg-cream text-5xl leading-none transition hover:scale-110 hover:border-primary"
                  onClick={() => {
                    const pr = promo;
                    setPromo(null);
                    onMove?.(pr.from, pr.to, p);
                  }}
                  aria-label={`Promote to ${p}`}
                >
                  {PROMO_GLYPH[p][promo.color === 'w' ? 0 : 1]}
                </button>
              ))}
            </div>
            <button className="mt-3 w-full text-sm font-semibold text-muted" onClick={() => setPromo(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {overlay}
    </div>
  );
}
