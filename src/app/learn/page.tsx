'use client';

import { useState } from 'react';
import Image from 'next/image';
import LessonBoard from '@/components/LessonBoard';
import { pieceLessons, PieceLesson } from '@/lib/lessons';
import { useGameStore } from '@/lib/store';
import { generatePuzzles, Puzzle } from '@/lib/puzzle-generator';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import confetti from 'canvas-confetti';

type View = 'hub' | 'lesson' | 'puzzle';

const basicsLessons = [
  { id: 'board-setup', label: 'Board &\nSetup', image: '/assets/lessons_images/Castle.png', lessonIndex: null },
  { id: 'pawn', label: 'Meet the\nPawn', image: '/pieces/w-pawn.png', lessonIndex: 0 },
  { id: 'rook', label: 'Meet the\nRook', image: '/pieces/w-rook.png', lessonIndex: 1 },
  { id: 'knight', label: 'Meet the\nKnight', image: '/pieces/w-knight.png', lessonIndex: 2 },
  { id: 'bishop', label: 'Meet the\nBishop', image: '/pieces/w-bishop.png', lessonIndex: 3 },
  { id: 'queen', label: 'Meet the\nQueen', image: '/pieces/w-queen.png', lessonIndex: 4 },
  { id: 'king', label: "King's\nSafety", image: '/pieces/w-king.png', lessonIndex: 5 },
  { id: 'capture', label: 'Capture\nBasics', image: '/assets/lessons_images/swords.png', lessonIndex: null },
];

const strategyLessons = [
  { id: 'castling', label: 'Castling', image: '/assets/lessons_images/Castle.png', lessonIndex: null },
  { id: 'opening', label: 'Opening\nMoves', image: '/assets/lessons_images/King.png', lessonIndex: null },
  { id: 'tactics', label: 'Combat\nTactics', image: '/assets/lessons_images/swords.png', lessonIndex: null },
  { id: 'endgame', label: 'Endgame\nBasics', image: '/assets/lessons_images/Crown.png', lessonIndex: null },
];

const puzzleChallenges = [
  { id: 'daily', label: 'Daily\nPuzzles', image: '/assets/lessons_images/chest.png' },
  { id: 'pawn-puzzles', label: 'Pawn\nPuzzles', image: '/pieces/w-pawn.png' },
  { id: 'checkmate', label: 'Checkmate\nTactic 1', image: '/assets/lessons_images/Crown.png' },
  { id: 'checkmate2', label: 'Checkmate\nTactic 2', image: '/assets/lessons_images/Victory-cup.png' },
];

