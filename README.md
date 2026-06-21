# Chess Quest - A Magical Chess Adventure

A fantasy-themed chess learning app for kids and adults, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Adaptive AI** - 7 difficulty levels (Apprentice to Dragon Lord) that auto-adjust based on performance
- **Interactive Tutorials** - 10 lessons covering all pieces, special moves, and tactics
- **Puzzle Mode** - Chess puzzles with hints, themed around magical challenges
- **Progress Tracking** - XP system, badges, streaks, and detailed stats
- **Fantasy Theme** - Magical wizards, dragons, and enchanted boards
- **Responsive** - Works on desktop, tablet, and mobile

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- chess.js (game logic)
- react-chessboard (board UI)
- Zustand (state management)
- canvas-confetti (celebrations)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This app is configured for Vercel deployment. Connect the GitHub repo to Vercel for automatic deployments.

## Difficulty Levels

| Level | Name | Ages | AI Behavior |
|-------|------|------|-------------|
| 1 | Apprentice | 3+ | Very random, frequent blunders |
| 2 | Squire | 5+ | Mostly random with some logic |
| 3 | Knight | 7+ | Mix of random and calculated |
| 4 | Wizard | 9+ | Strategic with occasional mistakes |
| 5 | Enchanter | 11+ | Strong play, rare mistakes |
| 6 | Archmage | 13+ | Very strong, deep calculation |
| 7 | Dragon Lord | 16+ | Near-optimal play |

The AI adapts automatically based on win/loss ratio, leveling up or down to keep games fun and challenging.
