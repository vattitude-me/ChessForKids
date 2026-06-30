import { Chess } from 'chess.js';
import { Puzzle } from './puzzle-generator';

type RNG = () => number;

function mulberry32(seed: number): RNG {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getDaySeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function shuffle<T>(arr: T[], rng: RNG): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pick<T>(arr: T[], rng: RNG): T {
  return arr[Math.floor(rng() * arr.length)];
}

function randInt(min: number, max: number, rng: RNG): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Validate a mate-in-2: White plays move1, then for ALL Black replies,
 * White has a mating response. Returns the solution [move1, ...possible_mates]
 * or null if no unique forced mate-in-2 exists.
 */
function validateMateIn2(fen: string): string[] | null {
  try {
    const game = new Chess(fen);
    if (game.isGameOver()) return null;

    const whiteMoves = game.moves({ verbose: true });
    const solutions: string[][] = [];

    for (const wMove of whiteMoves) {
      game.move(wMove);

      if (game.isCheckmate()) {
        game.undo();
        continue; // That's a mate-in-1, not mate-in-2
      }

      if (game.isGameOver()) {
        game.undo();
        continue;
      }

      const blackResponses = game.moves({ verbose: true });
      if (blackResponses.length === 0) {
        game.undo();
        continue;
      }

      let allBlackResponsesHaveMate = true;
      const matingMoves: string[] = [];

      for (const bMove of blackResponses) {
        game.move(bMove);
        const whiteMates = game.moves({ verbose: true });
        let foundMate = false;

        for (const w2 of whiteMates) {
          game.move(w2);
          if (game.isCheckmate()) {
            foundMate = true;
            matingMoves.push(w2.san);
            game.undo();
            break;
          }
          game.undo();
        }

        game.undo(); // undo black move

        if (!foundMate) {
          allBlackResponsesHaveMate = false;
          break;
        }
      }

      game.undo(); // undo white move

      if (allBlackResponsesHaveMate) {
        solutions.push([wMove.san, ...matingMoves]);
      }
    }

    // Exactly one first move should force mate-in-2
    if (solutions.length === 1) {
      return solutions[0];
    }
    return null;
  } catch {
    return null;
  }
}

function isLegalFen(fen: string): boolean {
  try {
    new Chess(fen);
    return true;
  } catch {
    return false;
  }
}

function isAdjacent(f1: number, r1: number, f2: number, r2: number): boolean {
  return Math.abs(f1 - f2) <= 1 && Math.abs(r1 - r2) <= 1;
}

function boardToFen(board: (string | null)[][], turn: 'w' | 'b'): string {
  const rows: string[] = [];
  for (let r = 7; r >= 0; r--) {
    let row = '';
    let empty = 0;
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (piece === null) {
        empty++;
      } else {
        if (empty > 0) { row += empty; empty = 0; }
        row += piece;
      }
    }
    if (empty > 0) row += empty;
    rows.push(row);
  }
  return rows.join('/') + ` ${turn} - - 0 1`;
}

interface MateIn2Pattern {
  name: string;
  hint: string;
  generate: (rng: RNG) => { fen: string; solution: string[] } | null;
}

/**
 * Generate a sparse board with: White King + Queen + Rook + 3 pawns,
 * Black King + 3 pawns. The constraint ensures beginner-friendly positions.
 */
function generateSparsePosition(rng: RNG): { fen: string; solution: string[] } | null {
  const board: (string | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));

  // Place black king (prefer edges/corners for easier mates)
  const bkEdge = rng() > 0.3;
  let bkf: number, bkr: number;
  if (bkEdge) {
    const edge = randInt(0, 3, rng);
    switch (edge) {
      case 0: bkf = randInt(0, 7, rng); bkr = 7; break;
      case 1: bkf = randInt(0, 7, rng); bkr = 0; break;
      case 2: bkf = 0; bkr = randInt(1, 6, rng); break;
      default: bkf = 7; bkr = randInt(1, 6, rng); break;
    }
  } else {
    bkf = randInt(1, 6, rng);
    bkr = randInt(5, 7, rng);
  }
  board[bkr][bkf] = 'k';

  // Place white king (not adjacent, reasonable distance)
  let wkf: number, wkr: number;
  let attempts = 0;
  do {
    wkf = randInt(0, 7, rng);
    wkr = randInt(0, 7, rng);
    attempts++;
    if (attempts > 50) return null;
  } while (
    isAdjacent(wkf, wkr, bkf, bkr) ||
    (wkf === bkf && wkr === bkr) ||
    Math.abs(wkf - bkf) + Math.abs(wkr - bkr) < 2
  );
  board[wkr][wkf] = 'K';

  // Place White Queen
  let qf: number, qr: number;
  attempts = 0;
  do {
    qf = randInt(0, 7, rng);
    qr = randInt(0, 7, rng);
    attempts++;
    if (attempts > 50) return null;
  } while (board[qr][qf] !== null);
  board[qr][qf] = 'Q';

  // Place White Rook
  let rf: number, rr: number;
  attempts = 0;
  do {
    rf = randInt(0, 7, rng);
    rr = randInt(0, 7, rng);
    attempts++;
    if (attempts > 50) return null;
  } while (board[rr][rf] !== null);
  board[rr][rf] = 'R';

  // Place 3 White pawns (ranks 2-6 to avoid promotion issues)
  for (let i = 0; i < 3; i++) {
    attempts = 0;
    let pf: number, pr: number;
    do {
      pf = randInt(0, 7, rng);
      pr = randInt(1, 5, rng);
      attempts++;
      if (attempts > 50) return null;
    } while (board[pr][pf] !== null);
    board[pr][pf] = 'P';
  }

  // Place 3 Black pawns (ranks 2-6)
  for (let i = 0; i < 3; i++) {
    attempts = 0;
    let pf: number, pr: number;
    do {
      pf = randInt(0, 7, rng);
      pr = randInt(2, 6, rng);
      attempts++;
      if (attempts > 50) return null;
    } while (board[pr][pf] !== null);
    board[pr][pf] = 'p';
  }

  const fen = boardToFen(board, 'w');
  if (!isLegalFen(fen)) return null;

  const solution = validateMateIn2(fen);
  if (solution) return { fen, solution };
  return null;
}

