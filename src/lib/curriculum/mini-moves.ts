/**
 * Movement rules for lesson mini-games (star hunts and "tap the squares").
 * These boards don't need kings, so chess.js can't be used here.
 */

export type Board = Record<string, string>; // square -> FEN piece letter

const FILES = 'abcdefgh';

export function parsePlacement(fen: string): Board {
  const board: Board = {};
  const rows = fen.split(' ')[0].split('/');
  rows.forEach((row, i) => {
    const rank = 8 - i;
    let file = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) file += +ch;
      else {
        board[FILES[file] + rank] = ch;
        file++;
      }
    }
  });
  return board;
}

export function toPlacement(board: Board): string {
  const rows: string[] = [];
  for (let rank = 8; rank >= 1; rank--) {
    let row = '';
    let empty = 0;
    for (let f = 0; f < 8; f++) {
      const p = board[FILES[f] + rank];
      if (!p) empty++;
      else {
        if (empty) row += empty;
        empty = 0;
        row += p;
      }
    }
    if (empty) row += empty;
    rows.push(row);
  }
  return rows.join('/');
}

const isWhite = (p: string) => p === p.toUpperCase();

function coords(sq: string): [number, number] {
  return [FILES.indexOf(sq[0]), +sq[1] - 1];
}
function name(f: number, r: number) {
  return f >= 0 && f < 8 && r >= 0 && r < 8 ? FILES[f] + (r + 1) : null;
}

const DIRS: Record<string, [number, number][]> = {
  r: [[1, 0], [-1, 0], [0, 1], [0, -1]],
  b: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
  q: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
};
const KNIGHT: [number, number][] = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
const KING = DIRS.q;

/** Squares the piece on `from` can move to (captures included). */
export function miniMoves(board: Board, from: string): string[] {
  const piece = board[from];
  if (!piece) return [];
  const white = isWhite(piece);
  const t = piece.toLowerCase();
  const [f, r] = coords(from);
  const out: string[] = [];
  const canLand = (s: string) => !board[s] || isWhite(board[s]) !== white;

  if (t === 'r' || t === 'b' || t === 'q') {
    for (const [df, dr] of DIRS[t]) {
      let nf = f + df;
      let nr = r + dr;
      let s = name(nf, nr);
      while (s) {
        if (board[s]) {
          if (isWhite(board[s]) !== white) out.push(s);
          break;
        }
        out.push(s);
        nf += df;
        nr += dr;
        s = name(nf, nr);
      }
    }
  } else if (t === 'n' || t === 'k') {
    for (const [df, dr] of t === 'n' ? KNIGHT : KING) {
      const s = name(f + df, r + dr);
      if (s && canLand(s)) out.push(s);
    }
  } else if (t === 'p') {
    const dir = white ? 1 : -1;
    const one = name(f, r + dir);
    if (one && !board[one]) {
      out.push(one);
      const startRank = white ? 1 : 6;
      const two = name(f, r + 2 * dir);
      if (r === startRank && two && !board[two]) out.push(two);
    }
    for (const df of [-1, 1]) {
      const s = name(f + df, r + dir);
      if (s && board[s] && isWhite(board[s]) !== white) out.push(s);
    }
  }
  return out;
}

/** Squares attacked by all pieces of the given colour (pawns attack diagonally). */
export function attackedBy(board: Board, white: boolean): Set<string> {
  const set = new Set<string>();
  for (const [sq, p] of Object.entries(board)) {
    if (isWhite(p) !== white) continue;
    if (p.toLowerCase() === 'p') {
      const [f, r] = coords(sq);
      const dir = white ? 1 : -1;
      for (const df of [-1, 1]) {
        const s = name(f + df, r + dir);
        if (s) set.add(s);
      }
    } else {
      // Treat every square as capturable so defended pieces count as guarded.
      const copy: Board = { ...board };
      for (const s of miniMovesRaw(copy, sq)) set.add(s);
    }
  }
  return set;
}

// Like miniMoves but includes squares occupied by own pieces (for "protection").
function miniMovesRaw(board: Board, from: string): string[] {
  const piece = board[from];
  const t = piece.toLowerCase();
  const [f, r] = coords(from);
  const out: string[] = [];
  if (t === 'r' || t === 'b' || t === 'q') {
    for (const [df, dr] of DIRS[t]) {
      let s = name(f + df, r + dr);
      let k = 1;
      while (s) {
        out.push(s);
        if (board[s]) break;
        k++;
        s = name(f + df * k, r + dr * k);
      }
    }
  } else if (t === 'n' || t === 'k') {
    for (const [df, dr] of t === 'n' ? KNIGHT : KING) {
      const s = name(f + df, r + dr);
      if (s) out.push(s);
    }
  }
  return out;
}

/** Fewest moves needed to collect all stars (BFS). Used to validate lessons. */
export function minMovesToCollect(fen: string, stars: string[], guarded = false, heroSq?: string): number {
  const board = parsePlacement(fen);
  const hero = heroSq ? ([heroSq, board[heroSq]] as const) : Object.entries(board).find(([, p]) => isWhite(p));
  if (!hero || !hero[1]) return Infinity;
  const start = { sq: hero[0], piece: hero[1], left: [...stars].sort() };
  const key = (s: typeof start) => `${s.sq}|${s.piece}|${s.left.join(',')}`;
  const seen = new Set([key(start)]);
  let frontier = [{ ...start, board }];
  for (let depth = 1; depth <= 30; depth++) {
    const next: typeof frontier = [];
    for (const st of frontier) {
      for (const to of miniMoves(st.board, st.sq)) {
        const b: Board = { ...st.board };
        let piece = b[st.sq];
        delete b[st.sq];
        if (piece === 'P' && to[1] === '8') piece = 'Q';
        b[to] = piece;
        if (guarded && attackedBy(b, false).has(to)) continue;
        const left = st.left.filter((s) => s !== to);
        if (left.length === 0) return depth;
        const s = { sq: to, piece, left, board: b };
        const k = key(s);
        if (!seen.has(k)) {
          seen.add(k);
          next.push(s);
        }
      }
    }
    frontier = next;
    if (!frontier.length) break;
  }
  return Infinity;
}
