'use client';

import { Chess, Color } from 'chess.js';
import { getEngine, EngineLine } from './stockfish';
import { findHangingPieces, PIECE_NAME, winChance, parseUci, uciToSan } from '../chess-utils';

export type MoveQuality = 'best' | 'great' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';

export interface MoveReview {
  quality: MoveQuality;
  message: string;
  bestMove?: string; // UCI of what the engine preferred
  bestSan?: string;
  evalAfter: number; // white-POV win chance 0..1
  canUndo: boolean;
}

export const QUALITY_STYLE: Record<MoveQuality, { label: string; emoji: string; color: string }> = {
  best: { label: 'Best move!', emoji: '🌟', color: '#1FB86A' },
  great: { label: 'Great move!', emoji: '👏', color: '#1FB86A' },
  good: { label: 'Good move', emoji: '👍', color: '#4C9AFF' },
  inaccuracy: { label: 'Hmm…', emoji: '🤔', color: '#F2B233' },
  mistake: { label: 'Mistake', emoji: '😬', color: '#FF8A3D' },
  blunder: { label: 'Uh-oh!', emoji: '😱', color: '#E5484D' },
};

const PRAISE = ['Nice thinking!', 'Super move!', 'You\'re a natural!', 'Brilliant!', 'The coach approves!', 'Way to go!'];
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

/** Win chance for `color` from an engine line evaluated with side-to-move = `stm`. */
export function lineWinChance(line: EngineLine | undefined, stm: Color, color: Color): number {
  if (!line) return 0.5;
  const w = winChance(line.cp, line.mate);
  return stm === color ? w : 1 - w;
}

/**
 * Reviews the move the kid just made. `before` is the engine's analysis of the
 * position before the move (side to move = kid).
 */
export async function reviewMove(fenBefore: string, uci: string, before: EngineLine[] | null): Promise<MoveReview | null> {
  const engine = getEngine();
  const gBefore = new Chess(fenBefore);
  const me = gBefore.turn();
  const after = new Chess(fenBefore);
  after.move(parseUci(uci));
  if (after.isGameOver()) return null;

  let evalAfterLines: EngineLine[] = [];
  let beforeLines = before;
  try {
    if (!beforeLines || !beforeLines.length) beforeLines = await engine.analyse(fenBefore, { depth: 10 });
    evalAfterLines = await engine.analyse(after.fen(), { depth: 10 });
  } catch {
    return staticReview(after, me);
  }
  if (!beforeLines.length || !evalAfterLines.length) return staticReview(after, me);

  const bestLine = beforeLines[0];
  const wBefore = lineWinChance(bestLine, me, me);
  const wAfter = lineWinChance(evalAfterLines[0], after.turn(), me);
  const drop = wBefore - wAfter;
  const whiteAfter = me === 'w' ? wAfter : 1 - wAfter;
  const bestSan = uciToSan(fenBefore, bestLine.move);

  let quality: MoveQuality;
  if (bestLine.move === uci) quality = 'best';
  else if (drop < 0.03) quality = 'great';
  else if (drop < 0.08) quality = 'good';
  else if (drop < 0.15) quality = 'inaccuracy';
  else if (drop < 0.28) quality = 'mistake';
  else quality = 'blunder';

  // Explain in kid language.
  let message = '';
  const hanging = findHangingPieces(after, me);
  const mateThreat = evalAfterLines[0].mate !== null && evalAfterLines[0].mate > 0;
  if (quality === 'best' || quality === 'great') {
    message = pick(PRAISE);
    const played = gBefore.move(parseUci(uci));
    if (played.captured) message = `Yum! You captured a ${PIECE_NAME[played.captured]}. ${message}`;
    else if (played.san.includes('+')) message = `Check! ${message}`;
  } else if (quality === 'good') {
    message = `Good! ${bestSan} was even a little stronger.`;
  } else if (mateThreat) {
    message = `Careful! Now your opponent can checkmate you in ${evalAfterLines[0].mate}. Look for danger near your king!`;
  } else if (hanging.length) {
    const h = hanging[0];
    message = `Watch out! Your ${PIECE_NAME[h.type]} on ${h.square} can be captured. Try ${bestSan} instead?`;
  } else if (quality === 'inaccuracy') {
    message = `Not bad, but ${bestSan} was better. Can you see why?`;
  } else {
    message = `That lets your opponent get ahead. ${bestSan} was the move to find.`;
  }

  return {
    quality,
    message,
    bestMove: bestLine.move,
    bestSan,
    evalAfter: whiteAfter,
    canUndo: quality === 'mistake' || quality === 'blunder',
  };
}

function staticReview(after: Chess, me: Color): MoveReview {
  const hanging = findHangingPieces(after, me);
  if (hanging.length) {
    const h = hanging[0];
    return {
      quality: 'mistake',
      message: `Watch out! Your ${PIECE_NAME[h.type]} on ${h.square} can be captured.`,
      evalAfter: 0.5,
      canUndo: true,
    };
  }
  return { quality: 'good', message: pick(PRAISE), evalAfter: 0.5, canUndo: false };
}
