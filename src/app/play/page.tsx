'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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

type RightTab = 'moves' | 'captured' | 'tips';

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
  const [gameMode, setGameMode] = useState<'computer' | 'friend'>('computer');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [capturedPieces, setCapturedPieces] = useState<{ white: string[]; black: string[] }>({ white: [], black: [] });
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>('moves');
  const [tabletSidebarOpen, setTabletSidebarOpen] = useState(true);
  const [confirmAction, setConfirmAction] = useState<'resign' | 'draw' | null>(null);
  const confirmTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const requestConfirm = useCallback((action: 'resign' | 'draw') => {
    if (confirmAction === action) {
      if (confirmTimeout.current) clearTimeout(confirmTimeout.current);
      setConfirmAction(null);
      setIsPlaying(false);
      handleGameEnd(action === 'resign' ? 'loss' : 'draw');
    } else {
      setConfirmAction(action);
      if (confirmTimeout.current) clearTimeout(confirmTimeout.current);
      confirmTimeout.current = setTimeout(() => setConfirmAction(null), 3000);
    }
  }, [confirmAction]);

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

  const isInGame = isPlaying || !!gameResult;

  function startNewGameAndCollapse() {
    startNewGame();
    setTabletSidebarOpen(false);
  }

  return (
    <div className={`play-page play-page-container min-h-screen flex flex-col relative overflow-hidden ${isInGame ? 'play-game-active' : ''}`}>
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

      {/* Mobile home button — top left on small screens */}
      {!mobileMenuOpen && (
        <Link
          href="/"
          className="fixed top-4 left-4 z-40 play-mobile-menu-btn md:hidden"
          aria-label="Go home"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e0e0ec" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l9-9 9 9" /><path d="M9 21V12h6v9" /></svg>
        </Link>
      )}

      {/* Mobile menu button — only on small screens where sidebar is hidden */}
      {!mobileMenuOpen && (
        <button
          className="fixed top-4 right-4 z-40 play-mobile-menu-btn md:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e0e0ec" strokeWidth="2.5" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      )}

      {/* Mobile drawer — only on small screens */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="play-mobile-drawer absolute right-0 top-0 bottom-0 w-72 max-w-[80vw] overflow-y-auto overflow-x-hidden pb-20">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <span className="font-bold text-lg text-white">Battle Setup</span>
              <button onClick={() => setMobileMenuOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e0e0ec" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Compact Player Strip */}
              <div className="play-xp-card-mobile">
                <div className="flex items-center gap-3 mb-2">
                  <div className="play-level-badge-sm">{stats.level}</div>
                  <div className="flex-1 min-w-0">
                    <span className="text-white font-bold text-sm block">Level {stats.level}</span>
                    <span className="text-[#a0a0b8] text-xs">{stats.wins}W / {stats.losses}L / {stats.draws}D</span>
                  </div>
                  <div className="play-streak-badge">
                    <span className="text-xs">🔥</span>
                    <span className="text-xs font-bold text-[#ffd700]">{stats.currentStreak}</span>
                  </div>
                </div>
                <div className="play-xp-bar">
                  <div className="play-xp-fill" style={{ width: `${xpProgress}%` }} />
                </div>
              </div>

              {/* Game Mode - Horizontal */}
              <div className="space-y-2">
                <h4 className="play-section-label">Game Mode</h4>
                <div className="play-segmented-row">
                  <button className={`play-seg-btn ${gameMode === 'computer' ? 'play-seg-btn-active' : ''}`} onClick={() => setGameMode('computer')}>
                    <span>🖥️</span> Computer
                  </button>
                  <button className="play-seg-btn play-seg-btn-disabled" disabled>
                    <span>👤</span> Friend
                  </button>
                </div>
              </div>

              {/* Difficulty - Compact Grid */}
              <div className="space-y-2">
                <h4 className="play-section-label">Difficulty</h4>
                <div className="grid grid-cols-2 gap-2">
                  {difficultyLevels.slice(0, 4).map((level, index) => {
                    const isUnlocked = index <= stats.highestDifficultyBeaten + 1;
                    const meta = difficultyMeta[level.label] || { icon: '⭐', color: '#6c5ce7' };
                    return (
                      <button
                        key={level.name}
                        onClick={() => { if (isUnlocked) setDifficulty(index); }}
                        disabled={!isUnlocked}
                        className={`play-diff-compact ${index === currentDifficultyIndex ? 'play-diff-compact-active' : ''} ${!isUnlocked ? 'play-diff-compact-locked' : ''}`}
                      >
                        <span className="play-diff-compact-icon" style={{ background: isUnlocked ? meta.color : undefined }}>
                          {isUnlocked ? meta.icon : '🔒'}
                        </span>
                        <span className="play-diff-compact-label">{level.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-3">
                <h4 className="play-section-label">Battle Settings</h4>
                <div className="play-settings-grid">
                  <div>
                    <label className="play-field-label">Play As</label>
                    <div className="flex gap-2">
                      <ColorButton color="white" active={playerColor === 'white'} onClick={() => setPlayerColor('white')} />
                      <ColorButton color="black" active={playerColor === 'black'} onClick={() => setPlayerColor('black')} />
                    </div>
                  </div>
                  <div>
                    <label className="play-field-label">Board</label>
                    <div className="flex gap-2">
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

              {/* Move History (compact) */}
              {(isPlaying || gameResult) && moveHistory.length > 0 && (
                <div className="space-y-2">
                  <h4 className="play-section-label">Moves</h4>
                  <div className="play-move-list max-h-28 overflow-y-auto">
                    {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => (
                      <div key={i} className="play-move-row">
                        <span className="play-move-num">{i + 1}.</span>
                        <span className="play-move-white">{moveHistory[i * 2]}</span>
                        {moveHistory[i * 2 + 1] && <span className="play-move-black">{moveHistory[i * 2 + 1]}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Start Game */}
              <button onClick={() => { startNewGameAndCollapse(); setMobileMenuOpen(false); }} className="play-cta-btn w-full">
                <span>⚔️</span> Begin Battle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tablet sidebar toggle button — visible only on tablet when sidebar is hidden */}
      {!tabletSidebarOpen && (
        <button
          className="play-tablet-sidebar-toggle hidden md:flex xl:hidden"
          onClick={() => setTabletSidebarOpen(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      )}

      {/* Main layout */}
      <div className={`relative z-10 flex-1 flex flex-col md:flex-row md:items-stretch gap-3 xl:gap-4 px-3 xl:px-5 pt-20 pb-3 min-h-0 md:max-h-screen max-w-[1800px] mx-auto w-full ${isInGame ? 'pb-[70px] md:pb-[72px] xl:pb-3' : ''}`}>

        {/* Left Panel - Compact Game Setup (visible from tablet+) */}
        <aside className={`hidden md:flex w-56 lg:w-64 xl:w-72 2xl:w-76 shrink-0 flex-col play-tablet-sidebar ${!tabletSidebarOpen ? 'play-tablet-sidebar-hidden' : ''}`}>
          <div className="play-dark-card play-card-compact flex-1 flex flex-col gap-3 overflow-y-auto play-sidebar-scroll">
            {/* Player Strip */}
            <div className="play-player-card-inner">
              <div className="flex items-center gap-2.5">
                <div className="play-level-badge-sm">{stats.level}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-xs">Lvl {stats.level} Warrior</span>
                    <div className="play-streak-badge-sm">
                      <span className="text-[10px]">🔥</span>
                      <span className="text-[10px] font-bold text-[#ffd700]">{stats.currentStreak}</span>
                    </div>
                  </div>
                  <span className="text-[#a0a0b8] text-[11px]">{stats.wins}W / {stats.losses}L / {stats.draws}D</span>
                </div>
              </div>
              <div className="play-xp-bar mt-2">
                <div className="play-xp-fill" style={{ width: `${xpProgress}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-[#a0a0b8]">{xp % 200}/200 XP</span>
                <span className="text-[10px] text-[#ffd700]">Next: Lvl {stats.level + 1}</span>
              </div>
            </div>

            <div className="border-t border-white/5" />

            {/* Game Mode */}
            <div>
              <h3 className="play-section-label mb-2">Game Mode</h3>
              <div className="play-segmented-row">
                <button className={`play-seg-btn ${gameMode === 'computer' ? 'play-seg-btn-active' : ''}`} onClick={() => setGameMode('computer')}>
                  <span>🖥️</span> Computer
                </button>
                <button className="play-seg-btn play-seg-btn-disabled" disabled>
                  <span>👤</span> Friend
                </button>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <h3 className="play-section-label mb-2">Difficulty</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {difficultyLevels.slice(0, 4).map((level, index) => {
                  const isUnlocked = index <= stats.highestDifficultyBeaten + 1;
                  const meta = difficultyMeta[level.label] || { icon: '⭐', color: '#6c5ce7' };
                  return (
                    <button
                      key={level.name}
                      onClick={() => { if (isUnlocked) setDifficulty(index); }}
                      disabled={!isUnlocked}
                      className={`play-diff-compact ${index === currentDifficultyIndex ? 'play-diff-compact-active' : ''} ${!isUnlocked ? 'play-diff-compact-locked' : ''}`}
                    >
                      <span className="play-diff-compact-icon" style={{ background: isUnlocked ? meta.color : undefined }}>
                        {isUnlocked ? meta.icon : '🔒'}
                      </span>
                      <span className="play-diff-compact-label">{level.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Battle Settings - Collapsible */}
            <div>
              <button
                className="play-section-label flex items-center justify-between w-full cursor-pointer"
                onClick={() => setSettingsOpen(!settingsOpen)}
              >
                <span>Battle Settings</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" className={`transition-transform ${settingsOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></svg>
              </button>
              {settingsOpen && (
                <div className="space-y-3 mt-3 pt-3 border-t border-white/5">
                  <div>
                    <label className="play-field-label">Play As</label>
                    <div className="flex gap-2">
                      <ColorButton color="white" active={playerColor === 'white'} onClick={() => setPlayerColor('white')} />
                      <ColorButton color="black" active={playerColor === 'black'} onClick={() => setPlayerColor('black')} />
                    </div>
                  </div>
                  <div>
                    <label className="play-field-label">Board Theme</label>
                    <div className="flex gap-2">
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
              )}
              {!settingsOpen && (
                <div className="flex items-center gap-3 mt-2 text-xs text-[#a0a0b8]">
                  <span className={`w-3 h-3 rounded-full ${playerColor === 'white' ? 'bg-white border border-white/40' : 'bg-[#2a2a3e] border border-white/20'}`}></span>
                  <span>{boardThemes[boardTheme].label}</span>
                  <span>{pieceStyle === 'classic' ? '♞ Classic' : '🏰 Fantasy'}</span>
                </div>
              )}
            </div>

            {/* Dragon Tips (visible when no right panel) */}
            <div className="xl:hidden mt-auto pt-3 border-t border-white/5">
              <div className="flex items-start gap-2.5">
                <span className="text-xl">🐉</span>
                <div>
                  <h4 className="text-xs font-bold text-[#ffd700] mb-0.5">Dragon&apos;s Wisdom</h4>
                  <p className="text-[11px] text-[#a0a0b8] leading-relaxed">
                    {currentDifficultyIndex === 0 && "Control the center squares! They give your pieces more room to move."}
                    {currentDifficultyIndex === 1 && "Develop your knights and bishops early. Don't move the same piece twice!"}
                    {currentDifficultyIndex === 2 && "Look for forks and pins. These tactics win material!"}
                    {currentDifficultyIndex === 3 && "Think ahead! Consider what your opponent wants to do after your move."}
                  </p>
                </div>
              </div>
            </div>

            {/* Begin Battle */}
            <button onClick={startNewGameAndCollapse} className="play-cta-btn w-full play-cta-compact mt-auto">
              <span>⚔️</span> Begin Battle
            </button>
          </div>
        </aside>

        {/* Center - Board Area */}
        <main className="flex-1 flex flex-col items-center justify-center min-w-0 min-h-0">
          {/* VS Header */}
          <div className="play-vs-bar mb-2">
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
                  <button onClick={startNewGameAndCollapse} className="play-cta-btn play-cta-btn-lg">
                    Begin Battle
                  </button>
                  <div className="play-arena-hint">
                    <span>🐉</span> Tip: Beat {currentDifficulty.label} to unlock the next difficulty!
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Desktop XL only (inline below board) */}
          {isPlaying && !gameResult && (
            <div className="hidden xl:flex items-stretch gap-2 mt-2">
              <button onClick={() => requestConfirm('resign')} className={`play-action-btn-dark ${confirmAction === 'resign' ? 'play-action-btn-confirm' : ''}`}>
                {confirmAction === 'resign' ? 'Confirm?' : 'Resign'}
              </button>
              <button onClick={() => requestConfirm('draw')} className={`play-action-btn-dark ${confirmAction === 'draw' ? 'play-action-btn-confirm' : ''}`}>
                {confirmAction === 'draw' ? 'Confirm?' : 'Draw'}
              </button>
              <button onClick={startNewGame} className="play-action-btn-gold">
                New Game
              </button>
            </div>
          )}

          {/* Game Result - Desktop XL only (inline) */}
          {gameResult && (
            <div className="hidden xl:block play-result-display mt-3">
              <p className={`play-result-text celebrate ${gameResult === 'Victory!' ? 'play-result-win' : gameResult === 'Defeated!' ? 'play-result-loss' : 'play-result-draw'}`}>
                {gameResult === 'Victory!' && '🏆 '}{gameResult}{gameResult === 'Victory!' && ' 🏆'}
                {gameResult === 'Defeated!' && ' 💀'}
              </p>
              <button onClick={startNewGame} className="play-cta-btn mt-2">
                <span>⚔️</span> Battle Again
              </button>
            </div>
          )}
        </main>

        {/* Sticky Game Action Bar — visible on mobile + tablet during gameplay */}
        {isInGame && (
          <div className="play-mobile-action-bar xl:hidden">
            {gameResult ? (
              <div className="play-mobile-action-inner play-mobile-action-result">
                <p className={`play-mobile-result-text ${gameResult === 'Victory!' ? 'play-result-win' : gameResult === 'Defeated!' ? 'play-result-loss' : 'play-result-draw'}`}>
                  {gameResult === 'Victory!' && '🏆 '}{gameResult}{gameResult === 'Defeated!' && ' 💀'}
                </p>
                <button onClick={startNewGame} className="play-mobile-action-primary">
                   New Game
                </button>
              </div>
            ) : (
              <div className="play-mobile-action-inner">
                <button onClick={() => requestConfirm('resign')} className={`play-mobile-action-secondary ${confirmAction === 'resign' ? 'play-action-btn-confirm' : ''}`}>
                  {confirmAction === 'resign' ? 'Confirm?' : 'Resign'}
                </button>
                <button onClick={() => requestConfirm('draw')} className={`play-mobile-action-secondary ${confirmAction === 'draw' ? 'play-action-btn-confirm' : ''}`}>
                  {confirmAction === 'draw' ? 'Confirm?' : 'Draw'}
                </button>
                <button onClick={startNewGame} className="play-mobile-action-primary">
                   New Game
                </button>
              </div>
            )}
          </div>
        )}

        {/* Right Panel - Tabbed Game Info (visible from xl) */}
        <aside className="hidden xl:flex w-72 2xl:w-76 shrink-0 flex-col gap-2 overflow-y-auto play-sidebar-scroll">
          {/* Tabbed Header */}
          <div className="play-dark-card play-card-compact flex-1 min-h-0 flex flex-col">
            <div className="play-tab-bar">
              <button className={`play-tab ${rightTab === 'moves' ? 'play-tab-active' : ''}`} onClick={() => setRightTab('moves')}>
                📜 Moves
              </button>
              <button className={`play-tab ${rightTab === 'captured' ? 'play-tab-active' : ''}`} onClick={() => setRightTab('captured')}>
                ⚔️ Captured
              </button>
              <button className={`play-tab ${rightTab === 'tips' ? 'play-tab-active' : ''}`} onClick={() => setRightTab('tips')}>
                🐉 Tips
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 overflow-y-auto mt-2 play-tab-content">
              {rightTab === 'moves' && (
                <div className="play-move-list">
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
                      <span className="text-2xl mb-2">📜</span>
                      <p className="text-xs text-[#a0a0b8]">Your battle chronicle<br/>will appear here</p>
                    </div>
                  )}
                </div>
              )}

              {rightTab === 'captured' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="play-captured-dot play-captured-dot-white"></span>
                    <span className="text-xs text-[#a0a0b8] font-medium">You captured</span>
                  </div>
                  <div className="text-base text-white tracking-wider min-h-[28px] pl-5">
                    {capturedPieces.black.join(' ') || <span className="text-[#606080] text-xs">None yet</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="play-captured-dot play-captured-dot-black"></span>
                    <span className="text-xs text-[#a0a0b8] font-medium">Opponent captured</span>
                  </div>
                  <div className="text-base text-white tracking-wider min-h-[28px] pl-5">
                    {capturedPieces.white.join(' ') || <span className="text-[#606080] text-xs">None yet</span>}
                  </div>
                </div>
              )}

              {rightTab === 'tips' && (
                <div className="flex items-start gap-2.5">
                  <span className="text-xl flex-shrink-0">🐉</span>
                  <div>
                    <h4 className="text-xs font-bold text-[#ffd700] mb-1">Dragon&apos;s Wisdom</h4>
                    <p className="text-xs text-[#a0a0b8] leading-relaxed">
                      {currentDifficultyIndex === 0 && "Control the center squares! They give your pieces more room to move. Try placing your pawns on e4 and d4 early."}
                      {currentDifficultyIndex === 1 && "Develop your knights and bishops early. Don't move the same piece twice in the opening!"}
                      {currentDifficultyIndex === 2 && "Look for forks and pins. These tactics win material! Always check if your opponent's pieces are undefended."}
                      {currentDifficultyIndex === 3 && "Think ahead! Consider what your opponent wants to do after your move. Calculate at least 2 moves deep."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick captured pieces summary (always visible) */}
          {rightTab !== 'captured' && (isPlaying || gameResult) && (capturedPieces.black.length > 0 || capturedPieces.white.length > 0) && (
            <div className="play-dark-card play-card-compact">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#a0a0b8] font-semibold uppercase tracking-wider">Captured</span>
                <button className="text-[10px] text-[#c084fc] font-bold" onClick={() => setRightTab('captured')}>View</button>
              </div>
              <div className="flex gap-2 mt-1.5 text-sm">
                {capturedPieces.black.length > 0 && <span className="text-white">{capturedPieces.black.slice(-5).join('')}</span>}
                {capturedPieces.white.length > 0 && <span className="text-[#a0a0b8]">{capturedPieces.white.slice(-5).join('')}</span>}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
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
