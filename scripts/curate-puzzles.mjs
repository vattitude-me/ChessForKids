#!/usr/bin/env node
// Cleans up src/data/puzzle-bank.json after generation:
//  • removes near-duplicates (a puzzle whose start position occurs inside another puzzle's solution)
//  • fixes theme tags (forcing mates are not "forks")
//  • keeps the bank balanced so easy "free piece" captures don't crowd out everything else
//  • gives every puzzle a stable id derived from its position, so progress survives regeneration
//
// Usage: node scripts/curate-puzzles.mjs [maxOneMoveCaptures=320]

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Chess } from 'chess.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(root, 'src/data/puzzle-bank.json');
const maxCaptures = +(process.argv[2] || 320);

const uci = (u) => ({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] });
const key = (fen) => fen.split(' ').slice(0, 2).join(' ');

function fnv(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

// Deterministic shuffle so reruns give the same bank.
function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const raw = JSON.parse(readFileSync(FILE, 'utf8'));
console.log('input', raw.length);

// 1. Tag fixes + start keys
const items = raw.map((p) => {
  const g = new Chess(p.fen);
  if (p.setup) g.move(uci(p.setup));
  const start = key(g.fen());
  const inner = [];
  for (const m of p.moves) {
    g.move(uci(m));
    inner.push(key(g.fen()));
  }
  let themes = [...new Set(p.themes)];
  if (themes.includes('mate')) themes = themes.filter((t) => t !== 'fork' && t !== 'winMaterial' && t !== 'tradeUp');
  return { ...p, themes, start, inner };
});

// 2. Drop exact duplicates and positions contained in another puzzle's line
const byStart = new Map();
for (const p of items) if (!byStart.has(p.start) || byStart.get(p.start).moves.length < p.moves.length) byStart.set(p.start, p);
let unique = [...byStart.values()];
const innerPositions = new Set(unique.flatMap((p) => p.inner));
unique = unique.filter((p) => !innerPositions.has(p.start));

// 3. Balance: cap one-move material grabs
const rng = seeded(20260930);
const isSimpleCapture = (p) => !p.themes.includes('mate') && p.moves.length === 1;
const simple = unique.filter(isSimpleCapture).sort(() => rng() - 0.5).slice(0, maxCaptures);
const rest = unique.filter((p) => !isSimpleCapture(p));
const final = [...simple, ...rest]
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .map(({ start, inner, ...p }) => ({ ...p, id: `p${fnv(p.fen + (p.setup ?? ''))}` }))
  .sort((a, b) => a.rating - b.rating || a.id.localeCompare(b.id));

writeFileSync(FILE, JSON.stringify(final).replace(/\},\{/g, '},\n{'));

const counts = {};
for (const p of final) for (const t of p.themes) counts[t] = (counts[t] ?? 0) + 1;
const bands = {};
for (const p of final) bands[Math.floor(p.rating / 200) * 200] = (bands[Math.floor(p.rating / 200) * 200] ?? 0) + 1;
console.log('output', final.length, counts, bands);
