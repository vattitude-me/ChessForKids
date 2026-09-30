'use client';

import { Chess, Move } from 'chess.js';
import { getEngine, EngineLine } from './stockfish';
import { parseUci, PIECE_VALUE } from '../chess-utils';
import { getBestMove, generateDifficultyLevels } from '../chess-ai';

export interface Bot {
  id: string;
  name: string;
  emoji: string;
  rating: number;
  color: string; // accent colour for cards
  tagline: string;
  greeting: string;
  winLine: string; // what the bot says when it wins
  loseLine: string; // what the bot says when the kid wins
  depth: number;
  multipv: number;
  temperature: number; // centipawns; higher = more random among top moves
  blunder: number; // chance of a "kid move" (random, but prefers captures)
}

export const BOTS: Bot[] = [
  {
    id: 'pip', name: 'Pip the Chick', emoji: '🐣', rating: 250, color: '#FFD84D',
    tagline: 'Just hatched! Moves pieces to see what happens.',
    greeting: 'Peep peep! Is this how chess works?', winLine: 'Peep! I won?! Wow!', loseLine: 'Peep… you are really good!',
    depth: 1, multipv: 10, temperature: 400, blunder: 0.5,
  },
  {
    id: 'bella', name: 'Bella Bunny', emoji: '🐰', rating: 400, color: '#FFB3C7',
    tagline: 'Hops around the board. Loves grabbing pieces!',
    greeting: 'Hop hop! Let\'s play!', winLine: 'Hoppity hooray, I won!', loseLine: 'You out-hopped me! Great game!',
    depth: 2, multipv: 8, temperature: 260, blunder: 0.32,
  },
  {
    id: 'rex', name: 'Rex the Puppy', emoji: '🐶', rating: 600, color: '#FFB86B',
    tagline: 'Chases every piece — but sometimes forgets his own.',
    greeting: 'Woof! I\'m ready to fetch your pieces!', winLine: 'Woof woof! Good game!', loseLine: 'Arf! You got me. Good human!',
    depth: 3, multipv: 6, temperature: 170, blunder: 0.2,
  },
  {
    id: 'ollie', name: 'Ollie Otter', emoji: '🦦', rating: 800, color: '#7FD1B9',
    tagline: 'Plays calm and steady like a river.',
    greeting: 'Let\'s have a splashing good game!', winLine: 'Splash! That was fun!', loseLine: 'You swam right past me. Well played!',
    depth: 4, multipv: 6, temperature: 110, blunder: 0.12,
  },
  {
    id: 'foxy', name: 'Foxy', emoji: '🦊', rating: 1000, color: '#FF8A5B',
    tagline: 'Sneaky! Loves tricks and traps.',
    greeting: 'I know a few tricks… watch out!', winLine: 'Hehe, my trap worked!', loseLine: 'You out-foxed the fox!',
    depth: 6, multipv: 5, temperature: 70, blunder: 0.07,
  },
  {
    id: 'panda', name: 'Captain Panda', emoji: '🐼', rating: 1200, color: '#9AA7B8',
    tagline: 'Strong and patient. Never rushes.',
    greeting: 'Steady paws win the game.', winLine: 'Patience wins again!', loseLine: 'Bamboo-zled! Excellent play!',
    depth: 7, multipv: 4, temperature: 45, blunder: 0.04,
  },
  {
    id: 'leo', name: 'Leo the Lion', emoji: '🦁', rating: 1400, color: '#F5B841',
    tagline: 'King of the jungle. Attacks fiercely!',
    greeting: 'ROAR! Show me your bravest moves.', winLine: 'ROAR! The lion rules!', loseLine: 'You tamed the lion!',
    depth: 9, multipv: 4, temperature: 30, blunder: 0.02,
  },
  {
    id: 'hoot', name: 'Professor Hoot', emoji: '🦉', rating: 1700, color: '#8C7CF0',
    tagline: 'The wise old owl. Thinks many moves ahead.',
    greeting: 'Hoo-hoo! Let us think carefully.', winLine: 'Hoo! A lesson for next time.', loseLine: 'Remarkable! You are a true scholar!',
    depth: 11, multipv: 3, temperature: 16, blunder: 0.005,
  },
  {
    id: 'robo', name: 'Robo Rook', emoji: '🤖', rating: 2000, color: '#5AB0F0',
    tagline: 'Beep boop. Calculates everything.',
    greeting: 'SYSTEM READY. BEGIN GAME.', winLine: 'CALCULATION COMPLETE. I WIN.', loseLine: 'ERROR… HUMAN IS TOO STRONG!',
    depth: 13, multipv: 2, temperature: 6, blunder: 0,
  },
  {
    id: 'dragon', name: 'Dragon King', emoji: '🐉', rating: 2800, color: '#E5484D',
    tagline: 'The final boss. Full Stockfish power!',
    greeting: 'So… you dare challenge the Dragon?', winLine: 'The Dragon is unbeatable!', loseLine: 'IMPOSSIBLE! You are a legend!',
    depth: 18, multipv: 1, temperature: 0, blunder: 0,
  },
];

