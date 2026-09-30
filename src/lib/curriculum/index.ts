import { World, Lesson } from './types';

export * from './types';

const EMPTY = '8/8/8/8/8/8/8/8 w - - 0 1';
const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const WORLDS: World[] = [
  // -------------------------------------------------------------------------
  {
    id: 'chess-land',
    title: 'Welcome to Chess Land',
    subtitle: 'The board and the armies',
    icon: '🏰',
    color: '#4CC9F0',
    lessons: [
      {
        id: 'board',
        title: 'The Magic Board',
        icon: '🗺️',
        blurb: 'Squares, files and ranks',
        steps: [
          { kind: 'talk', say: 'Hoo-hoo! Welcome to **Chess Land**! I\'m Coach Hoot, and I\'ll teach you everything. Chess is played on a board with **64 squares**: 8 across and 8 up. Light and dark squares take turns, like a checkerboard.', fen: EMPTY },
          { kind: 'quiz', say: 'Quick question! How many squares are on a chess board?', fen: EMPTY, options: ['32', '64', '100'], answer: 1, explain: '8 rows × 8 columns = 64 squares!' },
          { kind: 'talk', say: 'Each up-and-down column is a **file**. Files have letters from **a** to **h**. This is the **e-file**.', fen: EMPTY, highlights: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'] },
          { kind: 'talk', say: 'Each side-to-side row is a **rank**. Ranks have numbers from **1** to **8**. This is the **4th rank**.', fen: EMPTY, highlights: ['a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4'] },
          { kind: 'talk', say: 'Put the letter and the number together and every square gets its own name, like a treasure map! Where the e-file meets the 4th rank is **e4**.', fen: EMPTY, highlights: ['e4'] },
          { kind: 'find', say: 'Your turn, explorer! Tap the square I call out.', squares: ['e4', 'a1', 'h8', 'd5', 'c2', 'g6'] },
          { kind: 'quiz', say: 'Which square is in White\'s bottom-left corner?', fen: EMPTY, options: ['a1', 'h1', 'a8'], answer: 0, explain: 'Letter **a** is on the left and number **1** is at the bottom, so it\'s **a1**.' },
        ],
      },
      {
        id: 'setup',
        title: 'Two Armies',
        icon: '⚔️',
        blurb: 'Setting up the pieces',
        steps: [
          { kind: 'talk', say: 'Here are both armies ready for battle! **White** starts at the bottom and **Black** at the top. Each army has **16 pieces**.', fen: START },
          { kind: 'talk', say: 'The **rooks** stand in the corners, like castle towers. 🏰', fen: START, highlights: ['a1', 'h1', 'a8', 'h8'] },
          { kind: 'talk', say: 'Next to the rooks are the **knights**, the horses. 🐴', fen: START, highlights: ['b1', 'g1', 'b8', 'g8'] },
          { kind: 'talk', say: 'Then come the **bishops**. ⛪', fen: START, highlights: ['c1', 'f1', 'c8', 'f8'] },
          { kind: 'talk', say: 'The **queen** goes on her own colour: the white queen on a light square, the black queen on a dark square. The **king** stands right beside her. 👑', fen: START, highlights: ['d1', 'e1', 'd8', 'e8'] },
          { kind: 'talk', say: 'And the brave **pawns** fill the whole second row in front of everyone!', fen: START, highlights: ['a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2', 'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7'] },
          { kind: 'quiz', say: 'Where does the white queen start?', fen: START, options: ['d1', 'e1', 'a1'], answer: 0, explain: 'Queen on her own colour: **d1** is a light square, just right for the white queen.' },
          { kind: 'quiz', say: 'Who makes the very first move of the game?', fen: START, options: ['White', 'Black', 'Whoever is older'], answer: 0, explain: '**White always moves first.** Then the players take turns.' },
          { kind: 'quiz', say: 'When you set up the board, the bottom-right corner square should be…', fen: START, options: ['Light', 'Dark'], answer: 0, explain: 'Remember: **"light on the right"**!' },
        ],
      },
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: 'army',
    title: 'Meet the Army',
    subtitle: 'How every piece moves',
    icon: '♞',
    color: '#8C7CF0',
    lessons: [
      {
        id: 'rook',
        title: 'The Rook',
        icon: '♜',
        blurb: 'Zooms in straight lines',
        steps: [
          { kind: 'talk', say: 'This is the **rook**. It zooms in **straight lines**: up, down, left and right, as far as it likes!', fen: '8/8/8/8/3R4/8/8/8 w - - 0 1', arrows: [['d4', 'd8'], ['d4', 'd1'], ['d4', 'a4'], ['d4', 'h4']] },
          { kind: 'tap', say: 'Tap **every** square the rook can move to.', fen: '8/8/8/8/3R4/8/8/8 w - - 0 1', from: 'd4', explain: 'Wow, 14 squares! The rook is a powerful piece.' },
          { kind: 'stars', say: 'Collect all the stars with your rook! Tap the rook, then tap where it should go.', fen: '8/8/8/8/8/8/8/R7 w - - 0 1', stars: ['a5', 'e5', 'e8'], par: 3 },
          { kind: 'talk', say: 'The rook **can\'t jump** over pieces. When something is in the way, it has to stop.', fen: '8/8/2P5/8/8/2R2P2/8/8 w - - 0 1', arrows: [['c3', 'c5'], ['c3', 'e3']] },
          { kind: 'stars', say: 'Your pawns are in the way. Collect the stars anyway!', fen: '8/8/2P5/8/8/2R2P2/8/8 w - - 0 1', hero: 'c3', stars: ['c5', 'h5', 'h1'], par: 3 },
          { kind: 'stars', say: 'Enemy pieces can be **captured**! Land on them to take them off the board.', fen: '8/1p4p1/8/8/8/8/1R6/8 w - - 0 1', stars: ['b7', 'g7'], par: 2 },
          { kind: 'quiz', say: 'Pieces are worth points. How many points is a rook worth?', options: ['1', '3', '5', '9'], answer: 2, explain: 'A rook is worth **5 points**. (Pawn 1, knight 3, bishop 3, queen 9.)' },
        ],
      },
      {
        id: 'bishop',
        title: 'The Bishop',
        icon: '♝',
        blurb: 'Slides on diagonals',
        steps: [
          { kind: 'talk', say: 'Meet the **bishop**! It slides **diagonally**, as far as it likes.', fen: '8/8/8/8/3B4/8/8/8 w - - 0 1', arrows: [['d4', 'h8'], ['d4', 'a7'], ['d4', 'a1'], ['d4', 'g1']] },
          { kind: 'tap', say: 'Tap every square this bishop can reach.', fen: '8/8/8/8/3B4/8/8/8 w - - 0 1', from: 'd4', explain: 'That\'s 13 squares, all on the diagonals!' },
          { kind: 'talk', say: 'Here\'s a secret: a bishop **always stays on the same colour**. This bishop lives on dark squares forever!', fen: '8/8/8/8/3B4/8/8/8 w - - 0 1', highlights: ['a1', 'b2', 'c3', 'e5', 'f6', 'g7', 'h8', 'a7', 'b6', 'c5', 'e3', 'f2', 'g1'] },
          { kind: 'stars', say: 'Collect the stars with your bishop!', fen: '8/8/8/8/8/8/8/2B5 w - - 0 1', stars: ['e3', 'h6', 'f8'], par: 3 },
          { kind: 'stars', say: 'Capture the enemy pieces!', fen: '8/6r1/8/8/3n4/8/8/B7 w - - 0 1', stars: ['d4', 'g7'], par: 2 },
          { kind: 'quiz', say: 'True or false: a bishop on a light square can move to a dark square.', options: ['True', 'False'], answer: 1, explain: 'False! A bishop stays on its colour for the **whole game**.' },
        ],
      },
      {
        id: 'queen',
        title: 'The Queen',
        icon: '♛',
        blurb: 'The most powerful piece',
        steps: [
          { kind: 'talk', say: 'All hail the **queen**, the most powerful piece! She moves like a **rook AND a bishop** together.', fen: '8/8/8/8/3Q4/8/8/8 w - - 0 1', arrows: [['d4', 'd8'], ['d4', 'h8'], ['d4', 'h4'], ['d4', 'g1'], ['d4', 'd1'], ['d4', 'a1'], ['d4', 'a4'], ['d4', 'a7']] },
          { kind: 'tap', say: 'Your own pawns are blocking the queen. Tap every square she **can** still reach.', fen: '8/8/8/8/1P1P4/8/1Q1P4/8 w - - 0 1', from: 'b2', explain: 'Pieces can\'t move through their friends, not even the queen!' },
          { kind: 'stars', say: 'Zoom around and collect the stars!', fen: '8/8/8/8/8/8/8/3Q4 w - - 0 1', stars: ['d7', 'a4', 'h4'], par: 3 },
          { kind: 'stars', say: 'Careful! Enemy pieces **protect** each other. Never land on a square where an enemy could capture you. Capture both pieces safely!', fen: '8/8/2p5/1r6/8/8/8/Q7 w - - 0 1', stars: ['c6', 'b5'], guarded: true, par: 3 },
          { kind: 'quiz', say: 'How many points is the queen worth?', options: ['3', '5', '9'], answer: 2, explain: 'The queen is worth **9 points**. Take good care of her!' },
        ],
      },
      {
        id: 'king',
        title: 'The King',
        icon: '♚',
        blurb: 'The most important piece',
        steps: [
          { kind: 'talk', say: 'This is the **king**, the most important piece of all! He moves just **one step** in any direction.', fen: '8/8/8/8/3K4/8/8/8 w - - 0 1', arrows: [['d4', 'd5'], ['d4', 'e5'], ['d4', 'e4'], ['d4', 'e3'], ['d4', 'd3'], ['d4', 'c3'], ['d4', 'c4'], ['d4', 'c5']] },
          { kind: 'tap', say: 'Tap every square the king can step to.', fen: '8/8/8/8/3K4/8/8/8 w - - 0 1', from: 'd4', explain: 'Eight squares, all right next to him.' },
          { kind: 'stars', say: 'Walk the king to every star, one step at a time.', fen: '8/8/8/8/8/8/8/4K3 w - - 0 1', stars: ['e3', 'g4', 'f6'], par: 6 },
          { kind: 'talk', say: 'Important rule: the king can **never** step onto a square where an enemy could capture him. That would be walking into **check**!', fen: '8/8/b7/8/8/8/8/4K3 w - - 0 1', arrows: [['a6', 'f1', 'rgba(229,72,77,0.8)']] },
          { kind: 'stars', say: 'The black bishop guards a diagonal. Reach the stars without stepping into danger!', fen: '8/8/b7/8/8/8/8/4K3 w - - 0 1', stars: ['e4', 'b4'], guarded: true, par: 6 },
          { kind: 'quiz', say: 'How far can the king move in one turn?', options: ['One square', 'Two squares', 'As far as he wants'], answer: 0, explain: 'Just **one square**, but in any direction.' },
        ],
      },
      {
        id: 'knight',
        title: 'The Knight',
        icon: '♞',
        blurb: 'Jumps in an L-shape',
        steps: [
          { kind: 'talk', say: 'Neigh! The **knight** moves in an **L-shape**: two squares one way, then one square to the side.', fen: '8/8/8/8/3N4/8/8/8 w - - 0 1', arrows: [['d4', 'e6'], ['d4', 'f5'], ['d4', 'f3'], ['d4', 'e2'], ['d4', 'c2'], ['d4', 'b3'], ['d4', 'b5'], ['d4', 'c6']] },
          { kind: 'talk', say: 'The knight has a superpower: it\'s the only piece that can **jump over** other pieces!', fen: '8/8/8/2PPP3/2PNP3/2PPP3/8/8 w - - 0 1', arrows: [['d4', 'e6'], ['d4', 'b3']] },
          { kind: 'tap', say: 'Tap every square the knight can jump to.', fen: '8/8/8/8/3N4/8/8/8 w - - 0 1', from: 'd4', explain: 'Did you notice? The knight always lands on the **opposite colour**.' },
          { kind: 'stars', say: 'Hop to every star!', fen: '8/8/8/8/8/8/8/1N6 w - - 0 1', stars: ['c3', 'd5', 'f6'], par: 3 },
          { kind: 'stars', say: 'Jump in and capture the black pieces!', fen: '8/8/4p3/1p6/3N4/8/8/8 w - - 0 1', stars: ['b5', 'e6'], par: 3 },
          { kind: 'quiz', say: 'Which piece can jump over other pieces?', options: ['The bishop', 'The knight', 'The queen'], answer: 1, explain: 'Only the **knight** can jump!' },
        ],
      },
      {
        id: 'pawn',
        title: 'The Pawn',
        icon: '♟',
        blurb: 'Small but brave',
        steps: [
          { kind: 'talk', say: 'The **pawn** is small but brave! It marches **forward** one square at a time, and it can never go backward.', fen: '8/8/8/8/8/8/4P3/8 w - - 0 1', arrows: [['e2', 'e3']] },
          { kind: 'talk', say: 'On its **very first move**, a pawn may take a big jump of **two squares**.', fen: '8/8/8/8/8/8/4P3/8 w - - 0 1', arrows: [['e2', 'e4']] },
          { kind: 'move', say: 'Move your pawn **two squares** forward!', fen: 'k7/8/8/8/8/8/4P3/K7 w - - 0 1', accept: ['e2e4'], success: 'Two big steps! 🎉', hint: 'Drag the pawn from e2 to e4.' },
          { kind: 'talk', say: 'Pawns are sneaky: they **capture diagonally**, one square forward. They can\'t capture straight ahead.', fen: '8/8/8/3p1p2/4P3/8/8/8 w - - 0 1', arrows: [['e4', 'd5'], ['e4', 'f5']] },
          { kind: 'move', say: 'Capture the black pawn with your pawn!', fen: 'k7/8/8/3p4/4P3/8/8/K7 w - - 0 1', accept: ['e4d5'], success: 'Chomp! Diagonal capture! 🍪', hint: 'Pawns capture one step diagonally forward.' },
          { kind: 'stars', say: 'Use your pawn to reach the star and capture the enemy pawn!', fen: '8/8/8/4p3/8/8/3P4/8 w - - 0 1', stars: ['d4', 'e5'], par: 2 },
          { kind: 'talk', say: 'Here\'s the pawn\'s big dream: when it reaches the **last row**, it **promotes**. It turns into a queen, rook, bishop or knight. Almost always a **queen**! ✨', fen: '8/4P3/8/8/8/8/8/8 w - - 0 1', arrows: [['e7', 'e8']] },
          { kind: 'move', say: 'Push your pawn to the end and make a new queen!', fen: 'k7/4P3/8/8/8/8/8/K7 w - - 0 1', goal: 'promote', success: 'A brand-new queen! 👸', hint: 'Move the pawn one more square forward.' },
        ],
      },
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: 'capture',
    title: 'Capture & Defend',
    subtitle: 'Win pieces, keep yours safe',
    icon: '🛡️',
    color: '#3CC47C',
    lessons: [
      {
        id: 'values',
        title: 'Piece Points',
        icon: '💰',
        blurb: 'Which pieces are worth more',
        steps: [
          { kind: 'talk', say: 'Every piece has a **value** in points: pawn **1**, knight **3**, bishop **3**, rook **5**, queen **9**. The king is priceless. Lose him and you lose the game!', fen: '8/8/8/8/8/8/8/1PNBRQK1 w - - 0 1' },
          { kind: 'quiz', say: 'Which is worth more?', options: ['A rook', 'A knight'], answer: 0, explain: 'A rook (5) is worth more than a knight (3).' },
          { kind: 'quiz', say: 'You can capture a pawn **or** a queen. Which should you take?', options: ['The pawn', 'The queen'], answer: 1, explain: 'The queen is worth 9 points, the pawn only 1!' },
          { kind: 'move', say: 'Your knight can capture two different pieces. Take the one worth **more**!', fen: 'k7/8/8/2q5/4N3/8/5p2/K7 w - - 0 1', accept: ['e4c5'], success: 'You won the queen! That\'s 9 points! 💎', hint: 'Which is worth more, a queen or a pawn?', wrong: 'That works, but there was a much bigger prize!' },
          { kind: 'move', say: 'Only capture pieces that are **not protected**. Which one is free?', fen: '6k1/5ppp/8/1p6/n5b1/8/5PPP/3Q2K1 w - - 0 1', accept: ['d1g4'], success: 'Smart! The bishop had no guards. 🎯', hint: 'The knight is protected by a pawn. Is the bishop protected?', wrong: 'Careful! That piece was protected, and you\'d lose your queen.' },
        ],
      },
      {
        id: 'defend',
        title: 'Safe & Sound',
        icon: '🛡️',
        blurb: 'Rescue pieces under attack',
        steps: [
          { kind: 'talk', say: 'When an enemy attacks one of your pieces, you need to **save it**! You can move it to a safe square, protect it, or block the attack.', fen: '6k1/5ppp/8/4p3/3N4/8/5PPP/6K1 w - - 0 1', arrows: [['e5', 'd4', 'rgba(229,72,77,0.8)']] },
          { kind: 'move', say: 'The black pawn is attacking your knight! Move it to a **safe** square.', fen: '6k1/5ppp/8/4p3/3N4/8/5PPP/6K1 w - - 0 1', goal: 'safe', success: 'Phew! Your knight is safe. 😌', hint: 'Look for a square where no black piece can capture your knight.', wrong: 'Oh no, your piece can still be captured there. Try another square!' },
          { kind: 'move', say: 'Now your bishop is in danger. Rescue it!', fen: 'r5k1/5ppp/8/3p4/2B5/8/5PPP/6K1 w - - 0 1', goal: 'safe', success: 'Great rescue! 🦸', hint: 'The pawn on d5 attacks c4. Where can the bishop hide?', wrong: 'Hmm, something can still be captured. Try again!' },
          { kind: 'move', say: 'The knight is attacking your **queen**! Save her!', fen: '6k1/5ppp/8/3n4/8/4Q3/5PPP/6K1 w - - 0 1', goal: 'safe', success: 'The queen is safe! 👸', hint: 'Find a square the knight can\'t reach.', wrong: 'The queen can still be captured there!' },
          { kind: 'quiz', say: 'Is it a good idea to trade your queen (9) for a knight (3)?', options: ['No way!', 'Yes, great deal'], answer: 0, explain: 'You\'d give away 9 points and only get 3 back. **Bad trade!**' },
        ],
      },
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: 'check',
    title: 'Check & Checkmate',
    subtitle: 'How to win the game',
    icon: '👑',
    color: '#FF8A5B',
    lessons: [
      {
        id: 'check',
        title: 'Check!',
        icon: '⚡',
        blurb: 'Attacking the king',
        steps: [
          { kind: 'talk', say: 'When a piece attacks the enemy **king**, that\'s called **check**! The king must get out of danger right away.', fen: '4k3/8/8/8/8/8/8/4R1K1 b - - 0 1', arrows: [['e1', 'e8', 'rgba(229,72,77,0.8)']] },
          { kind: 'move', say: 'Give check with your rook!', fen: '4k3/8/8/8/8/8/8/R5K1 w - - 0 1', goal: 'check', success: 'Check! The king is under attack! ⚡', hint: 'Put your rook on the same line as the black king.' },
          { kind: 'move', say: 'Now give check with your knight!', fen: '4k3/8/8/8/4N3/8/8/6K1 w - - 0 1', goal: 'check', success: 'Knight check! Sneaky! 🐴', hint: 'Jump to a square where the knight attacks e8.' },
          { kind: 'move', say: 'Give check with your bishop!', fen: '4k3/8/8/8/8/8/8/3B2K1 w - - 0 1', goal: 'check', success: 'Diagonal check! 🎯', hint: 'Find a diagonal that leads to the king.' },
          { kind: 'quiz', say: 'What must you do when your king is in check?', options: ['Get out of check right away', 'Ignore it', 'Move any piece you like'], answer: 0, explain: 'You **must** get out of check on your very next move.' },
        ],
      },
      {
        id: 'escape',
        title: 'Escape Check',
        icon: '🏃',
        blurb: 'Move, block or capture',
        steps: [
          { kind: 'talk', say: 'There are **3 ways** to escape check:\n1. **Move** the king to a safe square\n2. **Block** the attack with another piece\n3. **Capture** the attacking piece', fen: '4r1k1/8/8/8/8/8/3P1P2/3QKB2 w - - 0 1', arrows: [['e8', 'e1', 'rgba(229,72,77,0.8)']] },
          { kind: 'move', say: 'Your king is in check! **Move** him to a safe square.', fen: '4r1k1/8/8/8/8/8/8/4K3 w - - 0 1', goal: 'escape', success: 'Escaped! 🏃', hint: 'Step off the e-file, where the rook is attacking.' },
          { kind: 'move', say: 'The king is surrounded by his own pieces. **Block** the check!', fen: '4r1k1/8/8/8/8/8/3P1P2/3QKB2 w - - 0 1', goal: 'escape', success: 'Blocked! Nothing gets through that wall. 🧱', hint: 'Put a piece between the rook and your king, on e2.' },
          { kind: 'move', say: 'That rook came too close. **Capture** it!', fen: '6k1/8/8/8/8/8/4r3/4K3 w - - 0 1', accept: ['e1e2'], success: 'Captured the attacker! 💪', hint: 'The rook isn\'t protected. Your king can take it!', wrong: 'That escapes, but you could have captured the rook for free!' },
          { kind: 'move', say: 'Check from a knight! Knights can\'t be blocked. Find the best escape.', fen: '6k1/5ppp/8/8/8/5n2/3B1PPP/R3K3 w Q - 0 1', accept: ['g2f3'], success: 'You captured the knight! Best escape! 🌟', hint: 'Can one of your pawns capture the knight?', wrong: 'You escaped, but you could have captured the knight instead!' },
        ],
      },
      {
        id: 'checkmate',
        title: 'Checkmate!',
        icon: '🏆',
        blurb: 'The way to win',
        steps: [
          { kind: 'talk', say: '**Checkmate** means the king is in check and has **no way to escape**. That wins the game! 🏆 Look: the rook attacks the king, and his own pawns trap him.', fen: '3R2k1/5ppp/8/8/8/8/8/6K1 b - - 0 1', arrows: [['d8', 'g8', 'rgba(229,72,77,0.8)']] },
          { kind: 'move', say: 'Checkmate the king with your rook!', fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1', goal: 'mate', success: 'CHECKMATE! You win! 🏆', hint: 'The king is stuck behind his pawns. Attack along the back row!' },
          { kind: 'move', say: 'Checkmate with your queen! Your king helps too.', fen: 'k7/8/1K6/8/8/8/7Q/8 w - - 0 1', goal: 'mate', success: 'Checkmate! The queen and king work together! 👑', hint: 'Your king already guards a7 and b7. Can your queen check along the top row?' },
          { kind: 'move', say: 'Two rooks are a great team. Find checkmate!', fen: 'k7/8/8/8/8/8/1R6/2R3K1 w - - 0 1', goal: 'mate', success: 'The rook ladder! Checkmate! 🪜', hint: 'One rook guards the b-file. Use the other to check on the a-file.' },
          { kind: 'move', say: 'The famous **smothered mate**! Use your knight.', fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1', goal: 'mate', success: 'Smothered mate! The king was trapped by his own pieces! 🤯', hint: 'Find a knight jump that checks h8.' },
        ],
      },
      {
        id: 'stalemate',
        title: 'Stalemate & Draws',
        icon: '🤝',
        blurb: 'When nobody wins',
        steps: [
          { kind: 'talk', say: 'Watch out for **stalemate**! It\'s when a player is **not** in check but has **no legal moves**. The game ends in a **draw**, even if you have lots more pieces! 😮', fen: 'k7/2Q5/1K6/8/8/8/8/8 b - - 0 1' },
          { kind: 'quiz', say: 'It\'s Black\'s turn. What is this?', fen: 'k7/2Q5/1K6/8/8/8/8/8 b - - 0 1', options: ['Checkmate', 'Stalemate', 'Check'], answer: 1, explain: 'The black king is **not** in check, but every square around him is attacked. **Stalemate!**' },
          { kind: 'quiz', say: 'And what about this one? Black to move.', fen: 'k7/1Q6/1K6/8/8/8/8/8 b - - 0 1', options: ['Checkmate', 'Stalemate'], answer: 0, explain: 'The queen gives check and the king can\'t escape or capture her (the white king protects her). **Checkmate!**' },
          { kind: 'move', say: 'Win the game, but **don\'t** stalemate! Find checkmate.', fen: 'k7/8/1K6/8/8/8/8/2Q5 w - - 0 1', goal: 'mate', success: 'Checkmate, not stalemate. Perfect! 🎯', hint: 'Give check along the 8th row.' },
          { kind: 'talk', say: 'Other ways to draw: when only the two kings are left, when the same position repeats **three times**, or when both players agree to a draw. 🤝', fen: '8/8/3k4/8/8/4K3/8/8 w - - 0 1' },
        ],
      },
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: 'special',
    title: 'Special Moves',
    subtitle: 'Castling, promotion, en passant',
    icon: '✨',
    color: '#FF8FB1',
    lessons: [
      {
        id: 'castling',
        title: 'Castling',
        icon: '🏯',
        blurb: 'Tuck your king away safely',
        steps: [
          { kind: 'talk', say: '**Castling** is a special move where the king and a rook move together! The king steps **two squares** toward a rook, and the rook hops over to the other side of the king.', fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1', arrows: [['e1', 'g1'], ['h1', 'f1']] },
          { kind: 'move', say: 'Castle on the **kingside**! Drag your king two squares to the right.', fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', goal: 'castle', success: 'Castled! Your king is safe in his castle. 🏯', hint: 'Move the king from e1 to g1. The rook jumps by itself!' },
          { kind: 'talk', say: 'You **can\'t** castle if:\n• the king or that rook has already moved\n• your king is in check\n• the king would pass through or land on an attacked square', fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1' },
          { kind: 'move', say: 'Now castle on the **queenside**, to the left!', fen: 'r3kbnr/pppqpppp/2n5/3p1b2/3P1B2/2N5/PPPQPPPP/R3KBNR w KQkq - 6 5', goal: 'castle', success: 'Queenside castle! Nice and cosy. 🏰', hint: 'Move the king from e1 to c1.' },
          { kind: 'quiz', say: 'Can White castle kingside right now?', fen: 'rn1qkbnr/ppp2ppp/8/3pp3/2b1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5', arrows: [['c4', 'f1', 'rgba(229,72,77,0.8)']], options: ['Yes', 'No, f1 is attacked'], answer: 1, explain: 'The black bishop attacks **f1**. The king can\'t pass through an attacked square!' },
        ],
      },
      {
        id: 'promotion',
        title: 'Pawn Power-Up',
        icon: '👸',
        blurb: 'Promote your pawns',
        steps: [
          { kind: 'talk', say: 'Remember: a pawn that reaches the **last row** gets promoted! Let\'s practise turning pawns into queens.', fen: '8/1P6/8/8/8/8/8/8 w - - 0 1', arrows: [['b7', 'b8']] },
          { kind: 'move', say: 'Promote your pawn!', fen: '8/1P4k1/8/8/8/8/6K1/8 w - - 0 1', goal: 'promote', success: 'New queen on the board! 👸', hint: 'Push the pawn to b8.' },
          { kind: 'move', say: 'This time, capture while you promote! The rook is on a8.', fen: 'r3k3/1P6/8/8/8/8/8/4K3 w - - 0 1', accept: ['b7a8q', 'b7a8r', 'b7a8b', 'b7a8n'], success: 'Captured AND promoted! Double win! 🎉', hint: 'Pawns capture diagonally, even when they promote.', wrong: 'If you promote on b8, the rook can capture your new queen!' },
          { kind: 'play', say: 'Race! Push your pawn to the end before the black king catches it. The computer plays Black.', fen: '8/8/1K6/2P5/8/8/8/6k1 w - - 0 1', goal: 'promote', maxMoves: 6, success: 'You won the race! 🏁', hint: 'Just keep pushing the pawn forward!' },
        ],
      },
      {
        id: 'en-passant',
        title: 'En Passant',
        icon: '🥖',
        blurb: 'The sneaky pawn capture',
        steps: [
          { kind: 'talk', say: '**En passant** (say "on pah-SAHN") means "in passing" in French. 🥖 If an enemy pawn jumps two squares and lands **right beside** your pawn, you can capture it as if it had moved only **one** square!', fen: '8/8/8/3pP3/8/8/8/8 w - - 0 1', arrows: [['e5', 'd6']] },
          { kind: 'move', say: 'Black just jumped the pawn from f7 to f5. Capture it **en passant**!', fen: 'rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3', accept: ['e5f6'], success: 'En passant! Très bien! 🥐', hint: 'Move your e5 pawn diagonally to f6. The black pawn disappears!', wrong: 'Look at the pawn that just jumped next to yours.' },
          { kind: 'quiz', say: 'When can you capture en passant?', options: ['Only on the very next move', 'Any time later'], answer: 0, explain: 'It\'s now or never! You must do it **right away**.' },
        ],
      },
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: 'tactics',
    title: 'Tricks & Tactics',
    subtitle: 'Forks, pins and skewers',
    icon: '🎯',
    color: '#F5B841',
    lessons: [
      {
        id: 'forks',
        title: 'Forks',
        icon: '🍴',
        blurb: 'Attack two pieces at once',
        steps: [
          { kind: 'talk', say: 'A **fork** is when one piece attacks **two** enemy pieces at the same time. Your opponent can only save one! 🍴', fen: 'r3k3/2N5/8/8/8/8/8/4K3 b - - 0 1', arrows: [['c7', 'e8', 'rgba(229,72,77,0.8)'], ['c7', 'a8', 'rgba(229,72,77,0.8)']] },
          { kind: 'move', say: 'Find the **knight fork**!', fen: 'r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1', accept: ['b5c7'], then: [{ reply: 'e8e7', say: 'The king ran away. Now grab the rook!', accept: ['c7a8'] }], success: 'Fork complete! You won a whole rook! 🍴', hint: 'Jump to a square that attacks the king AND the rook.' },
          { kind: 'move', say: 'Pawns can fork too! Attack two pieces with one pawn push.', fen: '4k3/8/2n1b3/8/2PP4/8/8/4K3 w - - 0 1', accept: ['d4d5'], success: 'Pawn fork! The knight and bishop are both attacked! 🍴', hint: 'Which pawn could attack both c6 and e6?' },
          { kind: 'move', say: 'The queen is a fork master. Check the king and attack the rook!', fen: 'k7/8/8/8/8/8/2K5/3QB2r w - - 0 1', accept: ['d1d5'], then: [{ reply: 'a8b8', say: 'Now take the rook!', accept: ['d5h1'] }], success: 'Queen fork! 🏆', hint: 'Find a queen move that gives check on a diagonal that also hits h1.' },
        ],
      },
      {
        id: 'pins',
        title: 'Pins',
        icon: '📌',
        blurb: 'Freeze an enemy piece',
        steps: [
          { kind: 'talk', say: 'A **pin** freezes a piece. If it moves, something more important behind it would be captured. Here the knight can\'t move, or the king would be in check! 📌', fen: '4k3/8/8/4n3/8/8/8/4R1K1 b - - 0 1', arrows: [['e1', 'e8', 'rgba(229,72,77,0.8)']] },
          { kind: 'move', say: 'Pin the knight to the king!', fen: '4k3/8/8/4n3/8/8/8/R5K1 w - - 0 1', accept: ['a1e1'], success: 'Pinned! That knight is frozen. 🧊', hint: 'Line your rook up with the knight and the king.' },
          { kind: 'move', say: 'The knight is pinned and can\'t run away. Attack it with a pawn!', fen: '4k3/8/8/4n3/8/5P2/8/4R1K1 w - - 0 1', accept: ['f3f4'], success: 'The pinned knight is lost! 🎯', hint: 'Which pawn move attacks e5?' },
          { kind: 'move', say: 'Use your bishop to pin the knight to the king!', fen: 'r2qk2r/ppp2ppp/2np4/4p3/4P3/5N2/PPP2PPP/R2QKB1R w KQkq - 0 7', accept: ['f1b5'], success: 'Pinned! The knight can\'t move without exposing its king. 📌', hint: 'Put a bishop on the diagonal through c6 and e8.' },
        ],
      },
      {
        id: 'skewers',
        title: 'Skewers',
        icon: '🍢',
        blurb: 'Attack through a piece',
        steps: [
          { kind: 'talk', say: 'A **skewer** is like a backwards pin: you attack a big piece, and when it moves out of the way, you capture the piece **behind** it! 🍢', fen: '8/5q2/8/8/2k5/8/B7/7K b - - 0 1', arrows: [['a2', 'c4', 'rgba(229,72,77,0.8)'], ['c4', 'f7', 'rgba(229,72,77,0.5)']] },
          { kind: 'move', say: 'Skewer the king and queen with your bishop!', fen: '8/5q2/8/8/2k5/8/8/1B5K w - - 0 1', accept: ['b1a2'], then: [{ reply: 'c4b4', say: 'The king had to move. Now take the queen!', accept: ['a2f7'] }], success: 'Skewered! You won the queen! 🍢', hint: 'Check the king from far away on the same diagonal as the queen.' },
          { kind: 'move', say: 'Rook skewer! Check the king so you can win the rook behind it.', fen: '8/8/8/8/2k3r1/8/7K/R7 w - - 0 1', accept: ['a1a4'], then: [{ reply: 'c4d5', say: 'The king had to step off the row. Grab the rook!', accept: ['a4g4'] }], success: 'Skewer success! 🍢', hint: 'Check the king along the 4th row.' },
        ],
      },
      {
        id: 'mate-patterns',
        title: 'Mate Patterns',
        icon: '🧩',
        blurb: 'Famous checkmates',
        steps: [
          { kind: 'talk', say: 'Strong players remember **checkmate patterns**. Here are some famous ones to add to your collection!', fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1' },
          { kind: 'move', say: '**Back rank mate**: the king is stuck behind his own pawns.', fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', goal: 'mate', success: 'Back rank mate! 🧱', hint: 'Slide your rook to the 8th row.' },
          { kind: 'move', say: '**Scholar\'s mate**: queen and bishop attack f7 together.', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', goal: 'mate', success: 'Scholar\'s mate! 🎓', hint: 'Capture on f7. Your bishop protects the queen.' },
          { kind: 'move', say: '**Kiss of death**: queen right next to the king, protected by a friend.', fen: '6k1/5p1p/5PpQ/8/8/8/8/6K1 w - - 0 1', goal: 'mate', success: 'Mwah! Kiss of death! 💋', hint: 'Your f6 pawn protects g7. Put the queen right next to the king!' },
          { kind: 'move', say: '**Queen and knight** team-up!', fen: '5rk1/5p1p/8/5N2/3Q4/8/8/6K1 w - - 0 1', goal: 'mate', success: 'Great teamwork! 🤝', hint: 'Your knight guards g7. Can the queen land there?' },
        ],
      },
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: 'winning',
    title: 'Winning Games',
    subtitle: 'Openings and endgames',
    icon: '🏆',
    color: '#E5484D',
    lessons: [
      {
        id: 'opening',
        title: 'Great Beginnings',
        icon: '🌅',
        blurb: 'How to start a game',
        steps: [
          { kind: 'talk', say: 'Three **golden rules** for the start of a game:\n1. Take the **center** with pawns\n2. **Develop** your knights and bishops\n3. **Castle** to keep your king safe', fen: START, highlights: ['d4', 'e4', 'd5', 'e5'] },
          { kind: 'move', say: 'Make a great first move: grab the **center** with a pawn!', fen: START, accept: ['e2e4', 'd2d4'], success: 'Right in the center! 🎯', hint: 'Push the e-pawn or d-pawn two squares.', wrong: 'That\'s legal, but the best first moves grab the center squares.' },
          { kind: 'move', say: 'Black answered e5. Now **develop** a knight toward the center!', fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', accept: ['g1f3', 'b1c3'], success: 'Knights before bishops! 🐴', hint: 'Knights love the f3 and c3 squares.', wrong: 'Try bringing a knight out toward the middle.' },
          { kind: 'move', say: 'Now develop your **bishop** to an active square.', fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', accept: ['f1c4', 'f1b5'], success: 'Your bishop is in the game! ⛪', hint: 'c4 and b5 are great squares for this bishop.', wrong: 'Try a square where the bishop aims at the enemy camp.' },
          { kind: 'quiz', say: 'Should you bring your queen out very early?', options: ['Usually not, she can get chased around', 'Yes, always!'], answer: 0, explain: 'Enemy pieces will attack your queen and gain time. Develop the smaller pieces first!' },
          { kind: 'move', say: 'You are Black. White threatens **Scholar\'s mate** on f7! Stop it!', fen: 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3', accept: ['g7g6', 'd8e7', 'd8f6'], success: 'Defended! No cheap tricks today! 🛡️', hint: 'Protect f7, or block the queen\'s path.', wrong: 'Uh-oh, Qxf7 would still be checkmate. Protect f7!' },
        ],
      },
      {
        id: 'ladder-mate',
        title: 'Rook Ladder',
        icon: '🪜',
        blurb: 'Checkmate with two rooks',
        steps: [
          { kind: 'talk', say: 'Two rooks can checkmate a lone king like climbing a ladder: one rook **checks**, the other **blocks** the escape row, and they take turns stepping up! 🪜', fen: '8/8/8/3k4/8/8/8/R6R w - - 0 1', arrows: [['a1', 'a4'], ['h1', 'h5']] },
          { kind: 'play', say: 'Checkmate the king with your two rooks! Tip: keep your rooks far away from the king so he can\'t attack them.', fen: '8/8/8/3k4/8/8/8/R3K2R w - - 0 1', goal: 'mate', maxMoves: 16, success: 'Ladder mate! You climbed all the way! 🪜', hint: 'Rook to the 4th row, then the other rook checks on the 5th row, and keep climbing!' },
        ],
      },
      {
        id: 'queen-mate',
        title: 'Queen Checkmate',
        icon: '👸',
        blurb: 'King + queen vs king',
        steps: [
          { kind: 'talk', say: 'Winning with a queen: use her to squeeze the king into a smaller and smaller box, pushing him to the **edge**. Then bring your king closer to help. Watch out for stalemate! ⚠️', fen: '8/8/8/4k3/8/8/8/3QK3 w - - 0 1' },
          { kind: 'play', say: 'Checkmate the king with your queen and king!', fen: '8/8/8/4k3/8/8/8/3QK3 w - - 0 1', goal: 'mate', maxMoves: 25, success: 'Queen checkmate mastered! 👑', hint: 'Make a knight-jump distance from the king with your queen to shrink his box. Don\'t forget to bring your king!' },
        ],
      },
      {
        id: 'rook-mate',
        title: 'Rook Checkmate',
        icon: '🏰',
        blurb: 'King + rook vs king',
        steps: [
          { kind: 'talk', say: 'The lone rook needs its king\'s help! Use the rook to cut the enemy king off, walk your king up **face to face**, then check along the edge.', fen: '8/8/8/3k4/8/8/8/R3K3 w - - 0 1' },
          { kind: 'play', say: 'Checkmate with king and rook. You can do it!', fen: '8/8/8/3k4/8/8/8/R3K3 w - - 0 1', goal: 'mate', maxMoves: 40, success: 'Rook checkmate! You\'re a real chess player now! 🏆', hint: 'Cut the king off with the rook, bring your king opposite his, then check.' },
        ],
      },
    ],
  },
];

export const ALL_LESSONS: Lesson[] = WORLDS.flatMap((w) => w.lessons);
export const LESSON_ORDER: string[] = ALL_LESSONS.map((l) => l.id);

export function findLesson(id: string): { lesson: Lesson; world: typeof WORLDS[number]; index: number } | null {
  for (const world of WORLDS) {
    const lesson = world.lessons.find((l) => l.id === id);
    if (lesson) return { lesson, world, index: LESSON_ORDER.indexOf(id) };
  }
  return null;
}
