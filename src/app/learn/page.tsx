'use client';

import { useState } from 'react';
import Image from 'next/image';
import LessonBoard from '@/components/LessonBoard';
import { pieceLessons, PieceLesson } from '@/lib/lessons';
import { useGameStore } from '@/lib/store';
import { generatePuzzles, generatePiecePuzzles, Puzzle, PieceType } from '@/lib/puzzle-generator';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import confetti from 'canvas-confetti';

type View = 'hub' | 'lesson' | 'puzzle';

const basicsLessons = [
  { id: 'board-setup', label: 'Board & Setup', image: '/assets/lessons_images/Castle.png', lessonIndex: 0 },
  { id: 'pawn', label: 'Meet the Pawn', image: '/pieces/w-pawn.png', lessonIndex: 1 },
  { id: 'rook', label: 'Meet the Rook', image: '/pieces/w-rook.png', lessonIndex: 2 },
  { id: 'knight', label: 'Meet the Knight', image: '/pieces/w-knight.png', lessonIndex: 3 },
  { id: 'bishop', label: 'Meet the Bishop', image: '/pieces/w-bishop.png', lessonIndex: 4 },
  { id: 'queen', label: 'Meet the Queen', image: '/pieces/w-queen.png', lessonIndex: 5 },
  { id: 'king', label: "King's Safety", image: '/pieces/w-king.png', lessonIndex: 6 },
  { id: 'capture', label: 'Capture Basics', image: '/assets/lessons_images/swords.png', lessonIndex: null },
];

const strategyLessons = [
  { id: 'castling', label: 'Castling', image: '/assets/lessons_images/Castle.png', lessonIndex: null },
  { id: 'opening', label: 'Opening Moves', image: '/assets/lessons_images/King.png', lessonIndex: null },
  { id: 'tactics', label: 'Combat Tactics', image: '/assets/lessons_images/swords.png', lessonIndex: null },
  { id: 'endgame', label: 'Endgame Basics', image: '/assets/lessons_images/Crown.png', lessonIndex: null },
];

const puzzleChallenges: { id: string; label: string; image: string; piece?: PieceType; mode?: 'checkmate' | 'daily' }[] = [
  { id: 'pawn-puzzles', label: 'Pawn Puzzles', image: '/pieces/w-pawn.png', piece: 'pawn' },
  { id: 'rook-puzzles', label: 'Rook Puzzles', image: '/pieces/w-rook.png', piece: 'rook' },
  { id: 'knight-puzzles', label: 'Knight Puzzles', image: '/pieces/w-knight.png', piece: 'knight' },
  { id: 'bishop-puzzles', label: 'Bishop Puzzles', image: '/pieces/w-bishop.png', piece: 'bishop' },
  { id: 'queen-puzzles', label: 'Queen Puzzles', image: '/pieces/w-queen.png', piece: 'queen' },
  { id: 'king-puzzles', label: 'King Puzzles', image: '/pieces/w-king.png', piece: 'king' },
  { id: 'daily', label: 'Daily Puzzles', image: '/assets/lessons_images/chest.png', mode: 'daily' },
  { id: 'checkmate', label: 'Checkmate in 1', image: '/assets/lessons_images/Crown.png', mode: 'checkmate' },
];

