import { Chess, Color, PieceSymbol, Square } from 'chess.js';

export const PIECE_VALUE: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export const PIECE_NAME: Record<PieceSymbol, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

export const PIECE_GLYPH: Record<string, string> = {
  wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
  bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟',
};

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export function other(c: Color): Color {
  return c === 'w' ? 'b' : 'w';
}

export interface UciMove {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
}

export function parseUci(uci: string): UciMove {
  return {
    from: uci.slice(0, 2) as Square,
    to: uci.slice(2, 4) as Square,
    promotion: (uci[4] as PieceSymbol) || undefined,
  };
}

export function toUci(m: { from: string; to: string; promotion?: string }): string {
  return m.from + m.to + (m.promotion ?? '');
}

/** Safely try a move on a copy. Returns the new game or null. */
export function tryMove(fen: string, move: string | UciMove): Chess | null {
  try {
    const g = new Chess(fen);
    const m = typeof move === 'string' && /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move) ? parseUci(move) : move;
    const res = g.move(m);
    return res ? g : null;
  } catch {
    return null;
  }
}

export function uciToSan(fen: string, uci: string): string {
  try {
    const g = new Chess(fen);
    return g.move(parseUci(uci)).san;
  } catch {
    return uci;
  }
}

/** Material from `color`'s point of view (own − opponent). */
export function materialBalance(game: Chess, color: Color): number {
  let score = 0;
  for (const row of game.board()) {
    for (const p of row) {
      if (!p) continue;
      score += p.color === color ? PIECE_VALUE[p.type] : -PIECE_VALUE[p.type];
    }
  }
  return score;
}

/** Pieces captured so far, derived from the difference with a full army. */
export function capturedPieces(game: Chess): { w: PieceSymbol[]; b: PieceSymbol[] } {
  const full: Record<PieceSymbol, number> = { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 };
  const counts = { w: { ...full, k: 1 }, b: { ...full, k: 1 } } as Record<Color, Record<PieceSymbol, number>>;
  for (const row of game.board()) {
    for (const p of row) if (p) counts[p.color][p.type]--;
  }
  // captured.w = white pieces that were taken (shown next to black player)
  const order: PieceSymbol[] = ['q', 'r', 'b', 'n', 'p'];
  const out = { w: [] as PieceSymbol[], b: [] as PieceSymbol[] };
  for (const color of ['w', 'b'] as Color[]) {
    for (const t of order) {
      // promotions can push counts negative; clamp
      for (let i = 0; i < Math.max(0, counts[color][t]); i++) out[color].push(t);
    }
  }
  return out;
}

/** All squares attacked by `by` in the given position. */
export function attackersOf(game: Chess, square: Square, by: Color): Square[] {
  return game.attackers(square, by);
}

export interface HangingPiece {
  square: Square;
  type: PieceSymbol;
  color: Color;
  attackerType: PieceSymbol;
}

/**
 * Finds pieces of `color` that can be won: attacked and undefended, or attacked
 * by something cheaper. Kings are ignored.
 */
export function findHangingPieces(game: Chess, color: Color): HangingPiece[] {
  const res: HangingPiece[] = [];
  const opp = other(color);
  for (const row of game.board()) {
    for (const p of row) {
      if (!p || p.color !== color || p.type === 'k') continue;
      const attackers = game.attackers(p.square, opp);
      if (attackers.length === 0) continue;
      const defenders = game.attackers(p.square, color);
      const cheapest = attackers
        .map((sq) => game.get(sq)!)
        .filter(Boolean)
        .sort((a, b) => PIECE_VALUE[a.type] - PIECE_VALUE[b.type])[0];
      if (!cheapest) continue;
      if (defenders.length === 0 || PIECE_VALUE[cheapest.type] < PIECE_VALUE[p.type]) {
        res.push({ square: p.square, type: p.type, color: p.color, attackerType: cheapest.type });
      }
    }
  }
  return res.sort((a, b) => PIECE_VALUE[b.type] - PIECE_VALUE[a.type]);
}

/** Converts engine centipawns (side-to-move POV) into a 0..1 win chance. */
export function winChance(cp: number | null, mate: number | null): number {
  if (mate !== null && mate !== undefined) return mate > 0 ? 1 : 0;
  const v = cp ?? 0;
  return 1 / (1 + Math.exp(-0.00368208 * v));
}

export function kingSquare(game: Chess, color: Color): Square | null {
  for (const row of game.board()) for (const p of row) if (p && p.type === 'k' && p.color === color) return p.square;
  return null;
}
