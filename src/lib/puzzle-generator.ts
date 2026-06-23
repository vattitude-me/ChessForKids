import { Chess, Move } from 'chess.js';
import { generateDynamicPuzzles, generateDailyPuzzles } from './puzzle-engine';

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
  { name: 'fork', title: 'The Fork Spell', description: 'Attack two pieces at once!', hint: 'Find one move that attacks two things!' },
  { name: 'pin', title: 'The Binding Curse', description: 'Pin a piece so it cannot move!', hint: 'Look for a piece that is stuck in front of its king.' },
  { name: 'skewer', title: 'The Dragon Strike', description: 'Attack through one piece to hit another!', hint: 'Attack in a line — there is a piece hiding behind!' },
  { name: 'mate_in_1', title: 'Checkmate Charm', description: 'Deliver checkmate in one move!', hint: 'The king is trapped — find where to attack!' },
  { name: 'mate_in_2', title: 'Double Spell Combo', description: 'Checkmate in two moves!', hint: 'Make a move that forces the king, then finish!' },
  { name: 'capture', title: 'Treasure Hunt', description: 'Win material with a clever capture!', hint: 'Look for a piece with no one guarding it!' },
  { name: 'defense', title: 'Shield Wall', description: 'Save your piece from danger!', hint: 'One of your pieces is being attacked — save it!' },
  { name: 'discovered_attack', title: 'Hidden Magic', description: 'Move one piece to reveal an attack!', hint: 'Move a piece out of the way to open an attack!' },
];

const pawnPuzzles: { fen: string; solution: string[]; title: string; hint: string; description: string }[] = [
  { fen: '4k3/pp6/8/8/8/3p4/2P2PP1/4K3 w - - 0 1', solution: ['cxd3'], title: 'Pawn Capture', hint: 'Pawns eat sideways! Move your pawn one step diagonally to grab the enemy pawn.', description: 'Capture the enemy pawn!' },
  { fen: '4k3/pp4pp/8/8/8/8/3P1PP1/4K3 w - - 0 1', solution: ['d4'], title: 'Pawn Push', hint: 'On its very first move, a pawn can jump forward two squares instead of one!', description: 'Push the d-pawn forward two squares!' },
  { fen: '4k3/pp4pp/8/3p4/4P3/8/5PP1/4K3 w - - 0 1', solution: ['exd5'], title: 'Pawn Takes', hint: 'Your pawn captures by moving one square diagonally forward. Look for the black pawn next to yours!', description: 'Capture the black pawn!' },
  { fen: '4k3/pp4pp/8/8/8/4p3/3P1PP1/4K3 w - - 0 1', solution: ['dxe3'], title: 'Diagonal Strike', hint: 'See that enemy pawn right next to your pawn? Eat it by moving diagonally!', description: 'Take the enemy pawn with yours!' },
  { fen: '8/3P2kp/8/8/8/8/6PP/4K3 w - - 0 1', solution: ['d8=Q'], title: 'Pawn Promotion', hint: 'Your pawn is one step from the end! Push it forward and it turns into a Queen!', description: 'Promote your pawn to a Queen!' },
];

const rookPuzzles: { fen: string; solution: string[]; title: string; hint: string; description: string }[] = [
  { fen: '4k3/pp4pp/8/8/4p3/8/5PPP/4RK2 w - - 0 1', solution: ['Rxe4'], title: 'Rook Captures', hint: 'The rook slides straight up and down or left and right. Slide it up to grab that pawn!', description: 'Capture the pawn with your rook!' },
  { fen: '6k1/5ppp/8/8/8/8/5PP1/R3K3 w - - 0 1', solution: ['Ra8'], title: 'Rook Checkmate', hint: 'Slide your rook all the way to the top row — the king has nowhere to go!', description: 'Checkmate the king!' },
  { fen: '7k/6pp/8/8/r7/8/5PPP/R3K3 w - - 0 1', solution: ['Rxa4'], title: 'Rook Exchange', hint: 'Your rook can slide sideways to take the enemy rook!', description: 'Take the black rook!' },
  { fen: '6k1/5ppp/8/8/8/8/1R3PP1/K7 w - - 0 1', solution: ['Rb8'], title: 'Back Rank Attack', hint: 'Slide your rook straight up to the top row — the king is trapped there!', description: 'Checkmate with the rook!' },
  { fen: '4k3/4p1pp/8/8/8/8/5PPP/4RK2 w - - 0 1', solution: ['Rxe7'], title: 'Rook Snatch', hint: 'Your rook can zoom straight up the file and grab that pawn!', description: 'Grab the enemy pawn!' },
];

