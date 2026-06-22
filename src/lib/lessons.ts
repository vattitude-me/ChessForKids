export interface LessonChallenge {
  instruction: string;
  fen: string;
  validMoves: { from: string; to: string }[];
  highlightSquares?: string[];
  arrows?: [string, string][];
  successMessage: string;
  hintMessage?: string;
}

export interface LessonStep {
  type: 'intro' | 'demo' | 'try' | 'attack-demo' | 'attack-try' | 'summary';
  title: string;
  description: string;
  fen?: string;
  highlightSquares?: string[];
  arrows?: [string, string][];
  challenge?: LessonChallenge;
}

export interface PieceLesson {
  id: string;
  piece: string;
  name: string;
  icon: string;
  symbol: string;
  color: string;
  tagline: string;
  steps: LessonStep[];
}

export const pieceLessons: PieceLesson[] = [
  {
    id: 'board-setup',
    piece: '',
    name: 'Board & Setup',
    icon: '♔',
    symbol: '',
    color: '#8b6914',
    tagline: 'Learn how to set up the chess board!',
    steps: [
      {
        type: 'intro',
        title: 'The Chess Board',
        description: 'A chess board has 64 squares — 8 rows and 8 columns. The squares alternate between light and dark colors. Each player starts with 16 pieces.',
        fen: '8/8/8/8/8/8/8/8 w - - 0 1',
      },
      {
        type: 'demo',
        title: 'Where the Pieces Go',
        description: 'Each piece has its own starting square. Rooks go in the corners, then Knights, then Bishops. The Queen goes on her own color, and the King goes next to her. Pawns fill the entire second row!',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        highlightSquares: ['a1', 'h1', 'b1', 'g1', 'c1', 'f1', 'd1', 'e1'],
      },
      {
        type: 'demo',
        title: 'The Two Armies',
        description: 'White pieces always start on rows 1 and 2. Black pieces start on rows 7 and 8. White always moves first! Each side has: 8 Pawns, 2 Rooks, 2 Knights, 2 Bishops, 1 Queen, and 1 King.',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        highlightSquares: ['a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2', 'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7'],
      },
      {
        type: 'summary',
        title: 'Board Setup Complete!',
        description: 'You now know how to set up a chess board! Remember:\n• Light square in the bottom-right corner\n• Queen on her own color\n• White moves first\n• Each side has 16 pieces total!',
      },
    ],
  },
  {
    id: 'pawn',
    piece: 'P',
    name: 'The Pawn',
    icon: '♟',
    symbol: 'P',
    color: '#9b7fd4',
    tagline: 'Small but brave! The frontline soldiers of your army.',
    steps: [
      {
        type: 'intro',
        title: 'Meet the Pawn',
        description: 'Pawns are the smallest pieces on the board, but they are very important! Every great army needs brave soldiers on the front line. You have 8 pawns to start the game.',
      },
      {
        type: 'demo',
        title: 'How the Pawn Moves',
        description: 'A pawn moves straight forward, one square at a time. On its very first move, it can jump forward TWO squares! Look at the green dots showing where this pawn can go.',
        fen: '8/8/8/8/8/8/4P3/8 w - - 0 1',
        highlightSquares: ['e3', 'e4'],
        arrows: [['e2', 'e3'], ['e2', 'e4']],
      },
      {
        type: 'try',
        title: 'Your Turn! Move the Pawn',
        description: 'Try moving the pawn forward. You can move it one or two squares since it hasn\'t moved yet!',
        challenge: {
          instruction: 'Move the pawn forward!',
          fen: '8/8/8/8/8/8/3P4/8 w - - 0 1',
          validMoves: [
            { from: 'd2', to: 'd3' },
            { from: 'd2', to: 'd4' },
          ],
          highlightSquares: ['d3', 'd4'],
          successMessage: 'Great job! The pawn marches forward!',
          hintMessage: 'Click the pawn on d2 and move it to d3 or d4',
        },
      },
      {
        type: 'attack-demo',
        title: 'How the Pawn Captures',
        description: 'Here\'s a tricky rule: pawns capture DIAGONALLY! They can only take enemy pieces that are one square diagonally in front of them. The pawn cannot move straight if a piece is blocking it!',
        fen: '8/8/8/8/3p1p2/4P3/8/8 w - - 0 1',
        highlightSquares: ['d4', 'f4'],
        arrows: [['e3', 'd4'], ['e3', 'f4']],
      },
      {
        type: 'attack-try',
        title: 'Capture the Enemy!',
        description: 'An enemy piece is in your pawn\'s path. Capture it by moving diagonally!',
        challenge: {
          instruction: 'Capture the black pawn!',
          fen: '8/8/8/8/5p2/4P3/8/8 w - - 0 1',
          validMoves: [
            { from: 'e3', to: 'f4' },
          ],
          highlightSquares: ['f4'],
          successMessage: 'Excellent! You captured the enemy pawn! Pawns attack diagonally!',
          hintMessage: 'Move your white pawn to f4 to capture the black pawn',
        },
      },
      {
        type: 'summary',
        title: 'Pawn Mastered!',
        description: 'You\'ve learned the Pawn! Remember:\n• Moves forward one square (two on first move)\n• Captures diagonally\n• Can\'t move backward\n• If it reaches the other side, it becomes a Queen!',
      },
    ],
  },
  {
    id: 'rook',
    piece: 'R',
    name: 'The Rook',
    icon: '♜',
    symbol: 'R',
    color: '#5b8fd4',
    tagline: 'A mighty castle that slides across the board!',
    steps: [
      {
        type: 'intro',
        title: 'Meet the Rook',
        description: 'The Rook looks like a castle tower! It\'s one of the most powerful pieces. You start with two Rooks, one in each corner of the board.',
      },
      {
        type: 'demo',
        title: 'How the Rook Moves',
        description: 'The Rook moves in straight lines — up, down, left, or right — as far as it wants! It can\'t jump over other pieces though.',
        fen: '8/8/8/8/3R4/8/8/8 w - - 0 1',
        highlightSquares: ['d1', 'd2', 'd3', 'd5', 'd6', 'd7', 'd8', 'a4', 'b4', 'c4', 'e4', 'f4', 'g4', 'h4'],
        arrows: [['d4', 'd8'], ['d4', 'd1'], ['d4', 'a4'], ['d4', 'h4']],
      },
      {
        type: 'try',
        title: 'Your Turn! Move the Rook',
        description: 'Try moving the Rook! It can slide to any square in a straight line.',
        challenge: {
          instruction: 'Move the Rook anywhere along a straight line!',
          fen: '8/8/8/8/8/8/8/3R4 w - - 0 1',
          validMoves: [
            { from: 'd1', to: 'd2' }, { from: 'd1', to: 'd3' }, { from: 'd1', to: 'd4' },
            { from: 'd1', to: 'd5' }, { from: 'd1', to: 'd6' }, { from: 'd1', to: 'd7' },
            { from: 'd1', to: 'd8' }, { from: 'd1', to: 'a1' }, { from: 'd1', to: 'b1' },
            { from: 'd1', to: 'c1' }, { from: 'd1', to: 'e1' }, { from: 'd1', to: 'f1' },
            { from: 'd1', to: 'g1' }, { from: 'd1', to: 'h1' },
          ],
          successMessage: 'Perfect! The Rook zooms across the board in a straight line!',
          hintMessage: 'Click the Rook and move it up, down, left, or right',
        },
      },
      {
        type: 'attack-demo',
        title: 'How the Rook Captures',
        description: 'The Rook captures by moving to an enemy\'s square. It can eat any piece in its straight path!',
        fen: '8/8/8/3p4/8/8/8/3R4 w - - 0 1',
        highlightSquares: ['d5'],
        arrows: [['d1', 'd5']],
      },
      {
        type: 'attack-try',
        title: 'Capture with the Rook!',
        description: 'There\'s an enemy piece on the same line as your Rook. Capture it!',
        challenge: {
          instruction: 'Capture the black pawn with your Rook!',
          fen: '8/8/8/8/8/8/3p4/3R4 w - - 0 1',
          validMoves: [
            { from: 'd1', to: 'd2' },
          ],
          highlightSquares: ['d2'],
          successMessage: 'Boom! The Rook captures in a straight line!',
          hintMessage: 'Move the Rook straight up to capture the black pawn on d2',
        },
      },
      {
        type: 'summary',
        title: 'Rook Mastered!',
        description: 'You\'ve learned the Rook! Remember:\n• Moves in straight lines (up, down, left, right)\n• Can move as far as it wants\n• Can\'t jump over pieces\n• Very powerful in open positions!',
      },
    ],
  },
  {
    id: 'knight',
    piece: 'N',
    name: 'The Knight',
    icon: '♞',
    symbol: 'N',
    color: '#e67e22',
    tagline: 'The tricky jumper that leaps in an L-shape!',
    steps: [
      {
        type: 'intro',
        title: 'Meet the Knight',
        description: 'The Knight is a horse! It\'s the trickiest piece because it can JUMP over other pieces. No other piece can do that! You start with two Knights.',
      },
      {
        type: 'demo',
        title: 'How the Knight Moves',
        description: 'The Knight moves in an "L" shape: two squares in one direction, then one square to the side. It can jump over any piece in its way!',
        fen: '8/8/8/8/4N3/8/8/8 w - - 0 1',
        highlightSquares: ['d2', 'd6', 'c3', 'c5', 'f2', 'f6', 'g3', 'g5'],
        arrows: [['e4', 'd6'], ['e4', 'f6'], ['e4', 'c5'], ['e4', 'g5'], ['e4', 'c3'], ['e4', 'g3'], ['e4', 'd2'], ['e4', 'f2']],
      },
      {
        type: 'try',
        title: 'Your Turn! Jump the Knight',
        description: 'Move the Knight in an L-shape. Remember: 2 squares one way, then 1 square to the side!',
        challenge: {
          instruction: 'Jump the Knight to any L-shaped square!',
          fen: '8/8/8/8/4N3/8/8/8 w - - 0 1',
          validMoves: [
            { from: 'e4', to: 'd2' }, { from: 'e4', to: 'f2' },
            { from: 'e4', to: 'c3' }, { from: 'e4', to: 'g3' },
            { from: 'e4', to: 'c5' }, { from: 'e4', to: 'g5' },
            { from: 'e4', to: 'd6' }, { from: 'e4', to: 'f6' },
          ],
          highlightSquares: ['d2', 'f2', 'c3', 'g3', 'c5', 'g5', 'd6', 'f6'],
          successMessage: 'Amazing! The Knight jumps in its special L-shape!',
          hintMessage: 'The Knight moves 2 squares in one direction, then 1 to the side',
        },
      },
      {
        type: 'attack-demo',
        title: 'How the Knight Captures',
        description: 'The Knight captures by landing on an enemy piece. Since it can jump, it can attack pieces that other pieces can\'t reach!',
        fen: '8/8/3p4/8/4N3/8/8/8 w - - 0 1',
        highlightSquares: ['d6'],
        arrows: [['e4', 'd6']],
      },
      {
        type: 'attack-try',
        title: 'Capture with the Knight!',
        description: 'Jump your Knight to capture the enemy piece!',
        challenge: {
          instruction: 'Capture the black pawn with your Knight!',
          fen: '8/8/5p2/8/4N3/8/8/8 w - - 0 1',
          validMoves: [
            { from: 'e4', to: 'f6' },
          ],
          highlightSquares: ['f6'],
          successMessage: 'The Knight leaps and captures! No piece can escape the Knight\'s jump!',
          hintMessage: 'Jump the Knight to f6 to capture the black pawn',
        },
      },
      {
        type: 'summary',
        title: 'Knight Mastered!',
        description: 'You\'ve learned the Knight! Remember:\n• Moves in an L-shape (2+1)\n• Can jump over other pieces\n• Great for surprise attacks\n• Always lands on the opposite color square!',
      },
    ],
  },
  {
    id: 'bishop',
    piece: 'B',
    name: 'The Bishop',
    icon: '♝',
    symbol: 'B',
    color: '#27ae60',
    tagline: 'The diagonal master that slices across the board!',
    steps: [
      {
        type: 'intro',
        title: 'Meet the Bishop',
        description: 'The Bishop moves diagonally! It\'s like a ninja that only travels on the slant. You have two Bishops — one lives on light squares, and the other on dark squares. They never switch!',
      },
      {
        type: 'demo',
        title: 'How the Bishop Moves',
        description: 'The Bishop slides diagonally in any direction, as far as it wants. It always stays on the same color square it started on!',
        fen: '8/8/8/8/3B4/8/8/8 w - - 0 1',
        highlightSquares: ['a1', 'b2', 'c3', 'e5', 'f6', 'g7', 'h8', 'a7', 'b6', 'c5', 'e3', 'f2', 'g1'],
        arrows: [['d4', 'h8'], ['d4', 'a1'], ['d4', 'a7'], ['d4', 'g1']],
      },
      {
        type: 'try',
        title: 'Your Turn! Move the Bishop',
        description: 'Slide the Bishop along any diagonal! It can go as far as you want.',
        challenge: {
          instruction: 'Move the Bishop diagonally!',
          fen: '8/8/8/8/3B4/8/8/8 w - - 0 1',
          validMoves: [
            { from: 'd4', to: 'c3' }, { from: 'd4', to: 'b2' }, { from: 'd4', to: 'a1' },
            { from: 'd4', to: 'e5' }, { from: 'd4', to: 'f6' }, { from: 'd4', to: 'g7' },
            { from: 'd4', to: 'h8' }, { from: 'd4', to: 'c5' }, { from: 'd4', to: 'b6' },
            { from: 'd4', to: 'a7' }, { from: 'd4', to: 'e3' }, { from: 'd4', to: 'f2' },
            { from: 'd4', to: 'g1' },
          ],
          successMessage: 'Wonderful! The Bishop glides diagonally across the board!',
          hintMessage: 'Click the Bishop and move it along any diagonal',
        },
      },
      {
        type: 'attack-demo',
        title: 'How the Bishop Captures',
        description: 'The Bishop captures by moving diagonally to an enemy\'s square. It can strike from far away!',
        fen: '8/8/5p2/8/3B4/8/8/8 w - - 0 1',
        highlightSquares: ['f6'],
        arrows: [['d4', 'f6']],
      },
      {
        type: 'attack-try',
        title: 'Capture with the Bishop!',
        description: 'Slide your Bishop diagonally to capture the enemy piece!',
        challenge: {
          instruction: 'Capture the black pawn with your Bishop!',
          fen: '8/p7/8/8/3B4/8/8/8 w - - 0 1',
          validMoves: [
            { from: 'd4', to: 'a7' },
          ],
          highlightSquares: ['a7'],
          successMessage: 'Sliced! The Bishop strikes diagonally from a distance!',
          hintMessage: 'Move the Bishop diagonally to a7 to capture',
        },
      },
      {
        type: 'summary',
        title: 'Bishop Mastered!',
        description: 'You\'ve learned the Bishop! Remember:\n• Moves diagonally any distance\n• Stays on the same color square forever\n• Great for long-range attacks\n• Works best on open diagonals!',
      },
    ],
  },
  {
    id: 'queen',
    piece: 'Q',
    name: 'The Queen',
    icon: '♛',
    symbol: 'Q',
    color: '#e74c8c',
    tagline: 'The most powerful piece — she can go anywhere!',
    steps: [
      {
        type: 'intro',
        title: 'Meet the Queen',
        description: 'The Queen is the MOST POWERFUL piece on the board! She combines the powers of the Rook AND the Bishop. She can move in any direction: straight or diagonal!',
      },
      {
        type: 'demo',
        title: 'How the Queen Moves',
        description: 'The Queen can move straight (like a Rook) AND diagonally (like a Bishop), as far as she wants in any direction!',
        fen: '8/8/8/8/3Q4/8/8/8 w - - 0 1',
        highlightSquares: [
          'd1', 'd2', 'd3', 'd5', 'd6', 'd7', 'd8',
          'a4', 'b4', 'c4', 'e4', 'f4', 'g4', 'h4',
          'a1', 'b2', 'c3', 'e5', 'f6', 'g7', 'h8',
          'a7', 'b6', 'c5', 'e3', 'f2', 'g1',
        ],
        arrows: [['d4', 'd8'], ['d4', 'h4'], ['d4', 'h8'], ['d4', 'a7']],
      },
      {
        type: 'try',
        title: 'Your Turn! Move the Queen',
        description: 'The Queen can go anywhere in a straight or diagonal line. Try it!',
        challenge: {
          instruction: 'Move the Queen in any direction!',
          fen: '8/8/8/8/3Q4/8/8/8 w - - 0 1',
          validMoves: [
            { from: 'd4', to: 'd5' }, { from: 'd4', to: 'd6' }, { from: 'd4', to: 'd7' }, { from: 'd4', to: 'd8' },
            { from: 'd4', to: 'd3' }, { from: 'd4', to: 'd2' }, { from: 'd4', to: 'd1' },
            { from: 'd4', to: 'e4' }, { from: 'd4', to: 'f4' }, { from: 'd4', to: 'g4' }, { from: 'd4', to: 'h4' },
            { from: 'd4', to: 'c4' }, { from: 'd4', to: 'b4' }, { from: 'd4', to: 'a4' },
            { from: 'd4', to: 'e5' }, { from: 'd4', to: 'f6' }, { from: 'd4', to: 'g7' }, { from: 'd4', to: 'h8' },
            { from: 'd4', to: 'c3' }, { from: 'd4', to: 'b2' }, { from: 'd4', to: 'a1' },
            { from: 'd4', to: 'c5' }, { from: 'd4', to: 'b6' }, { from: 'd4', to: 'a7' },
            { from: 'd4', to: 'e3' }, { from: 'd4', to: 'f2' }, { from: 'd4', to: 'g1' },
          ],
          successMessage: 'Incredible! The Queen is unstoppable in any direction!',
          hintMessage: 'Move the Queen in any straight or diagonal line',
        },
      },
      {
        type: 'attack-demo',
        title: 'How the Queen Captures',
        description: 'The Queen captures by moving to an enemy piece\'s square — in any direction. She\'s deadly from both straight lines and diagonals!',
        fen: '8/8/8/5p2/3Q4/8/8/8 w - - 0 1',
        highlightSquares: ['f6'],
        arrows: [['d4', 'f6']],
      },
      {
        type: 'attack-try',
        title: 'Capture with the Queen!',
        description: 'Use the Queen\'s power to capture the enemy piece!',
        challenge: {
          instruction: 'Capture the black piece with your Queen!',
          fen: '8/8/8/8/3Q2p1/8/8/8 w - - 0 1',
          validMoves: [
            { from: 'd4', to: 'g4' },
          ],
          highlightSquares: ['g4'],
          successMessage: 'The Queen strikes! She\'s the strongest piece on the board!',
          hintMessage: 'Move the Queen straight to g4 to capture',
        },
      },
      {
        type: 'summary',
        title: 'Queen Mastered!',
        description: 'You\'ve learned the Queen! Remember:\n• Moves like Rook + Bishop combined\n• Can go straight OR diagonal\n• Most powerful piece on the board\n• Protect her — she\'s worth a lot!',
      },
    ],
  },
  {
    id: 'king',
    piece: 'K',
    name: 'The King',
    icon: '♚',
    symbol: 'K',
    color: '#f1c40f',
    tagline: 'The most important piece — protect him at all costs!',
    steps: [
      {
        type: 'intro',
        title: 'Meet the King',
        description: 'The King is the most IMPORTANT piece! If your King is captured, you lose the game. But don\'t worry — the King can move too, just one square at a time in any direction.',
      },
      {
        type: 'demo',
        title: 'How the King Moves',
        description: 'The King moves ONE square in any direction — up, down, left, right, or diagonally. He\'s slow but mighty!',
        fen: '8/8/8/8/3K4/8/8/8 w - - 0 1',
        highlightSquares: ['c3', 'c4', 'c5', 'd3', 'd5', 'e3', 'e4', 'e5'],
        arrows: [['d4', 'c5'], ['d4', 'd5'], ['d4', 'e5'], ['d4', 'e4'], ['d4', 'e3'], ['d4', 'd3'], ['d4', 'c3'], ['d4', 'c4']],
      },
      {
        type: 'try',
        title: 'Your Turn! Move the King',
        description: 'Move the King one square in any direction you like!',
        challenge: {
          instruction: 'Move the King one square!',
          fen: '8/8/8/8/3K4/8/8/8 w - - 0 1',
          validMoves: [
            { from: 'd4', to: 'c3' }, { from: 'd4', to: 'c4' }, { from: 'd4', to: 'c5' },
            { from: 'd4', to: 'd3' }, { from: 'd4', to: 'd5' },
            { from: 'd4', to: 'e3' }, { from: 'd4', to: 'e4' }, { from: 'd4', to: 'e5' },
          ],
          successMessage: 'The King takes a careful step! Remember — one square at a time.',
          hintMessage: 'Click the King and move him one square in any direction',
        },
      },
      {
        type: 'attack-demo',
        title: 'How the King Captures',
        description: 'The King captures by moving one square to an enemy piece. But be careful — the King can never move into danger!',
        fen: '8/8/8/8/3Kp3/8/8/8 w - - 0 1',
        highlightSquares: ['e4'],
        arrows: [['d4', 'e4']],
      },
      {
        type: 'attack-try',
        title: 'Capture with the King!',
        description: 'The enemy pawn is right next to your King. Capture it!',
        challenge: {
          instruction: 'Capture the black pawn with your King!',
          fen: '8/8/8/4p3/3K4/8/8/8 w - - 0 1',
          validMoves: [
            { from: 'd4', to: 'e5' },
          ],
          highlightSquares: ['e5'],
          successMessage: 'The King captures! Even the King can fight when needed!',
          hintMessage: 'Move the King diagonally to e5 to capture the pawn',
        },
      },
      {
        type: 'summary',
        title: 'King Mastered!',
        description: 'You\'ve learned the King! Remember:\n• Moves one square in any direction\n• Most IMPORTANT piece — lose him, lose the game\n• Can capture enemy pieces next to him\n• Keep him safe behind your other pieces!',
      },
    ],
  },
];

export function getLessonById(id: string): PieceLesson | undefined {
  return pieceLessons.find(l => l.id === id);
}
