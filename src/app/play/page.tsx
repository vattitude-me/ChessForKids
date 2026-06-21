'use client';

import { useState } from 'react';
import ChessBoard from '@/components/ChessBoard';
import DifficultySelector from '@/components/DifficultySelector';
import { useGameStore } from '@/lib/store';

export default function PlayPage() {
  const {
    currentDifficultyIndex,
    difficultyLevels,
    setDifficulty,
    recordWin,
    recordLoss,
    recordDraw,
  } = useGameStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');

  function handleGameEnd(result: 'win' | 'loss' | 'draw') {
    switch (result) {
      case 'win':
        recordWin();
        break;
      case 'loss':
        recordLoss();
        break;
      case 'draw':
        recordDraw();
        break;
    }
  }

  if (!isPlaying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center mb-6">
          <span className="text-5xl block mb-3">⚔️</span>
          <h1 className="text-3xl font-bold magic-text mb-2">Battle Arena</h1>
          <p className="text-purple-300 text-sm">Choose your difficulty and color!</p>
        </div>

        <DifficultySelector
          levels={difficultyLevels}
          selectedIndex={currentDifficultyIndex}
          onSelect={setDifficulty}
        />

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setPlayerColor('white')}
            className={`px-4 py-2 rounded-xl transition-all ${
              playerColor === 'white'
                ? 'bg-white text-purple-900 font-bold'
                : 'bg-purple-900/30 text-white border border-purple-500/30'
            }`}
          >
            ⬜ White
          </button>
          <button
            onClick={() => setPlayerColor('black')}
            className={`px-4 py-2 rounded-xl transition-all ${
              playerColor === 'black'
                ? 'bg-gray-800 text-white font-bold border-2 border-purple-400'
                : 'bg-purple-900/30 text-white border border-purple-500/30'
            }`}
          >
            ⬛ Black
          </button>
        </div>

        <button
          onClick={() => setIsPlaying(true)}
          className="sparkle-btn mt-6 text-lg px-8 py-3"
        >
          Start Battle! ⚔️
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <ChessBoard
        difficulty={difficultyLevels[currentDifficultyIndex]}
        onGameEnd={handleGameEnd}
        playerColor={playerColor}
      />
      <button
        onClick={() => setIsPlaying(false)}
        className="mt-4 text-sm text-purple-400 hover:text-purple-200 transition"
      >
        ← Back to Level Select
      </button>
    </div>
  );
}
