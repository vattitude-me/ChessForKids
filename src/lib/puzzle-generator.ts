import { Chess, Move } from 'chess.js';

export interface Puzzle {
  id: string;
  fen: string;
  solution: string[];
  theme: string;
  difficulty: number;
  title: string;
  hint: string;
  description: string;
}

const puzzleThemes = [
  { name: 'fork', title: 'The Fork Spell', description: 'Attack two pieces at once!', hint: 'Can you threaten two pieces with one move?' },
  { name: 'pin', title: 'The Binding Curse', description: 'Pin a piece so it cannot move!', hint: 'Look for pieces blocking something important.' },
  { name: 'skewer', title: 'The Dragon Strike', description: 'Attack through one piece to hit another!', hint: 'What if you attack a valuable piece that has another behind it?' },
  { name: 'mate_in_1', title: 'Checkmate Charm', description: 'Deliver checkmate in one move!', hint: 'The king has nowhere to hide!' },
  { name: 'mate_in_2', title: 'Double Spell Combo', description: 'Checkmate in two moves!', hint: 'Think ahead — what will they do after your first move?' },
  { name: 'capture', title: 'Treasure Hunt', description: 'Win material with a clever capture!', hint: 'Is there a piece left unguarded?' },
  { name: 'defense', title: 'Shield Wall', description: 'Save your piece from danger!', hint: 'Which of your pieces is in trouble?' },
  { name: 'discovered_attack', title: 'Hidden Magic', description: 'Move one piece to reveal an attack!', hint: 'What happens when you move a piece out of the way?' },
];

const mateIn1Positions = [
  { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', solution: ['Qxf7'], title: "Scholar's Mate" },
  { fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1', solution: ['Re8'], title: 'Back Rank Magic' },
  { fen: 'k7/8/1K6/8/8/8/8/7R w - - 0 1', solution: ['Rh8'], title: 'Rook Finale' },
  { fen: '5rk1/5ppp/8/8/8/8/4QPPP/6K1 w - - 0 1', solution: ['Qe8'], title: 'Queen Power' },
  { fen: 'r4rk1/ppp2ppp/8/8/8/8/PPP2PPP/R3R1K1 w - - 0 1', solution: ['Re8'], title: 'Rook Invasion' },
  { fen: '6k1/pppp1ppp/8/8/8/8/PPPPQPPP/6K1 w - - 0 1', solution: ['Qe8'], title: 'Queen Checkmate' },
  { fen: 'rnbqkbnr/ppppp2p/6p1/5p1Q/4P3/8/PPPP1PPP/RNB1KBNR w KQkq - 0 1', solution: ['Qh6'], title: 'Fool\'s Mate Trap' },
];

const tacticalPositions = [
  { fen: 'r1bqkbnr/pppppppp/2n5/8/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 2', solution: ['d4'], theme: 'capture', title: 'Center Control' },
  { fen: 'rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2', solution: ['e5'], theme: 'fork', title: 'Pawn Fork' },
  { fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 3', solution: ['Ng5'], theme: 'fork', title: 'Knight Attack' },
  { fen: 'rnb1kbnr/pppp1ppp/8/4p3/4PP1q/8/PPPP2PP/RNBQKBNR w KQkq - 1 3', solution: ['g3'], theme: 'defense', title: 'Queen Trap' },
];

function generatePuzzleId(): string {
  return 'puzzle_' + Math.random().toString(36).substring(2, 10);
}

export function generatePuzzles(difficulty: number, count: number): Puzzle[] {
  const puzzles: Puzzle[] = [];
  const maxDifficulty = 7;
  const normalizedDiff = Math.min(difficulty, maxDifficulty) / maxDifficulty;

  if (normalizedDiff < 0.3) {
    const available = mateIn1Positions.slice(0, Math.max(3, Math.floor(mateIn1Positions.length * (normalizedDiff + 0.3))));
    for (let i = 0; i < count; i++) {
      const pos = available[i % available.length];
      puzzles.push({
        id: generatePuzzleId(),
        fen: pos.fen,
        solution: pos.solution,
        theme: 'mate_in_1',
        difficulty,
        title: pos.title,
        hint: puzzleThemes.find(t => t.name === 'mate_in_1')?.hint || 'Look for checkmate!',
        description: puzzleThemes.find(t => t.name === 'mate_in_1')?.description || 'Find checkmate!',
      });
    }
  } else if (normalizedDiff < 0.6) {
    const allPositions = [...mateIn1Positions.slice(3), ...tacticalPositions];
    for (let i = 0; i < count; i++) {
      const pos = allPositions[i % allPositions.length];
      const theme = 'solution' in pos && pos.solution.length === 1 ? 'mate_in_1' :
        ('theme' in pos ? (pos as { theme: string }).theme : 'capture');
      puzzles.push({
        id: generatePuzzleId(),
        fen: pos.fen,
        solution: pos.solution,
        theme,
        difficulty,
        title: pos.title,
        hint: puzzleThemes.find(t => t.name === theme)?.hint || 'Think carefully!',
        description: puzzleThemes.find(t => t.name === theme)?.description || 'Solve the puzzle!',
      });
    }
  } else {
    const allPositions = [...tacticalPositions, ...mateIn1Positions.slice(4)];
    for (let i = 0; i < count; i++) {
      const pos = allPositions[i % allPositions.length];
      const theme = 'theme' in pos ? (pos as { theme: string }).theme : 'mate_in_1';
      puzzles.push({
        id: generatePuzzleId(),
        fen: pos.fen,
        solution: pos.solution,
        theme,
        difficulty,
        title: pos.title,
        hint: puzzleThemes.find(t => t.name === theme)?.hint || 'Think several moves ahead!',
        description: puzzleThemes.find(t => t.name === theme)?.description || 'Find the best move!',
      });
    }
  }

  return puzzles;
}

export function generateRandomPuzzle(difficulty: number): Puzzle {
  const game = new Chess();
  const moves = Math.floor(5 + Math.random() * 20);

  for (let i = 0; i < moves; i++) {
    const legalMoves = game.moves({ verbose: true });
    if (legalMoves.length === 0) break;
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    game.move(randomMove);
  }

  const legalMoves = game.moves({ verbose: true });
  if (legalMoves.length === 0) {
    return generatePuzzles(difficulty, 1)[0];
  }

  const captureMoves = legalMoves.filter(m => m.captured);
  const checkMoves = legalMoves.filter(m => {
    game.move(m);
    const isCheck = game.isCheck();
    game.undo();
    return isCheck;
  });

  let bestMove: Move;
  let theme: string;

  if (checkMoves.length > 0) {
    bestMove = checkMoves[0];
    theme = 'discovered_attack';
  } else if (captureMoves.length > 0) {
    bestMove = captureMoves[0];
    theme = 'capture';
  } else {
    bestMove = legalMoves[0];
    theme = 'capture';
  }

  const themeInfo = puzzleThemes.find(t => t.name === theme) || puzzleThemes[5];

  return {
    id: generatePuzzleId(),
    fen: game.fen(),
    solution: [bestMove.san],
    theme,
    difficulty,
    title: themeInfo.title,
    hint: themeInfo.hint,
    description: themeInfo.description,
  };
}

export { puzzleThemes };