export default function LearnPage() {
  const { tutorialProgress, stats, currentDifficultyIndex, recordPuzzleSolved } = useGameStore();
  const [view, setView] = useState<View>('hub');
  const [activeLesson, setActiveLesson] = useState<PieceLesson | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);

  const completedLessons = pieceLessons.filter((_, i) => tutorialProgress.includes(i + 100)).length;
  const totalLessons = 12;

  function startLesson(lessonIndex: number | null) {
    if (lessonIndex === null || lessonIndex >= pieceLessons.length) return;
    setActiveLesson(pieceLessons[lessonIndex]);
    setCurrentStepIndex(0);
    setView('lesson');
  }

  function startPuzzles() {
    setPuzzles(generatePuzzles(currentDifficultyIndex, 10));
    setCurrentPuzzleIndex(0);
    setView('puzzle');
  }

  function backToHub() {
    setView('hub');
    setActiveLesson(null);
  }

  if (view === 'lesson' && activeLesson) {
    return (
      <LessonView
        lesson={activeLesson}
        currentStepIndex={currentStepIndex}
        setCurrentStepIndex={setCurrentStepIndex}
        onBack={backToHub}
        onComplete={backToHub}
        isCompleted={tutorialProgress.includes(pieceLessons.indexOf(activeLesson) + 100)}
      />
    );
  }

  if (view === 'puzzle' && puzzles.length > 0) {
    return (
      <PuzzleView
        puzzles={puzzles}
        currentIndex={currentPuzzleIndex}
        setCurrentIndex={setCurrentPuzzleIndex}
        onBack={backToHub}
        recordPuzzleSolved={recordPuzzleSolved}
      />
    );
  }

  return (
    <div className="lessons-hub h-screen flex flex-col relative overflow-hidden">
      {/* Background - lessons hero image, no blur */}
      <div className="absolute inset-0 z-0">
        <Image src="/assets/lessons_images/Lessons_hero.png" alt="" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 lessons-hub-bg" />
      </div>

      {/* Main layout */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row pt-16 md:pt-20 min-h-0">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 py-6 lg:py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="lessons-hub-title text-3xl md:text-4xl lg:text-5xl font-black tracking-wide">
              LESSONS HUB
            </h1>
          </div>

          {/* THE BASICS Section */}
          <section className="lessons-hub-section mb-8">
            <div className="lessons-hub-section-header">
              <h2 className="lessons-hub-section-title">THE BASICS: Learn to Play!</h2>
              <span className="lessons-hub-progress-badge">
                {completedLessons} of {totalLessons} Lessons Completed
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 p-5 md:p-6">
              {basicsLessons.map((item) => {
                const isAvailable = item.lessonIndex !== null && item.lessonIndex < pieceLessons.length;
                const isComplete = item.lessonIndex !== null && tutorialProgress.includes(item.lessonIndex + 100);
                return (
                  <button
                    key={item.id}
                    onClick={() => isAvailable && startLesson(item.lessonIndex)}
                    className={`lessons-hub-card ${isComplete ? 'lessons-hub-card-complete' : ''} ${!isAvailable ? 'lessons-hub-card-locked' : ''}`}
                    disabled={!isAvailable}
                  >
                    <div className="lessons-hub-card-img">
                      <Image src={item.image} alt={item.label} width={64} height={64} className="object-contain" style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }} />
                    </div>
                    <span className="lessons-hub-card-label">{item.label.split('\n').map((line, i) => (
                      <span key={i}>{line}{i === 0 && <br />}</span>
                    ))}</span>
                    {isComplete && <span className="lessons-hub-card-check">&#10003;</span>}
                    {!isAvailable && <span className="lessons-hub-card-lock">&#128274;</span>}
                  </button>
                );
              })}
            </div>
          </section>

          {/* STRATEGY Section */}
          <section className="lessons-hub-section mb-8">
            <div className="lessons-hub-section-header lessons-hub-section-header-strategy">
              <h2 className="lessons-hub-section-title">STRATEGY: Level Up Your Game!</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 p-5 md:p-6">
              {strategyLessons.map((item) => (
                <button
                  key={item.id}
                  className="lessons-hub-card lessons-hub-card-locked"
                  disabled
                >
                  <div className="lessons-hub-card-img">
                    <Image src={item.image} alt={item.label} width={64} height={64} className="object-contain" style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }} />
                  </div>
                  <span className="lessons-hub-card-label">{item.label.split('\n').map((line, i) => (
                    <span key={i}>{line}{i === 0 && <br />}</span>
                  ))}</span>
                  <span className="lessons-hub-card-lock">&#128274;</span>
                </button>
              ))}
            </div>
          </section>

          {/* PUZZLES CHALLENGE Section */}
          <section className="lessons-hub-section mb-8">
            <div className="lessons-hub-section-header lessons-hub-section-header-puzzles">
              <h2 className="lessons-hub-section-title">PUZZLES CHALLENGE: Test Your Skills!</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 p-5 md:p-6">
              {puzzleChallenges.map((item, index) => (
                <button
                  key={item.id}
                  onClick={startPuzzles}
                  className="lessons-hub-card lessons-hub-card-puzzle"
                >
                  <div className="lessons-hub-card-img">
                    <Image src={item.image} alt={item.label} width={64} height={64} className="object-contain" style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }} />
                  </div>
                  <span className="lessons-hub-card-label">{item.label.split('\n').map((line, i) => (
                    <span key={i}>{line}{i === 0 && <br />}</span>
                  ))}</span>
                  {index === 0 && stats.puzzlesSolved > 0 && (
                    <span className="lessons-hub-card-check">&#10003;</span>
                  )}
                </button>
              ))}
            </div>
          </section>
        </main>

        {/* Right Sidebar - My Progress */}
        <aside className="hidden lg:flex w-72 xl:w-80 shrink-0 flex-col border-l lessons-hub-sidebar overflow-y-auto">
          <div className="p-5">
            <h3 className="lessons-hub-sidebar-title text-center mb-4">My Progress</h3>

            {/* Dragon character */}
            <div className="flex justify-center mb-4">
              <div className="lessons-hub-avatar">
                <Image src="/assets/lessons_images/dragon.png" alt="Dragon mascot" width={64} height={64} className="object-contain" />
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <div className="lessons-hub-stat">
                <span className="lessons-hub-stat-label">Level</span>
                <span className="lessons-hub-stat-value">{stats.level}</span>
              </div>
              <div className="lessons-hub-stat">
                <span className="lessons-hub-stat-label">XP</span>
                <span className="lessons-hub-stat-value">{stats.xp}</span>
              </div>
              <div className="lessons-hub-stat">
                <span className="lessons-hub-stat-label">Lessons</span>
                <span className="lessons-hub-stat-value">{completedLessons}/{totalLessons}</span>
              </div>
              <div className="lessons-hub-stat">
                <span className="lessons-hub-stat-label">Puzzles Solved</span>
                <span className="lessons-hub-stat-value">{stats.puzzlesSolved}</span>
              </div>
              <div className="lessons-hub-stat">
                <span className="lessons-hub-stat-label">Win Streak</span>
                <span className="lessons-hub-stat-value">{stats.currentStreak}</span>
              </div>
            </div>

            {/* XP Progress bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="lessons-hub-stat-label">Next Level</span>
                <span className="lessons-hub-stat-label">{stats.xp % 200}/{200} XP</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden lessons-hub-xp-bar">
                <div
                  className="h-full rounded-full lessons-hub-xp-fill"
                  style={{ width: `${((stats.xp % 200) / 200) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function getDefaultFenForPiece(pieceId: string): string {
  const fens: Record<string, string> = {
    pawn: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    rook: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
    knight: 'r1bqkbnr/pppppppp/2n5/8/8/2N5/PPPPPPPP/R1BQKBNR w KQkq - 0 1',
    bishop: 'r1bqk2r/pppppppp/2n2n2/2b5/2B5/2N2N2/PPPPPPPP/R1BQK2R w KQkq - 0 1',
    queen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    king: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  };
  return fens[pieceId] || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
}

function LessonView({
  lesson,
  currentStepIndex,
  setCurrentStepIndex,
  onBack,
  onComplete,
  isCompleted,
}: {
  lesson: PieceLesson;
  currentStepIndex: number;
  setCurrentStepIndex: (i: number) => void;
  onBack: () => void;
  onComplete: () => void;
  isCompleted: boolean;
}) {
  const { recordLessonCompleted, tutorialProgress } = useGameStore();
  const step = lesson.steps[currentStepIndex];
  const isLastStep = currentStepIndex === lesson.steps.length - 1;
  const progress = ((currentStepIndex + 1) / lesson.steps.length) * 100;

  const boardFen = step.challenge?.fen || step.fen || getDefaultFenForPiece(lesson.id);
  const isInteractiveStep = step.type === 'try' || step.type === 'attack-try';

  function handleComplete() {
    const lessonNumericId = pieceLessons.indexOf(lesson) + 100;
    if (!tutorialProgress.includes(lessonNumericId)) {
      recordLessonCompleted(lessonNumericId);
    }
    onComplete();
  }

  return (
    <div className="lessons-hub h-screen flex flex-col relative overflow-hidden">
      {/* Background — lessons_background.png */}
      <div className="absolute inset-0 z-0">
        <Image src="/assets/lessons_images/lessons_background.png" alt="" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col pt-16 md:pt-20 min-h-0">
        {/* Compact progress strip */}
        <div className="px-4 md:px-8 py-1.5 flex items-center gap-2">
          <button onClick={onBack} className="lessons-hub-back-btn shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div className="flex-1 h-2 rounded-full bg-[#5c3a10]/40 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#d4a843] to-[#f5d77a]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[#f5d77a] shrink-0">
            {currentStepIndex + 1}/{lesson.steps.length}
          </span>
        </div>

        {/* Main lesson area — side-by-side: board left, text right */}
        <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-stretch justify-center px-4 md:px-8 lg:px-12 py-4 gap-6 lg:gap-10 overflow-y-auto">
          {/* Board — left side */}
          <div className="w-full max-w-[min(60vh,440px)] lg:max-w-[min(65vh,500px)] aspect-square shrink-0">
            <LessonBoard
              key={`${lesson.id}-${currentStepIndex}`}
              fen={boardFen}
              highlightSquares={step.highlightSquares}
              arrows={step.arrows}
              interactive={isInteractiveStep}
              challenge={step.challenge}
              onChallengeComplete={() => {
                if (!isLastStep) {
                  setTimeout(() => setCurrentStepIndex(currentStepIndex + 1), 800);
                }
              }}
            />
          </div>

          {/* Text panel — right side */}
          <div className="flex flex-col justify-center items-center lg:items-start gap-4 lg:gap-6 lg:max-w-sm">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white text-center lg:text-left drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
              {step.title}
            </h2>

            {isInteractiveStep && step.challenge ? (
              <div className="lesson-instruction-bubble">
                <span className="text-lg md:text-xl">&#127919;</span>
                <p className="text-lg md:text-xl font-bold text-[#2d6b22]">{step.challenge.instruction}</p>
              </div>
            ) : (
              <p className="text-base md:text-lg lg:text-xl text-[#ffe8c2] text-center lg:text-left max-w-xl font-medium leading-snug drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                {step.type === 'summary'
                  ? 'You mastered this piece! Ready for the next one?'
                  : step.description.split('.')[0] + '.'}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-4 mt-2">
              {currentStepIndex > 0 && (
                <button
                  onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                  className="lesson-big-btn lesson-big-btn-back"
                >
                  &#9664; Back
                </button>
              )}

              {!isInteractiveStep && !isLastStep && (
                <button
                  onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
                  className="lesson-big-btn lesson-big-btn-next"
                >
                  Next &#9654;
                </button>
              )}

              {isLastStep && (
                <button
                  onClick={handleComplete}
                  className="lesson-big-btn lesson-big-btn-complete"
                >
                  {isCompleted ? '&#10003; Done!' : '&#11088; Complete!'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PuzzleView({
  puzzles,
  currentIndex,
  setCurrentIndex,
  onBack,
  recordPuzzleSolved,
}: {
  puzzles: Puzzle[];
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
  onBack: () => void;
  recordPuzzleSolved: () => void;
}) {
  const [game, setGame] = useState<Chess>(() => new Chess(puzzles[0].fen));
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [attempts, setAttempts] = useState(0);

  const currentPuzzle = puzzles[currentIndex];
  const turn = game.turn() === 'w' ? 'White' : 'Black';

  function loadPuzzle(index: number) {
    const puzzle = puzzles[index];
    setGame(new Chess(puzzle.fen));
    setSolved(false);
    setShowHint(false);
    setFeedback('');
    setAttempts(0);
    setCurrentIndex(index);
  }

  function handlePieceDrop({ sourceSquare, targetSquare }: { piece: { isSparePiece: boolean; position: string; pieceType: string }; sourceSquare: string; targetSquare: string | null }): boolean {
    if (solved || !targetSquare) return false;
    try {
      const newGame = new Chess(game.fen());
      const move = newGame.move({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        promotion: 'q',
      });
      if (!move) return false;

      const expectedMove = currentPuzzle.solution[0];
      if (move.san === expectedMove) {
        setGame(newGame);
        setSolved(true);
        setFeedback('Correct! Well done!');
        recordPuzzleSolved();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#8b6914', '#d4a843', '#f5d77a'] });
      } else {
        setAttempts(prev => prev + 1);
        setFeedback(attempts >= 1 ? 'Not quite... try using the hint!' : 'Not quite... try again!');
        newGame.undo();
      }
      return move.san === expectedMove;
    } catch {
      return false;
    }
  }

  return (
    <div className="lessons-hub h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 lessons-hub-bg" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col pt-16 md:pt-20 min-h-0">
        <div className="px-4 md:px-8 flex items-center gap-4 py-3 lessons-hub-topbar">
          <button onClick={onBack} className="lessons-hub-back-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
            Back
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-[#3d2b1a] text-base md:text-lg">Puzzle Chamber</h2>
            <p className="text-xs text-[#8b6914]">Puzzle {currentIndex + 1} of {puzzles.length}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-4">
              <h3 className="font-bold text-lg text-[#3d2b1a]">{currentPuzzle.title}</h3>
              <p className="text-sm text-[#5a4320]">{currentPuzzle.description}</p>
              <p className="text-xs text-[#8b6914] mt-1">{turn} to move</p>
            </div>

            <div className="chess-board-container w-full max-w-[min(80vw,480px)] mx-auto aspect-square rounded-xl overflow-hidden border-2 border-[#d4a843]">
              <PuzzleBoard game={game} onPieceDrop={handlePieceDrop} />
            </div>

            {feedback && (
              <div className={`mt-4 text-center p-3 rounded-xl ${
                solved ? 'bg-green-50 border border-green-300' : 'bg-red-50 border border-red-300'
              }`}>
                <p className="font-bold text-sm text-[#3d2b1a]">{feedback}</p>
              </div>
            )}

            <div className="flex gap-3 mt-4 justify-center">
              {!solved && (
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="lessons-hub-nav-btn lessons-hub-nav-btn-secondary text-sm"
                >
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
              )}
              {solved && currentIndex < puzzles.length - 1 && (
                <button onClick={() => loadPuzzle(currentIndex + 1)} className="lessons-hub-nav-btn lessons-hub-nav-btn-primary text-sm">
                  Next Puzzle
                </button>
              )}
            </div>

            {showHint && !solved && (
              <div className="mt-3 p-3 rounded-xl bg-[#fef9e7] border border-[#f5d77a] max-w-md mx-auto">
                <p className="text-sm text-[#8b6914]">{currentPuzzle.hint}</p>
              </div>
            )}

            <div className="mt-6 flex gap-2 flex-wrap justify-center">
              {puzzles.map((_, index) => (
                <button
                  key={index}
                  onClick={() => loadPuzzle(index)}
                  className={`w-8 h-8 rounded-full text-xs font-bold transition-all border ${
                    index === currentIndex
                      ? 'bg-[#8b6914] text-white border-[#d4a843]'
                      : index < currentIndex
                        ? 'bg-[#f5e6c8] text-[#8b6914] border-[#d4a843]'
                        : 'bg-white text-[#8b6914] border-[#e8d5a3]'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PuzzleBoard({ game, onPieceDrop }: { game: Chess; onPieceDrop: (args: { piece: { isSparePiece: boolean; position: string; pieceType: string }; sourceSquare: string; targetSquare: string | null }) => boolean }) {
  return (
    <Chessboard
      options={{
        position: game.fen(),
        onPieceDrop: onPieceDrop,
        boardOrientation: game.turn() === 'w' ? 'white' : 'black',
        boardStyle: { borderRadius: '12px' },
        darkSquareStyle: { backgroundColor: '#8b6914' },
        lightSquareStyle: { backgroundColor: '#f5e6c8' },
        animationDurationInMs: 300,
      }}
    />
  );
}
