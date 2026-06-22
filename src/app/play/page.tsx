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
  const [openSection, setOpenSection] = useState<'game' | 'difficulty' | 'settings' | null>('settings');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [capturedPieces, setCapturedPieces] = useState<{ white: string[]; black: string[] }>({ white: [], black: [] });
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentDifficulty = difficultyLevels[currentDifficultyIndex];
  const xp = stats.xp;

  const MIN_MOVES_FOR_XP = 10;

  function handleGameEnd(result: 'win' | 'loss' | 'draw') {
    const hasEnoughMoves = moveHistory.length >= MIN_MOVES_FOR_XP;
    switch (result) {
      case 'win':
        recordWin();
        setGameResult('You Win!');
        break;
      case 'loss':
        if (hasEnoughMoves) recordLoss();
        setGameResult('You Lost!');
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
    <div className="play-page-light h-screen flex flex-col relative overflow-hidden play-page-container">
      {/* Hero image blur background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero_image.png"
          alt=""
          fill
          className="object-cover object-center opacity-40 blur-sm scale-105"
          priority
        />
        <div className="play-bg-gradient absolute inset-0" />
      </div>

      {/* Mobile settings button */}
      <button
        className="lg:hidden fixed top-4 right-4 z-40 flex items-center justify-center w-10 h-10 rounded-full shadow-lg"
        style={{ background: 'rgba(13, 10, 26, 0.8)', border: '1px solid rgba(155, 127, 212, 0.3)' }}
        onClick={() => setMobileMenuOpen(true)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      </button>

      {/* Mobile drawer overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#e8dff5]">
              <span className="font-bold text-lg text-[#4a3b6b]">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#f5f0ff]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a3b6b" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Settings */}
              <div className="space-y-3 pb-4 border-b border-[#e8dff5]">
                <h4 className="text-xs font-bold text-[#9b7fd4] tracking-wider">GAME SETTINGS</h4>
                <div>
                  <label className="text-sm text-[#5a4b7a] mb-1.5 block font-semibold">Mode</label>
                  <div className="flex flex-col gap-1.5">
                    <GameModeButton icon="🖥️" label="Play vs Computer" active={gameMode === 'computer'} onClick={() => setGameMode('computer')} />
                    <GameModeButton icon="👤" label="Play vs Friend" active={gameMode === 'friend'} onClick={() => setGameMode('friend')} disabled />
                    <GameModeButton icon="🌐" label="Online Players" active={gameMode === 'online'} onClick={() => setGameMode('online')} disabled />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-[#5a4b7a] mb-1.5 block font-semibold">Difficulty</label>
                  <div className="flex flex-col gap-1.5">
                    {difficultyLevels.slice(0, 4).map((level, index) => {
                      const isUnlocked = index <= stats.highestDifficultyBeaten + 1;
                      return (
                        <DifficultyOption
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
                <div>
                  <label className="text-sm text-[#5a4b7a] mb-1.5 block font-semibold">Play As</label>
                  <div className="flex gap-2">
                    <button onClick={() => setPlayerColor('white')} className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold border-2 ${playerColor === 'white' ? 'bg-white text-[#4a3b6b] border-[#9b7fd4] shadow-md' : 'bg-[#f8f4ff] text-[#7a6b9a] border-[#e8dff5]'}`}>White</button>
                    <button onClick={() => setPlayerColor('black')} className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold border-2 ${playerColor === 'black' ? 'bg-[#3a2d5c] text-white border-[#9b7fd4] shadow-md' : 'bg-[#f8f4ff] text-[#7a6b9a] border-[#e8dff5]'}`}>Black</button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-[#5a4b7a] mb-1.5 block font-semibold">Board Theme</label>
                  <div className="flex gap-3">
                    {(Object.keys(boardThemes) as BoardTheme[]).map((theme) => (
                      <button key={theme} onClick={() => setBoardTheme(theme)} className={`w-9 h-9 rounded-lg overflow-hidden border-2 transition-all ${boardTheme === theme ? 'border-[#9b7fd4] scale-110 shadow-lg' : 'border-[#e8dff5]'}`} title={boardThemes[theme].label}>
                        <div className="w-full h-1/2" style={{ backgroundColor: boardThemes[theme].light }} />
                        <div className="w-full h-1/2" style={{ backgroundColor: boardThemes[theme].dark }} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-[#5a4b7a] mb-1.5 block font-semibold">Pieces</label>
                  <div className="flex gap-2">
                    <button onClick={() => setPieceStyle('classic')} className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold border-2 flex items-center justify-center gap-1.5 ${pieceStyle === 'classic' ? 'bg-white text-[#4a3b6b] border-[#9b7fd4] shadow-md' : 'bg-[#f8f4ff] text-[#7a6b9a] border-[#e8dff5]'}`}>
                      <span className="text-base">♞</span> Classic
                    </button>
                    <button onClick={() => setPieceStyle('fantasy')} className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold border-2 flex items-center justify-center gap-1.5 ${pieceStyle === 'fantasy' ? 'bg-white text-[#4a3b6b] border-[#9b7fd4] shadow-md' : 'bg-[#f8f4ff] text-[#7a6b9a] border-[#e8dff5]'}`}>
                      <span className="text-base">🏰</span> Fantasy
                    </button>
                  </div>
                </div>
              </div>

              {/* Move List */}
              <div className="pb-4 border-b border-[#e8dff5]">
                <h4 className="text-xs font-bold text-[#9b7fd4] tracking-wider mb-2">MOVE LIST</h4>
                {moveHistory.length > 0 ? (
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => (
                      <div key={i} className="flex text-sm">
                        <span className="text-[#9b8fb5] w-6 font-semibold">{i + 1}.</span>
                        <span className="text-[#4a3b6b] flex-1 font-semibold">{moveHistory[i * 2]}</span>
                        {moveHistory[i * 2 + 1] && <span className="text-[#6b5b8a] flex-1">{moveHistory[i * 2 + 1]}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#9b8fb5]">No moves yet</p>
                )}
              </div>

              {/* Captured Pieces */}
              <div className="pb-4 border-b border-[#e8dff5]">
                <h4 className="text-xs font-bold text-[#9b7fd4] tracking-wider mb-2">CAPTURED PIECES</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#3a3a3a] border-2 border-[#555] inline-block"></span>
                    <span className="text-sm text-[#5a4b7a] font-semibold">Black</span>
                    <span className="text-base ml-1 text-[#4a3b6b]">{capturedPieces.black.join(' ') || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-white border-2 border-[#bbb] inline-block"></span>
                    <span className="text-sm text-[#5a4b7a] font-semibold">White</span>
                    <span className="text-base ml-1 text-[#4a3b6b]">{capturedPieces.white.join(' ') || '—'}</span>
                  </div>
                </div>
              </div>

              {/* XP */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">✨</span>
                  <span className="text-base font-bold text-[#6c5ce7]">{xp} XP</span>
                </div>
                <div className="play-progress-bar">
                  <div className="play-progress-fill" style={{ width: `${(xp % 200) / 2}%` }} />
                </div>
                <p className="text-sm text-[#7a6b9a] mt-1.5 font-medium">Level {stats.level} • {200 - (xp % 200)} XP to next level</p>
              </div>

              {/* New Game button */}
              <button onClick={() => { startNewGame(); setMobileMenuOpen(false); }} className="play-start-btn w-full mt-2">
                <span className="mr-2">⚔️</span> New Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main layout: left sidebar + clean board area */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-3 xl:gap-4 px-3 xl:px-5 pt-20 md:pt-24 pb-3 min-h-0">

        {/* Left Sidebar - all controls and info panels */}
        <aside className="hidden lg:flex w-72 xl:w-80 2xl:w-88 shrink-0 lg:overflow-y-auto lg:max-h-full flex-col gap-2.5">
          {/* Game Setup Section - collapsed during active game */}
          {isPlaying && !gameResult ? (
            <div className="play-card overflow-hidden">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#f5f0ff] rounded-xl transition-colors"
                onClick={() => setIsPlaying(false)}
              >
                <span className="text-xl">⚙️</span>
                <div className="flex-1 text-left">
                  <span className="text-xs font-bold text-[#9b7fd4] tracking-wider block">GAME SETUP</span>
                  <span className="font-bold text-sm text-[#4a3b6b]">
                    {gameMode === 'computer' ? 'vs Computer' : gameMode === 'friend' ? 'vs Friend' : 'Online'} • {currentDifficulty.label} • {playerColor === 'white' ? 'White' : 'Black'}
                  </span>
                </div>
                <svg className="w-4 h-4 text-[#9b7fd4]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
              </button>
            </div>
          ) : (
            <>
              {/* Game Mode - Accordion */}
              <div className="play-card overflow-hidden">
                {openSection === 'game' ? (
                  <>
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 bg-[#9b7fd4] rounded-xl mb-3 cursor-pointer"
                      onClick={() => setOpenSection(null)}
                    >
                      <span className="text-white font-bold text-sm tracking-wide">GAME</span>
                      <svg className="w-4 h-4 text-white rotate-180" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                    <div className="flex flex-col gap-2">
                      <GameModeButton
                        icon="🖥️"
                        label="Play vs Computer"
                        active={gameMode === 'computer'}
                        onClick={() => { setGameMode('computer'); setOpenSection(null); }}
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
                  </>
                ) : (
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#f5f0ff] rounded-xl transition-colors"
                    onClick={() => setOpenSection('game')}
                  >
                    <span className="text-xl">{gameMode === 'computer' ? '🖥️' : gameMode === 'friend' ? '👤' : '🌐'}</span>
                    <div className="flex-1 text-left">
                      <span className="text-xs font-bold text-[#9b7fd4] tracking-wider block">GAME</span>
                      <span className="font-bold text-base text-[#4a3b6b]">
                        {gameMode === 'computer' ? 'Play vs Computer' : gameMode === 'friend' ? 'Play vs Friend' : 'Online Players'}
                      </span>
                    </div>
                    <svg className="w-4 h-4 text-[#9b7fd4]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                )}
              </div>

              {/* Difficulty - Accordion */}
              <div className="play-card overflow-hidden">
                {openSection === 'difficulty' ? (
                  <>
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 bg-[#9b7fd4] rounded-xl mb-3 cursor-pointer"
                      onClick={() => setOpenSection(null)}
                    >
                      <span className="text-white font-bold text-sm tracking-wide">DIFFICULTY</span>
                      <svg className="w-4 h-4 text-white rotate-180" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                    <div className="flex flex-col gap-2">
                      {difficultyLevels.slice(0, 4).map((level, index) => {
                        const isUnlocked = index <= stats.highestDifficultyBeaten + 1;
                        return (
                          <DifficultyOption
                            key={level.name}
                            level={level}
                            selected={index === currentDifficultyIndex}
                            unlocked={isUnlocked}
                            onClick={() => { if (isUnlocked) { setDifficulty(index); setOpenSection(null); } }}
                          />
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#f5f0ff] rounded-xl transition-colors"
                    onClick={() => setOpenSection('difficulty')}
                  >
                    <span className="w-7 h-7 rounded-full bg-[#9b7fd4] flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">{currentDifficultyIndex + 1}</span>
                    </span>
                    <div className="flex-1 text-left">
                      <span className="text-xs font-bold text-[#9b7fd4] tracking-wider block">DIFFICULTY</span>
                      <span className="font-bold text-base text-[#4a3b6b]">{currentDifficulty.label}</span>
                    </div>
                    <svg className="w-4 h-4 text-[#9b7fd4]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                )}
              </div>

              {/* Game Settings - Accordion */}
              <div className="play-card overflow-hidden">
                {openSection === 'settings' ? (
                  <>
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 bg-[#9b7fd4] rounded-xl mb-3 cursor-pointer"
                      onClick={() => setOpenSection(null)}
                    >
                      <span className="text-white font-bold text-sm tracking-wide">SETTINGS</span>
                      <svg className="w-4 h-4 text-white rotate-180" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                    <div>
                      <div className="mb-4">
                        <label className="text-sm text-[#5a4b7a] mb-2 block font-semibold">Play As</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPlayerColor('white')}
                            className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold transition-all border-2 ${
                              playerColor === 'white'
                                ? 'bg-white text-[#4a3b6b] border-[#9b7fd4] shadow-md'
                                : 'bg-[#f8f4ff] text-[#7a6b9a] border-[#e8dff5] hover:border-[#c4b5e0]'
                            }`}
                          >
                            White
                          </button>
                          <button
                            onClick={() => setPlayerColor('black')}
                            className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold transition-all border-2 ${
                              playerColor === 'black'
                                ? 'bg-[#3a2d5c] text-white border-[#9b7fd4] shadow-md'
                                : 'bg-[#f8f4ff] text-[#7a6b9a] border-[#e8dff5] hover:border-[#c4b5e0]'
                            }`}
                          >
                            Black
                          </button>
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="text-sm text-[#5a4b7a] mb-2 block font-semibold">Board Theme</label>
                        <div className="flex gap-3">
                          {(Object.keys(boardThemes) as BoardTheme[]).map((theme) => {
                            const light = boardThemes[theme].light;
                            const dark = boardThemes[theme].dark;
                            return (
                              <button
                                key={theme}
                                onClick={() => setBoardTheme(theme)}
                                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                                  boardTheme === theme ? 'border-[#9b7fd4] scale-110 shadow-lg' : 'border-[#e8dff5] hover:border-[#c4b5e0]'
                                }`}
                                title={boardThemes[theme].label}
                                style={{
                                  background: `
                                    linear-gradient(45deg, ${dark} 25%, transparent 25%, transparent 75%, ${dark} 75%),
                                    linear-gradient(45deg, ${dark} 25%, transparent 25%, transparent 75%, ${dark} 75%)
                                  `,
                                  backgroundColor: light,
                                  backgroundSize: '50% 50%',
                                  backgroundPosition: '0 0, 25% 25%',
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="text-sm text-[#5a4b7a] mb-2 block font-semibold">Pieces</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPieceStyle('classic')}
                            className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold transition-all border-2 flex items-center justify-center gap-1.5 ${
                              pieceStyle === 'classic'
                                ? 'bg-white text-[#4a3b6b] border-[#9b7fd4] shadow-md'
                                : 'bg-[#f8f4ff] text-[#7a6b9a] border-[#e8dff5] hover:border-[#c4b5e0]'
                            }`}
                          >
                            <span className="text-base">♞</span> Classic
                          </button>
                          <button
                            onClick={() => setPieceStyle('fantasy')}
                            className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold transition-all border-2 flex items-center justify-center gap-1.5 ${
                              pieceStyle === 'fantasy'
                                ? 'bg-white text-[#4a3b6b] border-[#9b7fd4] shadow-md'
                                : 'bg-[#f8f4ff] text-[#7a6b9a] border-[#e8dff5] hover:border-[#c4b5e0]'
                            }`}
                          >
                            <span className="text-base">🏰</span> Fantasy
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#f5f0ff] rounded-xl transition-colors"
                    onClick={() => setOpenSection('settings')}
                  >
                    <span className="text-xl">⚙️</span>
                    <div className="flex-1 text-left">
                      <span className="text-xs font-bold text-[#9b7fd4] tracking-wider block">SETTINGS</span>
                      <span className="font-bold text-base text-[#4a3b6b]">{playerColor === 'white' ? 'White' : 'Black'} • {boardThemes[boardTheme].label}</span>
                    </div>
                    <svg className="w-4 h-4 text-[#9b7fd4]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                )}
              </div>
            </>
          )}

          {/* New Game Button */}
          <button onClick={startNewGame} className="play-start-btn w-full">
            <span className="mr-2"></span> New Game
          </button>

          {/* Divider */}
          <div className="border-t border-[#e8dff5]/50 my-1" />

          {/* Move List & Captured Pieces - expanded during and after game, collapsed before first game */}
          {isPlaying || gameResult ? (
            <>
              {/* Move List */}
              <div className="play-card min-h-0">
                <h3 className="play-card-title text-xs">MOVE LIST</h3>
                {moveHistory.length > 0 ? (
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => (
                      <div key={i} className="flex text-sm">
                        <span className="text-[#9b8fb5] w-6 font-semibold">{i + 1}.</span>
                        <span className="text-[#4a3b6b] flex-1 font-semibold">{moveHistory[i * 2]}</span>
                        {moveHistory[i * 2 + 1] && (
                          <span className="text-[#6b5b8a] flex-1">{moveHistory[i * 2 + 1]}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-2 text-[#9b8fb5]">
                    <p className="text-xs">Moves will appear here</p>
                  </div>
                )}
              </div>

              {/* Captured Pieces */}
              <div className="play-card">
                <h3 className="play-card-title text-xs">CAPTURED PIECES</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#3a3a3a] border-2 border-[#555] inline-block"></span>
                    <span className="text-sm text-[#5a4b7a] font-semibold">Black</span>
                    <span className="text-base ml-1 text-[#4a3b6b]">{capturedPieces.black.join(' ') || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-white border-2 border-[#bbb] inline-block"></span>
                    <span className="text-sm text-[#5a4b7a] font-semibold">White</span>
                    <span className="text-base ml-1 text-[#4a3b6b]">{capturedPieces.white.join(' ') || '—'}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="play-card overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl">
                <span className="text-xl">📋</span>
                <div className="flex-1 text-left">
                  <span className="text-xs font-bold text-[#9b7fd4] tracking-wider block">GAME INFO</span>
                  <span className="text-sm text-[#7a6b9a]">Moves & captures appear during play</span>
                </div>
              </div>
            </div>
          )}

          {/* XP / Stats */}
          <div className="play-card play-card-xp">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg">✨</span>
              <span className="text-base font-bold text-[#6c5ce7]">{xp} XP</span>
            </div>
            <div className="play-progress-bar">
              <div className="play-progress-fill" style={{ width: `${(xp % 200) / 2}%` }} />
            </div>
            <p className="text-sm text-[#7a6b9a] mt-1.5 font-medium">Level {stats.level} • {200 - (xp % 200)} XP to next level</p>
          </div>
        </aside>

        {/* Main Board Area - clean, maximized */}
        <main className="flex-1 flex flex-col items-center justify-center min-w-0 min-h-0">
          {/* Compact VS Header */}
          <div className="flex items-center justify-center gap-3 mb-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-sm shadow-sm border border-[#e8dff5]/60 max-w-max">
            <span className="font-bold text-sm text-[#4a3b6b]">You</span>
            <span className="text-xs text-[#7a6b9a]">({playerColor === 'white' ? 'White' : 'Black'})</span>
            <span className="text-xs font-bold text-[#9b7fd4] bg-[#f5f0ff] px-2 py-0.5 rounded-full">VS</span>
            <span className="font-bold text-sm text-[#4a3b6b]">Computer</span>
            <span className="text-xs text-[#7a6b9a]">({playerColor === 'white' ? 'Black' : 'White'})</span>
          </div>

          {/* Chess Board */}
          <div className="flex-1 w-full flex items-center justify-center min-h-0">
            {isPlaying ? (
              <div className="play-board-wrapper-light">
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
              <div className="play-board-wrapper-light play-board-empty rounded-2xl flex items-center justify-center">
                <div className="text-center px-6 flex flex-col items-center">
                  <span className="text-7xl lg:text-8xl block mb-5">⚔️</span>
                  <h2 className="text-3xl lg:text-5xl font-bold text-[#4a3b6b] mb-3">Ready for Battle?</h2>
                  <p className="text-[#7a6b9a] mb-6 text-lg lg:text-xl">Choose your settings and click New Game to begin!</p>
                  <button onClick={startNewGame} className="play-start-btn text-xl px-10 py-4">
                    <span className="mr-2">⚔️</span> Start Playing
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isPlaying && !gameResult && (
            <div className="flex gap-3 mt-3">
              <ActionButton icon="🏳️" label="Resign" onClick={() => { setIsPlaying(false); handleGameEnd('loss'); }} />
              <ActionButton icon="🤝" label="Draw" onClick={() => { setIsPlaying(false); handleGameEnd('draw'); }} />
            </div>
          )}

          {gameResult && (
            <div className="mt-4 text-center">
              <p className="text-3xl font-bold text-[#4a3b6b] celebrate mb-3">{gameResult}</p>
              <button onClick={startNewGame} className="play-start-btn inline-flex">
                <span className="mr-2">⚔️</span> Play Again
              </button>
            </div>
          )}
        </main>
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
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all w-full border-2 ${
        active
          ? 'bg-[#9b7fd4] border-[#9b7fd4] text-white shadow-md'
          : disabled
            ? 'text-[#b8aed0] border-[#ede8f5] cursor-not-allowed bg-[#faf8ff]'
            : 'text-[#4a3b6b] border-[#e8dff5] hover:bg-[#f5f0ff] hover:border-[#c4b5e0]'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-bold text-base">{label}</span>
      {disabled && <span className="ml-auto text-sm text-[#b8aed0] bg-[#ede8f5] px-2.5 py-0.5 rounded-full font-semibold">Soon</span>}
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
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all w-full border-2 ${
        selected
          ? 'bg-[#f5f0ff] border-[#9b7fd4] shadow-sm'
          : unlocked
            ? 'hover:bg-[#faf8ff] border-[#ede8f5] hover:border-[#c4b5e0]'
            : 'opacity-40 cursor-not-allowed border-[#ede8f5]'
      }`}
    >
      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
        selected ? 'border-[#9b7fd4]' : 'border-[#c4b5e0]'
      }`}>
        {selected && <span className="w-2.5 h-2.5 rounded-full bg-[#9b7fd4]"></span>}
      </span>
      <div className="flex-1 min-w-0">
        <span className={`text-base font-bold block ${selected ? 'text-[#4a3b6b]' : unlocked ? 'text-[#5a4b7a]' : 'text-[#b8aed0]'}`}>
          {unlocked ? level.label : '🔒 ' + level.label}
        </span>
        <span className="text-sm text-[#7a6b9a] block truncate">{level.description}</span>
      </div>
    </button>
  );
}

function ActionButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="play-action-btn"
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

