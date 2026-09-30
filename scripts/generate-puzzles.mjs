#!/usr/bin/env node
// Generates the Little Knights puzzle bank (src/data/puzzle-bank.json).
//
// How it works:
//   1. Two deliberately imperfect Stockfish players play each other, so the
//      games contain realistic, kid-level mistakes.
//   2. After every move we ask a stronger Stockfish search whether the side to
//      move now has a single, clearly winning reply (the classic puzzle test).
//   3. Each candidate is re-verified, extended into a full solution line,
//      tagged with themes and given a difficulty rating based on how deep the
//      engine has to look before it finds the answer.
//
// Usage: node scripts/generate-puzzles.mjs [targetCount=700] [workers=3]

import { spawn } from 'node:child_process';
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { Chess } from 'chess.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENGINE = path.join(root, 'public/engine/stockfish-19-lite-single.js');
const OUT = path.join(root, 'src/data/puzzle-bank.json');
const MATES_ONLY = process.env.MATES_ONLY === '1';

// ---------------------------------------------------------------------------
// Minimal UCI client
// ---------------------------------------------------------------------------
class Engine {
  constructor() {
    this.proc = spawn(process.execPath, [ENGINE], { stdio: ['pipe', 'pipe', 'ignore'] });
    this.buffer = '';
    this.listeners = [];
    this.proc.stdout.on('data', (chunk) => {
      this.buffer += chunk.toString();
      let idx;
      while ((idx = this.buffer.indexOf('\n')) >= 0) {
        const line = this.buffer.slice(0, idx).trim();
        this.buffer = this.buffer.slice(idx + 1);
        for (const l of [...this.listeners]) l(line);
      }
    });
  }
  send(cmd) { this.proc.stdin.write(cmd + '\n'); }
  waitFor(pred) {
    return new Promise((resolve) => {
      const lines = [];
      const fn = (line) => {
        lines.push(line);
        if (pred(line)) {
          this.listeners = this.listeners.filter((x) => x !== fn);
          resolve(lines);
        }
      };
      this.listeners.push(fn);
    });
  }
  async init() {
    this.send('uci');
    await this.waitFor((l) => l === 'uciok');
    this.send('setoption name Hash value 32');
    this.send('isready');
    await this.waitFor((l) => l === 'readyok');
  }
  // Returns [{ move, cp, mate, pv, depth }] sorted by multipv index, from side-to-move POV.
  async analyse(fen, { depth = 12, multipv = 1 } = {}) {
    this.send(`setoption name MultiPV value ${multipv}`);
    this.send(`position fen ${fen}`);
    this.send(`go depth ${depth}`);
    const lines = await this.waitFor((l) => l.startsWith('bestmove'));
    const byPv = new Map();
    const firstDepthFound = new Map(); // move -> first depth where it was PV1
    for (const line of lines) {
      if (!line.startsWith('info') || !line.includes(' pv ')) continue;
      const d = /\bdepth (\d+)/.exec(line);
      const mpv = /\bmultipv (\d+)/.exec(line);
      const cp = /\bscore cp (-?\d+)/.exec(line);
      const mate = /\bscore mate (-?\d+)/.exec(line);
      const pv = line.split(' pv ')[1].trim().split(/\s+/);
      if (/\b(lowerbound|upperbound)\b/.test(line)) continue;
      const k = mpv ? +mpv[1] : 1;
      const entry = { depth: +d[1], cp: cp ? +cp[1] : null, mate: mate ? +mate[1] : null, pv, move: pv[0] };
      byPv.set(k, entry);
      if (k === 1) {
        // track stability of the PV1 move across depths
        if (!firstDepthFound.has('__last') || firstDepthFound.get('__last') !== pv[0]) {
          firstDepthFound.set('__last', pv[0]);
          firstDepthFound.set('__since', +d[1]);
        }
      }
    }
    const result = [...byPv.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]);
    result.stableSince = firstDepthFound.get('__since') ?? depth;
    return result;
  }
  quit() { try { this.send('quit'); this.proc.kill(); } catch { /* ignore */ } }
}

// Convert a score to a single number (mate = huge).
function score(e) {
  if (!e) return -100000;
  if (e.mate !== null) return e.mate > 0 ? 100000 - e.mate * 100 : -100000 - e.mate * 100;
  return e.cp;
}

const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function material(chess, color) {
  let m = 0;
  for (const row of chess.board()) for (const sq of row) if (sq && sq.color === color) m += VAL[sq.type];
  return m;
}

