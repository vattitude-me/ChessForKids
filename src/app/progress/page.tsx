'use client';

import { useState } from 'react';
import { useGameStore, allBadges } from '@/lib/store';

export default function ProgressPage() {
  const { stats, playerName, setPlayerName, difficultyLevels, currentDifficultyIndex } = useGameStore();
  const [nameInput, setNameInput] = useState(playerName);
  const [isEditingName, setIsEditingName] = useState(!playerName);

  const currentLevel = difficultyLevels[currentDifficultyIndex];
  const xpForNextLevel = (stats.level) * 200;
  const xpProgress = (stats.xp % 200) / 200;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pt-8">
      <div className="text-center mb-6">
        <span className="text-4xl block mb-2">⭐</span>
        <h1 className="text-2xl font-bold magic-text mb-1">Your Quest Log</h1>
      </div>

      <div className="w-full max-w-lg">
        <div className="fantasy-card p-6 mb-6 text-center">
          {isEditingName ? (
            <div className="flex gap-2 justify-center items-center">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your wizard name..."
                className="bg-purple-900/30 border border-purple-500/30 rounded-xl px-4 py-2 text-white text-center placeholder:text-purple-400/50 focus:outline-none focus:border-purple-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && nameInput.trim()) {
                    setPlayerName(nameInput.trim());
                    setIsEditingName(false);
                  }
                }}
              />
              <button
                onClick={() => {
                  if (nameInput.trim()) {
                    setPlayerName(nameInput.trim());
                    setIsEditingName(false);
                  }
                }}
                className="sparkle-btn px-4 py-2 text-sm"
              >
                Save
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-yellow-300 mb-1">{playerName || 'Young Wizard'}</h2>
              <button
                onClick={() => setIsEditingName(true)}
                className="text-xs text-purple-400 hover:text-purple-200"
              >
                ✏️ Edit name
              </button>
            </div>
          )}

          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-3xl">{currentLevel.icon}</span>
            <div>
              <p className="font-bold">{currentLevel.label}</p>
              <p className="text-xs text-purple-300">Level {stats.level}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs text-purple-300 mb-1">
              <span>{stats.xp % 200} XP</span>
              <span>{xpForNextLevel} XP to next level</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${xpProgress * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon="⚔️" value={stats.totalGames} label="Battles" />
          <StatCard icon="🏆" value={stats.wins} label="Victories" />
          <StatCard icon="🔥" value={stats.bestStreak} label="Best Streak" />
          <StatCard icon="🧩" value={stats.puzzlesSolved} label="Puzzles" />
        </div>

        {stats.totalGames > 0 && (
          <div className="fantasy-card p-4 mb-6">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <span>📊</span> Battle Stats
            </h3>
            <div className="space-y-2">
              <StatBar label="Win Rate" value={Math.round((stats.wins / stats.totalGames) * 100)} suffix="%" color="green" />
              <StatBar label="Lessons" value={stats.lessonsCompleted} suffix="/10" color="blue" />
              <StatBar label="Current Streak" value={stats.currentStreak} suffix="" color="orange" />
            </div>
          </div>
        )}

        <div className="fantasy-card p-4">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <span>🏅</span> Badges & Achievements
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {allBadges.map(badge => {
              const earned = stats.badges.find(b => b.id === badge.id);
              return (
                <div
                  key={badge.id}
                  className={`badge-card ${earned ? 'earned' : 'locked'}`}
                >
                  <span className="text-3xl">{badge.icon}</span>
                  <p className="text-xs font-bold">{badge.name}</p>
                  <p className="text-[10px] text-purple-300">{badge.description}</p>
                  {earned && (
                    <p className="text-[10px] text-yellow-400">Earned! ⭐</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="fantasy-card p-3 text-center">
      <span className="text-2xl block">{icon}</span>
      <p className="text-xl font-bold mt-1">{value}</p>
      <p className="text-[10px] text-purple-300">{label}</p>
    </div>
  );
}

function StatBar({ label, value, suffix, color }: { label: string; value: number; suffix: string; color: string }) {
  const colorMap: Record<string, string> = {
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-cyan-500',
    orange: 'from-orange-500 to-yellow-500',
    purple: 'from-purple-500 to-pink-500',
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-purple-300 w-28">{label}</span>
      <div className="flex-1 h-4 rounded-full bg-purple-900/30 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorMap[color] || colorMap.purple}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="text-sm font-bold w-12 text-right">{value}{suffix}</span>
    </div>
  );
}
