'use client';

import Link from 'next/link';
import { useGameStore } from '@/lib/store';

export default function Home() {
  const stats = useGameStore(state => state.stats);
  const playerName = useGameStore(state => state.playerName);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-lg lg:max-w-2xl mx-auto">
        <div className="float-animation mb-6">
          <span className="text-7xl md:text-8xl">🏰</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          <span className="magic-text">Chess Quest</span>
        </h1>
        <p className="text-purple-300 text-lg mb-8">
          A Magical Chess Adventure
        </p>

        {playerName && (
          <p className="text-purple-200 mb-6">
            Welcome back, <span className="font-bold text-yellow-300">{playerName}</span>! ✨
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Link href="/learn" className="fantasy-card p-6 text-center block">
            <span className="text-4xl block mb-2">📚</span>
            <h2 className="text-lg font-bold mb-1">Learn</h2>
            <p className="text-xs text-purple-300">Master the enchanted pieces!</p>
          </Link>

          <Link href="/puzzles" className="fantasy-card p-6 text-center block">
            <span className="text-4xl block mb-2">🧩</span>
            <h2 className="text-lg font-bold mb-1">Puzzles</h2>
            <p className="text-xs text-purple-300">Solve magical challenges!</p>
          </Link>

          <Link href="/play" className="fantasy-card p-6 text-center block">
            <span className="text-4xl block mb-2">⚔️</span>
            <h2 className="text-lg font-bold mb-1">Play</h2>
            <p className="text-xs text-purple-300">Battle the AI wizard!</p>
          </Link>
        </div>

        <Link href="/progress" className="fantasy-card p-3 px-6 inline-flex items-center gap-3 mb-8">
          <span className="text-2xl">⭐</span>
          <div className="text-left">
            <h2 className="text-sm font-bold">Progress</h2>
            <p className="text-xs text-purple-300">Your magical journey</p>
          </div>
          <span className="text-purple-400 text-sm ml-2">→</span>
        </Link>

        {stats.totalGames > 0 && (
          <div className="fantasy-card p-4 mb-6">
            <div className="flex justify-around text-center">
              <div>
                <p className="text-2xl font-bold text-yellow-300">{stats.wins}</p>
                <p className="text-xs text-purple-300">Victories</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-300">{stats.totalGames}</p>
                <p className="text-xs text-purple-300">Battles</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-300">{stats.currentStreak}</p>
                <p className="text-xs text-purple-300">Streak</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-pink-300">{stats.puzzlesSolved}</p>
                <p className="text-xs text-purple-300">Puzzles</p>
              </div>
            </div>
          </div>
        )}

        <p className="text-purple-400/60 text-xs">
          For wizards aged 3 to 103 🧙‍♂️
        </p>
      </div>
    </div>
  );
}