function uciToMove(uci) {
  return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] };
}

function rand(n) { return Math.floor(Math.random() * n); }

// ---------------------------------------------------------------------------
// Theme detection helpers
// ---------------------------------------------------------------------------
function attackedValuables(chess, square, byColor) {
  // Which enemy pieces does the piece on `square` attack?
  const piece = chess.get(square);
  if (!piece) return [];
  const targets = [];
  // Use a board copy where it's the attacker's turn to list its captures.
  const fenParts = chess.fen().split(' ');
  fenParts[1] = byColor;
  fenParts[3] = '-';
  let c;
  try { c = new Chess(fenParts.join(' ')); } catch { return []; }
  for (const m of c.moves({ square, verbose: true })) {
    if (m.captured) targets.push({ sq: m.to, type: m.captured });
  }
  // king "captures" aren't listed as moves; check for check separately
  return targets;
}

function isDefended(chess, square, ownerColor) {
  // Is the piece on `square` (owned by ownerColor) defended by its own side?
  const fenParts = chess.fen().split(' ');
  const piece = chess.get(square);
  if (!piece) return false;
  // Flip the piece's colour temporarily and see if the owner can capture it.
  const c = new Chess();
  try {
    c.load(fenParts.join(' '), { skipValidation: true });
    c.remove(square);
    c.put({ type: piece.type, color: ownerColor === 'w' ? 'b' : 'w' }, square);
    const p2 = c.fen().split(' ');
    p2[1] = ownerColor;
    p2[3] = '-';
    c.load(p2.join(' '), { skipValidation: true });
    return c.moves({ verbose: true }).some((m) => m.to === square);
  } catch {
    return false;
  }
}

function detectThemes(startFen, solution) {
  const themes = new Set();
  const c = new Chess(startFen);
  const solver = c.turn();
  const opp = solver === 'w' ? 'b' : 'w';
  const solverMoves = solution.filter((_, i) => i % 2 === 0);
  const startMat = material(c, opp) - material(c, solver);

  const first = c.move(uciToMove(solution[0]));
  if (first.promotion) themes.add('promotion');
  if (first.captured) {
    c.undo();
    const defended = isDefended(c, first.to, opp);
    c.move(uciToMove(solution[0]));
    if (!defended) themes.add('hangingPiece');
    else if (VAL[first.captured] > VAL[first.piece]) themes.add('tradeUp');
  }
  if (!first.captured && !c.isCheckmate()) {
    const hits = attackedValuables(c, first.to, solver).filter((t) => VAL[t.type] >= 3 || t.type === 'k');
    const givesCheck = c.inCheck();
    if (hits.length + (givesCheck ? 1 : 0) >= 2 && solverMoves.length >= 2) themes.add('fork');
  }
  if (first.san.includes('+') && !c.isCheckmate()) themes.add('check');
  c.undo();

  // play through
  for (let i = 0; i < solution.length; i++) {
    const mv = c.move(uciToMove(solution[i]));
    if (i % 2 === 0 && mv.promotion) themes.add('promotion');
  }
  if (c.isCheckmate()) {
    const n = solverMoves.length;
    themes.add(`mateIn${n}`);
    themes.add('mate');
    // back rank: mated king on its home rank
    const kingSq = c.board().flat().find((p) => p && p.type === 'k' && p.color === opp)?.square;
    if (kingSq && ((opp === 'b' && kingSq[1] === '8') || (opp === 'w' && kingSq[1] === '1'))) {
      const last = c.history({ verbose: true }).at(-1);
      if (last && (last.piece === 'r' || last.piece === 'q') && last.to[1] === kingSq[1]) themes.add('backRankMate');
    }
    const last = c.history({ verbose: true }).at(-1);
    if (last && last.piece === 'n') themes.add('knightMate');
  } else {
    const gain = material(c, solver) - material(c, opp) + startMat;
    if (gain >= 2) themes.add('winMaterial');
  }
  return [...themes];
}

