'use client';

import { DifficultyLevel } from '@/lib/chess-ai';
import { useGameStore } from '@/lib/store';

interface DifficultySelectorProps {
  levels: DifficultyLevel[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function DifficultySelector({ levels, selectedIndex, onSelect }: DifficultySelectorProps) {
  const stats = useGameStore(state => state.stats);

  return (
    <div className="w-full max-w-md">
      <h3 className="text-lg font-bold text-center mb-4 magic-text">Choose Your Challenge</h3>
      <div className="grid gap-2">
        {levels.map((level, index) => {
          const isSelected = index === selectedIndex;
          const isUnlocked = index <= Math.max(0, Math.floor(stats.wins / 3));
          const isRecommended = index === selectedIndex;

          return (
            <button
              key={level.name}
              onClick={() => isUnlocked && onSelect(index)}
              disabled={!isUnlocked}
              className={`
                flex items-center gap-3 p-3 rounded-xl transition-all text-left
                ${isSelected
                  ? 'bg-purple-600/30 border-2 border-purple-400 magic-glow'
                  : isUnlocked
                    ? 'bg-purple-900/20 border border-purple-500/20 hover:border-purple-400/50'
                    : 'bg-gray-900/30 border border-gray-600/20 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <span className="text-2xl">{isUnlocked ? level.icon : '🔒'}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{level.label}</span>
                  {isRecommended && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-purple-300/70">{level.description}</p>
              </div>
              <div className="text-right">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className={`text-xs ${i < Math.ceil((index + 1) / levels.length * 5) ? 'text-yellow-400' : 'text-gray-600'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
