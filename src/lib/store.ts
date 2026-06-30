import { create } from 'zustand';
import { DifficultyLevel, generateDifficultyLevels, getAdaptiveDifficulty } from './chess-ai';

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt?: string;
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  puzzlesSolved: number;
  lessonsCompleted: number;
  currentStreak: number;
  bestStreak: number;
  lastPlayedDate: string;
  badges: Badge[];
  xp: number;
  level: number;
  highestDifficultyBeaten: number;
}

export interface GameRecord {
  id: string;
  date: string;
  result: 'win' | 'loss' | 'draw';
  difficulty: string;
  playerColor: 'white' | 'black';
  moves: string[];
  capturedPieces: { white: string[]; black: string[] };
  totalMoves: number;
}

export interface GameState {
  playerName: string;
  playerAge: number | null;
  currentDifficultyIndex: number;
  difficultyLevels: DifficultyLevel[];
  stats: PlayerStats;
  tutorialProgress: number[];
  gameHistory: GameRecord[];
  setPlayerName: (name: string) => void;
  setPlayerAge: (age: number) => void;
  setDifficulty: (index: number) => void;
  recordWin: () => void;
  recordLoss: () => void;
  recordDraw: () => void;
  recordPuzzleSolved: () => void;
  recordLessonCompleted: (lessonId: number) => void;
  addBadge: (badge: Badge) => void;
  addXp: (amount: number) => void;
  saveGameRecord: (record: Omit<GameRecord, 'id' | 'date'>) => void;
  resetStats: () => void;
}

const allBadges: Badge[] = [
  { id: 'first_win', name: 'First Victory', icon: '⚔️', description: 'Win your first game!' },
  { id: 'streak_3', name: 'On Fire', icon: '🔥', description: 'Win 3 games in a row!' },
  { id: 'streak_5', name: 'Unstoppable', icon: '⚡', description: 'Win 5 games in a row!' },
  { id: 'puzzle_master', name: 'Puzzle Wizard', icon: '🧩', description: 'Solve 10 puzzles!' },
  { id: 'scholar', name: 'Scholar', icon: '📚', description: 'Complete 5 lessons!' },
  { id: 'level_up', name: 'Level Up', icon: '⬆️', description: 'Reach a new difficulty level!' },
  { id: 'ten_games', name: 'Adventurer', icon: '🗺️', description: 'Play 10 games!' },
  { id: 'dragon_slayer', name: 'Dragon Slayer', icon: '🐉', description: 'Beat the Dragon Lord!' },
];

export { allBadges };

const defaultStats: PlayerStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  puzzlesSolved: 0,
  lessonsCompleted: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastPlayedDate: '',
  badges: [],
  xp: 0,
  level: 1,
  highestDifficultyBeaten: -1,
};