// ---------------------------------------------------------------------------
// Puzzle extraction
// ---------------------------------------------------------------------------
async function tryBuildPuzzle(eng, fenBefore, setupUci) {
  const c = new Chess(fenBefore);
  c.move(uciToMove(setupUci));
  if (c.isGameOver()) return null;
  const startFen = c.fen();

  // Candidate filter: one clearly winning move.
  const lines = await eng.analyse(startFen, { depth: 16, multipv: 2 });
  if (!lines.length) return null;
  const best = lines[0];
  const second = lines[1];
  const bestS = score(best);
  const secondS = second ? score(second) : -100000;
  const isMate = best.mate !== null && best.mate > 0;

  if (isMate) {
    if (best.mate > 3) return null;
    // The first move must be the only one that mates this fast.
    if (second && second.mate !== null && second.mate > 0 && second.mate <= best.mate) return null;
    if (best.mate === 1 && second && second.mate !== null && second.mate > 0) return null;
  } else {
    if (bestS < 250) return null;
    if (bestS - secondS < 220) return null;
    if (secondS > 150) return null;
  }

  // Build solution line.
  const solution = [];
  const walk = new Chess(startFen);
  const solver = walk.turn();
  const startMatDiff = material(walk, solver) - material(walk, solver === 'w' ? 'b' : 'w');

  let current = best;
  for (let solverMove = 0; solverMove < 3; solverMove++) {
    const mv = walk.move(uciToMove(current.move));
    if (!mv) return null;
    solution.push(current.move);
    if (walk.isCheckmate()) break;
    if (walk.isGameOver()) return null;

    const matGain = material(walk, solver) - material(walk, solver === 'w' ? 'b' : 'w') - startMatDiff;
    if (!isMate) {
      // stop once material has been won and the position is stable
      if (matGain >= 2 && !walk.inCheck()) break;
      if (solverMove >= 1) break;
    }

    // Opponent's best reply
    const reply = await eng.analyse(walk.fen(), { depth: 14, multipv: 1 });
    if (!reply.length) return null;
    walk.move(uciToMove(reply[0].move));
    solution.push(reply[0].move);

    // Next solver move must be unique too.
    const next = await eng.analyse(walk.fen(), { depth: 14, multipv: 2 });
    if (!next.length) return null;
    const n1 = score(next[0]);
    const n2 = next[1] ? score(next[1]) : -100000;
    if (isMate) {
      if (next[0].mate === null || next[0].mate <= 0) return null;
      // on the final mating move, any mate is accepted in the app, so allow multiple
      if (next[0].mate > 1 && next[1] && next[1].mate !== null && next[1].mate > 0) return null;
    } else {
      if (n1 - n2 < 200) {
        // not unique: puzzle ends before this move, drop the dangling reply
        solution.pop();
        walk.undo();
        break;
      }
    }
    current = next[0];
  }

  if (solution.length % 2 === 0) return null; // must end on a solver move
  if (isMate && !walk.isCheckmate()) return null;

  // Difficulty: at what depth does the engine settle on the right first move?
  const shallow = await eng.analyse(startFen, { depth: 10, multipv: 1 });
  const foundAt = shallow.stableSince ?? 10;

  const themes = detectThemes(startFen, solution);
  if (!themes.some((t) => ['mate', 'hangingPiece', 'fork', 'winMaterial', 'tradeUp', 'promotion'].includes(t))) return null;

  const solverMoves = (solution.length + 1) / 2;
  const firstSan = new Chess(startFen).move(uciToMove(solution[0])).san;
  let rating = 450;
  if (themes.includes('mateIn1')) rating = 600;
  if (themes.includes('mateIn2')) rating = 1100;
  if (themes.includes('mateIn3')) rating = 1450;
  if (!isMate) rating = 500 + (solverMoves - 1) * 350;
  if (themes.includes('hangingPiece') && solverMoves === 1) rating -= 100;
  if (themes.includes('fork')) rating += 250;
  const quiet = !firstSan.includes('x') && !firstSan.includes('+') && !firstSan.includes('#');
  if (quiet) rating += 200;
  if (firstSan.includes('+')) rating -= 50;
  if (firstSan.startsWith('N')) rating += 60;
  rating += Math.max(0, foundAt - 1) * 45;
  const pieceCount = startFen.split(' ')[0].replace(/[^a-zA-Z]/g, '').length;
  rating += Math.round((pieceCount - 16) * 6);
  rating = Math.max(300, Math.min(2000, Math.round(rating / 10) * 10));

  return { fen: fenBefore, setup: setupUci, moves: solution, themes, rating };
}

