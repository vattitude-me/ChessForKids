import { Chess } from 'chess.js';
import { MoveStep } from './types';
import { findHangingPieces, parseUci } from '../chess-utils';

export type GoalResult = { ok: true } | { ok: false; reason?: 'stalemate' | 'hanging' | 'wrong' };

/** Checks a kid's move against a lesson step's accepted moves or goal. */
export function checkLessonMove(fen: string, uci: string, accept?: string[], goal?: MoveStep['goal']): GoalResult {
  const game = new Chess(fen);
  const me = game.turn();
  let move;
  try {
    move = game.move(parseUci(uci));
  } catch {
    return { ok: false };
  }
  if (!move) return { ok: false };
  if (accept && accept.length) {
    // Promotions: accept a matching from/to even if the kid picked another piece, when the list allows any.
    return accept.includes(uci) ? { ok: true } : { ok: false, reason: 'wrong' };
  }
  switch (goal) {
    case 'mate':
      if (game.isCheckmate()) return { ok: true };
      if (game.isStalemate()) return { ok: false, reason: 'stalemate' };
      return { ok: false };
    case 'check':
      return game.inCheck() ? { ok: true } : { ok: false };
    case 'castle':
      return move.isKingsideCastle() || move.isQueensideCastle() ? { ok: true } : { ok: false };
    case 'promote':
      return move.isPromotion() ? { ok: true } : { ok: false };
    case 'capture':
      return move.isCapture() ? { ok: true } : { ok: false };
    case 'escape':
      return { ok: true }; // any legal move escapes check
    case 'safe':
      return findHangingPieces(game, me).length === 0 ? { ok: true } : { ok: false, reason: 'hanging' };
    default:
      return { ok: false };
  }
}
