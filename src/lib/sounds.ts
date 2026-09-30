'use client';

import { useProgress } from './progress';

/** Tiny synthesized sound effects, so there are no audio files to load. */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!useProgress.getState().settings.sound) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.18) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function knock(start = 0, pitch = 1) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const len = Math.floor(a.sampleRate * 0.06);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
  const src = a.createBufferSource();
  src.buffer = buf;
  const filter = a.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 900 * pitch;
  filter.Q.value = 1.2;
  const g = a.createGain();
  g.gain.value = 0.9;
  src.connect(filter).connect(g).connect(a.destination);
  src.start(t);
}

export const sfx = {
  move: () => knock(0, 1),
  capture: () => {
    knock(0, 0.8);
    knock(0.05, 1.3);
  },
  check: () => {
    knock(0, 1);
    tone(880, 0.02, 0.15, 'triangle', 0.08);
  },
  select: () => tone(660, 0, 0.05, 'sine', 0.05),
  star: () => {
    tone(1046, 0, 0.12, 'triangle', 0.12);
    tone(1568, 0.07, 0.18, 'triangle', 0.1);
  },
  correct: () => {
    tone(659, 0, 0.12, 'triangle');
    tone(880, 0.1, 0.12, 'triangle');
    tone(1318, 0.2, 0.25, 'triangle');
  },
  wrong: () => {
    tone(220, 0, 0.18, 'square', 0.06);
    tone(185, 0.12, 0.25, 'square', 0.06);
  },
  win: () => {
    [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.2, 'triangle', 0.14));
  },
  lose: () => {
    [392, 330, 262].forEach((f, i) => tone(f, i * 0.18, 0.3, 'sine', 0.12));
  },
  pop: () => tone(520, 0, 0.08, 'sine', 0.1),
};

export function moveSound(san: string) {
  if (san.includes('#') || san.includes('+')) sfx.check();
  else if (san.includes('x')) sfx.capture();
  else sfx.move();
}
