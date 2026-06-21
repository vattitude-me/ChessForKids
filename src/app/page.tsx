'use client';

import Link from 'next/link';
import { useGameStore } from '@/lib/store';

function ChessBoardSVG() {
  const squares = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const isLight = (row + col) % 2 === 0;
      squares.push(
        <rect
          key={`${row}-${col}`}
          x={col * 12.5}
          y={row * 12.5}
          width={12.5}
          height={12.5}
          fill={isLight ? 'rgba(162, 155, 254, 0.15)' : 'rgba(108, 92, 231, 0.25)'}
        />
      );
    }
  }
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {squares}
      <text x="50" y="38" textAnchor="middle" fontSize="22" opacity="0.6">♚</text>
      <text x="30" y="58" textAnchor="middle" fontSize="16" opacity="0.4">♞</text>
      <text x="70" y="58" textAnchor="middle" fontSize="16" opacity="0.4">♝</text>
      <text x="50" y="75" textAnchor="middle" fontSize="14" opacity="0.3">♟</text>
      <text x="38" y="75" textAnchor="middle" fontSize="14" opacity="0.3">♟</text>
      <text x="62" y="75" textAnchor="middle" fontSize="14" opacity="0.3">♟</text>
    </svg>
  );
}

function FloatingPieces() {
  const pieces = [
    { char: '♔', top: '8%', left: '5%', size: 'text-4xl lg:text-5xl', delay: '0s', opacity: 'opacity-20' },
    { char: '♕', top: '15%', right: '8%', size: 'text-3xl lg:text-5xl', delay: '1s', opacity: 'opacity-15' },
    { char: '♗', bottom: '20%', left: '3%', size: 'text-3xl lg:text-4xl', delay: '2s', opacity: 'opacity-15' },
    { char: '♘', bottom: '12%', right: '5%', size: 'text-3xl lg:text-4xl', delay: '0.5s', opacity: 'opacity-20' },
    { char: '♖', top: '45%', left: '2%', size: 'text-2xl lg:text-4xl', delay: '1.5s', opacity: 'opacity-10' },
    { char: '♙', top: '40%', right: '3%', size: 'text-2xl lg:text-3xl', delay: '2.5s', opacity: 'opacity-10' },
  ];

  return (
    <>
      {pieces.map((piece, i) => (
        <span
          key={i}
          className={`absolute ${piece.size} ${piece.opacity} text-purple-300 float-animation hidden md:block pointer-events-none select-none`}
          style={{
            top: piece.top,
            left: piece.left,
            right: piece.right,
            bottom: piece.bottom,
            animationDelay: piece.delay,
          }}
        >
          {piece.char}
        </span>
      ))}
    </>
  );
}

export default function Home() {
  const stats = useGameStore(state => state.stats);
  const playerName = useGameStore(state => state.playerName);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <FloatingPieces />

      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 p-6 lg:p-12 max-w-7xl mx-auto w-full">
        {/* Hero left — Branding + chessboard visual */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="float-animation mb-4">
            <span className="text-6xl md:text-7xl">🏰</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
            <span className="magic-text">Chess Quest</span>
          </h1>
          <p className="text-purple-300 text-lg lg:text-xl mb-4">
            A Magical Chess Adventure
          </p>

          {playerName && (
            <p className="text-purple-200 text-base lg:text-lg mb-4">
              Welcome back, <span className="font-bold text-yellow-300">{playerName}</span>! ✨
            </p>
          )}

          {/* Decorative mini chessboard */}
          <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-xl magic-glow overflow-hidden mt-4 hidden md:block">
            <ChessBoardSVG />
          </div>
        </div>

        {/* Right side — Navigation cards */}
        <div className="flex-1 w-full max-w-lg lg:max-w-xl flex flex-col gap-4 lg:gap-5">
          <Link href="/learn" className="fantasy-card p-5 lg:p-7 flex items-center gap-4 lg:gap-6 group">
            <span className="text-3xl lg:text-4xl group-hover:scale-110 transition-transform">📚</span>
            <div className="flex-1">
              <h2 className="text-lg lg:text-xl font-bold mb-0.5">Learn</h2>
              <p className="text-xs lg:text-sm text-purple-300">Master the enchanted pieces! Start your journey here.</p>
            </div>
            <span className="text-purple-400 group-hover:text-white transition-colors text-lg">→</span>
          </Link>

          <Link href="/puzzles" className="fantasy-card p-5 lg:p-7 flex items-center gap-4 lg:gap-6 group">
            <span className="text-3xl lg:text-4xl group-hover:scale-110 transition-transform">🧩</span>
            <div className="flex-1">
              <h2 className="text-lg lg:text-xl font-bold mb-0.5">Puzzles</h2>
              <p className="text-xs lg:text-sm text-purple-300">Solve magical challenges and train your tactics!</p>
            </div>
            <span className="text-purple-400 group-hover:text-white transition-colors text-lg">→</span>
          </Link>

          <Link href="/play" className="fantasy-card p-5 lg:p-7 flex items-center gap-4 lg:gap-6 group">
            <span className="text-3xl lg:text-4xl group-hover:scale-110 transition-transform">⚔️</span>
            <div className="flex-1">
              <h2 className="text-lg lg:text-xl font-bold mb-0.5">Play</h2>
              <p className="text-xs lg:text-sm text-purple-300">Battle the AI wizard in a full chess game!</p>
            </div>
            <span className="text-purple-400 group-hover:text-white transition-colors text-lg">→</span>
          </Link>

          <Link href="/progress" className="fantasy-card p-4 lg:p-5 flex items-center gap-4 lg:gap-6 group border-yellow-500/20">
            <span className="text-2xl lg:text-3xl group-hover:scale-110 transition-transform">⭐</span>
            <div className="flex-1">
              <h2 className="text-base lg:text-lg font-bold mb-0.5">Progress</h2>
              <p className="text-xs lg:text-sm text-purple-300">Track your magical journey</p>
            </div>
            <span className="text-purple-400 group-hover:text-white transition-colors text-lg">→</span>
          </Link>

          {stats.totalGames > 0 && (
            <div className="fantasy-card p-4 lg:p-5">
              <div className="grid grid-cols-4 text-center gap-2">
                <div>
                  <p className="text-xl lg:text-2xl font-bold text-yellow-300">{stats.wins}</p>
                  <p className="text-xs text-purple-300">Victories</p>
                </div>
                <div>
                  <p className="text-xl lg:text-2xl font-bold text-purple-300">{stats.totalGames}</p>
                  <p className="text-xs text-purple-300">Battles</p>
                </div>
                <div>
                  <p className="text-xl lg:text-2xl font-bold text-green-300">{stats.currentStreak}</p>
                  <p className="text-xs text-purple-300">Streak</p>
                </div>
                <div>
                  <p className="text-xl lg:text-2xl font-bold text-pink-300">{stats.puzzlesSolved}</p>
                  <p className="text-xs text-purple-300">Puzzles</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-purple-400/60 text-xs pb-4">
        For wizards aged 3 to 103 🧙‍♂️
      </p>
    </div>
  );
}
