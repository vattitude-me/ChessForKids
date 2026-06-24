'use client';

import { useState } from 'react';
import Image from 'next/image';
import ChessBoard from '@/components/ChessBoard';
import { useGameStore } from '@/lib/store';
import { DifficultyLevel } from '@/lib/chess-ai';

type BoardTheme = 'purple' | 'wood' | 'dark' | 'painting';

const boardThemes: Record<BoardTheme, { dark: string; light: string; label: string }> = {
  purple: { dark: '#9b7fd4', light: '#e8dff5', label: 'Purple' },
  wood: { dark: '#b58863', light: '#f0d9b5', label: 'Wood' },
  dark: { dark: '#5a6a7a', light: '#c4d4e0', label: 'Slate' },
  painting: { dark: '#4a4a4a', light: '#f5f0e8', label: 'Painting' },
};

const difficultyMeta: Record<string, { icon: string; color: string }> = {
  'Apprentice': { icon: '🧹', color: '#4caf50' },
  'Squire': { icon: '🛡️', color: '#2196f3' },
  'Knight': { icon: '⚔️', color: '#ff9800' },
  'Wizard': { icon: '🧙', color: '#9c27b0' },
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
    saveGameRecord,
  } = useGameStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('wood');
  const [pieceStyle, setPieceStyle] = useState<'classic' | 'fantasy'>('classic');
  const [gameMode, setGameMode] = useState<'computer' | 'friend' | 'online'>('computer');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [capturedPieces, setCapturedPieces] = useState<{ white: string[]; black: string[] }>({ white: [], black: [] });
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentDifficulty = difficultyLevels[currentDifficultyIndex];
  const xp = stats.xp;
  const xpProgress = (xp % 200) / 2;

  const MIN_MOVES_FOR_XP = 10;

  function handleGameEnd(result: 'win' | 'loss' | 'draw') {
    const hasEnoughMoves = moveHistory.length >= MIN_MOVES_FOR_XP;
    switch (result) {
      case 'win':
        recordWin();
        setGameResult('Victory!');
        break;
      case 'loss':
        if (hasEnoughMoves) recordLoss();
        setGameResult('Defeated!');
        break;
      case 'draw':
        if (hasEnoughMoves) recordDraw();
        setGameResult('Draw!');
        break;
    }
    saveGameRecord({
      result,
      difficulty: currentDifficulty.label,
      playerColor,
      moves: moveHistory,
      capturedPieces,
      totalMoves: moveHistory.length,
    });
  }

  function startNewGame() {
    setIsPlaying(true);
    setMoveHistory([]);
    setCapturedPieces({ white: [], black: [] });
    setGameResult(null);
    setGameKey(prev => prev + 1);
  }

  const pieceSymbols: Record<string, string> = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' };

  function handleMove(move: { san: string; color: 'w' | 'b'; captured?: string }) {
    setMoveHistory(prev => [...prev, move.san]);
    if (move.captured) {
      const symbol = pieceSymbols[move.captured] || move.captured;
      setCapturedPieces(prev => {
        if (move.color === 'w') {
          return { ...prev, black: [...prev.black, symbol] };
        } else {
          return { ...prev, white: [...prev.white, symbol] };
        }
      });
    }
  }

  return (
    <div className="play-page play-page-container min-h-screen flex flex-col relative overflow-hidden">
      {/* Dark fantasy background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero_image.png"
          alt=""
          fill
          className="object-cover object-center opacity-30 scale-105"
          priority
        />
        <div className="play-page-overlay absolute inset-0" />
      </div>

      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 right-4 z-40 play-mobile-menu-btn"
        onClick={() => setMobileMenuOpen(true)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e0e0ec" strokeWidth="2.5" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="play-mobile-drawer absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] overflow-y-auto pb-20">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <span className="font-bold text-lg text-white">Battle Setup</span>
              <button onClick={() => setMobileMenuOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e0e0ec" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Player Level Badge */}
              <div className="play-xp-card-mobile">
                <div className="flex items-center gap-3 mb-2">
                  <div className="play-level-badge">{stats.level}</div>
                  <div>
                    <span className="text-white font-bold text-sm block">Level {stats.level} Warrior</span>
                    <span className="text-[#a0a0b8] text-xs">{xp} XP total</span>
                  </div>
                </div>
                <div className="play-xp-bar">
                  <div className="play-xp-fill" style={{ width: `${xpProgress}%` }} />
                </div>
                <p className="text-xs text-[#a0a0b8] mt-1.5">{200 - (xp % 200)} XP to next level</p>
              </div>

              {/* Game Mode */}
              <div className="space-y-2">
                <h4 className="play-section-label">Game Mode</h4>
                <div className="flex flex-col gap-2">
                  <ModeButton icon="🖥️" label="vs Computer" active={gameMode === 'computer'} onClick={() => setGameMode('computer')} />
                  <ModeButton icon="👤" label="vs Friend" active={gameMode === 'friend'} onClick={() => setGameMode('friend')} disabled />
                  <ModeButton icon="🌐" label="Online" active={gameMode === 'online'} onClick={() => setGameMode('online')} disabled />
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <h4 className="play-section-label">Difficulty</h4>
                <div className="flex flex-col gap-2">
                  {difficultyLevels.slice(0, 4).map((level, index) => {
                    const isUnlocked = index <= stats.highestDifficultyBeaten + 1;
                    return (
                      <DifficultyCard
                        key={level.name}
                        level={level}
                        selected={index === currentDifficultyIndex}
                        unlocked={isUnlocked}
                        onClick={() => { if (isUnlocked) setDifficulty(index); }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-3">
                <h4 className="play-section-label">Battle Settings</h4>
                <div>
                  <label className="play-field-label">Play As</label>
                  <div className="flex gap-2">
                    <ColorButton color="white" active={playerColor === 'white'} onClick={() => setPlayerColor('white')} />
                    <ColorButton color="black" active={playerColor === 'black'} onClick={() => setPlayerColor('black')} />
                  </div>
                </div>
                <div>
                  <label className="play-field-label">Board Theme</label>
                  <div className="flex gap-3">
                    {(Object.keys(boardThemes) as BoardTheme[]).map((theme) => (
                      <ThemeSwatch key={theme} theme={theme} active={boardTheme === theme} onClick={() => setBoardTheme(theme)} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="play-field-label">Pieces</label>
                  <div className="flex gap-2">
                    <PieceButton style="classic" active={pieceStyle === 'classic'} onClick={() => setPieceStyle('classic')} />
                    <PieceButton style="fantasy" active={pieceStyle === 'fantasy'} onClick={() => setPieceStyle('fantasy')} />
                  </div>
                </div>
              </div>

              {/* Move List */}
              {(isPlaying || gameResult) && (
                <div className="space-y-2">
                  <h4 className="play-section-label">Move History</h4>
                  <div className="play-move-list max-h-36 overflow-y-auto">
                    {moveHistory.length > 0 ? (
                      Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => (
                        <div key={i} className="play-move-row">
                          <span className="play-move-num">{i + 1}.</span>
                          <span className="play-move-white">{moveHistory[i * 2]}</span>
                          {moveHistory[i * 2 + 1] && <span className="play-move-black">{moveHistory[i * 2 + 1]}</span>}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[#a0a0b8]">Moves will appear here</p>
                    )}
                  </div>
                </div>
              )}

              {/* Start Game */}
              <button onClick={() => { startNewGame(); setMobileMenuOpen(false); }} className="play-cta-btn w-full">
                <span>⚔️</span> Begin Battle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-4 xl:gap-5 px-4 xl:px-6 pt-20 md:pt-24 pb-4 min-h-0 max-w-[1600px] mx-auto w-full">

        {/* Left Panel - Game Setup */}
        <aside className="hidden lg:flex w-72 xl:w-80 2xl:w-88 shrink-0 lg:overflow-y-auto lg:max-h-full flex-col gap-3">
          {/* Player Card */}
          <div className="play-dark-card play-player-card">
            <div className="flex items-center gap-3">
              <div className="play-level-badge">{stats.level}</div>
              <div className="flex-1">
                <span className="text-white font-bold text-sm block">Level {stats.level} Warrior</span>
                <span className="text-[#a0a0b8] text-xs">{stats.wins}W / {stats.losses}L / {stats.draws}D</span>
              </div>
              <div className="play-streak-badge">
                <span className="text-xs">🔥</span>
                <span className="text-xs font-bold text-[#ffd700]">{stats.currentStreak}</span>
              </div>
            </div>
            <div className="play-xp-bar mt-3">
              <div className="play-xp-fill" style={{ width: `${xpProgress}%` }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-[#a0a0b8]">{xp % 200} / 200 XP</span>
              <span className="text-xs text-[#ffd700]">Level {stats.level + 1}</span>
            </div>
          </div>

          {/* Game Mode */}
          <div className="play-dark-card">
            <h3 className="play-section-label">Game Mode</h3>
            <div className="flex flex-col gap-2 mt-2">
              <ModeButton icon="🖥️" label="vs Computer" active={gameMode === 'computer'} onClick={() => setGameMode('computer')} />
              <ModeButton icon="👤" label="vs Friend" active={gameMode === 'friend'} onClick={() => setGameMode('friend')} disabled />
              <ModeButton icon="🌐" label="Online" active={gameMode === 'online'} onClick={() => setGameMode('online')} disabled />
            </div>
          </div>

          {/* Difficulty */}
          <div className="play-dark-card">
            <h3 className="play-section-label">Difficulty</h3>
            <div className="flex flex-col gap-2 mt-2">
              {difficultyLevels.slice(0, 4).map((level, index) => {
                const isUnlocked = index <= stats.highestDifficultyBeaten + 1;
                return (
                  <DifficultyCard
                    key={level.name}
                    level={level}
                    selected={index === currentDifficultyIndex}
                    unlocked={isUnlocked}
                    onClick={() => { if (isUnlocked) setDifficulty(index); }}
                  />
                );
              })}
            </div>
          </div>

          {/* Settings */}
          <div className="play-dark-card">
            <h3 className="play-section-label">Battle Settings</h3>
            <div className="space-y-4 mt-2">
              <div>
                <label className="play-field-label">Play As</label>
                <div className="flex gap-2">
                  <ColorButton color="white" active={playerColor === 'white'} onClick={() => setPlayerColor('white')} />
                  <ColorButton color="black" active={playerColor === 'black'} onClick={() => setPlayerColor('black')} />
                </div>
              </div>
              <div>
                <label className="play-field-label">Board Theme</label>
                <div className="flex gap-3">
                  {(Object.keys(boardThemes) as BoardTheme[]).map((theme) => (
                    <ThemeSwatch key={theme} theme={theme} active={boardTheme === theme} onClick={() => setBoardTheme(theme)} />
                  ))}
                </div>
              </div>
              <div>
                <label className="play-field-label">Pieces</label>
                <div className="flex gap-2">
                  <PieceButton style="classic" active={pieceStyle === 'classic'} onClick={() => setPieceStyle('classic')} />
                  <PieceButton style="fantasy" active={pieceStyle === 'fantasy'} onClick={() => setPieceStyle('fantasy')} />
                </div>
              </div>
            </div>
          </div>

          {/* New Game Button */}
          <button onClick={startNewGame} className="play-cta-btn w-full">
            <span>⚔️</span> Begin Battle
          </button>
        </aside>

        {/* Center - Board Area */}
        <main className="flex-1 flex flex-col items-center justify-center min-w-0 min-h-0">
          {/* VS Header */}
          <div className="play-vs-bar mb-3">
            <div className="play-vs-player">
              <div className="play-vs-avatar play-vs-avatar-you">🧑</div>
              <div>
                <span className="text-white font-bold text-sm">You</span>
                <span className="text-[#a0a0b8] text-xs block">{playerColor === 'white' ? 'White' : 'Black'}</span>
              </div>
            </div>
            <div className="play-vs-badge-new">VS</div>
            <div className="play-vs-player">
              <div>
                <span className="text-white font-bold text-sm">Computer</span>
                <span className="text-[#a0a0b8] text-xs block">{currentDifficulty.label}</span>
              </div>
              <div className="play-vs-avatar play-vs-avatar-ai">
                {difficultyMeta[currentDifficulty.label]?.icon || '🤖'}
              </div>
            </div>
          </div>

          {/* Chess Board */}
          <div className="flex-1 w-full flex items-center justify-center min-h-0">
            {isPlaying ? (
              <div className="play-board-frame">
                <ChessBoard
                  key={gameKey}
                  difficulty={currentDifficulty}
                  onGameEnd={handleGameEnd}
                  onMove={handleMove}
                  playerColor={playerColor}
                  boardTheme={boardThemes[boardTheme]}
                  pieceTheme={pieceStyle}
                  minimal
                />
              </div>
            ) : (
              <div className="play-arena-empty">
                <div className="play-arena-inner">
                  <div className="play-arena-icon">⚔️</div>
                  <h2 className="play-arena-title">Enter the Arena</h2>
                  <p className="play-arena-desc">
                    Choose your settings and challenge the {currentDifficulty.label}!
                  </p>
                  <button onClick={startNewGame} className="play-cta-btn play-cta-btn-lg">
                    <span>⚔️</span> Begin Battle
                  </button>
                  <div className="play-arena-hint">
                    <span>🐉</span> Tip: Beat {currentDifficulty.label} to unlock the next difficulty!
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isPlaying && !gameResult && (
            <div className="flex items-stretch gap-3 mt-3 mb-4 lg:mb-0">
              <button onClick={() => { setIsPlaying(false); handleGameEnd('loss'); }} className="play-action-btn-dark">
                <span>🏳️</span> Resign
              </button>
              <button onClick={() => { setIsPlaying(false); handleGameEnd('draw'); }} className="play-action-btn-dark">
                <span>🤝</span> Draw
              </button>
              <button onClick={startNewGame} className="lg:hidden play-action-btn-gold">
                <span>⚔️</span> New Game
              </button>
            </div>
          )}

          {/* Game Result */}
          {gameResult && (
            <div className="play-result-display mt-4 mb-4 lg:mb-0">
              <p className={`play-result-text celebrate ${gameResult === 'Victory!' ? 'play-result-win' : gameResult === 'Defeated!' ? 'play-result-loss' : 'play-result-draw'}`}>
                {gameResult === 'Victory!' && '🏆 '}{gameResult}{gameResult === 'Victory!' && ' 🏆'}
                {gameResult === 'Defeated!' && ' 💀'}
              </p>
              <button onClick={startNewGame} className="play-cta-btn mt-3">
                <span>⚔️</span> Battle Again
              </button>
            </div>
          )}
        </main>

        {/* Right Panel - Game Info */}
        <aside className="hidden xl:flex w-72 2xl:w-80 shrink-0 xl:overflow-y-auto xl:max-h-full flex-col gap-3">
          {/* Move History */}
          <div className="play-dark-card flex-1 min-h-0">
            <h3 className="play-section-label">Move History</h3>
            <div className="play-move-list mt-2 max-h-48 2xl:max-h-64 overflow-y-auto">
              {moveHistory.length > 0 ? (
                Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => (
                  <div key={i} className="play-move-row">
                    <span className="play-move-num">{i + 1}.</span>
                    <span className="play-move-white">{moveHistory[i * 2]}</span>
                    {moveHistory[i * 2 + 1] && <span className="play-move-black">{moveHistory[i * 2 + 1]}</span>}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <span className="text-3xl mb-2">📜</span>
                  <p className="text-sm text-[#a0a0b8]">Your battle chronicle<br/>will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Captured Pieces */}
          <div className="play-dark-card">
            <h3 className="play-section-label">Captured Pieces</h3>
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-2">
                <span className="play-captured-dot play-captured-dot-black"></span>
                <span className="text-sm text-[#a0a0b8] font-medium">Black</span>
                <span className="text-base ml-auto text-white tracking-wider">{capturedPieces.black.join(' ') || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="play-captured-dot play-captured-dot-white"></span>
                <span className="text-sm text-[#a0a0b8] font-medium">White</span>
                <span className="text-base ml-auto text-white tracking-wider">{capturedPieces.white.join(' ') || '—'}</span>
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="play-dark-card play-tips-card">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🐉</span>
              <div>
                <h4 className="text-sm font-bold text-[#ffd700] mb-1">Dragon&apos;s Wisdom</h4>
                <p className="text-xs text-[#a0a0b8] leading-relaxed">
                  {currentDifficultyIndex === 0 && "Control the center squares! They give your pieces more room to move."}
                  {currentDifficultyIndex === 1 && "Develop your knights and bishops early. Don't move the same piece twice!"}
                  {currentDifficultyIndex === 2 && "Look for forks and pins. These tactics win material!"}
                  {currentDifficultyIndex === 3 && "Think ahead! Consider what your opponent wants to do after your move."}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ModeButton({ icon, label, active, onClick, disabled }: {
  icon: string; label: string; active: boolean; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`play-mode-btn ${active ? 'play-mode-btn-active' : ''} ${disabled ? 'play-mode-btn-disabled' : ''}`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-bold text-sm">{label}</span>
      {disabled && <span className="play-mode-soon">Soon</span>}
    </button>
  );
}

function DifficultyCard({ level, selected, unlocked, onClick }: {
  level: DifficultyLevel; selected: boolean; unlocked: boolean; onClick: () => void;
}) {
  const meta = difficultyMeta[level.label] || { icon: '⭐', color: '#6c5ce7' };
  return (
    <button
      onClick={onClick}
      disabled={!unlocked}
      className={`play-difficulty-btn ${selected ? 'play-difficulty-btn-active' : ''} ${!unlocked ? 'play-difficulty-btn-locked' : ''}`}
    >
      <span className="play-difficulty-icon" style={{ background: unlocked ? meta.color : undefined }}>
        {unlocked ? meta.icon : '🔒'}
      </span>
      <div className="flex-1 min-w-0 text-left">
        <span className={`text-sm font-bold block ${selected ? 'text-white' : unlocked ? 'text-[#e0e0ec]' : 'text-[#606080]'}`}>
          {level.label}
        </span>
        <span className="text-xs text-[#a0a0b8] block truncate">{level.description}</span>
      </div>
      {selected && <span className="play-difficulty-check">✓</span>}
    </button>
  );
}

function ColorButton({ color, active, onClick }: { color: 'white' | 'black'; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`play-color-btn ${active ? 'play-color-btn-active' : ''} ${color === 'black' ? 'play-color-btn-dark' : ''}`}
    >
      <span className={`play-color-swatch ${color === 'white' ? 'bg-white' : 'bg-[#2a2a3e]'}`}></span>
      {color === 'white' ? 'White' : 'Black'}
    </button>
  );
}

function ThemeSwatch({ theme, active, onClick }: { theme: BoardTheme; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`play-theme-swatch ${active ? 'play-theme-swatch-active' : ''}`}
      title={boardThemes[theme].label}
    >
      <div className="w-full h-1/2 rounded-t-sm" style={{ backgroundColor: boardThemes[theme].light }} />
      <div className="w-full h-1/2 rounded-b-sm" style={{ backgroundColor: boardThemes[theme].dark }} />
    </button>
  );
}

function PieceButton({ style, active, onClick }: { style: 'classic' | 'fantasy'; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`play-piece-btn ${active ? 'play-piece-btn-active' : ''}`}
    >
      <span className="text-lg">{style === 'classic' ? '♞' : '🏰'}</span>
      {style === 'classic' ? 'Classic' : 'Fantasy'}
    </button>
  );
}