export const useGameStore = create<GameState>()((set, get) => ({
  playerName: '',
  playerAge: null,
  currentDifficultyIndex: 0,
  difficultyLevels: generateDifficultyLevels(),
  stats: { ...defaultStats },
  tutorialProgress: [],
  gameHistory: [],

  setPlayerName: (name: string) => set({ playerName: name }),
  setPlayerAge: (age: number) => {
    const levels = get().difficultyLevels;
    const suggestedIndex = levels.findIndex(l => l.minAge >= age) - 1;
    set({
      playerAge: age,
      currentDifficultyIndex: Math.max(0, suggestedIndex),
    });
  },

  setDifficulty: (index: number) => set({ currentDifficultyIndex: index }),

  recordWin: () => {
    const state = get();
    const newStats = {
      ...state.stats,
      totalGames: state.stats.totalGames + 1,
      wins: state.stats.wins + 1,
      currentStreak: state.stats.currentStreak + 1,
      bestStreak: Math.max(state.stats.bestStreak, state.stats.currentStreak + 1),
      lastPlayedDate: new Date().toISOString(),
      xp: state.stats.xp + 50,
      highestDifficultyBeaten: Math.max(state.stats.highestDifficultyBeaten, state.currentDifficultyIndex),
    };

    const newBadges = [...newStats.badges];
    if (newStats.wins === 1 && !newBadges.find(b => b.id === 'first_win')) {
      newBadges.push({ ...allBadges[0], earnedAt: new Date().toISOString() });
    }
    if (newStats.currentStreak >= 3 && !newBadges.find(b => b.id === 'streak_3')) {
      newBadges.push({ ...allBadges[1], earnedAt: new Date().toISOString() });
    }
    if (newStats.currentStreak >= 5 && !newBadges.find(b => b.id === 'streak_5')) {
      newBadges.push({ ...allBadges[2], earnedAt: new Date().toISOString() });
    }
    if (newStats.totalGames >= 10 && !newBadges.find(b => b.id === 'ten_games')) {
      newBadges.push({ ...allBadges[6], earnedAt: new Date().toISOString() });
    }
    newStats.badges = newBadges;

    const adaptedLevel = getAdaptiveDifficulty(
      newStats.wins,
      newStats.losses,
      state.currentDifficultyIndex,
      state.difficultyLevels
    );

    const newLevel = Math.floor(newStats.xp / 200) + 1;
    newStats.level = newLevel;

    set({
      stats: newStats,
      currentDifficultyIndex: adaptedLevel,
    });
  },

  recordLoss: () => {
    const state = get();
    const newStats = {
      ...state.stats,
      totalGames: state.stats.totalGames + 1,
      losses: state.stats.losses + 1,
      currentStreak: 0,
      lastPlayedDate: new Date().toISOString(),
      xp: state.stats.xp + 10,
    };

    const adaptedLevel = getAdaptiveDifficulty(
      newStats.wins,
      newStats.losses,
      state.currentDifficultyIndex,
      state.difficultyLevels
    );

    set({
      stats: newStats,
      currentDifficultyIndex: adaptedLevel,
    });
  },

  recordDraw: () => {
    const state = get();
    set({
      stats: {
        ...state.stats,
        totalGames: state.stats.totalGames + 1,
        draws: state.stats.draws + 1,
        lastPlayedDate: new Date().toISOString(),
        xp: state.stats.xp + 25,
      },
    });
  },

  recordPuzzleSolved: () => {
    const state = get();
    const newStats = {
      ...state.stats,
      puzzlesSolved: state.stats.puzzlesSolved + 1,
      xp: state.stats.xp + 30,
    };

    if (newStats.puzzlesSolved >= 10 && !newStats.badges.find(b => b.id === 'puzzle_master')) {
      newStats.badges = [...newStats.badges, { ...allBadges[3], earnedAt: new Date().toISOString() }];
    }

    set({ stats: newStats });
  },

  recordLessonCompleted: (lessonId: number) => {
    const state = get();
    const newProgress = [...state.tutorialProgress];
    if (!newProgress.includes(lessonId)) {
      newProgress.push(lessonId);
    }

    const newStats = {
      ...state.stats,
      lessonsCompleted: newProgress.length,
      xp: state.stats.xp + 40,
    };

    if (newProgress.length >= 5 && !newStats.badges.find(b => b.id === 'scholar')) {
      newStats.badges = [...newStats.badges, { ...allBadges[4], earnedAt: new Date().toISOString() }];
    }

    set({ stats: newStats, tutorialProgress: newProgress });
  },

  addBadge: (badge: Badge) => {
    const state = get();
    if (!state.stats.badges.find(b => b.id === badge.id)) {
      set({
        stats: {
          ...state.stats,
          badges: [...state.stats.badges, { ...badge, earnedAt: new Date().toISOString() }],
        },
      });
    }
  },

  addXp: (amount: number) => {
    const state = get();
    const newXp = state.stats.xp + amount;
    set({
      stats: {
        ...state.stats,
        xp: newXp,
        level: Math.floor(newXp / 200) + 1,
      },
    });
  },

  saveGameRecord: (record: Omit<GameRecord, 'id' | 'date'>) => {
    const state = get();
    const newRecord: GameRecord = {
      ...record,
      id: `game-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
    };
    set({ gameHistory: [...state.gameHistory, newRecord] });
  },

  resetStats: () => set({
    playerName: '',
    playerAge: null,
    currentDifficultyIndex: 0,
    stats: { ...defaultStats },
    tutorialProgress: [],
    gameHistory: [],
  }),
}));

interface GameData {
  playerName: string;
  playerAge: number | null;
  currentDifficultyIndex: number;
  stats: PlayerStats;
  tutorialProgress: number[];
  gameHistory: GameRecord[];
}

const GAME_KEY_PREFIX = 'chess-kids-game-';

export function loadGameForUser(uid: string) {
  const raw = localStorage.getItem(`${GAME_KEY_PREFIX}${uid}`);
  if (raw) {
    try {
      const data = JSON.parse(raw) as GameData;
      useGameStore.setState({
        playerName: data.playerName || '',
        playerAge: data.playerAge ?? null,
        currentDifficultyIndex: data.currentDifficultyIndex || 0,
        stats: { ...defaultStats, ...data.stats },
        tutorialProgress: data.tutorialProgress || [],
        gameHistory: data.gameHistory || [],
      });
    } catch {
      useGameStore.getState().resetStats();
    }
  }
}

export function saveGameForUser(uid: string) {
  const { playerName, playerAge, currentDifficultyIndex, stats, tutorialProgress, gameHistory } =
    useGameStore.getState();
  const data: GameData = { playerName, playerAge, currentDifficultyIndex, stats, tutorialProgress, gameHistory };
  localStorage.setItem(`${GAME_KEY_PREFIX}${uid}`, JSON.stringify(data));
}