const knightPuzzles: { fen: string; solution: string[]; title: string; hint: string; description: string }[] = [
  { fen: '4k3/pp4pp/8/8/3p4/8/PP2NPPP/4K3 w - - 0 1', solution: ['Nxd4'], title: 'Knight Jump', hint: 'The knight jumps in an L-shape — two squares one way, then one to the side. Jump to eat the pawn!', description: 'Capture the pawn with your knight!' },
  { fen: '4k3/pp4pp/8/3p4/8/4N3/PP3PPP/4K3 w - - 0 1', solution: ['Nxd5'], title: 'Knight Capture', hint: 'Count the L-shape: two up and one to the side lands right on that pawn!', description: 'Capture the pawn with the knight!' },
  { fen: '4k3/pp4pp/2p5/8/3N4/8/PP3PPP/4K3 w - - 0 1', solution: ['Nxc6'], title: 'Knight Fork Setup', hint: 'Look at all the squares your knight can reach — one of them has a pawn sitting on it!', description: 'Capture an enemy pawn!' },
  { fen: 'r3k3/pp4pp/8/8/8/5N2/PP3PPP/4K3 w - - 0 1', solution: ['Nd4'], title: 'Knight Advance', hint: 'Jump your knight to the middle of the board where it controls the most squares!', description: 'Centralize your knight!' },
  { fen: '4k3/pp4pp/8/8/8/4N3/PP3PPP/4K3 w - - 0 1', solution: ['Nd5'], title: 'Knight Hop', hint: 'The center is the best spot for a knight! Jump two up and one to the side.', description: 'Move the knight to the center!' },
];

const bishopPuzzles: { fen: string; solution: string[]; title: string; hint: string; description: string }[] = [
  { fen: '4k3/pp4pp/8/8/5p2/8/PP3PPP/2B1K3 w - - 0 1', solution: ['Bxf4'], title: 'Bishop Capture', hint: 'The bishop slides corner-to-corner like an X. Slide it diagonally to grab that pawn!', description: 'Capture the pawn with your bishop!' },
  { fen: '4k3/pp4pp/8/6p1/8/8/PP3PPP/2B1K3 w - - 0 1', solution: ['Bxg5'], title: 'Bishop Snipe', hint: 'The bishop can reach far — slide it along the diagonal to take the pawn!', description: 'Capture the pawn!' },
  { fen: '4k3/pp4pp/7p/8/8/8/PP3PPP/2B1K3 w - - 0 1', solution: ['Bxh6'], title: 'Long Diagonal', hint: 'Your bishop can zoom all the way across the board on its diagonal!', description: 'Capture the enemy pawn!' },
  { fen: '4k3/pp4pp/8/8/8/4p3/PP3PPP/2B1K3 w - - 0 1', solution: ['Bxe3'], title: 'Bishop Strike', hint: 'Look at the diagonal lines from your bishop — there is a pawn you can grab!', description: 'Take the pawn!' },
  { fen: 'r3k3/pp4pp/8/8/8/8/PP2PPBP/4K3 w - - 0 1', solution: ['Bd5'], title: 'Bishop Centralize', hint: 'Slide your bishop to the middle where it watches over lots of squares!', description: 'Move bishop to a strong diagonal!' },
];

