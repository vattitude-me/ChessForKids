import { generateMate, mulberry32 } from './mate-factory';
import { todayKey } from '../progress';

export interface Puzzle {
  id: string;
  /** Position before the opponent's setup move (or the puzzle position if no setup). */
  fen: string;
  /** Opponent's move that creates the puzzle, played automatically. */
  setup?: string;
  /** Solution in UCI: solver, opponent, solver, … (always ends on a solver move). */
  moves: string[];
  themes: string[];
  rating: number;
  source?: 'bank' | 'factory';
}

export const THEMES: Record<string, { label: string; icon: string; blurb: string; hint: string }> = {
  hangingPiece: { label: 'Free Pieces', icon: '🍎', blurb: 'Grab pieces nobody is guarding', hint: 'Is there an enemy piece that nobody protects?' },
  mateIn1: { label: 'Mate in 1', icon: '👑', blurb: 'Checkmate in one move', hint: 'Look at every check. Which one leaves the king no escape?' },
  mateIn2: { label: 'Mate in 2', icon: '⚔️', blurb: 'Checkmate in two moves', hint: 'Start with a forcing move — a check or a sacrifice!' },
  mateIn3: { label: 'Mate in 3', icon: '🏰', blurb: 'Checkmate in three moves', hint: 'Keep checking — the king is running out of squares.' },
  fork: { label: 'Forks', icon: '🍴', blurb: 'Attack two things at once', hint: 'Can one piece attack two enemies at the same time?' },
  winMaterial: { label: 'Win Material', icon: '💰', blurb: 'Come out pieces ahead', hint: 'Find the move that wins something big.' },
  tradeUp: { label: 'Trade Up', icon: '⚖️', blurb: 'Swap a small piece for a big one', hint: 'Can a small piece capture a bigger one?' },
  promotion: { label: 'Promotion', icon: '✨', blurb: 'Turn a pawn into a queen', hint: 'Can a pawn reach the last row?' },
  backRankMate: { label: 'Back Rank', icon: '🧱', blurb: 'Trap the king behind its pawns', hint: 'The king is stuck behind its own pawns…' },
  knightMate: { label: 'Knight Mates', icon: '🐴', blurb: 'Checkmate with a knight', hint: 'The knight jumps where others cannot!' },
  check: { label: 'Checks', icon: '⚡', blurb: 'Win with a strong check', hint: 'A check can set up something even better.' },
};

let bankCache: Puzzle[] | null = null;

export async function loadBank(): Promise<Puzzle[]> {
  if (bankCache) return bankCache;
  const mod = await import('@/data/puzzle-bank.json');
  const raw = (mod.default ?? mod) as unknown as Puzzle[];
  bankCache = raw.map((p) => ({ ...p, source: 'bank' as const }));
  return bankCache;
}

export function hintFor(p: Puzzle): string {
  for (const t of ['mateIn1', 'mateIn2', 'mateIn3', 'fork', 'promotion', 'hangingPiece', 'tradeUp', 'backRankMate', 'winMaterial']) {
    if (p.themes.includes(t)) return THEMES[t].hint;
  }
  return 'Check every capture and every check first!';
}

export function titleFor(p: Puzzle): string {
  if (p.themes.includes('mateIn1')) return 'Find checkmate in 1';
  if (p.themes.includes('mateIn2')) return 'Find checkmate in 2';
  if (p.themes.includes('mateIn3')) return 'Find checkmate in 3';
  // Don't give the trick away before it's solved.
  return 'Find the best move';
}

/**
 * The adaptive heart of puzzle training: chooses the next puzzle close to the
 * kid's current rating, slightly favouring themes they find hard, never
 * repeating what they've seen. Falls back to freshly generated mates when the
 * bank runs dry.
 */
export function pickAdaptive(
  bank: Puzzle[],
  opts: { rating: number; seen: Set<string>; themeStats: Record<string, { ok: number; fail: number }>; theme?: string; exclude?: Set<string> },
): Puzzle {
  const { rating, seen, themeStats, theme, exclude } = opts;
  const pool = bank.filter((p) => !seen.has(p.id) && !exclude?.has(p.id) && (!theme || p.themes.includes(theme)));
  // Aim a touch below-to-around the kid's level so success feels frequent (~70%).
  const target = rating - 50 + Math.round((Math.random() - 0.5) * 200);
  for (const width of [120, 220, 400, 800]) {
    const near = pool.filter((p) => Math.abs(p.rating - target) <= width);
    if (near.length) {
      const weights = near.map((p) => {
        let w = 1;
        for (const t of p.themes) {
          const s = themeStats[t];
          if (s && s.ok + s.fail >= 3) w += (s.fail / (s.ok + s.fail)) * 1.5; // weaker theme → more practice
        }
        return w;
      });
      let r = Math.random() * weights.reduce((a, b) => a + b, 0);
      for (let i = 0; i < near.length; i++) {
        r -= weights[i];
        if (r <= 0) return near[i];
      }
      return near[0];
    }
  }
  // Mate-in-1 is instant to generate; deeper mates come from the pre-verified bank.
  return factoryPuzzle(1);
}

export function factoryPuzzle(mateIn: 1 | 2, seed?: number): Puzzle {
  const s = seed ?? Math.floor(Math.random() * 2 ** 31);
  const g = generateMate(mateIn, s) ?? generateMate(1, s + 1);
  if (!g) {
    // Extremely unlikely; a classic back-rank mate as a safety net.
    return { id: 'fallback-backrank', fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', moves: ['a1a8'], themes: ['mate', 'mateIn1', 'backRankMate'], rating: 500, source: 'factory' };
  }
  return {
    id: `gen-${g.fen.split(' ')[0]}`,
    fen: g.fen,
    moves: g.solution,
    themes: ['mate', `mateIn${g.mateIn}`],
    rating: g.mateIn === 1 ? 650 : 1150,
    source: 'factory',
  };
}

/** Five puzzles for today: the same for everyone on the same day, tuned to rating bands. */
export function dailySet(bank: Puzzle[], rating: number): Puzzle[] {
  const key = todayKey();
  const seed = +key.replace(/-/g, '');
  const rng = mulberry32(seed);
  const offsets = [-200, -100, 0, 80, 180];
  const used = new Set<string>();
  return offsets.map((off) => {
    const target = Math.round((rating + off) / 100) * 100;
    const near = bank.filter((p) => Math.abs(p.rating - target) <= 100 && !used.has(p.id));
    const list = near.length ? near : bank.filter((p) => !used.has(p.id));
    const p = list[Math.floor(rng() * list.length)];
    used.add(p.id);
    return p;
  });
}

/** Puzzle Rush: an ever-harder sequence starting easy. */
export function rushPuzzle(bank: Puzzle[], index: number, used: Set<string>): Puzzle {
  const target = 350 + index * 60;
  const near = bank.filter((p) => !used.has(p.id) && Math.abs(p.rating - target) <= 80);
  const list = near.length ? near : bank.filter((p) => !used.has(p.id) && p.rating >= target - 200);
  if (!list.length) return factoryPuzzle(1);
  return list[Math.floor(Math.random() * list.length)];
}