export default function LearnPage() {
  const { tutorialProgress, currentDifficultyIndex, recordPuzzleSolved } = useGameStore();
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
    <div className="lessons-hub h-full flex flex-col relative overflow-hidden">
      {/* Background - lessons hero image, no blur */}
      <div className="absolute inset-0 z-0">
        <Image src="/assets/lessons_images/Lessons_hero.png" alt="" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 lessons-hub-bg" />
      </div>

      {/* Main layout */}
      <div className="relative z-10 flex-1 flex flex-col pt-16 md:pt-20 min-h-0">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 py-6 lg:py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="lessons-hub-title text-3xl md:text-4xl lg:text-5xl font-black tracking-wide">
              
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-6 lg:gap-8 items-start">
            {/* Left Column: Lessons */}
            <div className="min-w-0">
              {/* THE BASICS Section */}
              <section className="lessons-hub-section mb-8">
                <div className="lessons-hub-section-header">
                  <h2 className="lessons-hub-section-title">THE BASICS: Learn to Play!</h2>
                  <span className="lessons-hub-progress-badge">
                    {completedLessons} of {totalLessons} Lessons Completed
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 p-5 md:p-6">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 p-5 md:p-6">
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
            </div>

            {/* Right Column: Puzzles */}
            <div>
              <section className="lessons-hub-section lg:sticky lg:top-24">
                <div className="lessons-hub-section-header lessons-hub-section-header-puzzles">
                  <h2 className="lessons-hub-section-title">PUZZLES CHALLENGE</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 p-4 md:p-5">
                  {puzzleChallenges.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => startPuzzles(item.piece, item.mode)}
                      className="lessons-hub-card lessons-hub-card-puzzle lessons-hub-card-vertical"
                    >
                      <div className="lessons-hub-card-img">
                        <Image src={item.image} alt={item.label} width={48} height={48} className="object-contain" style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }} />
                      </div>
                      <span className="lessons-hub-card-label">{item.label}</span>
                    </button>
                  ))}
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
    <div className="lessons-hub h-full flex flex-col relative overflow-hidden">
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
                  {isCompleted ? '✓ Done!' : '⭐ Complete!'}
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
      const move = newGame.move({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        promotion: 'q',
      });
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
    } catch {
      return false;
    }
  }

  return (
    <div className="lessons-hub h-full flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image src="/assets/lessons_images/lessons_background.png" alt="" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col pt-16 md:pt-20 min-h-0">
        {/* Progress strip matching lesson view */}
        <div className="px-4 md:px-8 py-1.5 flex items-center gap-2">
          <button onClick={onBack} className="lessons-hub-back-btn shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div className="flex-1 h-2 rounded-full bg-[#5c3a10]/40 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#d4a843] to-[#f5d77a]"
              style={{ width: `${((currentIndex + 1) / puzzles.length) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[#f5d77a] shrink-0">
            {currentIndex + 1}/{puzzles.length}
          </span>
        </div>

        {/* Main puzzle area — side-by-side: board left, text right */}
        <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-stretch justify-center px-4 md:px-8 lg:px-12 py-4 gap-6 lg:gap-10 overflow-y-auto">
          {/* Board — left side */}
          <div className="w-full max-w-[min(60vh,440px)] lg:max-w-[min(65vh,500px)] aspect-square shrink-0">
            <div className="chess-board-container w-full aspect-square rounded-xl overflow-hidden border-2 border-[#d4a843]">
              <PuzzleBoard game={game} onPieceDrop={handlePieceDrop} solved={solved} orientation={initialTurn} />
            </div>
          </div>

          {/* Text panel — right side */}
          <div className="flex flex-col justify-center items-center lg:items-start gap-4 lg:gap-5 lg:max-w-sm">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white text-center lg:text-left drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
              {currentPuzzle.title}
            </h2>

            <div className="lesson-instruction-bubble">
              <span className="text-lg md:text-xl">&#127919;</span>
              <p className="text-lg md:text-xl font-bold text-[#2d6b22]">{currentPuzzle.description}</p>
            </div>

            <p className="text-sm text-[#f5d77a] font-semibold">{turn} to move</p>

            {feedback && (
              <div className={`p-3 rounded-xl w-full ${
                solved ? 'bg-green-50/90 border border-green-300' : 'bg-red-50/90 border border-red-300'
              }`}>
                <p className={`font-bold text-sm ${solved ? 'text-green-700' : 'text-red-700'}`}>{feedback}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              {!solved && (
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="lesson-big-btn lesson-big-btn-back text-sm"
                >
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
              )}
              {solved && currentIndex < puzzles.length - 1 && (
                <button onClick={() => loadPuzzle(currentIndex + 1)} className="lesson-big-btn lesson-big-btn-next text-sm">
                  Next Puzzle &#9654;
                </button>
              )}
              {solved && currentIndex === puzzles.length - 1 && (
                <button onClick={onBack} className="lesson-big-btn lesson-big-btn-complete text-sm">
                  &#11088; All Done!
                </button>
              )}
            </div>

            {showHint && !solved && (
              <div className="p-3 rounded-xl bg-[#fef9e7]/90 border border-[#f5d77a] w-full">
                <p className="text-sm text-[#8b6914]">{currentPuzzle.hint}</p>
              </div>
            )}

            {/* Puzzle navigation dots */}
            <div className="flex gap-2 flex-wrap mt-2">
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

function PuzzleBoard({ game, onPieceDrop, solved, orientation }: { game: Chess; onPieceDrop: (args: { piece: { isSparePiece: boolean; position: string; pieceType: string }; sourceSquare: string; targetSquare: string | null }) => boolean; solved: boolean; orientation: 'w' | 'b' }) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);

  const turn = game.turn();

  function selectPiece(square: string) {
    const piece = game.get(square as Square);
    if (!piece || piece.color !== turn) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }
    setSelectedSquare(square);
    const moves = game.moves({ square: square as Square, verbose: true });
    setLegalMoves(moves.map(m => m.to));
  }

  function handleSquareClick({ square }: { piece: { pieceType: string } | null; square: string }) {
    if (solved) return;
    if (selectedSquare) {
      if (legalMoves.includes(square)) {
        const success = onPieceDrop({ piece: { isSparePiece: false, position: '', pieceType: '' }, sourceSquare: selectedSquare, targetSquare: square });
        setSelectedSquare(null);
        setLegalMoves([]);
        if (!success) return;
        return;
      }
      const piece = game.get(square as Square);
      if (piece && piece.color === turn) {
        selectPiece(square);
        return;
      }
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }
    selectPiece(square);
  }

  function handlePieceClick({ square }: { isSparePiece: boolean; piece: { pieceType: string }; square: string | null }) {
    if (solved || !square) return;
    if (selectedSquare && selectedSquare !== square && legalMoves.includes(square)) {
      onPieceDrop({ piece: { isSparePiece: false, position: '', pieceType: '' }, sourceSquare: selectedSquare, targetSquare: square });
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }
    selectPiece(square);
  }

  const squareStyles: Record<string, React.CSSProperties> = {};
  if (selectedSquare) {
    squareStyles[selectedSquare] = {
      backgroundColor: 'rgba(255, 215, 0, 0.6)',
      boxShadow: 'inset 0 0 8px rgba(255, 215, 0, 0.8)',
    };
  }
  for (const sq of legalMoves) {
    const targetPiece = game.get(sq as Square);
    if (targetPiece) {
      squareStyles[sq] = {
        background: 'radial-gradient(circle, transparent 55%, rgba(255, 80, 80, 0.7) 55%)',
        borderRadius: '50%',
      };
    } else {
      squareStyles[sq] = {
        background: 'radial-gradient(circle, rgba(0, 200, 100, 0.7) 25%, transparent 25%)',
      };
    }
  }

  return (
    <Chessboard
      options={{
        position: game.fen(),
        onPieceDrop: solved ? undefined : onPieceDrop,
        onSquareClick: solved ? undefined : handleSquareClick,
        onPieceClick: solved ? undefined : handlePieceClick,
        canDragPiece: solved ? () => false : ({ piece }: { piece: { pieceType: string } }) => piece.pieceType.charAt(0) === turn,
        boardOrientation: orientation === 'w' ? 'white' : 'black',
        boardStyle: { borderRadius: '12px' },
        darkSquareStyle: { backgroundColor: '#b58863' },
        lightSquareStyle: { backgroundColor: '#f0d9b5' },
        squareStyles,
        animationDurationInMs: 250,
      }}
    />
  );
}
