# Little Knights ♞ Chess for Kids

A friendly chess academy for children. **Coach Hoot** the owl teaches chess step by step with interactive lessons. Puzzles adapt to each child's level, and the computer opponents run on real **Stockfish 19** inside the browser.

## What's inside

### 📚 Chess Academy: 25 interactive lessons in 7 worlds
From "what is a square?" all the way to checkmating with a lone rook:

| World | Lessons |
|---|---|
| 🏰 Welcome to Chess Land | The board, files & ranks, setting up |
| ♞ Meet the Army | Rook, bishop, queen, king, knight, pawn |
| 🛡️ Capture & Defend | Piece values, rescuing attacked pieces |
| 👑 Check & Checkmate | Check, escaping check, checkmate, stalemate |
| ✨ Special Moves | Castling, promotion, en passant |
| 🎯 Tricks & Tactics | Forks, pins, skewers, famous mate patterns |
| 🏆 Winning Games | Opening principles, rook ladder, queen mate, rook mate |

Lessons mix seven kinds of activity: coach explanations with arrows, quizzes, find-the-square games, "tap every square this piece can reach", **star hunts** (collect stars and capture pieces, with a par for 3 stars), real-position move challenges with multi-move follow-ups, and **play-it-out endgames** against Stockfish. Every lesson position is checked automatically (`src/lib/curriculum/curriculum.test.ts`). Each move must be legal, each goal reachable, and each star hunt's par must be exactly optimal.

### 🧩 Puzzles that evolve with the child
- **Adaptive training**: each child has an Elo-style puzzle rating. The next puzzle is picked near that rating, weighted toward themes they get wrong most, and never repeats one they've already seen. When the bank runs dry, fresh checkmate puzzles are generated on the fly and proven solvable.
- **Daily 5**: the same five puzzles for everyone each day, tuned to the child's level.
- **Puzzle Rush**: 3 minutes, 3 lives, and the puzzles keep getting harder.
- **Themes**: practise mates in 1, 2 or 3, forks, back-rank mates, promotion, free pieces and more.

The puzzle bank (`src/data/puzzle-bank.json`) was generated and verified with Stockfish. See [`scripts/generate-puzzles.mjs`](scripts/generate-puzzles.mjs) and [`scripts/curate-puzzles.mjs`](scripts/curate-puzzles.mjs).

### ♟️ The game table
Ten bot opponents, from **Pip the Chick** (~250) to the **Dragon King** (full-strength Stockfish). Each has its own personality and lines. Weaker bots sample from Stockfish's top moves with a temperature and make occasional "kid moves", so they play like real beginners instead of a strong engine that throws games on purpose.

Helpers kids can switch on or off:
- 🦉 **Coach tips**: every move is graded (best → blunder) and explained in kid language, e.g. "Your queen on d5 can be captured"
- 💡 **Hints**: first the piece to move, then the exact move
- ↩️ **Take-backs**
- 📊 **Who's winning bar**
- 🟢 **Possible-move dots**

Games auto-save and can be resumed. Results feed a game rating that suggests the best-matched opponent.

### ⭐ Motivation
XP and levels with ranks (Pawn → Grandmaster), a daily XP goal, day streaks, 20 badges, and confetti.

### 👨‍👩‍👧 Accounts are optional
Kids start playing immediately as guests, and progress is saved on the device. A grown-up can create an optional account (Firebase) to sync across devices. The nickname is encrypted before upload, and the age range never leaves the device. Progress from the original Chess Quest cloud accounts is imported automatically.

## Tech

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 with a custom design system (`src/app/globals.css`)
- `chess.js` for rules, `react-chessboard` v5 for the board
- **Stockfish 19 lite (WASM)** in a Web Worker (`public/engine/`, `src/lib/engine/`)
- Zustand (persisted) for progress, Firebase Auth + Firestore for optional sync
- Vitest for tests

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # lesson, puzzle and engine tests
npm run lint
```

Optional cloud sync: set the `NEXT_PUBLIC_FIREBASE_*` variables (see `src/lib/firebase.ts`). Without them the app runs fully offline.

Regenerating puzzles (takes a while; uses all cores):

```bash
node scripts/generate-puzzles.mjs 1200 3           # tactics from engine self-play
MATES_ONLY=1 node scripts/generate-puzzles.mjs 1500 3  # add checkmate puzzles
node scripts/curate-puzzles.mjs                    # dedupe + balance
```

## Licenses

The Stockfish engine files in `public/engine/` are © the Stockfish developers and Chess.com (stockfish.js), licensed under the **GNU GPL v3**. See `public/engine/STOCKFISH-LICENSE.txt` and https://github.com/nmrugg/stockfish.js for source.
