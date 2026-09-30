import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { WORLDS, ALL_LESSONS } from './index';
import { checkLessonMove } from './goals';
import { minMovesToCollect, miniMoves, parsePlacement } from './mini-moves';
import { parseUci, toUci } from '../chess-utils';

describe('curriculum', () => {
  it('has unique lesson ids', () => {
    const ids = ALL_LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(WORLDS.length).toBeGreaterThanOrEqual(5);
  });

  for (const lesson of ALL_LESSONS) {
    describe(lesson.id, () => {
      lesson.steps.forEach((step, i) => {
        const name = `step ${i + 1} (${step.kind})`;
        if (step.kind === 'quiz') {
          it(`${name} answer is valid`, () => {
            expect(step.answer).toBeGreaterThanOrEqual(0);
            expect(step.answer).toBeLessThan(step.options.length);
          });
        }
        if (step.kind === 'tap') {
          it(`${name} has a piece with moves`, () => {
            const board = parsePlacement(step.fen);
            expect(board[step.from]).toBeTruthy();
            expect(miniMoves(board, step.from).length).toBeGreaterThan(0);
          });
        }
        if (step.kind === 'stars') {
          it(`${name} is solvable within par`, () => {
            const min = minMovesToCollect(step.fen, step.stars, step.guarded, step.hero);
            expect(min).toBeLessThanOrEqual(step.par);
            // par shouldn't be generous either
            expect(min).toBe(step.par);
          });
        }
        if (step.kind === 'move') {
          it(`${name} is legal and solvable`, () => {
            const game = new Chess(step.fen);
            expect(game.isCheckmate() || game.isStalemate()).toBe(false);
            const legal = game.moves({ verbose: true }).map((m) => toUci(m));
            const winners = legal.filter((u) => checkLessonMove(step.fen, u, step.accept, step.goal).ok);
            expect(winners.length).toBeGreaterThan(0);
            if (step.accept) for (const a of step.accept) expect(legal).toContain(a);
            if (step.goal === 'safe' || step.goal === 'mate' || step.goal === 'check') {
              // there must be a way to get it wrong, otherwise it's not a lesson
              expect(winners.length).toBeLessThan(legal.length);
            }
            // follow-ups
            if (step.then) {
              let fen = step.fen;
              let cur = step.accept?.[0] ?? winners[0];
              for (const t of step.then) {
                const g = new Chess(fen);
                g.move(parseUci(cur));
                g.move(parseUci(t.reply));
                fen = g.fen();
                const legal2 = g.moves({ verbose: true }).map((m) => toUci(m));
                const ok2 = legal2.filter((u) => checkLessonMove(fen, u, t.accept, t.goal).ok);
                expect(ok2.length).toBeGreaterThan(0);
                cur = ok2[0];
              }
            }
          });
        }
        if (step.kind === 'play') {
          it(`${name} is a legal starting position`, () => {
            const game = new Chess(step.fen);
            expect(game.isGameOver()).toBe(false);
          });
        }
        if ((step.kind === 'talk' || step.kind === 'quiz') && step.fen) {
          it(`${name} has a parseable board`, () => {
            expect(Object.keys(parsePlacement(step.fen!)).length).toBeGreaterThanOrEqual(0);
          });
        }
      });
    });
  }
});
