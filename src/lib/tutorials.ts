export interface TutorialLesson {
  id: number;
  title: string;
  icon: string;
  description: string;
  category: string;
  content: TutorialStep[];
}

export interface TutorialStep {
  type: 'text' | 'board' | 'interactive';
  title?: string;
  text: string;
  fen?: string;
  highlightSquares?: string[];
  arrows?: [string, string][];
}

export const tutorials: TutorialLesson[] = [
  {
    id: 1,
    title: 'The Chess Kingdom',
    icon: '🏰',
    description: 'Welcome to the magical world of chess!',
    category: 'basics',
    content: [
      {
        type: 'text',
        title: 'Welcome, Young Wizard!',
        text: 'Chess is like a magical battle between two kingdoms. You command an army of enchanted pieces, each with its own special powers!',
      },
      {
        type: 'board',
        title: 'The Battlefield',
        text: 'This is the chess board — an 8x8 grid of light and dark squares. Your kingdom starts at the bottom, and your opponent is at the top!',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      },
      {
        type: 'text',
        title: 'Two Armies',
        text: 'Each army has 16 pieces: 1 King 👑, 1 Queen 👸, 2 Rooks 🏰, 2 Bishops ⛪, 2 Knights 🐴, and 8 Pawns 🧙‍♂️. White always moves first!',
      },
    ],
  },
  {
    id: 2,
    title: 'The Brave Pawns',
    icon: '♟️',
    description: 'Learn how the smallest warriors move!',
    category: 'pieces',
    content: [
      {
        type: 'text',
        title: 'The Pawns',
        text: 'Pawns are your frontline soldiers! They are small but brave. They move forward one square at a time, but they capture diagonally!',
      },
      {
        type: 'board',
        title: 'Pawn Movement',
        text: 'A pawn moves straight forward one square. On its first move, it can jump two squares! Look at the arrows showing where this pawn can go.',
        fen: '8/8/8/8/8/8/4P3/8 w - - 0 1',
        highlightSquares: ['e3', 'e4'],
        arrows: [['e2', 'e3'], ['e2', 'e4']],
      },
      {
        type: 'board',
        title: 'Pawn Captures',
        text: 'Pawns capture diagonally! They can only take pieces that are one square diagonally in front of them.',
        fen: '8/8/8/8/3p1p2/4P3/8/8 w - - 0 1',
        highlightSquares: ['d4', 'f4'],
        arrows: [['e3', 'd4'], ['e3', 'f4']],
      },
      {
        type: 'text',
        title: 'Pawn Promotion — Magic Transformation!',
        text: 'When a pawn reaches the other side of the board, it transforms into any piece you want (usually a Queen)! This is called promotion — the pawn becomes a powerful wizard! 🧙‍♂️✨',
      },
    ],
  },
  {
    id: 3,
    title: 'The Mighty Rook',
    icon: '🏰',
    description: 'The castle that slides across the land!',
    category: 'pieces',
    content: [
      {
        type: 'text',
        title: 'The Rook',
        text: 'The Rook is like a mighty castle tower! It moves in straight lines — up, down, left, or right — as far as it wants!',
      },
      {
        type: 'board',
        title: 'Rook Movement',
        text: 'The Rook can slide any number of squares along a row or column. Nothing stops it except other pieces!',
        fen: '8/8/8/8/3R4/8/8/8 w - - 0 1',
        highlightSquares: ['d1', 'd2', 'd3', 'd5', 'd6', 'd7', 'd8', 'a4', 'b4', 'c4', 'e4', 'f4', 'g4', 'h4'],
      },
    ],
  },
  {
    id: 4,
    title: 'The Sneaky Bishop',
    icon: '⛪',
    description: 'The diagonal wizard!',
    category: 'pieces',
    content: [
      {
        type: 'text',
        title: 'The Bishop',
        text: 'The Bishop is a diagonal wizard! It moves diagonally as far as it wants. One Bishop lives on light squares, the other on dark squares — they never switch!',
      },
      {
        type: 'board',
        title: 'Bishop Movement',
        text: 'The Bishop slides diagonally in any direction. It always stays on the same color square!',
        fen: '8/8/8/8/3B4/8/8/8 w - - 0 1',
        highlightSquares: ['a1', 'b2', 'c3', 'e5', 'f6', 'g7', 'h8', 'a7', 'b6', 'c5', 'e3', 'f2', 'g1'],
      },
    ],
  },
  {
    id: 5,
    title: 'The Jumping Knight',
    icon: '🐴',
    description: 'The only piece that can jump over others!',
    category: 'pieces',
    content: [
      {
        type: 'text',
        title: 'The Knight',
        text: 'The Knight is a magical horse that can JUMP over other pieces! It moves in an "L" shape — two squares in one direction, then one square to the side.',
      },
      {
        type: 'board',
        title: 'Knight Movement',
        text: 'The Knight jumps in an L-shape! It can leap over any piece in its way. Count: 2 squares one way, then 1 square to the side.',
        fen: '8/8/8/8/3N4/8/8/8 w - - 0 1',
        highlightSquares: ['b3', 'b5', 'c2', 'c6', 'e2', 'e6', 'f3', 'f5'],
      },
    ],
  },
  {
    id: 6,
    title: 'The Powerful Queen',
    icon: '👑',
    description: 'The most powerful piece on the board!',
    category: 'pieces',
    content: [
      {
        type: 'text',
        title: 'The Queen',
        text: 'The Queen is the MOST POWERFUL piece! She combines the Rook and Bishop — she can move in any direction (straight or diagonal) as far as she wants!',
      },
      {
        type: 'board',
        title: 'Queen Movement',
        text: 'The Queen can move like a Rook (straight) AND a Bishop (diagonal). She controls so many squares!',
        fen: '8/8/8/8/3Q4/8/8/8 w - - 0 1',
        highlightSquares: ['d1', 'd2', 'd3', 'd5', 'd6', 'd7', 'd8', 'a4', 'b4', 'c4', 'e4', 'f4', 'g4', 'h4', 'a1', 'b2', 'c3', 'e5', 'f6', 'g7', 'h8', 'a7', 'b6', 'c5', 'e3', 'f2', 'g1'],
      },
    ],
  },
  {
    id: 7,
    title: 'The King',
    icon: '🤴',
    description: 'Protect the King at all costs!',
    category: 'pieces',
    content: [
      {
        type: 'text',
        title: 'The King',
        text: 'The King is the most IMPORTANT piece (but not the strongest). If your King is captured, you lose! The King moves one square in any direction.',
      },
      {
        type: 'board',
        title: 'King Movement',
        text: 'The King moves one square in any direction. He must be protected at all times!',
        fen: '8/8/8/8/3K4/8/8/8 w - - 0 1',
        highlightSquares: ['c3', 'c4', 'c5', 'd3', 'd5', 'e3', 'e4', 'e5'],
      },
      {
        type: 'text',
        title: 'Check and Checkmate',
        text: 'When an enemy piece threatens your King, that\'s called "CHECK" ⚠️! You MUST escape check. If there\'s no escape... that\'s CHECKMATE — game over! 💀',
      },
    ],
  },
  {
    id: 8,
    title: 'Special Moves',
    icon: '✨',
    description: 'Castling and En Passant!',
    category: 'advanced',
    content: [
      {
        type: 'text',
        title: 'Castling — The King\'s Escape!',
        text: 'Once per game, the King can "castle" — jumping two squares toward a Rook while the Rook hops over the King! This protects your King and activates your Rook!',
      },
      {
        type: 'board',
        title: 'Before Castling',
        text: 'The King and Rook haven\'t moved yet, and the squares between them are empty. The King can castle!',
        fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
        highlightSquares: ['e1', 'g1', 'c1'],
        arrows: [['e1', 'g1'], ['e1', 'c1']],
      },
      {
        type: 'text',
        title: 'En Passant — The Ghost Capture!',
        text: 'If an enemy pawn jumps two squares and lands beside your pawn, you can capture it "in passing" — as if it only moved one square! This is called En Passant. 👻',
      },
    ],
  },
  {
    id: 9,
    title: 'Opening Strategy',
    icon: '📖',
    description: 'Start your game like a grandmaster!',
    category: 'strategy',
    content: [
      {
        type: 'text',
        title: 'The Opening Rules',
        text: 'Every great wizard follows these rules at the start:\n\n1. Control the CENTER (d4, d5, e4, e5)\n2. Develop your pieces (Knights and Bishops first!)\n3. Castle your King to safety!',
      },
      {
        type: 'board',
        title: 'Control the Center!',
        text: 'The four center squares are the most powerful. Pieces in the center control more of the board!',
        fen: 'rnbqkbnr/pppppppp/8/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 1',
        highlightSquares: ['d4', 'd5', 'e4', 'e5'],
      },
    ],
  },
  {
    id: 10,
    title: 'Tactics: Forks',
    icon: '🍴',
    description: 'Attack two pieces at once!',
    category: 'tactics',
    content: [
      {
        type: 'text',
        title: 'The Fork',
        text: 'A FORK is when one piece attacks TWO enemy pieces at the same time! The opponent can only save one — you win the other! Knights are fork champions! 🐴',
      },
      {
        type: 'board',
        title: 'Knight Fork!',
        text: 'This Knight is forking the King and Queen! The King must move, and the Knight captures the Queen!',
        fen: '2k5/8/8/3N4/8/8/8/4K3 w - - 0 1',
        highlightSquares: ['c7', 'b6'],
        arrows: [['d5', 'c7'], ['d5', 'b6']],
      },
    ],
  },
];

export function getTutorialsByCategory(category: string): TutorialLesson[] {
  return tutorials.filter(t => t.category === category);
}

export function getCategories(): { id: string; name: string; icon: string }[] {
  return [
    { id: 'basics', name: 'Chess Basics', icon: '🌟' },
    { id: 'pieces', name: 'The Pieces', icon: '♟️' },
    { id: 'advanced', name: 'Special Moves', icon: '✨' },
    { id: 'strategy', name: 'Strategy', icon: '📖' },
    { id: 'tactics', name: 'Tactics', icon: '⚡' },
  ];
}
