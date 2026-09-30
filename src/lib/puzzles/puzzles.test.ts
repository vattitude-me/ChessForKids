import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import bank from '@/data/puzzle-bank.json';
import { generateMate, forcedMates } from './mate-factory';
import { pickAdaptive, dailySet, Puzzle } from './index';
import { parseUci } from '../chess-utils';

const puzzles = bank as unknown as Puzzle[];

describe('puzzle bank', () => {
  it('has a healthy number of puzzles', () => {
    expect(puzzles.length).toBeGreaterThan(300);
    expect(new Set(puzzles.map((p) => p.id)).size).toBe(puzzles.length);
  });

  it('every puzzle replays legally and mates when it says so', () => {
    for (const p of puzzles) {
      const g = new Chess(p.fen);
      if (p.setup) g.move(parseUci(p.setup));
      expect(p.moves.length % 2).toBe(1);
      for (const m of p.moves) g.move(parseUci(m));
      if (p.themes.includes('mate')) expect(g.isCheckmate(), p.id).toBe(true);
    }
  });

  it('covers a wide range of difficulty', () => {
    const ratings = puzzles.map((p) => p.rating);
    expect(Math.min(...ratings)).toBeLessThan(500);
    expect(Math.max(...ratings)).toBeGreaterThan(1300);
  });
});

describe('adaptive selection', () => {
  it('picks puzzles near the player rating and skips seen ones', () => {
    const seen = new Set(puzzles.slice(0, 50).map((p) => p.id));
    for (let i = 0; i < 20; i++) {
      const p = pickAdaptive(puzzles, { rating: 900, seen, themeStats: {} });
      expect(seen.has(p.id)).toBe(false);
      expect(Math.abs(p.rating - 900)).toBeLessThan(700);
    }
  });

  it('builds a stable daily set of 5 different puzzles', () => {
    const a = dailySet(puzzles, 600).map((p) => p.id);
    const b = dailySet(puzzles, 600).map((p) => p.id);
    expect(a).toEqual(b);
    expect(new Set(a).size).toBe(5);
  });
});

describe('mate factory', () => {
  it('generates verified mate-in-1 puzzles quickly', () => {
    const t = Date.now();
    for (let seed = 1; seed <= 10; seed++) {
      const m = generateMate(1, seed);
      expect(m).not.toBeNull();
      const g = new Chess(m!.fen);
      expect(forcedMates(g, 1)).toEqual(m!.solution);
      g.move(parseUci(m!.solution[0]));
      expect(g.isCheckmate()).toBe(true);
    }
    expect(Date.now() - t).toBeLessThan(5000);
  });

  it('generates verified mate-in-2 puzzles', () => {
    const t = Date.now();
    for (let seed = 1; seed <= 3; seed++) {
      const m = generateMate(2, seed);
      expect(m).not.toBeNull();
      const g = new Chess(m!.fen);
      for (const u of m!.solution) g.move(parseUci(u));
      expect(g.isCheckmate()).toBe(true);
    }
    expect(Date.now() - t).toBeLessThan(60000);
  }, 60000);
});
