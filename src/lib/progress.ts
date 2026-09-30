'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LessonResult {
  stars: number; // 1..3
  completedAt: string;
}

export interface ThemeStat {
  ok: number;
  fail: number;
}

export interface PlayedGame {
  id: string;
  date: string;
  botId: string;
  botRating: number;
  color: 'w' | 'b';
  result: 'win' | 'loss' | 'draw';
  moves: number;
  pgn: string;
  ratingChange: number;
}

export interface SavedGame {
  botId: string;
  color: 'w' | 'b';
  startFen: string;
  moves: string[]; // UCI
  hintsUsed: number;
  undosUsed: number;
  savedAt: string;
}

export interface Settings {
  boardTheme: BoardThemeId;
  sound: boolean;
  showLegalMoves: boolean;
  coachTips: boolean;
  showEvalBar: boolean;
  unlockAllLessons: boolean;
}

export type BoardThemeId = 'meadow' | 'ocean' | 'candy' | 'wood' | 'night';

export const BOARD_THEMES: Record<BoardThemeId, { label: string; light: string; dark: string; emoji: string }> = {
  meadow: { label: 'Meadow', light: '#EEF3D6', dark: '#7DB46C', emoji: '🌿' },
  ocean: { label: 'Ocean', light: '#E3F1FB', dark: '#5C9FD6', emoji: '🌊' },
  candy: { label: 'Candy', light: '#FFF0F5', dark: '#F090B5', emoji: '🍭' },
  wood: { label: 'Wood', light: '#F3DDB7', dark: '#B9875A', emoji: '🪵' },
  night: { label: 'Galaxy', light: '#C9C3F2', dark: '#6A5BC7', emoji: '🌌' },
};

export interface ProgressData {
  version: 2;
  profile: {
    name: string;
    avatar: string;
    age: number | null;
    onboarded: boolean;
    createdAt: string;
  };
  xp: number;
  lessons: Record<string, LessonResult>;
  puzzles: {
    rating: number;
    solved: number;
    failed: number;
    streak: number;
    bestStreak: number;
    seen: string[];
    themes: Record<string, ThemeStat>;
    rushBest: number;
    dailyDone: Record<string, string[]>; // date -> puzzle ids solved from the daily set
  };
  games: {
    rating: number;
    played: number;
    wins: number;
    losses: number;
    draws: number;
    botsBeaten: string[];
    history: PlayedGame[];
    saved: SavedGame | null;
  };
  activity: {
    days: string[]; // YYYY-MM-DD days with any activity (last 60)
    streak: number;
    bestStreak: number;
    xpByDay: Record<string, number>;
  };
  badges: Record<string, string>; // id -> earnedAt
  settings: Settings;
  updatedAt: string;
}

export interface Toast {
  id: number;
  kind: 'xp' | 'badge' | 'level';
  title: string;
  body?: string;
  icon: string;
}

interface Actions {
  hydrated: boolean;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  setProfile: (p: Partial<ProgressData['profile']>) => void;
  setSettings: (s: Partial<Settings>) => void;
  addXp: (amount: number, reason?: string) => void;
  completeLesson: (id: string, stars: number) => void;
  recordPuzzle: (p: { id: string; rating: number; themes: string[]; success: boolean; daily?: string }) => number;
  recordRush: (score: number) => void;
  recordGame: (g: Omit<PlayedGame, 'id' | 'date' | 'ratingChange'>) => number;
  saveGame: (g: SavedGame | null) => void;
  replaceAll: (data: ProgressData) => void;
  resetAll: () => void;
}

export type ProgressState = ProgressData & Actions;

// ---------------------------------------------------------------------------
// Levels, avatars, badges
// ---------------------------------------------------------------------------

export const AVATARS = ['🦁', '🐯', '🐼', '🦊', '🐸', '🐙', '🦄', '🐲', '🐧', '🦉', '🐨', '🐵', '🦖', '🐬', '🐝', '🚀'];

export const RANKS = [
  { name: 'Pawn', icon: '♟️', minLevel: 1 },
  { name: 'Knight', icon: '🐴', minLevel: 4 },
  { name: 'Bishop', icon: '⛪', minLevel: 8 },
  { name: 'Rook', icon: '🏰', minLevel: 12 },
  { name: 'Queen', icon: '👸', minLevel: 17 },
  { name: 'King', icon: '👑', minLevel: 23 },
  { name: 'Grandmaster', icon: '🏆', minLevel: 30 },
];