export function getBot(id: string): Bot {
  return BOTS.find((b) => b.id === id) ?? BOTS[0];
}

/** The bot whose strength best matches a kid's rating (slightly easier). */
export function suggestBot(rating: number): Bot {
  let best = BOTS[0];
  for (const b of BOTS) if (b.rating <= rating + 100) best = b;
  return best;
}

function lineScore(l: EngineLine): number {
  if (l.mate !== null) return l.mate > 0 ? 10000 - l.mate * 10 : -10000 - l.mate * 10;
  return l.cp ?? 0;
}

function kidMove(game: Chess): Move {
  // Random, but with a soft spot for captures and checks — like a real beginner.
  const moves = game.moves({ verbose: true });
  const weights = moves.map((m) => 1 + (m.captured ? 2 + PIECE_VALUE[m.captured] / 3 : 0) + (m.san.includes('+') ? 1 : 0));
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < moves.length; i++) {
    r -= weights[i];
    if (r <= 0) return moves[i];
  }
  return moves[moves.length - 1];
}

/**
 * Picks a move for `bot`. Uses Stockfish with a strength-shaped random choice
 * among the top engine lines; falls back to the built-in minimax engine if the
 * WASM engine can't load.
 */
export async function chooseBotMove(fen: string, bot: Bot): Promise<{ from: string; to: string; promotion?: string }> {
  const game = new Chess(fen);
  const legal = game.moves({ verbose: true });
  if (legal.length === 1) return legal[0];

  if (Math.random() < bot.blunder) return kidMove(game);

  const engine = getEngine();
  if (engine.available) {
    try {
      const lines = await engine.analyse(fen, { depth: bot.depth, multipv: Math.min(bot.multipv, legal.length) });
      if (lines.length) {
        if (bot.temperature <= 0) return parseUci(lines[0].move);
        const best = lineScore(lines[0]);
        // Never throw away a forced mate for strong bots.
        if (lines[0].mate !== null && lines[0].mate > 0 && bot.rating >= 1000) return parseUci(lines[0].move);
        const w = lines.map((l) => Math.exp((lineScore(l) - best) / bot.temperature));
        let r = Math.random() * w.reduce((a, b) => a + b, 0);
        for (let i = 0; i < lines.length; i++) {
          r -= w[i];
          if (r <= 0) return parseUci(lines[i].move);
        }
        return parseUci(lines[0].move);
      }
    } catch {
      // fall through to the fallback engine
    }
  }

  const levels = generateDifficultyLevels();
  const idx = Math.min(levels.length - 1, Math.max(0, Math.round((bot.rating - 250) / 350)));
  const mv = getBestMove(game, levels[idx]);
  return mv ?? legal[0];
}
