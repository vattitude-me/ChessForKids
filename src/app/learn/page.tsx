'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import LessonBoard from '@/components/LessonBoard';
import { pieceLessons, PieceLesson } from '@/lib/lessons';
import { useGameStore } from '@/lib/store';
import { generatePuzzles, generatePiecePuzzles, Puzzle, PieceType } from '@/lib/puzzle-generator';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import confetti from 'canvas-confetti';

type View = 'hub' | 'lesson' | 'puzzle';

interface LessonNode {
  id: string;
  label: string;
  image: string;
  lessonIndex: number | null;
  description: string;
  section: 'basics' | 'strategy';
}

const allLessons: LessonNode[] = [
  { id: 'board-setup', label: 'Board & Setup', image: '/assets/lessons_images/Castle.png', lessonIndex: 0, description: 'Learn where all the pieces go', section: 'basics' },
  { id: 'pawn', label: 'Meet the Pawn', image: '/pieces/w-pawn.png', lessonIndex: 1, description: 'The brave foot soldiers', section: 'basics' },
  { id: 'rook', label: 'Meet the Rook', image: '/pieces/w-rook.png', lessonIndex: 2, description: 'The powerful castle towers', section: 'basics' },
  { id: 'knight', label: 'Meet the Knight', image: '/pieces/w-knight.png', lessonIndex: 3, description: 'The tricky horse jumper', section: 'basics' },
  { id: 'bishop', label: 'Meet the Bishop', image: '/pieces/w-bishop.png', lessonIndex: 4, description: 'The diagonal wizard', section: 'basics' },
  { id: 'queen', label: 'Meet the Queen', image: '/pieces/w-queen.png', lessonIndex: 5, description: 'The most powerful piece', section: 'basics' },
  { id: 'king', label: "King's Safety", image: '/pieces/w-king.png', lessonIndex: 6, description: 'Protect your ruler!', section: 'basics' },
  { id: 'capture', label: 'Capture Basics', image: '/assets/lessons_images/swords.png', lessonIndex: null, description: 'Learn to take enemy pieces', section: 'basics' },
  { id: 'castling', label: 'Castling', image: '/assets/lessons_images/Castle.png', lessonIndex: null, description: 'The special king-rook move', section: 'strategy' },
  { id: 'opening', label: 'Opening Moves', image: '/assets/lessons_images/King.png', lessonIndex: null, description: 'Start your games strong', section: 'strategy' },
  { id: 'tactics', label: 'Combat Tactics', image: '/assets/lessons_images/swords.png', lessonIndex: null, description: 'Forks, pins, and skewers', section: 'strategy' },
  { id: 'endgame', label: 'Endgame Basics', image: '/assets/lessons_images/Crown.png', lessonIndex: null, description: 'Finish with a checkmate!', section: 'strategy' },
];

const puzzleChallenges: { id: string; label: string; image: string; piece?: PieceType; mode?: 'checkmate' | 'daily'; difficulty: 1 | 2 | 3 }[] = [
  { id: 'pawn-puzzles', label: 'Pawn Puzzles', image: '/pieces/w-pawn.png', piece: 'pawn', difficulty: 1 },
  { id: 'rook-puzzles', label: 'Rook Puzzles', image: '/pieces/w-rook.png', piece: 'rook', difficulty: 1 },
  { id: 'knight-puzzles', label: 'Knight Puzzles', image: '/pieces/w-knight.png', piece: 'knight', difficulty: 2 },
  { id: 'bishop-puzzles', label: 'Bishop Puzzles', image: '/pieces/w-bishop.png', piece: 'bishop', difficulty: 2 },
  { id: 'queen-puzzles', label: 'Queen Puzzles', image: '/pieces/w-queen.png', piece: 'queen', difficulty: 2 },
  { id: 'king-puzzles', label: 'King Puzzles', image: '/pieces/w-king.png', piece: 'king', difficulty: 3 },
  { id: 'daily', label: 'Daily Challenge', image: '/assets/lessons_images/chest.png', mode: 'daily', difficulty: 2 },
  { id: 'checkmate', label: 'Checkmate in 1', image: '/assets/lessons_images/Crown.png', mode: 'checkmate', difficulty: 3 },
];

function getPlayerTitle(level: number): string {
  if (level <= 1) return 'Squire';
  if (level <= 3) return 'Knight';
  if (level <= 5) return 'Champion';
  if (level <= 8) return 'Wizard';
  return 'Dragon Slayer';
}

