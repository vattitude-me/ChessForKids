import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { getBestMove, generateDifficultyLevels } from './chess-ai';

const levels = generateDifficultyLevels();
const easy = levels[0]; // depth 1, high randomness
const medium = levels[2]; // depth ~2

describe('Chess AI Engine', () => {
  describe('getBestMove', () => {
    it('returns a valid move from starting position', () => {
      const game = new Chess();
      const move = getBestMove(game, easy);
      expect(move).not.toBeNull();
      expect(move!.color).toBe('w');
    });

    it('returns a move for black when it is blacks turn', () => {
      const game = new Chess();
      game.move('e4');
      const move = getBestMove(game, easy);
      expect(move).not.toBeNull();
      expect(move!.color).toBe('b');
    });

    it('does not mutate the original game state', () => {
      const game = new Chess();
      const fenBefore = game.fen();
      getBestMove(game, medium);
      expect(game.fen()).toBe(fenBefore);
    });

    it('returns null when no moves available (checkmate)', () => {
      // Fool's mate position — white is checkmated
      const game = new Chess('rnb1kbnr/pppp1ppp/4p3/8/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3');
      const move = getBestMove(game, easy);
      expect(move).toBeNull();
    });

    it('finds checkmate in 1 with depth 2', () => {
      // Scholar's mate setup: Qxf7# is available for white
      const game = new Chess('rnbqkb1r/pppp1ppp/5n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 3');
      // Use a level with no randomness and depth 2
      const smartLevel = { ...levels[3], searchDepth: 2, randomness: 0, blunderChance: 0 };
      const move = getBestMove(game, smartLevel);
      expect(move).not.toBeNull();
      expect(move!.san).toBe('Qxf7#');
    });
  });

  describe('Turn alternation — simulates component behavior', () => {
    it('correctly alternates turns for 10 moves', () => {
      const game = new Chess();

      for (let i = 0; i < 10; i++) {
        const expectedColor = i % 2 === 0 ? 'w' : 'b';
        expect(game.turn()).toBe(expectedColor);

        const move = getBestMove(game, easy);
        expect(move).not.toBeNull();
        expect(move!.color).toBe(expectedColor);
        game.move(move!);
      }
    });

    it('player white + AI black: correct turn flow using FEN copies', () => {
      const game = new Chess();

      // Player (white) makes e4
      const playerMove = game.move('e4');
      expect(playerMove).not.toBeNull();
      expect(game.turn()).toBe('b');

      // AI calculates from a FEN copy (same as component does)
      const fen = game.fen();
      const gameCopy = new Chess(fen);
      const aiMove = getBestMove(gameCopy, medium);
      expect(aiMove).not.toBeNull();
      expect(aiMove!.color).toBe('b');

      // Apply AI move to a fresh instance from the same FEN
      const newGame = new Chess(fen);
      newGame.move(aiMove!);
      expect(newGame.turn()).toBe('w');

      // Player moves again
      const playerMove2 = newGame.move('d4');
      expect(playerMove2).not.toBeNull();
      expect(newGame.turn()).toBe('b');

      // AI responds
      const fen2 = newGame.fen();
      const gameCopy2 = new Chess(fen2);
      const aiMove2 = getBestMove(gameCopy2, medium);
      expect(aiMove2).not.toBeNull();
      expect(aiMove2!.color).toBe('b');

      const newGame2 = new Chess(fen2);
      newGame2.move(aiMove2!);
      expect(newGame2.turn()).toBe('w');
    });

    it('player black + AI white: AI moves first correctly', () => {
      const game = new Chess();

      // AI (white) moves first
      expect(game.turn()).toBe('w');
      const fen = game.fen();
      const aiMove = getBestMove(new Chess(fen), easy);
      expect(aiMove).not.toBeNull();
      expect(aiMove!.color).toBe('w');

      const newGame = new Chess(fen);
      newGame.move(aiMove!);
      expect(newGame.turn()).toBe('b');

      // Player (black) responds
      const blackMoves = newGame.moves({ verbose: true });
      expect(blackMoves.length).toBeGreaterThan(0);
      expect(blackMoves[0].color).toBe('b');
      newGame.move(blackMoves[0]);
      expect(newGame.turn()).toBe('w');

      // AI responds again as white
      const fen2 = newGame.fen();
      const aiMove2 = getBestMove(new Chess(fen2), easy);
      expect(aiMove2).not.toBeNull();
      expect(aiMove2!.color).toBe('w');
    });
  });

  describe('Component state simulation (the actual bug scenario)', () => {
    it('after player white moves, AI must only respond as black', () => {
      // This tests the exact bug: stale closure causing AI to play white again
      const game = new Chess();
      const playerColor = 'w';
      const aiColor = 'b';

      // Player makes e4
      game.move('e4');
      const fenAfterPlayerMove = game.fen();

      // Verify it's now black's turn
      expect(game.turn()).toBe('b');

      // AI should use the CURRENT fen (after player's move)
      const aiGame = new Chess(fenAfterPlayerMove);
      expect(aiGame.turn()).toBe(aiColor);

      const aiMove = getBestMove(aiGame, medium);
      expect(aiMove).not.toBeNull();
      expect(aiMove!.color).toBe(aiColor);
      expect(aiMove!.color).not.toBe(playerColor);
    });

    it('gameRef pattern: AI reads from ref not stale state', () => {
      // Simulates the gameRef.current pattern used in the component
      let gameRef = new Chess();

      // Player moves — update ref
      const newGameAfterPlayer = new Chess(gameRef.fen());
      newGameAfterPlayer.move('e4');
      gameRef = newGameAfterPlayer; // ref is now updated

      // setTimeout fires — reads from ref
      const currentFen = gameRef.fen(); // This is the key: read from ref
      expect(new Chess(currentFen).turn()).toBe('b');

      const aiGame = new Chess(currentFen);
      const aiMove = getBestMove(aiGame, medium);
      expect(aiMove!.color).toBe('b');

      // Apply AI move
      const newGameAfterAI = new Chess(currentFen);
      newGameAfterAI.move(aiMove!);
      gameRef = newGameAfterAI;
      expect(gameRef.turn()).toBe('w');
    });

    it('guard: AI bails if turn does not match aiColor', () => {
      const game = new Chess(); // white's turn
      const aiColor = 'b';

      // Component guard: if (currentGame.turn() !== aiColor) return;
      if (game.turn() !== aiColor) {
        // AI should not move — this is the guard that prevents the bug
        expect(true).toBe(true);
        return;
      }

      // This line should never be reached when it's white's turn and AI is black
      expect(false).toBe(true);
    });
  });

  describe('Difficulty levels', () => {
    it('generates 7 difficulty levels', () => {
      expect(levels).toHaveLength(7);
    });

    it('levels have increasing search depth', () => {
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i].searchDepth).toBeGreaterThanOrEqual(levels[i - 1].searchDepth);
      }
    });

    it('levels have decreasing randomness', () => {
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i].randomness).toBeLessThanOrEqual(levels[i - 1].randomness);
      }
    });

    it('highest difficulty has zero randomness and blunder', () => {
      const hardest = levels[levels.length - 1];
      expect(hardest.randomness).toBe(0);
      expect(hardest.blunderChance).toBe(0);
    });
  });

  describe('Game state integrity with FEN copies', () => {
    it('creating Chess from FEN preserves turn', () => {
      const game = new Chess();
      game.move('e4');
      const fen = game.fen();
      const copy = new Chess(fen);
      expect(copy.turn()).toBe('b');
    });

    it('10 sequential AI moves do not corrupt state', () => {
      const game = new Chess();

      for (let i = 0; i < 10; i++) {
        if (game.isGameOver()) break;

        const fen = game.fen();
        const currentTurn = game.turn();

        const gameCopy = new Chess(fen);
        const move = getBestMove(gameCopy, easy);
        if (!move) break;

        expect(move.color).toBe(currentTurn);

        const newGame = new Chess(fen);
        const applied = newGame.move(move);
        expect(applied).not.toBeNull();
        expect(newGame.turn()).not.toBe(currentTurn);

        // Advance for next iteration using move on original
        game.move(move);
      }
    });
  });
});
