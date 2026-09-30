import { Chess, Color, PieceSymbol, Square } from 'chess.js';
import { toUci } from '../chess-utils';

/**
 * Endless "checkmate practice" generator. Builds small, natural-looking
 * positions from templates, then proves with brute force that they contain a
 * forced mate — so every generated puzzle is guaranteed solvable.
 */

type RNG = () => number;

export function mulberry32(seed: number): RNG {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FILES = 'abcdefgh';
const sq = (f: number, r: number) => (FILES[f] + (r + 1)) as Square;
const ri = (rng: RNG, a: number, b: number) => a + Math.floor(rng() * (b - a + 1));

interface Placement {
  type: PieceSymbol;
  color: Color;
  square: Square;
}

/** Templates return a rough placement; validation happens afterwards. */
const templates: ((rng: RNG) => Placement[])[] = [
  // Back-rank: defending king boxed in by its own pawns, attacker has a rook/queen.
  (rng) => {
    const kf = ri(rng, 1, 6);
    const pcs: Placement[] = [{ type: 'k', color: 'b', square: sq(kf, 7) }];
    for (let f = kf - 1; f <= kf + 1; f++) if (rng() < 0.9) pcs.push({ type: 'p', color: 'b', square: sq(f, 6) });
    pcs.push({ type: rng() < 0.6 ? 'r' : 'q', color: 'w', square: sq(ri(rng, 0, 7), ri(rng, 0, 4)) });
    if (rng() < 0.5) pcs.push({ type: 'r', color: 'b', square: sq(ri(rng, 0, 7), ri(rng, 3, 7)) });
    if (rng() < 0.5) pcs.push({ type: 'r', color: 'w', square: sq(ri(rng, 0, 7), ri(rng, 0, 3)) });
    pcs.push({ type: 'k', color: 'w', square: sq(ri(rng, 0, 7), 0) });
    return pcs;
  },
  // King on the edge vs queen + king.
  (rng) => {
    const edge = rng() < 0.5;
    const kf = edge ? ri(rng, 0, 7) : 0;
    const kr = edge ? 7 : ri(rng, 0, 7);
    return [
      { type: 'k', color: 'b', square: sq(kf, kr) },
      { type: 'k', color: 'w', square: sq(Math.max(0, Math.min(7, kf + ri(rng, -2, 2))), Math.max(0, Math.min(7, kr - 2))) },
      { type: 'q', color: 'w', square: sq(ri(rng, 0, 7), ri(rng, 0, 7)) },
    ];
  },
  // Two rooks ladder.
  (rng) => [
    { type: 'k', color: 'b', square: sq(ri(rng, 0, 7), 7) },
    { type: 'r', color: 'w', square: sq(ri(rng, 0, 7), 6) },
    { type: 'r', color: 'w', square: sq(ri(rng, 0, 7), ri(rng, 0, 5)) },
    { type: 'k', color: 'w', square: sq(ri(rng, 0, 7), ri(rng, 0, 2)) },
  ],
  // Knight + friends in the corner (smothered-ish).
  (rng) => {
    const pcs: Placement[] = [
      { type: 'k', color: 'b', square: 'h8' },
      { type: 'n', color: 'w', square: sq(ri(rng, 3, 7), ri(rng, 3, 6)) },
      { type: 'k', color: 'w', square: sq(ri(rng, 0, 4), ri(rng, 0, 2)) },
    ];
    if (rng() < 0.8) pcs.push({ type: 'p', color: 'b', square: 'h7' });
    if (rng() < 0.8) pcs.push({ type: 'p', color: 'b', square: 'g7' });
    if (rng() < 0.6) pcs.push({ type: 'r', color: 'b', square: 'g8' });
    if (rng() < 0.6) pcs.push({ type: rng() < 0.5 ? 'q' : 'b', color: 'w', square: sq(ri(rng, 0, 7), ri(rng, 0, 7)) });
    return pcs;
  },
  // Queen + bishop battery at the castled king.
  (rng) => {
    const pcs: Placement[] = [
      { type: 'k', color: 'b', square: 'g8' },
      { type: 'p', color: 'b', square: 'f7' },
      { type: 'p', color: 'b', square: rng() < 0.5 ? 'g7' : 'g6' },
      { type: 'p', color: 'b', square: rng() < 0.5 ? 'h7' : 'h6' },
      { type: 'q', color: 'w', square: sq(ri(rng, 2, 7), ri(rng, 2, 5)) },
      { type: 'b', color: 'w', square: sq(ri(rng, 0, 5), ri(rng, 0, 4)) },
      { type: 'k', color: 'w', square: 'g1' },
    ];
    if (rng() < 0.5) pcs.push({ type: 'r', color: 'b', square: 'f8' });
    if (rng() < 0.4) pcs.push({ type: 'n', color: 'b', square: sq(ri(rng, 0, 7), ri(rng, 4, 7)) });
    return pcs;
  },
];

function toFen(pcs: Placement[], turn: Color): string | null {
  const board: (Placement | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (const p of pcs) {
    const f = FILES.indexOf(p.square[0]);
    const r = +p.square[1] - 1;
    if (board[r][f]) return null; // collision
    if (p.type === 'p' && (r === 0 || r === 7)) return null;
    board[r][f] = p;
  }
  const rows: string[] = [];
  for (let r = 7; r >= 0; r--) {
    let row = '';
    let empty = 0;
    for (let f = 0; f < 8; f++) {
      const p = board[r][f];
      if (!p) {
        empty++;
        continue;
      }
      if (empty) row += empty;
      empty = 0;
      row += p.color === 'w' ? p.type.toUpperCase() : p.type;
    }
    if (empty) row += empty;
    rows.push(row);
  }
  return `${rows.join('/')} ${turn} - - 0 1`;
}

/** All first moves that force mate in `n` (brute force; fine for tiny positions). */
export function forcedMates(game: Chess, n: number): string[] {
  const out: string[] = [];
  for (const m of game.moves({ verbose: true })) {
    game.move(m);
    if (matesIn(game, n - 1)) out.push(toUci(m));
    game.undo();
  }
  return out;
}

// After the attacker has moved: is the defender (to move) mated within `n` more attacker moves?
function matesIn(game: Chess, n: number): boolean {
  if (game.isCheckmate()) return true;
  if (n <= 0 || game.isGameOver()) return false;
  for (const reply of game.moves({ verbose: true })) {
    game.move(reply);
    let found = false;
    for (const m of game.moves({ verbose: true })) {
      game.move(m);
      const ok = matesIn(game, n - 1);
      game.undo();
      if (ok) {
        found = true;
        break;
      }
    }
    game.undo();
    if (!found) return false;
  }
  return true;
}

export interface GeneratedMate {
  fen: string;
  solution: string[]; // UCI line, attacker first
  mateIn: 1 | 2;
}

function lineFor(fen: string, mateIn: 1 | 2): string[] | null {
  const g = new Chess(fen);
  const first = forcedMates(g, mateIn);
  if (first.length !== 1) return null; // unique first move only
  if (mateIn === 1) return first;
  g.move({ from: first[0].slice(0, 2), to: first[0].slice(2, 4), promotion: first[0][4] || undefined });
  // Pick the defender's most stubborn reply (the one with the fewest mating answers).
  let best: { reply: string; finish: string } | null = null;
  let fewest = Infinity;
  for (const reply of g.moves({ verbose: true })) {
    g.move(reply);
    const finishes = forcedMates(g, 1);
    g.undo();
    if (finishes.length && finishes.length < fewest) {
      fewest = finishes.length;
      best = { reply: toUci(reply), finish: finishes[0] };
    }
  }
  return best ? [first[0], best.reply, best.finish] : null;
}

export function generateMate(mateIn: 1 | 2, seed = Math.floor(Math.random() * 2 ** 31)): GeneratedMate | null {
  const rng = mulberry32(seed);
  for (let attempt = 0; attempt < 400; attempt++) {
    const tpl = templates[Math.floor(rng() * templates.length)];
    let pcs = tpl(rng);
    // Randomly mirror left/right for variety.
    if (rng() < 0.5) pcs = pcs.map((p) => ({ ...p, square: sq(7 - FILES.indexOf(p.square[0]), +p.square[1] - 1) }));
    const fen = toFen(pcs, 'w');
    if (!fen) continue;
    let g: Chess;
    try {
      g = new Chess(fen);
    } catch {
      continue;
    }
    // Legality: the side not to move must not be in check; kings apart.
    const flipped = fen.replace(' w ', ' b ');
    try {
      if (new Chess(flipped).inCheck()) continue;
    } catch {
      continue;
    }
    if (g.isGameOver()) continue;
    // Avoid trivially giving mate-in-1 when asking for mate-in-2.
    if (mateIn === 2 && forcedMates(g, 1).length > 0) continue;
    const line = lineFor(fen, mateIn);
    if (line) return { fen, solution: line, mateIn };
  }
  return null;
}