/**
 * Pattern: Queen + Rook battery on a file/rank with king on edge.
 * White's first move sets up the mate threat, forcing Black's hand.
 */
function generateBatteryMateIn2(rng: RNG): { fen: string; solution: string[] } | null {
  const board: (string | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));

  // Black king on back rank
  const bkf = randInt(1, 6, rng);
  const bkr = 7;
  board[bkr][bkf] = 'k';

  // Black pawns forming a partial shield
  const pawnPositions: [number, number][] = [];
  for (let f = Math.max(0, bkf - 1); f <= Math.min(7, bkf + 1); f++) {
    if (rng() > 0.3) {
      board[6][f] = 'p';
      pawnPositions.push([f, 6]);
    }
  }
  // Ensure exactly 3 black pawns
  while (pawnPositions.length < 3) {
    const f = randInt(0, 7, rng);
    const r = randInt(4, 6, rng);
    if (board[r][f] === null) {
      board[r][f] = 'p';
      pawnPositions.push([f, r]);
    }
  }
  while (pawnPositions.length > 3) {
    const [pf, pr] = pawnPositions.pop()!;
    board[pr][pf] = null;
  }

  // White king far away
  const wkr = randInt(0, 2, rng);
  const wkf = randInt(0, 7, rng);
  if (board[wkr][wkf] !== null || isAdjacent(wkf, wkr, bkf, bkr)) return null;
  board[wkr][wkf] = 'K';

  // White Queen and Rook on different files/ranks
  let qf: number, qr: number, rf2: number, rr2: number;
  let attempts = 0;
  do {
    qf = randInt(0, 7, rng);
    qr = randInt(0, 5, rng);
    attempts++;
    if (attempts > 30) return null;
  } while (board[qr][qf] !== null);
  board[qr][qf] = 'Q';

  attempts = 0;
  do {
    rf2 = randInt(0, 7, rng);
    rr2 = randInt(0, 5, rng);
    attempts++;
    if (attempts > 30) return null;
  } while (board[rr2][rf2] !== null);
  board[rr2][rf2] = 'R';

  // 3 White pawns
  for (let i = 0; i < 3; i++) {
    attempts = 0;
    let pf: number, pr: number;
    do {
      pf = randInt(0, 7, rng);
      pr = randInt(1, 4, rng);
      attempts++;
      if (attempts > 30) return null;
    } while (board[pr][pf] !== null);
    board[pr][pf] = 'P';
  }

  const fen = boardToFen(board, 'w');
  if (!isLegalFen(fen)) return null;

  const solution = validateMateIn2(fen);
  if (solution) return { fen, solution };
  return null;
}

/**
 * Pattern: King cornered with restricting pawns, Q+R coordinate for mate.
 */
