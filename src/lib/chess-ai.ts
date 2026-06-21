import { Chess, Move, Square } from 'chess.js';

export interface DifficultyLevel {
  name: string;
  label: string;
  description: string;
  searchDepth: number;
  randomness: number; // 0 = perfect play, 1 = fully random
  blunderChance: number; // chance of making a deliberate mistake
  icon: string;
  minAge: number;
  color: string;
}

export function generateDifficultyLevels(): DifficultyLevel[] {
  const baseConfigs = [
    { name: 'apprentice', label: 'Apprentice', description: 'Learning the magical arts', icon: '🧹', minAge: 3, color: '#a8e6cf' },
    { name: 'squire', label: 'Squire', description: 'A brave young helper', icon: '🛡️', minAge: 5, color: '#88d8b0' },
    { name: 'knight', label: 'Knight', description: 'Defender of the realm', icon: '⚔️', minAge: 7, color: '#ffd3b6' },
    { name: 'wizard', label: 'Wizard', description: 'Master of strategy', icon: '🧙', minAge: 9, color: '#ffaaa5' },
    { name: 'enchanter', label: 'Enchanter', description: 'Weaves complex spells', icon: '✨', minAge: 11, color: '#d4a5ff' },
    { name: 'archmage', label: 'Archmage', description: 'Supreme magical intellect', icon: '🔮', minAge: 13, color: '#b388ff' },
    { name: 'dragon', label: 'Dragon Lord', description: 'Ancient and unstoppable', icon: '🐉', minAge: 16, color: '#ff6b6b' },
  ];

  return baseConfigs.map((config, index) => {
    const totalLevels = baseConfigs.length;
    const progress = index / (totalLevels - 1);

    return {
      ...config,
      searchDepth: Math.floor(1 + progress * 4),
      randomness: Math.max(0, 1 - progress * 1.2),
      blunderChance: Math.max(0, 0.5 - progress * 0.55),
    };
  });
}

export function getAdaptiveDifficulty(
  playerWins: number,
  playerLosses: number,
  currentLevelIndex: number,
  levels: DifficultyLevel[]
): number {
  const totalGames = playerWins + playerLosses;
  if (totalGames < 3) return currentLevelIndex;

  const winRate = playerWins / totalGames;

  if (winRate > 0.7 && totalGames >= 5) {
    return Math.min(currentLevelIndex + 1, levels.length - 1);
  } else if (winRate < 0.3 && totalGames >= 5) {
    return Math.max(currentLevelIndex - 1, 0);
  }

  return currentLevelIndex;
}

const pieceValues: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

const pawnTable = [
  0, 0, 0, 0, 0, 0, 0, 0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5, 5, 10, 25, 25, 10, 5, 5,
  0, 0, 0, 20, 20, 0, 0, 0,
  5, -5, -10, 0, 0, -10, -5, 5,
  5, 10, 10, -20, -20, 10, 10, 5,
  0, 0, 0, 0, 0, 0, 0, 0,
];

const knightTable = [
  -50, -40, -30, -30, -30, -30, -40, -50,
  -40, -20, 0, 0, 0, 0, -20, -40,
  -30, 0, 10, 15, 15, 10, 0, -30,
  -30, 5, 15, 20, 20, 15, 5, -30,
  -30, 0, 15, 20, 20, 15, 0, -30,
  -30, 5, 10, 15, 15, 10, 5, -30,
  -40, -20, 0, 5, 5, 0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50,
];

const bishopTable = [
  -20, -10, -10, -10, -10, -10, -10, -20,
  -10, 0, 0, 0, 0, 0, 0, -10,
  -10, 0, 10, 10, 10, 10, 0, -10,
  -10, 5, 5, 10, 10, 5, 5, -10,
  -10, 0, 5, 10, 10, 5, 0, -10,
  -10, 0, 5, 5, 5, 5, 0, -10,
  -10, 5, 0, 0, 0, 0, 5, -10,
  -20, -10, -10, -10, -10, -10, -10, -20,
];

function getPositionBonus(piece: string, square: Square, isWhite: boolean): number {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = parseInt(square[1]) - 1;
  const index = isWhite ? (7 - rank) * 8 + file : rank * 8 + file;

  switch (piece) {
    case 'p': return pawnTable[index] || 0;
    case 'n': return knightTable[index] || 0;
    case 'b': return bishopTable[index] || 0;
    default: return 0;
  }
}

function evaluateBoard(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -99999 : 99999;
  }
  if (game.isDraw()) return 0;

  let score = 0;
  const board = game.board();

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (!piece) continue;

      const value = pieceValues[piece.type] || 0;
      const square = (String.fromCharCode('a'.charCodeAt(0) + file) + (8 - rank)) as Square;
      const posBonus = getPositionBonus(piece.type, square, piece.color === 'w');

      if (piece.color === 'w') {
        score += value + posBonus;
      } else {
        score -= value + posBonus;
      }
    }
  }

  return score;
}

function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = game.moves({ verbose: true });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evalScore = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evalScore = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function getBestMove(game: Chess, difficulty: DifficultyLevel): Move | null {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  if (Math.random() < difficulty.blunderChance) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  if (Math.random() < difficulty.randomness) {
    const topN = Math.max(1, Math.floor(moves.length * 0.3));
    const scoredMoves = moves.map(move => {
      game.move(move);
      const score = evaluateBoard(game);
      game.undo();
      return { move, score };
    });

    const isBlack = game.turn() === 'b';
    scoredMoves.sort((a, b) => isBlack ? a.score - b.score : b.score - a.score);
    return scoredMoves[Math.floor(Math.random() * topN)].move;
  }

  let bestMove = moves[0];
  let bestScore = game.turn() === 'w' ? -Infinity : Infinity;

  for (const move of moves) {
    game.move(move);
    const score = minimax(
      game,
      difficulty.searchDepth - 1,
      -Infinity,
      Infinity,
      game.turn() === 'w'
    );
    game.undo();

    if (game.turn() === 'w') {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }

  return bestMove;
}
