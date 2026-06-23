import { Chess } from 'chess.js';
import { Puzzle } from './puzzle-generator';

// Seeded PRNG for reproducible "daily" puzzles
function mulberry32(seed: number) {
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

type RNG = () => number;

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

function sq(file: number, rank: number): string {
  return FILES[file] + RANKS[rank];
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

interface MatePattern {
  name: string;
  hint: string;
  generate: (rng: RNG) => { fen: string; solution: string } | null;
}

// Validate a position: must have exactly the stated side to move able to deliver checkmate in 1
function validateMateIn1(fen: string): string | null {
  try {
    const game = new Chess(fen);
    if (game.isGameOver()) return null;

    const moves = game.moves({ verbose: true });
    const mateMoves = moves.filter(m => {
      game.move(m);
      const isMate = game.isCheckmate();
      game.undo();
      return isMate;
    });

    if (mateMoves.length === 1) {
      return mateMoves[0].san;
    }
    return null;
  } catch {
    return null;
  }
}

// Validate a FEN is legal (no impossible positions)
function isLegalFen(fen: string): boolean {
  try {
    new Chess(fen);
    return true;
  } catch {
    return false;
  }
}

// Check if a square is adjacent to another
function isAdjacent(f1: number, r1: number, f2: number, r2: number): boolean {
  return Math.abs(f1 - f2) <= 1 && Math.abs(r1 - r2) <= 1;
}

// Generate back rank mate: Rook or Queen delivers mate on 8th rank, king trapped by own pawns
function generateBackRankMate(rng: RNG): { fen: string; solution: string } | null {
  const kingFile = randInt(1, 2, rng) === 1 ? randInt(5, 7, rng) : randInt(0, 2, rng);
  const kingRank = 7; // Black king on 8th rank

  // Pawn shield trapping the king
  const pawnFiles: number[] = [];
  for (let f = Math.max(0, kingFile - 1); f <= Math.min(7, kingFile + 1); f++) {
    pawnFiles.push(f);
  }

  // White rook delivers mate from an open file
  const openFiles = [0, 1, 2, 3, 4, 5, 6, 7].filter(f => !pawnFiles.includes(f) || rng() > 0.5);
  if (openFiles.length === 0) return null;
  const rookFile = pick(openFiles, rng);
  const rookRank = randInt(0, 5, rng); // Rook somewhere on lower ranks

  // White king somewhere safe
  const wKingFile = randInt(0, 7, rng);
  const wKingRank = randInt(0, 1, rng);
  if (isAdjacent(wKingFile, wKingRank, kingFile, kingRank)) return null;

  // Build the position
  const board: (string | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
  board[kingRank][kingFile] = 'k';
  board[wKingRank][wKingFile] = 'K';
  board[rookRank][rookFile] = rng() > 0.5 ? 'R' : 'R';

  // Place black pawns on 7th rank to trap king
  for (const f of pawnFiles) {
    if (board[6][f] === null && !(f === rookFile && 6 === rookRank)) {
      board[6][f] = 'p';
    }
  }

  const fen = boardToFen(board, 'w');
  if (!isLegalFen(fen)) return null;

  const solution = validateMateIn1(fen);
  if (solution) return { fen, solution };
  return null;
}

// Queen + King mate: Queen delivers checkmate with king support
function generateQueenKingMate(rng: RNG): { fen: string; solution: string } | null {
  // Black king on edge
  const edge = randInt(0, 3, rng);
  let kf: number, kr: number;
  switch (edge) {
    case 0: kf = randInt(0, 7, rng); kr = 7; break; // top
    case 1: kf = randInt(0, 7, rng); kr = 0; break; // bottom
    case 2: kf = 0; kr = randInt(0, 7, rng); break; // left
    default: kf = 7; kr = randInt(0, 7, rng); break; // right
  }

  // White king must be close enough to support
  const wkf = kf + randInt(-2, 2, rng);
  const wkr = kr + (edge === 0 ? -2 : edge === 1 ? 2 : randInt(-2, 2, rng));
  if (wkf < 0 || wkf > 7 || wkr < 0 || wkr > 7) return null;
  if (isAdjacent(wkf, wkr, kf, kr)) return null;
  if (wkf === kf && wkr === kr) return null;

  // Try queen positions that can deliver mate
  const board: (string | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
  board[kr][kf] = 'k';
  board[wkr][wkf] = 'K';

  // Place queen on a random square (it will move to deliver mate)
  const queenSquares: [number, number][] = [];
  for (let f = 0; f < 8; f++) {
    for (let r = 0; r < 8; r++) {
      if (board[r][f] !== null) continue;
      if (f === kf && r === kr) continue;
      if (f === wkf && r === wkr) continue;
      queenSquares.push([f, r]);
    }
  }

  const shuffled = shuffle(queenSquares, rng);
  for (const [qf, qr] of shuffled.slice(0, 15)) {
    const b2 = board.map(row => [...row]);
    b2[qr][qf] = 'Q';
    const fen = boardToFen(b2, 'w');
    if (!isLegalFen(fen)) continue;
    const solution = validateMateIn1(fen);
    if (solution) return { fen, solution };
  }
  return null;
}

// Rook + King mate on edge
function generateRookKingMate(rng: RNG): { fen: string; solution: string } | null {
  // Black king on edge file or rank
  const onRank = rng() > 0.5;
  let kf: number, kr: number;
  if (onRank) {
    kr = rng() > 0.5 ? 7 : 0;
    kf = randInt(1, 6, rng);
  } else {
    kf = rng() > 0.5 ? 7 : 0;
    kr = randInt(1, 6, rng);
  }

  // White king controls escape squares
  let wkf: number, wkr: number;
  if (onRank) {
    wkf = kf;
    wkr = kr === 7 ? 5 : 2;
  } else {
    wkr = kr;
    wkf = kf === 7 ? 5 : 2;
  }
  if (wkf < 0 || wkf > 7 || wkr < 0 || wkr > 7) return null;

  const board: (string | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
  board[kr][kf] = 'k';
  board[wkr][wkf] = 'K';

  // Try placing rook to deliver mate
  const rookSquares: [number, number][] = [];
  for (let f = 0; f < 8; f++) {
    for (let r = 0; r < 8; r++) {
      if (board[r][f] !== null) continue;
      rookSquares.push([f, r]);
    }
  }

  const shuffled = shuffle(rookSquares, rng);
  for (const [rf, rr] of shuffled.slice(0, 20)) {
    const b2 = board.map(row => [...row]);
    b2[rr][rf] = 'R';
    const fen = boardToFen(b2, 'w');
    if (!isLegalFen(fen)) continue;
    const solution = validateMateIn1(fen);
    if (solution) return { fen, solution };
  }
  return null;
}

// Scholar's mate style: Queen threatens f7/f2 with bishop support
function generateScholarMateStyle(rng: RNG): { fen: string; solution: string } | null {
  const templates = [
    // Queen can take on f7 with bishop on c4 supporting
    'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
    'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
    'r1bqkb1r/pppp1ppp/2n5/4p2Q/2B1Pn2/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
    // Fool's mate style
    'rnbqkbnr/pppp1p1p/8/4p1p1/4P3/5P1Q/PPPP2PP/RNB1KBNR w KQkq - 0 1',
  ];

  // Modify a template slightly
  const template = pick(templates, rng);
  const game = new Chess(template);
  const moves = game.moves({ verbose: true });
  const mateMoves = moves.filter(m => {
    game.move(m);
    const isMate = game.isCheckmate();
    game.undo();
    return isMate;
  });

  if (mateMoves.length === 1) {
    return { fen: template, solution: mateMoves[0].san };
  }
  return null;
}

// Two rook / queen-rook mate patterns
function generateHeavyPieceMate(rng: RNG): { fen: string; solution: string } | null {
  const kr = rng() > 0.5 ? 7 : 0;
  const kf = randInt(1, 6, rng);

  // King trapped by rank control
  const board: (string | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
  board[kr][kf] = 'k';

  // White king far away
  const wkr = kr === 7 ? randInt(0, 2, rng) : randInt(5, 7, rng);
  const wkf = randInt(0, 7, rng);
  board[wkr][wkf] = 'K';

  // One rook/queen controls the adjacent rank, another delivers mate
  const controlRank = kr === 7 ? 6 : 1;
  const controlFile = randInt(0, 7, rng);
  if (board[controlRank][controlFile] !== null) return null;
  board[controlRank][controlFile] = rng() > 0.5 ? 'R' : 'Q';

  // Attacking piece delivers mate on king's rank
  const attackSquares: [number, number][] = [];
  for (let f = 0; f < 8; f++) {
    if (f === kf) continue;
    if (board[kr][f] !== null) continue;
    attackSquares.push([f, kr]);
  }

  // Try attacking from different files on a lower rank
  const sourceSquares: [number, number][] = [];
  for (let f = 0; f < 8; f++) {
    for (let r = 0; r < 8; r++) {
      if (board[r][f] !== null) continue;
      if (r === kr) continue;
      sourceSquares.push([f, r]);
    }
  }

  const shuffled = shuffle(sourceSquares, rng);
  for (const [sf, sr] of shuffled.slice(0, 15)) {
    const b2 = board.map(row => [...row]);
    b2[sr][sf] = rng() > 0.3 ? 'R' : 'Q';
    const fen = boardToFen(b2, 'w');
    if (!isLegalFen(fen)) continue;
    const solution = validateMateIn1(fen);
    if (solution) return { fen, solution };
  }
  return null;
}

// Knight + other pieces mate (smothered-style)
function generateKnightMate(rng: RNG): { fen: string; solution: string } | null {
  // King in corner with own pieces blocking
  const corner = randInt(0, 3, rng);
  let kf: number, kr: number;
  switch (corner) {
    case 0: kf = 0; kr = 7; break;
    case 1: kf = 7; kr = 7; break;
    case 2: kf = 7; kr = 0; break;
    default: kf = 0; kr = 0; break;
  }

  const board: (string | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
  board[kr][kf] = 'k';

  // Block escape with own pieces (pawns/rook)
  const adj: [number, number][] = [];
  for (let df = -1; df <= 1; df++) {
    for (let dr = -1; dr <= 1; dr++) {
      if (df === 0 && dr === 0) continue;
      const nf = kf + df, nr = kr + dr;
      if (nf >= 0 && nf <= 7 && nr >= 0 && nr <= 7) {
        adj.push([nf, nr]);
      }
    }
  }

  // Place some black pieces to block king
  for (const [af, ar] of adj) {
    if (rng() > 0.4) {
      board[ar][af] = pick(['p', 'r', 'n', 'b'], rng);
    }
  }

  // White king far away
  const wkr = kr >= 4 ? randInt(0, 2, rng) : randInt(5, 7, rng);
  const wkf = kf >= 4 ? randInt(0, 3, rng) : randInt(4, 7, rng);
  if (board[wkr][wkf] !== null) return null;
  board[wkr][wkf] = 'K';

  // Knight L-shape squares from king
  const knightTargets: [number, number][] = [];
  const knightOffsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  for (const [df, dr] of knightOffsets) {
    const nf = kf + df, nr = kr + dr;
    if (nf >= 0 && nf <= 7 && nr >= 0 && nr <= 7 && board[nr][nf] === null) {
      knightTargets.push([nf, nr]);
    }
  }

  // Try placing knight on a non-target square so it can jump to target
  for (const [tf, tr] of shuffle(knightTargets, rng)) {
    // Knight must come FROM somewhere
    for (const [df, dr] of shuffle(knightOffsets, rng)) {
      const sf = tf + df, sr = tr + dr;
      if (sf < 0 || sf > 7 || sr < 0 || sr > 7) continue;
      if (board[sr][sf] !== null) continue;
      const b2 = board.map(row => [...row]);
      b2[sr][sf] = 'N';
      const fen = boardToFen(b2, 'w');
      if (!isLegalFen(fen)) continue;
      const solution = validateMateIn1(fen);
      if (solution) return { fen, solution };
    }
  }
  return null;
}

// Bishop + other piece mate (diagonal checkmate)
function generateBishopAssistMate(rng: RNG): { fen: string; solution: string } | null {
  // King on edge
  const kr = rng() > 0.5 ? 7 : 0;
  const kf = randInt(0, 7, rng);

  const board: (string | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
  board[kr][kf] = 'k';

  // Pawns blocking king
  const pawnRank = kr === 7 ? 6 : 1;
  for (let f = Math.max(0, kf - 1); f <= Math.min(7, kf + 1); f++) {
    board[pawnRank][f] = 'p';
  }

  // White king
  const wkr = kr === 7 ? randInt(0, 3, rng) : randInt(4, 7, rng);
  const wkf = randInt(0, 7, rng);
  if (board[wkr][wkf] !== null) return null;
  board[wkr][wkf] = 'K';

  // Try bishop + queen combo
  const emptySquares: [number, number][] = [];
  for (let f = 0; f < 8; f++) {
    for (let r = 0; r < 8; r++) {
      if (board[r][f] === null) emptySquares.push([f, r]);
    }
  }

  const shuffled = shuffle(emptySquares, rng);
  for (let i = 0; i < Math.min(10, shuffled.length - 1); i++) {
    const [qf, qr] = shuffled[i];
    const b2 = board.map(row => [...row]);
    b2[qr][qf] = 'Q';
    const fen = boardToFen(b2, 'w');
    if (!isLegalFen(fen)) continue;
    const solution = validateMateIn1(fen);
    if (solution) return { fen, solution };
  }
  return null;
}

// Pawn promotion mate (pawn promotes to Q/R with checkmate)
function generatePromotionMate(rng: RNG): { fen: string; solution: string } | null {
  // Pawn on 7th rank about to promote
  const pawnFile = randInt(0, 7, rng);
  const promotionSquare = sq(pawnFile, 7);

  // Black king near promotion square
  const kf = pawnFile + pick([-1, 0, 1], rng);
  const kr = 7;
  if (kf < 0 || kf > 7) return null;

  const board: (string | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));

  // Pawn must promote on empty square or capture
  if (kf === pawnFile) {
    // King is directly ahead, pawn can't promote straight
    return null;
  }

  board[kr][kf] = 'k';
  board[6][pawnFile] = 'P'; // White pawn on 7th

  // Block king escape with black own pieces or edge
  const adjSquares: [number, number][] = [];
  for (let df = -1; df <= 1; df++) {
    for (let dr = -1; dr <= 1; dr++) {
      if (df === 0 && dr === 0) continue;
      const nf = kf + df, nr = kr + dr;
      if (nf >= 0 && nf <= 7 && nr >= 0 && nr <= 7) {
        adjSquares.push([nf, nr]);
      }
    }
  }

  for (const [af, ar] of adjSquares) {
    if (board[ar][af] !== null) continue;
    if (ar === 6 && af === pawnFile) continue; // don't block our pawn
    if (rng() > 0.5) {
      board[ar][af] = pick(['p', 'r'], rng);
    }
  }

  // White king far away
  const wkr = randInt(0, 3, rng);
  const wkf = randInt(0, 7, rng);
  if (board[wkr][wkf] !== null) return null;
  if (isAdjacent(wkf, wkr, kf, kr)) return null;
  board[wkr][wkf] = 'K';

  const fen = boardToFen(board, 'w');
  if (!isLegalFen(fen)) return null;
  const solution = validateMateIn1(fen);
  if (solution) return { fen, solution };
  return null;
}

// Convert board array to FEN
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

// All mate patterns with metadata
const matePatterns: MatePattern[] = [
  {
    name: 'Back Rank Mate',
    hint: 'The king is trapped behind its own pawns — attack the back rank!',
    generate: generateBackRankMate,
  },
  {
    name: 'Queen & King Mate',
    hint: 'Use your queen to checkmate while your king guards the escape squares!',
    generate: generateQueenKingMate,
  },
  {
    name: 'Rook & King Mate',
    hint: 'Your king cuts off escape — deliver the final blow with your rook!',
    generate: generateRookKingMate,
  },
  {
    name: 'Scholar\'s Mate',
    hint: 'The f7 pawn is weak — attack it with your queen!',
    generate: generateScholarMateStyle,
  },
  {
    name: 'Heavy Piece Mate',
    hint: 'One piece controls the rank, the other delivers checkmate!',
    generate: generateHeavyPieceMate,
  },
  {
    name: 'Knight Mate',
    hint: 'The knight jumps in an L-shape — the king cannot escape!',
    generate: generateKnightMate,
  },
  {
    name: 'Queen Delivery Mate',
    hint: 'The king is boxed in — slide your queen to finish the game!',
    generate: generateBishopAssistMate,
  },
  {
    name: 'Promotion Mate',
    hint: 'Promote your pawn and deliver checkmate at the same time!',
    generate: generatePromotionMate,
  },
];

// Generate a single unique mate-in-1 puzzle
function generateSingleMateIn1(rng: RNG, seenFens: Set<string>, maxAttempts = 50): Puzzle | null {
  const patterns = shuffle([...matePatterns], rng);

  for (const pattern of patterns) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = pattern.generate(rng);
      if (result && !seenFens.has(result.fen)) {
        seenFens.add(result.fen);
        return {
          id: 'puzzle_' + Math.random().toString(36).substring(2, 10),
          fen: result.fen,
          solution: [result.solution],
          theme: 'mate_in_1',
          difficulty: 1,
          title: pattern.name,
          hint: pattern.hint,
          description: 'Deliver checkmate in one move!',
        };
      }
    }
  }
  return null;
}

/**
 * Generate `count` unique mate-in-1 puzzles dynamically.
 * Uses chess.js to validate every position — puzzles are always solvable.
 */
export function generateMateIn1Puzzles(count: number, seed?: number): Puzzle[] {
  const rng = mulberry32(seed ?? Math.floor(Math.random() * 2147483647));
  const seenFens = new Set<string>();
  const puzzles: Puzzle[] = [];

  let safetyCounter = 0;
  const maxIterations = count * 100;

  while (puzzles.length < count && safetyCounter < maxIterations) {
    safetyCounter++;
    const puzzle = generateSingleMateIn1(rng, seenFens, 10);
    if (puzzle) {
      puzzles.push(puzzle);
    }
  }

  return puzzles;
}

/**
 * Generate daily puzzles — same puzzles for the same day, different each day.
 */
export function generateDailyPuzzles(count: number): Puzzle[] {
  const seed = getDaySeed();
  return generateMateIn1Puzzles(count, seed).map(p => ({
    ...p,
    title: `Daily: ${p.title}`,
  }));
}

/**
 * Generate a mixed difficulty puzzle set with dynamic positions.
 * Replaces the old hardcoded `generatePuzzles` for checkmate sections.
 */
export function generateDynamicPuzzles(difficulty: number, count: number): Puzzle[] {
  const rng = mulberry32(Math.floor(Math.random() * 2147483647));
  const seenFens = new Set<string>();
  const puzzles: Puzzle[] = [];

  let safetyCounter = 0;
  const maxIterations = count * 150;

  while (puzzles.length < count && safetyCounter < maxIterations) {
    safetyCounter++;
    // Weight patterns by difficulty — easier patterns first for lower difficulty
    const easyPatterns = ['Back Rank Mate', 'Queen & King Mate', 'Scholar\'s Mate', 'Heavy Piece Mate'];
    const hardPatterns = ['Knight Mate', 'Rook & King Mate', 'Queen Delivery Mate', 'Promotion Mate'];

    const normalizedDiff = Math.min(difficulty, 7) / 7;
    const pool = normalizedDiff < 0.4
      ? matePatterns.filter(p => easyPatterns.includes(p.name))
      : normalizedDiff < 0.7
        ? matePatterns
        : matePatterns.filter(p => hardPatterns.includes(p.name) || rng() > 0.5);

    const pattern = pick(pool, rng);
    const result = pattern.generate(rng);
    if (result && !seenFens.has(result.fen)) {
      seenFens.add(result.fen);
      puzzles.push({
        id: 'puzzle_' + Math.random().toString(36).substring(2, 10),
        fen: result.fen,
        solution: [result.solution],
        theme: 'mate_in_1',
        difficulty,
        title: pattern.name,
        hint: pattern.hint,
        description: 'Deliver checkmate in one move!',
      });
    }
  }

  return puzzles;
}