function generateCornerMateIn2(rng: RNG): { fen: string; solution: string[] } | null {
  const board: (string | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));

  // Black king in a corner region
  const corner = randInt(0, 3, rng);
  let bkf: number, bkr: number;
  switch (corner) {
    case 0: bkf = randInt(0, 1, rng); bkr = randInt(6, 7, rng); break;
    case 1: bkf = randInt(6, 7, rng); bkr = randInt(6, 7, rng); break;
    case 2: bkf = randInt(0, 1, rng); bkr = randInt(0, 1, rng); break;
    default: bkf = randInt(6, 7, rng); bkr = randInt(0, 1, rng); break;
  }
  board[bkr][bkf] = 'k';

  // White king at a distance
  let wkf: number, wkr: number, attempts = 0;
  do {
    wkf = randInt(2, 5, rng);
    wkr = randInt(2, 5, rng);
    attempts++;
    if (attempts > 30) return null;
  } while (isAdjacent(wkf, wkr, bkf, bkr));
  board[wkr][wkf] = 'K';

  // Place Q and R
  attempts = 0;
  let qf: number, qr: number;
  do {
    qf = randInt(0, 7, rng);
    qr = randInt(0, 7, rng);
    attempts++;
    if (attempts > 30) return null;
  } while (board[qr][qf] !== null);
  board[qr][qf] = 'Q';

  attempts = 0;
  let rf: number, rr: number;
  do {
    rf = randInt(0, 7, rng);
    rr = randInt(0, 7, rng);
    attempts++;
    if (attempts > 30) return null;
  } while (board[rr][rf] !== null);
  board[rr][rf] = 'R';

  // 3 black pawns near king to restrict movement
  let bpCount = 0;
  for (let df = -1; df <= 1 && bpCount < 3; df++) {
    for (let dr = -1; dr <= 1 && bpCount < 3; dr++) {
      if (df === 0 && dr === 0) continue;
      const nf = bkf + df, nr = bkr + dr;
      if (nf < 0 || nf > 7 || nr < 0 || nr > 7) continue;
      if (board[nr][nf] !== null) continue;
      if (nr === 0 || nr === 7) continue; // avoid pawns on first/last rank
      if (rng() > 0.5) {
        board[nr][nf] = 'p';
        bpCount++;
      }
    }
  }
  // Fill remaining black pawns
  while (bpCount < 3) {
    const f = randInt(0, 7, rng);
    const r = randInt(2, 6, rng);
    if (board[r][f] === null) {
      board[r][f] = 'p';
      bpCount++;
    }
  }

  // 3 white pawns
  for (let i = 0; i < 3; i++) {
    attempts = 0;
    let pf: number, pr: number;
    do {
      pf = randInt(0, 7, rng);
      pr = randInt(1, 5, rng);
      attempts++;
      if (attempts > 30) return null;
    } while (board[pr][pf] !== null);
    board[pr][pf] = 'P';
  }

  const fen = boardToFen(board, 'w');
  if (!isLegalFen(fen)) return null;

  const solution = validateMateIn2(fen);
  if (solution) return { fen, solution };
  return null;
}

const mateIn2Patterns: MateIn2Pattern[] = [
  {
    name: 'Queen & Rook Squeeze',
    hint: 'Use your queen and rook together to trap the king — one move sets it up!',
    generate: generateSparsePosition,
  },
  {
    name: 'Battery Attack',
    hint: 'Line up your heavy pieces — the first move creates an unstoppable threat!',
    generate: generateBatteryMateIn2,
  },
  {
    name: 'Corner Trap',
    hint: 'The king is near the corner — force it in, then finish!',
    generate: generateCornerMateIn2,
  },
];

function generateSingleMateIn2(rng: RNG, seenFens: Set<string>, maxAttempts = 100): Puzzle | null {
  const patterns = shuffle([...mateIn2Patterns], rng);

  for (const pattern of patterns) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = pattern.generate(rng);
      if (result && !seenFens.has(result.fen)) {
        seenFens.add(result.fen);
        return {
          id: 'puzzle_' + Math.random().toString(36).substring(2, 10),
          fen: result.fen,
          solution: result.solution,
          theme: 'mate_in_2',
          difficulty: 1,
          title: pattern.name,
          hint: pattern.hint,
          description: 'Deliver checkmate in two moves!',
        };
      }
    }
  }
  return null;
}

/**
 * Generate `count` unique mate-in-2 puzzles.
 * Each position: White has K + Q + R + 3P, Black has K + 3P.
 * All validated to have exactly one forced mate-in-2 sequence.
 */
export function generateMateIn2Puzzles(count: number, seed?: number): Puzzle[] {
  const rng = mulberry32(seed ?? Math.floor(Math.random() * 2147483647));
  const seenFens = new Set<string>();
  const puzzles: Puzzle[] = [];

  let safetyCounter = 0;
  const maxIterations = count * 500;

  while (puzzles.length < count && safetyCounter < maxIterations) {
    safetyCounter++;
    const puzzle = generateSingleMateIn2(rng, seenFens, 20);
    if (puzzle) {
      puzzles.push(puzzle);
    }
  }

  return puzzles;
}

/**
 * Generate daily mate-in-2 puzzles — same puzzles all day, different each day.
 */
export function generateDailyMateIn2Puzzles(count: number): Puzzle[] {
  const seed = getDaySeed();
  return generateMateIn2Puzzles(count, seed).map(p => ({
    ...p,
    title: `Daily: ${p.title}`,
  }));
}

export { validateMateIn2 };