function getPlayerIcon(level: number): string {
  if (level <= 1) return '/pieces/w-pawn.png';
  if (level <= 3) return '/pieces/w-knight.png';
  if (level <= 5) return '/pieces/w-bishop.png';
  if (level <= 8) return '/pieces/w-queen.png';
  return '/pieces/w-king.png';
}

export default function LearnPage() {
  const { tutorialProgress, currentDifficultyIndex, recordPuzzleSolved, stats } = useGameStore();
  const [view, setView] = useState<View>('hub');
  const [activeLesson, setActiveLesson] = useState<PieceLesson | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);

  const completedLessons = pieceLessons.filter((_, i) => tutorialProgress.includes(i + 100)).length;
  const totalLessons = allLessons.length;

  const nextLesson = useMemo(() => {
    return allLessons.find(l => {
      if (l.lessonIndex === null) return false;
      return !tutorialProgress.includes(l.lessonIndex + 100);
    });
  }, [tutorialProgress]);

  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  function startLesson(lessonIndex: number | null) {
    if (lessonIndex === null || lessonIndex >= pieceLessons.length) return;
    setActiveLesson(pieceLessons[lessonIndex]);
    setCurrentStepIndex(0);
    setView('lesson');
  }

  function startPuzzles(piece?: PieceType, mode?: 'checkmate' | 'daily') {
    if (piece) {
      setPuzzles(generatePiecePuzzles(piece));
    } else {
      setPuzzles(generatePuzzles(currentDifficultyIndex, 10, mode));
    }
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
    <div className="learn-page h-full flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image src="/assets/lessons_images/Lessons_hero.png" alt="" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 learn-page-overlay" />
      </div>

      {/* Main layout */}
      <div className="relative z-10 flex-1 flex flex-col pt-16 md:pt-20 min-h-0">
        <main className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 py-6 lg:py-8">
          {/* Hero Continue Banner */}
          <section className="learn-hero-banner max-w-[1800px] mx-auto mb-8">
            <div className="learn-hero-inner">
              <div className="learn-hero-left">
                <div className="learn-hero-player-badge">
                  <div className="learn-hero-player-icon">
                    <Image src={getPlayerIcon(stats.level)} alt="" width={36} height={36} className="object-contain" />
                  </div>
                  <div className="learn-hero-player-info">
                    <span className="learn-hero-player-title">Level {stats.level} {getPlayerTitle(stats.level)}</span>
                    <span className="learn-hero-player-xp">{stats.xp} XP</span>
                  </div>
                </div>
                <h1 className="learn-hero-heading">
                  {nextLesson ? (
                    <>Next: <span className="learn-hero-heading-gold">{nextLesson.label}</span></>
                  ) : (
                    <span className="learn-hero-heading-gold">All Lessons Complete!</span>
                  )}
                </h1>
                <p className="learn-hero-subtext">
                  {nextLesson?.description || 'You are a true chess master!'}
                </p>
                <div className="learn-hero-progress">
                  <div className="learn-hero-progress-bar">
                    <div className="learn-hero-progress-fill" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <span className="learn-hero-progress-label">{completedLessons}/{totalLessons} lessons</span>
                </div>
              </div>
              <div className="learn-hero-right">
                {nextLesson && (
                  <button onClick={() => startLesson(nextLesson.lessonIndex)} className="learn-hero-cta">
                    <span className="learn-hero-cta-icon">&#9654;</span>
                    Continue
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Two-column content: Learning Journey + Puzzles */}
          <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_440px] 2xl:grid-cols-[1fr_520px] gap-6 lg:gap-8 2xl:gap-12 items-start">
            {/* Left Column: Learning Journey */}
            <div className="min-w-0">
              {/* The Basics — Adventure Path */}
              <section className="learn-section mb-8">
                <div className="learn-section-header learn-section-header-basics">
                  <h2 className="learn-section-title">The Basics</h2>
                  <span className="learn-section-badge">{completedLessons} of 8 mastered</span>
                </div>
                <div className="learn-path-container">
                  {allLessons.filter(l => l.section === 'basics').map((lesson, index) => {
                    const isAvailable = lesson.lessonIndex !== null && lesson.lessonIndex < pieceLessons.length;
                    const isComplete = lesson.lessonIndex !== null && tutorialProgress.includes(lesson.lessonIndex + 100);
                    const isCurrent = nextLesson?.id === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => isAvailable && startLesson(lesson.lessonIndex)}
                        className={`learn-path-node ${isComplete ? 'learn-path-node-complete' : ''} ${isCurrent ? 'learn-path-node-current' : ''} ${!isAvailable ? 'learn-path-node-locked' : ''}`}
                        disabled={!isAvailable}
                      >
                        <div className="learn-path-node-connector" />
                        <div className="learn-path-node-circle">
                          <Image src={lesson.image} alt={lesson.label} width={48} height={48} className="object-contain" style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }} />
                          {isComplete && <span className="learn-path-node-check">&#10003;</span>}
                          {!isAvailable && <span className="learn-path-node-lock">&#128274;</span>}
                          {isCurrent && <span className="learn-path-node-star">&#11088;</span>}
                        </div>
                        <div className="learn-path-node-text">
                          <span className="learn-path-node-label">{lesson.label}</span>
                          <span className="learn-path-node-desc">{lesson.description}</span>
                        </div>
                        <span className="learn-path-node-number">{index + 1}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Strategy — Locked Section */}
              <section className="learn-section mb-8">
                <div className="learn-section-header learn-section-header-strategy">
                  <h2 className="learn-section-title">Strategy & Tactics</h2>
                  <span className="learn-section-badge learn-section-badge-locked">Complete Basics to Unlock</span>
                </div>
                <div className="learn-path-container learn-path-container-locked">
                  {allLessons.filter(l => l.section === 'strategy').map((lesson, index) => (
                    <button
                      key={lesson.id}
                      className="learn-path-node learn-path-node-locked"
                      disabled
                    >
                      <div className="learn-path-node-connector" />
                      <div className="learn-path-node-circle">
                        <Image src={lesson.image} alt={lesson.label} width={48} height={48} className="object-contain" style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }} />
                        <span className="learn-path-node-lock">&#128274;</span>
                      </div>
                      <div className="learn-path-node-text">
                        <span className="learn-path-node-label">{lesson.label}</span>
                        <span className="learn-path-node-desc">{lesson.description}</span>
                      </div>
                      <span className="learn-path-node-number">{index + 9}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: Puzzles */}
            <div>
              <section className="learn-section lg:sticky lg:top-24">
                <div className="learn-section-header learn-section-header-puzzles">
                  <h2 className="learn-section-title">Puzzle Arena</h2>
                  <span className="learn-section-badge">{stats.puzzlesSolved} solved</span>
                </div>
                <div className="learn-puzzles-inner">
                  {/* Daily Challenge — featured */}
                  <button
                    onClick={() => startPuzzles(undefined, 'daily')}
                    className="learn-puzzle-featured"
                  >
                    <div className="learn-puzzle-featured-icon">
                      <Image src="/assets/lessons_images/chest.png" alt="Daily Challenge" width={48} height={48} className="object-contain" />
                    </div>
                    <div className="learn-puzzle-featured-text">
                      <span className="learn-puzzle-featured-title">Daily Challenge</span>
                      <span className="learn-puzzle-featured-desc">New puzzles every day!</span>
                    </div>
                    <span className="learn-puzzle-featured-arrow">&#9654;</span>
                  </button>

                  {/* Difficulty groups */}
                  <div className="learn-puzzle-group">
                    <h3 className="learn-puzzle-group-title">
                      <span className="learn-puzzle-star">&#11088;</span> Beginner
                    </h3>
                    <div className="learn-puzzle-grid">
                      {puzzleChallenges.filter(p => p.difficulty === 1).map(item => (
                        <button
                          key={item.id}
                          onClick={() => startPuzzles(item.piece, item.mode)}
                          className="learn-puzzle-card"
                        >
                          <Image src={item.image} alt={item.label} width={40} height={40} className="object-contain" />
                          <span className="learn-puzzle-card-label">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="learn-puzzle-group">
                    <h3 className="learn-puzzle-group-title">
                      <span className="learn-puzzle-star">&#11088;&#11088;</span> Intermediate
                    </h3>
                    <div className="learn-puzzle-grid">
                      {puzzleChallenges.filter(p => p.difficulty === 2 && p.mode !== 'daily').map(item => (
                        <button
                          key={item.id}
                          onClick={() => startPuzzles(item.piece, item.mode)}
                          className="learn-puzzle-card"
                        >
                          <Image src={item.image} alt={item.label} width={40} height={40} className="object-contain" />
                          <span className="learn-puzzle-card-label">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="learn-puzzle-group">
                    <h3 className="learn-puzzle-group-title">
                      <span className="learn-puzzle-star">&#11088;&#11088;&#11088;</span> Advanced
                    </h3>
                    <div className="learn-puzzle-grid">
                      {puzzleChallenges.filter(p => p.difficulty === 3).map(item => (
                        <button
                          key={item.id}
                          onClick={() => startPuzzles(item.piece, item.mode)}
                          className="learn-puzzle-card"
                        >
                          <Image src={item.image} alt={item.label} width={40} height={40} className="object-contain" />
                          <span className="learn-puzzle-card-label">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function getDefaultFenForPiece(pieceId: string): string {
  const fens: Record<string, string> = {
    'board-setup': '8/8/8/8/8/8/8/8 w - - 0 1',
    pawn: '8/pppppppp/8/8/8/8/PPPPPPPP/8 w - - 0 1',
    rook: 'r6r/8/8/8/8/8/8/R6R w - - 0 1',
    knight: '1n4n1/8/8/8/8/8/8/1N4N1 w - - 0 1',
    bishop: '2b2b2/8/8/8/8/8/8/2B2B2 w - - 0 1',
    queen: '3q4/8/8/8/8/8/8/3Q4 w - - 0 1',
    king: '4k3/8/8/8/8/8/8/4K3 w - - 0 1',
  };
  return fens[pieceId] || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
}

function LessonView({ lesson, currentStepIndex, setCurrentStepIndex, onBack, onComplete, isCompleted }: { lesson: PieceLesson; currentStepIndex: number; setCurrentStepIndex: (i: number) => void; onBack: () => void; onComplete: () => void; isCompleted: boolean }) {
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
    <div className="lessons-hub h-full flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image src="/assets/lessons_images/lessons_background.png" alt="" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-black/20" />
      </div>
      <div className="relative z-10 flex-1 flex flex-col pt-16 md:pt-20 min-h-0">
        <div className="px-4 md:px-8 py-1.5 flex items-center gap-2">
          <button onClick={onBack} className="lessons-hub-back-btn shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div className="flex-1 h-2 rounded-full bg-[#5c3a10]/40 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#d4a843] to-[#f5d77a]" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-bold text-[#f5d77a] shrink-0">{currentStepIndex + 1}/{lesson.steps.length}</span>
        </div>
        <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-stretch justify-center px-4 md:px-8 lg:px-12 py-4 gap-6 lg:gap-10 overflow-y-auto">
          <div className="w-full max-w-[min(60vh,440px)] lg:max-w-[min(65vh,500px)] shrink-0">
            <LessonBoard key={`${lesson.id}-${currentStepIndex}`} fen={boardFen} highlightSquares={step.highlightSquares} arrows={step.arrows} interactive={isInteractiveStep} challenge={step.challenge} onChallengeComplete={() => { if (!isLastStep) { setTimeout(() => setCurrentStepIndex(currentStepIndex + 1), 800); } }} />
          </div>
          <div className="flex flex-col justify-center items-center lg:items-start gap-4 lg:gap-6 lg:max-w-sm">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white text-center lg:text-left drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">{step.title}</h2>
            {isInteractiveStep && step.challenge ? (
              <div className="lesson-instruction-bubble">
                <span className="text-lg md:text-xl">&#127919;</span>
                <p className="text-lg md:text-xl font-bold text-[#2d6b22]">{step.challenge.instruction}</p>
              </div>
            ) : (
              <p className="text-base md:text-lg lg:text-xl text-[#ffe8c2] text-center lg:text-left max-w-xl font-medium leading-snug drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                {step.type === 'summary' ? 'You mastered this piece! Ready for the next one?' : step.description.split('.')[0] + '.'}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2">
              {currentStepIndex > 0 && (<button onClick={() => setCurrentStepIndex(currentStepIndex - 1)} className="lesson-big-btn lesson-big-btn-back">&#9664; Back</button>)}
              {!isInteractiveStep && !isLastStep && (<button onClick={() => setCurrentStepIndex(currentStepIndex + 1)} className="lesson-big-btn lesson-big-btn-next">Next &#9654;</button>)}
              {isLastStep && (<button onClick={handleComplete} className="lesson-big-btn lesson-big-btn-complete">{isCompleted ? '✓ Done!' : '⭐ Complete!'}</button>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PuzzleView({ puzzles, currentIndex, setCurrentIndex, onBack, recordPuzzleSolved }: { puzzles: Puzzle[]; currentIndex: number; setCurrentIndex: (i: number) => void; onBack: () => void; recordPuzzleSolved: () => void }) {
  const [game, setGame] = useState<Chess>(() => new Chess(puzzles[0].fen));
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [initialTurn, setInitialTurn] = useState<'w' | 'b'>(() => new Chess(puzzles[0].fen).turn());

  const currentPuzzle = puzzles[currentIndex];
  const turn = initialTurn === 'w' ? 'White' : 'Black';

  function loadPuzzle(index: number) {
    const puzzle = puzzles[index];
    const newGame = new Chess(puzzle.fen);
    setGame(newGame);
    setInitialTurn(newGame.turn());
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
      const move = newGame.move({ from: sourceSquare as Square, to: targetSquare as Square, promotion: 'q' });
      if (!move) return false;
      const expectedMove = currentPuzzle.solution[0].replace(/[+#]/g, '');
      const actualMove = move.san.replace(/[+#]/g, '');
      if (actualMove === expectedMove) {
        setGame(newGame);
        setSolved(true);
        setFeedback('Correct!');
        recordPuzzleSolved();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#8b6914', '#d4a843', '#f5d77a'] });
      } else {
        setAttempts(prev => prev + 1);
        setFeedback(attempts >= 1 ? 'Not quite... try using the hint!' : 'Not quite... try again!');
        newGame.undo();
      }
      return actualMove === expectedMove;
    } catch { return false; }
  }

  return (
    <div className="lessons-hub h-full flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image src="/assets/lessons_images/lessons_background.png" alt="" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-black/20" />
      </div>
      <div className="relative z-10 flex-1 flex flex-col pt-16 md:pt-20 min-h-0">
        <div className="px-4 md:px-8 py-1.5 flex items-center gap-2">
          <button onClick={onBack} className="lessons-hub-back-btn shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div className="flex-1 h-2 rounded-full bg-[#5c3a10]/40 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#d4a843] to-[#f5d77a]" style={{ width: `${((currentIndex + 1) / puzzles.length) * 100}%` }} />
          </div>
          <span className="text-xs font-bold text-[#f5d77a] shrink-0">{currentIndex + 1}/{puzzles.length}</span>
        </div>
        <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-stretch justify-center px-4 md:px-8 lg:px-12 py-4 gap-6 lg:gap-10 overflow-y-auto">
          <div className="w-full max-w-[min(60vh,440px)] lg:max-w-[min(65vh,500px)] aspect-square shrink-0">
            <div className="chess-board-container w-full aspect-square rounded-xl overflow-hidden border-2 border-[#d4a843]">
              <PuzzleBoard game={game} onPieceDrop={handlePieceDrop} solved={solved} orientation={initialTurn} />
            </div>
          </div>
          <div className="flex flex-col justify-center items-center lg:items-start gap-4 lg:gap-5 lg:max-w-sm">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white text-center lg:text-left drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">{currentPuzzle.title}</h2>
            <div className="lesson-instruction-bubble">
              <span className="text-lg md:text-xl">&#127919;</span>
              <p className="text-lg md:text-xl font-bold text-[#2d6b22]">{currentPuzzle.description}</p>
            </div>
            <p className="text-sm text-[#f5d77a] font-semibold">{turn} to move</p>
            {feedback && (
              <div className={`p-3 rounded-xl w-full ${solved ? 'bg-green-50/90 border border-green-300' : 'bg-red-50/90 border border-red-300'}`}>
                <p className={`font-bold text-sm ${solved ? 'text-green-700' : 'text-red-700'}`}>{feedback}</p>
              </div>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              {!solved && (<button onClick={() => setShowHint(!showHint)} className="lesson-big-btn lesson-big-btn-back text-sm">{showHint ? 'Hide Hint' : 'Show Hint'}</button>)}
              {solved && currentIndex < puzzles.length - 1 && (<button onClick={() => loadPuzzle(currentIndex + 1)} className="lesson-big-btn lesson-big-btn-next text-sm">Next Puzzle &#9654;</button>)}
              {solved && currentIndex === puzzles.length - 1 && (<button onClick={onBack} className="lesson-big-btn lesson-big-btn-complete text-sm">&#11088; All Done!</button>)}
            </div>
            {showHint && !solved && (
              <div className="p-3 rounded-xl bg-[#fef9e7]/90 border border-[#f5d77a] w-full">
                <p className="text-sm text-[#8b6914]">{currentPuzzle.hint}</p>
              </div>
            )}
            <div className="flex gap-2 flex-wrap mt-2">
              {puzzles.map((_, index) => (
                <button key={index} onClick={() => loadPuzzle(index)} className={`w-8 h-8 rounded-full text-xs font-bold transition-all border ${index === currentIndex ? 'bg-[#8b6914] text-white border-[#d4a843]' : index < currentIndex ? 'bg-[#f5e6c8] text-[#8b6914] border-[#d4a843]' : 'bg-white text-[#8b6914] border-[#e8d5a3]'}`}>{index + 1}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PuzzleBoard({ game, onPieceDrop, solved, orientation }: { game: Chess; onPieceDrop: (args: { piece: { isSparePiece: boolean; position: string; pieceType: string }; sourceSquare: string; targetSquare: string | null }) => boolean; solved: boolean; orientation: 'w' | 'b' }) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const turn = game.turn();

  function selectPiece(square: string) {
    const piece = game.get(square as Square);
    if (!piece || piece.color !== turn) { setSelectedSquare(null); setLegalMoves([]); return; }
    setSelectedSquare(square);
    const moves = game.moves({ square: square as Square, verbose: true });
    setLegalMoves(moves.map(m => m.to));
  }

  function handleSquareClick({ square }: { piece: { pieceType: string } | null; square: string }) {
    if (solved) return;
    if (selectedSquare) {
      if (legalMoves.includes(square)) {
        const success = onPieceDrop({ piece: { isSparePiece: false, position: '', pieceType: '' }, sourceSquare: selectedSquare, targetSquare: square });
        setSelectedSquare(null); setLegalMoves([]);
        if (!success) return;
        return;
      }
      const piece = game.get(square as Square);
      if (piece && piece.color === turn) { selectPiece(square); return; }
      setSelectedSquare(null); setLegalMoves([]); return;
    }
    selectPiece(square);
  }

  function handlePieceClick({ square }: { isSparePiece: boolean; piece: { pieceType: string }; square: string | null }) {
    if (solved || !square) return;
    if (selectedSquare && selectedSquare !== square && legalMoves.includes(square)) {
      onPieceDrop({ piece: { isSparePiece: false, position: '', pieceType: '' }, sourceSquare: selectedSquare, targetSquare: square });
      setSelectedSquare(null); setLegalMoves([]); return;
    }
    selectPiece(square);
  }

  const squareStyles: Record<string, React.CSSProperties> = {};
  if (selectedSquare) {
    squareStyles[selectedSquare] = { backgroundColor: 'rgba(255, 215, 0, 0.6)', boxShadow: 'inset 0 0 8px rgba(255, 215, 0, 0.8)' };
  }
  for (const sq of legalMoves) {
    const targetPiece = game.get(sq as Square);
    if (targetPiece) {
      squareStyles[sq] = { background: 'radial-gradient(circle, transparent 55%, rgba(255, 80, 80, 0.7) 55%)', borderRadius: '50%' };
    } else {
      squareStyles[sq] = { background: 'radial-gradient(circle, rgba(0, 200, 100, 0.7) 25%, transparent 25%)' };
    }
  }

  return (
    <Chessboard options={{ position: game.fen(), onPieceDrop: solved ? undefined : onPieceDrop, onSquareClick: solved ? undefined : handleSquareClick, onPieceClick: solved ? undefined : handlePieceClick, canDragPiece: solved ? () => false : ({ piece }: { piece: { pieceType: string } }) => piece.pieceType.charAt(0) === turn, boardOrientation: orientation === 'w' ? 'white' : 'black', boardStyle: { borderRadius: '12px' }, darkSquareStyle: { backgroundColor: '#b58863' }, lightSquareStyle: { backgroundColor: '#f0d9b5' }, squareStyles, animationDurationInMs: 250 }} />
  );
}