/** XP needed to go from `level` to `level + 1`. */
export function xpForLevel(level: number) {
  return 100 + (level - 1) * 40;
}

export function levelFromXp(xp: number) {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return { level, into: remaining, needed: xpForLevel(level) };
}

export function rankForLevel(level: number) {
  let r = RANKS[0];
  for (const rank of RANKS) if (level >= rank.minLevel) r = rank;
  return r;
}

export interface BadgeDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  test: (d: ProgressData) => boolean;
}

export const BADGES: BadgeDef[] = [
  { id: 'first-lesson', name: 'First Steps', icon: '👣', description: 'Finish your first lesson', test: (d) => Object.keys(d.lessons).length >= 1 },
  { id: 'five-lessons', name: 'Bookworm', icon: '📚', description: 'Finish 5 lessons', test: (d) => Object.keys(d.lessons).length >= 5 },
  { id: 'all-pieces', name: 'Piece Pro', icon: '♞', description: 'Learn how every piece moves', test: (d) => ['rook', 'bishop', 'queen', 'king', 'knight', 'pawn'].every((l) => d.lessons[l]) },
  { id: 'fifteen-lessons', name: 'Scholar', icon: '🎓', description: 'Finish 15 lessons', test: (d) => Object.keys(d.lessons).length >= 15 },
  { id: 'perfect', name: 'Perfectionist', icon: '💯', description: 'Get 3 stars on 10 lessons', test: (d) => Object.values(d.lessons).filter((l) => l.stars === 3).length >= 10 },
  { id: 'first-puzzle', name: 'Puzzle Starter', icon: '🧩', description: 'Solve your first puzzle', test: (d) => d.puzzles.solved >= 1 },
  { id: 'puzzle-25', name: 'Puzzle Hunter', icon: '🔍', description: 'Solve 25 puzzles', test: (d) => d.puzzles.solved >= 25 },
  { id: 'puzzle-100', name: 'Puzzle Wizard', icon: '🧙', description: 'Solve 100 puzzles', test: (d) => d.puzzles.solved >= 100 },
  { id: 'puzzle-streak-5', name: 'Hot Streak', icon: '🔥', description: 'Solve 5 puzzles in a row', test: (d) => d.puzzles.bestStreak >= 5 },
  { id: 'puzzle-800', name: 'Sharp Eyes', icon: '👀', description: 'Reach puzzle rating 800', test: (d) => d.puzzles.rating >= 800 },
  { id: 'puzzle-1200', name: 'Tactics Tiger', icon: '🐯', description: 'Reach puzzle rating 1200', test: (d) => d.puzzles.rating >= 1200 },
  { id: 'rush-10', name: 'Speedy', icon: '⚡', description: 'Score 10 in Puzzle Rush', test: (d) => d.puzzles.rushBest >= 10 },
  { id: 'first-game', name: 'Let\'s Play', icon: '🎲', description: 'Play your first game', test: (d) => d.games.played >= 1 },
  { id: 'first-win', name: 'First Victory', icon: '🏅', description: 'Win your first game', test: (d) => d.games.wins >= 1 },
  { id: 'ten-wins', name: 'Champion', icon: '🏆', description: 'Win 10 games', test: (d) => d.games.wins >= 10 },
  { id: 'beat-foxy', name: 'Fox Tamer', icon: '🦊', description: 'Beat Foxy', test: (d) => d.games.botsBeaten.includes('foxy') },
  { id: 'beat-leo', name: 'Lion Heart', icon: '🦁', description: 'Beat Leo the Lion', test: (d) => d.games.botsBeaten.includes('leo') },
  { id: 'beat-dragon', name: 'Dragon Slayer', icon: '🐉', description: 'Beat the Dragon King', test: (d) => d.games.botsBeaten.includes('dragon') },
  { id: 'streak-3', name: 'Three in a Row', icon: '📅', description: 'Practice 3 days in a row', test: (d) => d.activity.bestStreak >= 3 },
  { id: 'streak-7', name: 'Week Warrior', icon: '🗓️', description: 'Practice 7 days in a row', test: (d) => d.activity.bestStreak >= 7 },
];

