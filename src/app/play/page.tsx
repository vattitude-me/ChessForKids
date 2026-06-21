'use client';

import { useState } from 'react';
import Image from 'next/image';
import ChessBoard from '@/components/ChessBoard';
import { useGameStore } from '@/lib/store';
import { DifficultyLevel } from '@/lib/chess-ai';

type BoardTheme = 'purple' | 'wood' | 'dark';

const boardThemes: Record<BoardTheme, { dark: string; light: string; label: string }> = {
  purple: { dark: '#6c5ce7', light: '#ddd6fe', label: 'Purple' },
  wood: { dark: '#b58863', light: '#f0d9b5', label: 'Wood' },
  dark: { dark: '#4a4a4a', light: '#9e9e9e', label: 'Slate' },
};

export default function PlayPage() {
  const {
    currentDifficultyIndex,
    difficultyLevels,
    setDifficulty,
    stats,
    recordWin,
    recordLoss,
    recordDraw,
  } = useGameStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('purple');
  const [gameMode, setGameMode] = useState<'computer' | 'friend' | 'online'>('computer');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [capturedPieces, setCapturedPieces] = useState<{ white: string[]; black: string[] }>({ white: [], black: [] });
  const [gameResult, setGameResult] = useState<string | null>(null);

  const currentDifficulty = difficultyLevels[currentDifficultyIndex];
  const xp = stats.xp;

  function handleGameEnd(result: 'win' | 'loss' | 'draw') {
    switch (result) {
      case 'win':
        recordWin();
        setGameResult('You Win!');
        break;
      case 'loss':
        recordLoss();
        setGameResult('You Lost!');
        break;
      case 'draw':
        recordDraw();
        setGameResult('Draw!');
        break;
    }
  }

  function startNewGame() {
    setIsPlaying(true);
    setMoveHistory([]);
    setCapturedPieces({ white: [], black: [] });
    setGameResult(null);
  }

  return (
    <div className="play-page h-screen flex flex-col relative overflow-hidden">
      {/* Blurred hero background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero_image.png"
          alt=""
          fill
          className="object-cover object-center blur-xl opacity-15 scale-110"
          priority
        />
        <div className="absolute inset-0 bg-[#0d0a1a]/75" />
      </div>

      {/* Spacer for fixed nav */}
      <div className="shrink-0 h-[72px] md:h-[80px]" />

      {/* Main 3-column layout - fills remaining viewport */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-3 xl:gap-5 px-3 xl:px-5 pb-3 min-h-0">

        {/* Left Sidebar */}
        <aside className="w-full lg:w-56 xl:w-64 2xl:w-72 shrink-0 lg:overflow-y-auto lg:max-h-full flex flex-col gap-3">
          {/* Game Mode */}
          <div className="play-panel">
            <h3 className="play-panel-title">GAME</h3>
            <div className="flex flex-col gap-1">
              <GameModeButton
                icon="🖥️"
                label="Play vs Computer"
                active={gameMode === 'computer'}
                onClick={() => setGameMode('computer')}
              />
              <GameModeButton
                icon="👤"
                label="Play vs Friend"
                active={gameMode === 'friend'}
                onClick={() => setGameMode('friend')}
                disabled
              />
              <GameModeButton
                icon="🌐"
                label="Online Players"
                active={gameMode === 'online'}
                onClick={() => setGameMode('online')}
                disabled
              />
            </div>
          </div>

          {/* Difficulty */}
          <div className="play-panel">
            <h3 className="play-panel-title">DIFFICULTY</h3>
            <div className="flex flex-col gap-1">
              {difficultyLevels.map((level, index) => {
                const isUnlocked = index <= Math.max(0, Math.floor(stats.wins / 3));
                return (
                  <DifficultyOption
                    key={level.name}
                    level={level}
                    selected={index === currentDifficultyIndex}
                    unlocked={isUnlocked}
                    onClick={() => isUnlocked && setDifficulty(index)}
                  />
                );
              })}
            </div>
          </div>

          {/* Game Settings */}
          <div className="play-panel">
            <h3 className="play-panel-title">GAME SETTINGS</h3>
            <div className="mb-3">
              <label className="text-xs text-[#a0a0b0] mb-1.5 block">Color</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPlayerColor('white')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                    playerColor === 'white'
                      ? 'bg-white text-[#1a0e00] shadow-md'
                      : 'bg-[#1a1530] text-[#a0a0b0] border border-[#2a2545]'
                  }`}
                >
                  White
                </button>
                <button
                  onClick={() => setPlayerColor('black')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                    playerColor === 'black'
                      ? 'bg-[#2a2a2a] text-white border-2 border-[#6c5ce7] shadow-md'
                      : 'bg-[#1a1530] text-[#a0a0b0] border border-[#2a2545]'
                  }`}
                >
                  Black
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-[#a0a0b0] mb-1.5 block">Board Theme</label>
              <div className="flex gap-2">
                {(Object.keys(boardThemes) as BoardTheme[]).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setBoardTheme(theme)}
                    className={`w-9 h-9 rounded-lg overflow-hidden border-2 transition-all ${
                      boardTheme === theme ? 'border-[#6c5ce7] scale-110' : 'border-[#2a2545]'
                    }`}
                    title={boardThemes[theme].label}
                  >
                    <div className="w-full h-1/2" style={{ backgroundColor: boardThemes[theme].light }} />
                    <div className="w-full h-1/2" style={{ backgroundColor: boardThemes[theme].dark }} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* New Game Button */}
          <button onClick={startNewGame} className="play-new-game-btn">
            <span className="mr-2">▶</span> New Game
          </button>
        </aside>

        {/* Center - Board area (fills remaining space) */}
        <main className="flex-1 flex flex-col items-center justify-center min-w-0 min-h-0">
          {/* Player Bar - Opponent */}
          <div className="play-player-bar mb-2 w-full max-w-[calc(100%)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1a1530] border border-[#2a2545] flex items-center justify-center text-lg">
                🖥️
              </div>
              <div>
                <span className="font-bold text-white text-sm">Computer</span>
                <span className="text-xs text-[#a0a0b0] ml-2">({playerColor === 'white' ? 'Black' : 'White'})</span>
              </div>
            </div>
            {isPlaying && (
              <div className="play-timer">
                <span className="text-base font-mono font-bold text-white">10:00</span>
              </div>
            )}
          </div>

          {/* Chess Board - sized to fill available height */}
          <div className="flex-1 w-full flex items-center justify-center min-h-0">
            {isPlaying ? (
              <div className="play-board-wrapper">
                <ChessBoard
                  difficulty={currentDifficulty}
                  onGameEnd={handleGameEnd}
                  playerColor={playerColor}
                  boardTheme={boardThemes[boardTheme]}
                  minimal
                />
              </div>
            ) : (
              <div className="play-board-wrapper play-board-placeholder rounded-xl flex items-center justify-center">
                <div className="text-center px-6">
                  <span className="text-5xl lg:text-6xl block mb-4">⚔️</span>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Ready for Battle?</h2>
                  <p className="text-[#c8c8d8] mb-5 text-sm lg:text-base">Choose your settings and click New Game to begin!</p>
                  <button onClick={startNewGame} className="play-new-game-btn inline-flex">
                    <span className="mr-2">▶</span> Start Playing
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Player Bar - You */}
          <div className="play-player-bar mt-2 w-full max-w-[calc(100%)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] flex items-center justify-center text-lg">
                🐉
              </div>
              <div>
                <span className="font-bold text-white text-sm">You</span>
                <span className="text-xs text-[#a0a0b0] ml-2">({playerColor === 'white' ? 'White' : 'Black'})</span>
              </div>
            </div>
            {isPlaying && (
              <div className="play-timer">
                <span className="text-base font-mono font-bold text-white">10:00</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isPlaying && !gameResult && (
            <div className="flex gap-2 mt-2">
              <ActionButton icon="↩️" label="Undo" onClick={() => {}} />
              <ActionButton icon="💡" label="Hint" onClick={() => {}} />
              <ActionButton icon="🏳️" label="Resign" onClick={() => handleGameEnd('loss')} />
              <ActionButton icon="🤝" label="Draw" onClick={() => handleGameEnd('draw')} />
            </div>
          )}

          {gameResult && (
            <div className="mt-3 text-center">
              <p className="text-xl font-bold text-white celebrate mb-2">{gameResult}</p>
              <button onClick={startNewGame} className="play-new-game-btn inline-flex text-sm">
                <span className="mr-2">▶</span> Play Again
              </button>
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-56 xl:w-64 2xl:w-72 shrink-0 lg:overflow-y-auto lg:max-h-full flex flex-col gap-3">
          {/* Game Info */}
          <div className="play-panel">
            <h3 className="play-panel-title">GAME INFO</h3>
            <div className="space-y-2 text-sm">
              <InfoRow label="Game Type" value={gameMode === 'computer' ? 'vs Computer' : gameMode === 'friend' ? 'vs Friend' : 'Online'} />
              <InfoRow label="Difficulty" value={currentDifficulty.label} />
              <InfoRow label="Color" value={playerColor === 'white' ? 'White' : 'Black'} />
              <InfoRow label="Time Control" value="10 min" />
              <InfoRow label="Move" value={isPlaying ? `${Math.ceil(moveHistory.length / 2) || 1}. ${playerColor === 'white' ? 'White' : 'Black'} to move` : '—'} />
            </div>
          </div>

          {/* Move List */}
          <div className="play-panel flex-1 min-h-0">
            <h3 className="play-panel-title">MOVE LIST</h3>
            {moveHistory.length > 0 ? (
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => (
                  <div key={i} className="flex text-xs">
                    <span className="text-[#a0a0b0] w-6">{i + 1}.</span>
                    <span className="text-white flex-1">{moveHistory[i * 2]}</span>
                    {moveHistory[i * 2 + 1] && (
                      <span className="text-[#c8c8d8] flex-1">{moveHistory[i * 2 + 1]}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-[#a0a0b0]">
                <span className="text-2xl mb-2 opacity-40">📜</span>
                <p className="text-xs">Moves will appear here</p>
              </div>
            )}
          </div>

          {/* Captured Pieces */}
          <div className="play-panel">
            <h3 className="play-panel-title">CAPTURED PIECES</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#2a2a2a] border border-[#555] inline-block"></span>
                <span className="text-xs text-[#a0a0b0]">Black</span>
                <span className="text-sm ml-2">{capturedPieces.black.join(' ') || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-white border border-[#ccc] inline-block"></span>
                <span className="text-xs text-[#a0a0b0]">White</span>
                <span className="text-sm ml-2">{capturedPieces.white.join(' ') || '—'}</span>
              </div>
            </div>
          </div>

          {/* XP / Stats */}
          <div className="play-panel">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">✨</span>
              <span className="text-xs font-bold text-[#f0e4cc]">{xp} XP</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${(xp % 200) / 2}%` }} />
            </div>
            <p className="text-[10px] text-[#a0a0b0] mt-1">Level {stats.level} • {200 - (xp % 200)} XP to next level</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function GameModeButton({ icon, label, active, onClick, disabled }: {
  icon: string; label: string; active: boolean; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-all w-full ${
        active
          ? 'bg-[#6c5ce7]/20 border border-[#6c5ce7]/50 text-white'
          : disabled
            ? 'text-[#555] cursor-not-allowed'
            : 'text-[#c8c8d8] hover:bg-[#1a1530] hover:text-white'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
      {disabled && <span className="ml-auto text-[10px] text-[#555]">Soon</span>}
    </button>
  );
}

function DifficultyOption({ level, selected, unlocked, onClick }: {
  level: DifficultyLevel; selected: boolean; unlocked: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!unlocked}
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all w-full ${
        selected
          ? 'bg-[#6c5ce7]/20 border border-[#6c5ce7]/50'
          : unlocked
            ? 'hover:bg-[#1a1530] border border-transparent'
            : 'opacity-40 cursor-not-allowed border border-transparent'
      }`}
    >
      <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
        selected ? 'border-[#6c5ce7]' : 'border-[#555]'
      }`}>
        {selected && <span className="w-1.5 h-1.5 rounded-full bg-[#6c5ce7]"></span>}
      </span>
      <div className="flex-1 min-w-0">
        <span className={`text-xs font-semibold block ${selected ? 'text-white' : unlocked ? 'text-[#c8c8d8]' : 'text-[#555]'}`}>
          {unlocked ? level.label : '🔒 ' + level.label}
        </span>
        <span className="text-[10px] text-[#a0a0b0] block truncate">{level.description}</span>
      </div>
    </button>
  );
}

function ActionButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1a1530] border border-[#2a2545] text-xs text-[#c8c8d8] hover:bg-[#6c5ce7]/20 hover:border-[#6c5ce7]/50 hover:text-white transition-all"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[#a0a0b0] text-xs">{label}</span>
      <span className="text-white font-medium text-xs">{value}</span>
    </div>
  );
}