const queenPuzzles: { fen: string; solution: string[]; title: string; hint: string; description: string }[] = [
  { fen: '4k3/pp4pp/8/8/3p4/8/PP3PPP/3QK3 w - - 0 1', solution: ['Qxd4'], title: 'Queen Captures', hint: 'The queen is the most powerful piece — she can go straight or diagonal! Grab that pawn!', description: 'Capture the pawn with the queen!' },
  { fen: '6k1/5ppp/8/8/8/8/PP3PPP/3QK3 w - - 0 1', solution: ['Qd8'], title: 'Queen Checkmate', hint: 'Move your queen to the top row — the king is stuck and cannot escape!', description: 'Checkmate!' },
  { fen: '4k3/pp4pp/8/8/5p2/8/PP3PPP/3QK3 w - - 0 1', solution: ['Qxf4'], title: 'Queen Diagonal', hint: 'Your queen can slide diagonally — look for the pawn on a diagonal line!', description: 'Capture diagonally!' },
  { fen: '4k3/pp4pp/4p3/8/8/8/PP2QPPP/4K3 w - - 0 1', solution: ['Qxe6'], title: 'Queen Power', hint: 'The queen can zoom across the whole board — slide her straight up to eat that pawn!', description: 'Capture the pawn!' },
  { fen: '6k1/5ppp/8/8/8/4Q3/PP3PPP/4K3 w - - 0 1', solution: ['Qe8'], title: 'Queen Mate', hint: 'The king is trapped on the top row with no escape — send your queen there!', description: 'Deliver checkmate!' },
];

const kingPuzzles: { fen: string; solution: string[]; title: string; hint: string; description: string }[] = [
  { fen: '8/pp2k1pp/8/8/3p4/3K4/PP4PP/8 w - - 0 1', solution: ['Kxd4'], title: 'King Captures', hint: 'The king moves one square in any direction — step onto the pawn to capture it!', description: 'Capture the pawn with your king!' },
  { fen: '8/pp4pp/8/3k4/8/8/PP4PP/3K4 w - - 0 1', solution: ['Kd2'], title: 'King Advance', hint: 'The king takes baby steps — just one square at a time. Move him forward!', description: 'Advance your king!' },
  { fen: '8/pp2k1pp/8/8/8/4p3/PP1K2PP/8 w - - 0 1', solution: ['Kxe3'], title: 'King Takes Pawn', hint: 'Your king can step one square diagonally to eat that pawn!', description: 'Take the enemy pawn!' },
  { fen: '8/pp4pp/8/4k3/8/8/PP1K2PP/8 w - - 0 1', solution: ['Ke3'], title: 'King Opposition', hint: 'Stand your king face-to-face with the enemy king — this blocks him from moving forward!', description: 'Take the opposition!' },
  { fen: '8/pp2k1pp/8/8/4p3/3K4/PP4PP/8 w - - 0 1', solution: ['Kxe4'], title: 'King Capture', hint: 'The pawn is right next to your king — just step on it!', description: 'Grab the pawn!' },
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

export function generatePuzzles(difficulty: number, count: number, mode?: 'checkmate' | 'daily'): Puzzle[] {
  // Use dynamic engine for mate-in-1 and daily puzzles — never repeats
  if (mode === 'daily') {
    return generateDailyPuzzles(count);
  }

  return generateDynamicPuzzles(difficulty, count);
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

export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';

const piecePuzzleMap: Record<PieceType, typeof pawnPuzzles> = {
  pawn: pawnPuzzles,
  rook: rookPuzzles,
  knight: knightPuzzles,
  bishop: bishopPuzzles,
  queen: queenPuzzles,
  king: kingPuzzles,
};

export function generatePiecePuzzles(piece: PieceType): Puzzle[] {
  const positions = piecePuzzleMap[piece];
  return positions.map(pos => ({
    id: generatePuzzleId(),
    fen: pos.fen,
    solution: pos.solution,
    theme: piece,
    difficulty: 1,
    title: pos.title,
    hint: pos.hint,
    description: pos.description,
  }));
}

export { puzzleThemes };