export function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

export const DAILY_XP_GOAL = 60;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export function defaultProgress(): ProgressData {
  return {
    version: 2,
    profile: { name: '', avatar: '🦁', age: null, onboarded: false, createdAt: new Date().toISOString() },
    xp: 0,
    lessons: {},
    puzzles: { rating: 500, solved: 0, failed: 0, streak: 0, bestStreak: 0, seen: [], themes: {}, rushBest: 0, dailyDone: {} },
    games: { rating: 400, played: 0, wins: 0, losses: 0, draws: 0, botsBeaten: [], history: [], saved: null },
    activity: { days: [], streak: 0, bestStreak: 0, xpByDay: {} },
    badges: {},
    settings: { boardTheme: 'meadow', sound: true, showLegalMoves: true, coachTips: true, showEvalBar: true, unlockAllLessons: false },
    updatedAt: new Date().toISOString(),
  };
}

function pickData(s: ProgressState): ProgressData {
  const { version, profile, xp, lessons, puzzles, games, activity, badges, settings, updatedAt } = s;
  return { version, profile, xp, lessons, puzzles, games, activity, badges, settings, updatedAt };
}

let toastId = 1;

function elo(player: number, opponent: number, score: number, k: number) {
  const expected = 1 / (1 + Math.pow(10, (opponent - player) / 400));
  return Math.round(k * (score - expected));
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => {
      /** Applies an update, then awards activity, levels and badges. */
      const commit = (patch: Partial<ProgressData>, xpGain = 0, reason?: string) => {
        const prev = pickData(get());
        const next: ProgressData = { ...prev, ...patch, updatedAt: new Date().toISOString() };
        const toasts: Toast[] = [];

        if (xpGain > 0) {
          const day = todayKey();
          const oldLevel = levelFromXp(prev.xp).level;
          next.xp = prev.xp + xpGain;
          const days = next.activity.days.includes(day) ? next.activity.days : [...next.activity.days, day].slice(-60);
          let streak = next.activity.streak;
          if (!next.activity.days.includes(day)) {
            streak = next.activity.days.includes(yesterdayKey()) ? streak + 1 : 1;
          }
          next.activity = {
            days,
            streak,
            bestStreak: Math.max(next.activity.bestStreak, streak),
            xpByDay: { ...Object.fromEntries(Object.entries(next.activity.xpByDay).slice(-30)), [day]: (next.activity.xpByDay[day] ?? 0) + xpGain },
          };
          toasts.push({ id: toastId++, kind: 'xp', title: `+${xpGain} XP`, body: reason, icon: '⭐' });
          const newLevel = levelFromXp(next.xp).level;
          if (newLevel > oldLevel) {
            const rank = rankForLevel(newLevel);
            toasts.push({ id: toastId++, kind: 'level', title: `Level ${newLevel}!`, body: `You are now a ${rank.name}`, icon: rank.icon });
          }
        }

        const badges = { ...next.badges };
        for (const b of BADGES) {
          if (!badges[b.id] && b.test(next)) {
            badges[b.id] = new Date().toISOString();
            toasts.push({ id: toastId++, kind: 'badge', title: `New badge: ${b.name}`, body: b.description, icon: b.icon });
          }
        }
        next.badges = badges;

        set({ ...next, toasts: [...get().toasts, ...toasts].slice(-4) });
      };

      return {
        ...defaultProgress(),
        hydrated: false,
        toasts: [],

        dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

        setProfile: (p) => commit({ profile: { ...get().profile, ...p } }),

        setSettings: (s) => commit({ settings: { ...get().settings, ...s } }),

        addXp: (amount, reason) => commit({}, amount, reason),

        completeLesson: (id, stars) => {
          const prev = get().lessons[id];
          const first = !prev;
          const lessons = { ...get().lessons, [id]: { stars: Math.max(stars, prev?.stars ?? 0), completedAt: new Date().toISOString() } };
          const xp = first ? 30 + stars * 10 : stars > (prev?.stars ?? 0) ? 15 : 5;
          commit({ lessons }, xp, first ? 'Lesson complete!' : 'Lesson practice');
        },

        recordPuzzle: ({ id, rating, themes, success, daily }) => {
          const p = get().puzzles;
          const attempts = p.solved + p.failed;
          const k = attempts < 15 ? 48 : attempts < 50 ? 32 : 20;
          const change = elo(p.rating, rating, success ? 1 : 0, k);
          const themeStats = { ...p.themes };
          for (const t of themes) {
            const cur = themeStats[t] ?? { ok: 0, fail: 0 };
            themeStats[t] = success ? { ...cur, ok: cur.ok + 1 } : { ...cur, fail: cur.fail + 1 };
          }
          const streak = success ? p.streak + 1 : 0;
          const dailyDone = { ...p.dailyDone };
          if (daily && success) {
            // keep only the last week of daily records
            for (const key of Object.keys(dailyDone)) if (key < todayKey(new Date(Date.now() - 7 * 864e5))) delete dailyDone[key];
            dailyDone[daily] = [...new Set([...(dailyDone[daily] ?? []), id])];
          }
          commit(
            {
              puzzles: {
                ...p,
                rating: Math.max(100, p.rating + change),
                solved: p.solved + (success ? 1 : 0),
                failed: p.failed + (success ? 0 : 1),
                streak,
                bestStreak: Math.max(p.bestStreak, streak),
                seen: [...p.seen.filter((x) => x !== id), id].slice(-1500),
                themes: themeStats,
                dailyDone,
              },
            },
            success ? 10 + Math.min(10, Math.floor(streak / 2) * 2) : 0,
            success ? 'Puzzle solved!' : undefined,
          );
          return change;
        },

        recordRush: (score) => {
          const p = get().puzzles;
          commit({ puzzles: { ...p, rushBest: Math.max(p.rushBest, score) } }, Math.min(50, score * 3), 'Puzzle Rush');
        },

        recordGame: (g) => {
          const games = get().games;
          const score = g.result === 'win' ? 1 : g.result === 'draw' ? 0.5 : 0;
          const k = games.played < 10 ? 48 : 32;
          const change = elo(games.rating, g.botRating, score, k);
          const record: PlayedGame = {
            ...g,
            id: `g${Date.now().toString(36)}`,
            date: new Date().toISOString(),
            ratingChange: change,
          };
          const xp = g.result === 'win' ? 40 : g.result === 'draw' ? 25 : 15;
          commit(
            {
              games: {
                ...games,
                rating: Math.max(100, games.rating + change),
                played: games.played + 1,
                wins: games.wins + (g.result === 'win' ? 1 : 0),
                losses: games.losses + (g.result === 'loss' ? 1 : 0),
                draws: games.draws + (g.result === 'draw' ? 1 : 0),
                botsBeaten: g.result === 'win' && !games.botsBeaten.includes(g.botId) ? [...games.botsBeaten, g.botId] : games.botsBeaten,
                history: [record, ...games.history].slice(0, 50),
                saved: null,
              },
            },
            xp,
            g.result === 'win' ? 'Victory!' : 'Game played',
          );
          return change;
        },

        saveGame: (saved) => set({ games: { ...get().games, saved }, updatedAt: new Date().toISOString() }),

        replaceAll: (data) => set({ ...defaultProgress(), ...data, settings: { ...defaultProgress().settings, ...data.settings } }),

        resetAll: () => set({ ...defaultProgress(), toasts: [] }),
      };
    },
    {
      // Storage key kept from the redesign so existing progress isn't lost.
      name: 'little-knights-progress',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => pickData(s),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ProgressData>;
        const d = defaultProgress();
        return {
          ...current,
          ...p,
          profile: { ...d.profile, ...p.profile },
          puzzles: { ...d.puzzles, ...p.puzzles },
          games: { ...d.games, ...p.games },
          activity: { ...d.activity, ...p.activity },
          settings: { ...d.settings, ...p.settings },
        };
      },
    },
  ),
);

export function getProgressData(): ProgressData {
  return pickData(useProgress.getState());
}

export function isLessonUnlocked(order: string[], id: string, lessons: Record<string, LessonResult>, unlockAll: boolean) {
  if (unlockAll) return true;
  const idx = order.indexOf(id);
  if (idx <= 0) return true;
  return !!lessons[order[idx - 1]] || !!lessons[id];
}