// Choose a move like an imperfect player.
async function pickGameMove(eng, chess, sloppiness) {
  const moves = chess.moves({ verbose: true });
  if (Math.random() < sloppiness) {
    // "kid move": prefer something natural-looking but unchecked
    const m = moves[rand(moves.length)];
    return m.from + m.to + (m.promotion || '');
  }
  const lines = await eng.analyse(chess.fen(), { depth: 6 + rand(4), multipv: 4 });
  if (!lines.length) {
    const m = moves[rand(moves.length)];
    return m.from + m.to + (m.promotion || '');
  }
  const w = lines.map((_, i) => Math.pow(0.45, i));
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lines.length; i++) { r -= w[i]; if (r <= 0) return lines[i].move; }
  return lines[0].move;
}

async function workerMain() {
  const eng = new Engine();
  await eng.init();
  const { games, id } = workerData;
  for (let g = 0; g < games; g++) {
    const chess = new Chess();
    const sloppiness = 0.06 + Math.random() * 0.14;
    // a few random opening moves for variety
    const openingPlies = 2 + rand(6);
    for (let i = 0; i < openingPlies && !chess.isGameOver(); i++) {
      const lines = await eng.analyse(chess.fen(), { depth: 5, multipv: 5 });
      const pick = lines[rand(lines.length)].move;
      chess.move(uciToMove(pick));
    }
    let plies = 0;
    while (!chess.isGameOver() && plies < 140) {
      const fenBefore = chess.fen();
      const uci = await pickGameMove(eng, chess, sloppiness);
      chess.move(uciToMove(uci));
      plies++;
      if (chess.isGameOver()) break;
      // quick check: is the side to move now clearly winning?
      const quick = await eng.analyse(chess.fen(), { depth: 9, multipv: 1 });
      const s = score(quick[0]);
      const mateSoon = quick[0] && quick[0].mate !== null && quick[0].mate > 0 && quick[0].mate <= 3;
      if (mateSoon) {
        // Checkmates are great puzzles even when the game was already won.
        const p = await tryBuildPuzzle(eng, fenBefore, uci);
        if (p) parentPort.postMessage({ type: 'puzzle', puzzle: p });
      } else if (s >= 250 && !MATES_ONLY) {
        // position before the setup move must have been reasonable for the (future) solver's opponent
        const pre = await eng.analyse(fenBefore, { depth: 9, multipv: 1 });
        const preS = -score(pre[0]); // from the solver's perspective
        if (preS < 200) {
          const p = await tryBuildPuzzle(eng, fenBefore, uci);
          if (p) parentPort.postMessage({ type: 'puzzle', puzzle: p });
        }
      }
      // someone is winning hugely: stop some games so we see more middlegames
      if (s > 2000 && Math.random() < 0.15) break;
    }
    parentPort.postMessage({ type: 'game', id });
  }
  eng.quit();
  parentPort.postMessage({ type: 'done', id });
}

async function main() {
  const target = +(process.argv[2] || 700);
  const nWorkers = +(process.argv[3] || 3);
  mkdirSync(path.dirname(OUT), { recursive: true });
  const bank = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : [];
  const seen = new Set(bank.map((p) => p.fen + p.setup));
  let games = 0;
  const workers = [];
  const save = () => {
    bank.sort((a, b) => a.rating - b.rating);
    bank.forEach((p, i) => { p.id = p.id || `lk${String(i).padStart(4, '0')}${Math.random().toString(36).slice(2, 5)}`; });
    writeFileSync(OUT, JSON.stringify(bank, null, 0).replace(/\},\{/g, '},\n{'));
  };
  await new Promise((resolve) => {
    let done = 0;
    for (let i = 0; i < nWorkers; i++) {
      const w = new Worker(fileURLToPath(import.meta.url), { workerData: { games: 10000, id: i } });
      workers.push(w);
      w.on('message', (msg) => {
        if (msg.type === 'puzzle') {
          const key = msg.puzzle.fen + msg.puzzle.setup;
          if (seen.has(key)) return;
          seen.add(key);
          bank.push(msg.puzzle);
          if (bank.length % 10 === 0) {
            save();
            console.log(`${bank.length} puzzles after ${games} games`);
          }
          if (bank.length >= target) {
            workers.forEach((x) => x.terminate());
            resolve();
          }
        } else if (msg.type === 'game') {
          games++;
        } else if (msg.type === 'done') {
          if (++done === nWorkers) resolve();
        }
      });
      w.on('error', (e) => console.error('worker error', e));
    }
  });
  save();
  const themeCounts = {};
  for (const p of bank) for (const t of p.themes) themeCounts[t] = (themeCounts[t] || 0) + 1;
  console.log('done', bank.length, themeCounts);
  process.exit(0);
}

if (isMainThread) main();
else workerMain();
