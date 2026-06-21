'use client';

import { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { tutorials, getCategories, TutorialLesson, TutorialStep } from '@/lib/tutorials';
import { useGameStore } from '@/lib/store';

const pieceCards = [
  {
    name: 'King',
    symbol: '♔',
    color: 'text-yellow-300',
    description: 'Moves 1 square any direction',
    fen: '8/8/8/8/3K4/8/8/8 w - - 0 1',
    highlights: ['c3', 'c4', 'c5', 'd3', 'd5', 'e3', 'e4', 'e5'],
    lessonId: 7,
  },
  {
    name: 'Queen',
    symbol: '♕',
    color: 'text-pink-300',
    description: 'Moves any direction, any distance',
    fen: '8/8/8/8/3Q4/8/8/8 w - - 0 1',
    highlights: ['d1', 'd2', 'd3', 'd5', 'd6', 'd7', 'd8', 'a4', 'b4', 'c4', 'e4', 'f4', 'g4', 'h4', 'a1', 'b2', 'c3', 'e5', 'f6', 'g7', 'h8', 'a7', 'b6', 'c5', 'e3', 'f2', 'g1'],
    lessonId: 6,
  },
  {
    name: 'Rook',
    symbol: '♖',
    color: 'text-blue-300',
    description: 'Moves straight lines',
    fen: '8/8/8/8/3R4/8/8/8 w - - 0 1',
    highlights: ['d1', 'd2', 'd3', 'd5', 'd6', 'd7', 'd8', 'a4', 'b4', 'c4', 'e4', 'f4', 'g4', 'h4'],
    lessonId: 3,
  },
  {
    name: 'Bishop',
    symbol: '♗',
    color: 'text-green-300',
    description: 'Moves diagonally',
    fen: '8/8/8/8/3B4/8/8/8 w - - 0 1',
    highlights: ['a1', 'b2', 'c3', 'e5', 'f6', 'g7', 'h8', 'a7', 'b6', 'c5', 'e3', 'f2', 'g1'],
    lessonId: 4,
  },
  {
    name: 'Knight',
    symbol: '♞',
    color: 'text-orange-300',
    description: 'Jumps in an L-shape',
    fen: '8/8/8/8/3N4/8/8/8 w - - 0 1',
    highlights: ['b3', 'b5', 'c2', 'c6', 'e2', 'e6', 'f3', 'f5'],
    lessonId: 5,
  },
  {
    name: 'Pawn',
    symbol: '♙',
    color: 'text-purple-200',
    description: 'Moves forward, captures diagonal',
    fen: '8/8/8/8/8/8/4P3/8 w - - 0 1',
    highlights: ['e3', 'e4'],
    lessonId: 2,
  },
];

export default function LearnPage() {
  const { tutorialProgress, recordLessonCompleted } = useGameStore();
  const [selectedLesson, setSelectedLesson] = useState<TutorialLesson | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [activePiece, setActivePiece] = useState<number | null>(null);
  const categories = getCategories();

  if (selectedLesson) {
    const step = selectedLesson.content[currentStep];
    const isLastStep = currentStep === selectedLesson.content.length - 1;
    const isCompleted = tutorialProgress.includes(selectedLesson.id);

    return (
      <div className="min-h-screen flex flex-col items-center p-4 pt-8">
        <button
          onClick={() => { setSelectedLesson(null); setCurrentStep(0); }}
          className="self-start text-purple-400 hover:text-purple-200 text-sm mb-4 transition"
        >
          ← Back to Lessons
        </button>

        <div className="text-center mb-4">
          <span className="text-4xl block mb-2">{selectedLesson.icon}</span>
          <h2 className="text-2xl font-bold magic-text">{selectedLesson.title}</h2>
          <p className="text-purple-300 text-sm mt-1">
            Step {currentStep + 1} of {selectedLesson.content.length}
          </p>
        </div>

        <div className="progress-bar w-full max-w-md mb-6">
          <div
            className="progress-bar-fill"
            style={{ width: `${((currentStep + 1) / selectedLesson.content.length) * 100}%` }}
          />
        </div>

        <LessonStepView step={step} />

        <div className="flex gap-3 mt-6">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-4 py-2 rounded-xl bg-purple-900/30 border border-purple-500/30 text-purple-300 hover:bg-purple-900/50 transition"
            >
              ← Previous
            </button>
          )}

          {!isLastStep ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="sparkle-btn"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => {
                if (!isCompleted) {
                  recordLessonCompleted(selectedLesson.id);
                }
                setSelectedLesson(null);
                setCurrentStep(0);
              }}
              className="sparkle-btn bg-gradient-to-r from-green-500 to-emerald-500"
            >
              {isCompleted ? 'Done! ✓' : 'Complete Lesson! ⭐'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 pt-8 lg:p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold magic-text mb-1">Meet the Pieces</h1>
        <p className="text-purple-300 text-sm lg:text-base">Tap a piece to see how it moves!</p>
      </div>

      {/* Interactive Piece Gallery */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 max-w-5xl mx-auto w-full mb-8">
        {pieceCards.map((piece, index) => (
          <button
            key={piece.name}
            onClick={() => setActivePiece(activePiece === index ? null : index)}
            className={`fantasy-card p-4 lg:p-5 text-center transition-all ${
              activePiece === index ? 'ring-2 ring-yellow-400 scale-105' : ''
            }`}
          >
            <span className={`text-4xl lg:text-5xl block mb-2 ${piece.color}`}>{piece.symbol}</span>
            <h3 className="font-bold text-sm lg:text-base">{piece.name}</h3>
            <p className="text-xs text-purple-300 mt-1 hidden sm:block">{piece.description}</p>
          </button>
        ))}
      </div>

      {/* Active piece board display */}
      {activePiece !== null && (
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10 max-w-4xl mx-auto w-full mb-8">
          <div className="chess-board-container w-full max-w-[min(85vw,360px)] lg:max-w-[420px] aspect-square magic-glow rounded-xl overflow-hidden">
            <Chessboard
              options={{
                position: pieceCards[activePiece].fen,
                boardOrientation: 'white' as const,
                allowDragging: false,
                boardStyle: { borderRadius: '12px' },
                darkSquareStyle: { backgroundColor: '#6c5ce7' },
                lightSquareStyle: { backgroundColor: '#ddd6fe' },
                squareStyles: Object.fromEntries(
                  pieceCards[activePiece].highlights.map(sq => [
                    sq,
                    { backgroundColor: 'rgba(253, 203, 110, 0.4)', borderRadius: '50%' },
                  ])
                ),
                animationDurationInMs: 300,
              }}
            />
          </div>

          <div className="text-center lg:text-left flex-1">
            <span className={`text-5xl lg:text-6xl ${pieceCards[activePiece].color}`}>
              {pieceCards[activePiece].symbol}
            </span>
            <h2 className="text-2xl lg:text-3xl font-bold mt-2 mb-2">
              The {pieceCards[activePiece].name}
            </h2>
            <p className="text-purple-200 text-base lg:text-lg mb-4">
              {pieceCards[activePiece].description}
            </p>
            <button
              onClick={() => {
                const lesson = tutorials.find(t => t.id === pieceCards[activePiece!].lessonId);
                if (lesson) setSelectedLesson(lesson);
              }}
              className="sparkle-btn"
            >
              Learn More →
            </button>
          </div>
        </div>
      )}

      {/* More lessons section */}
      <div className="max-w-3xl mx-auto w-full mt-4">
        <h2 className="text-lg lg:text-xl font-bold mb-4 text-center">More Lessons</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map(category => {
            const categoryLessons = tutorials.filter(t => t.category === category.id);
            if (categoryLessons.length === 0) return null;

            return categoryLessons.map(lesson => {
              const isCompleted = tutorialProgress.includes(lesson.id);
              return (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className="fantasy-card p-4 text-left flex items-center gap-3 w-full"
                >
                  <span className="text-2xl">
                    {isCompleted ? '✅' : lesson.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{lesson.title}</h4>
                    <p className="text-xs text-purple-300 truncate">{lesson.description}</p>
                  </div>
                  {isCompleted && (
                    <span className="text-yellow-400 text-sm">⭐</span>
                  )}
                </button>
              );
            });
          })}
        </div>
        <p className="text-center text-xs text-purple-400 mt-4">
          {tutorialProgress.length}/{tutorials.length} lessons completed
        </p>
      </div>
    </div>
  );
}

const GHOST_PIECE_UNICODE: Record<string, string> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♞', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};

function squareToCoords(square: string): { col: number; row: number } {
  const col = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = 8 - parseInt(square[1]);
  return { col, row };
}

function LessonStepView({ step }: { step: TutorialStep }) {
  const squareStyles: Record<string, React.CSSProperties> = {};

  if (step.highlightSquares) {
    step.highlightSquares.forEach(sq => {
      squareStyles[sq] = { backgroundColor: 'rgba(253, 203, 110, 0.4)' };
    });
  }

  const arrows = step.arrows?.map(([from, to]) => ({
    startSquare: from,
    endSquare: to,
    color: 'rgba(253, 203, 110, 0.8)',
  }));

  return (
    <div className="w-full max-w-2xl mx-auto">
      {step.title && (
        <h3 className="text-xl font-bold text-center mb-3">{step.title}</h3>
      )}

      <p className="text-purple-200 text-center mb-4 whitespace-pre-line leading-relaxed text-sm lg:text-base">
        {step.text}
      </p>

      {step.fen && (
        <div className="chess-board-container w-full max-w-[min(80vw,380px)] lg:max-w-[min(75vw,500px)] mx-auto aspect-square magic-glow rounded-xl overflow-hidden relative">
          <Chessboard
            options={{
              position: step.fen,
              boardOrientation: 'white' as const,
              allowDragging: false,
              boardStyle: { borderRadius: '12px' },
              darkSquareStyle: { backgroundColor: '#6c5ce7' },
              lightSquareStyle: { backgroundColor: '#ddd6fe' },
              squareStyles,
              arrows,
              animationDurationInMs: 300,
            }}
          />
          {step.ghostPiece && step.highlightSquares && (
            <div className="absolute inset-0 pointer-events-none">
              {step.highlightSquares.map(sq => {
                const { col, row } = squareToCoords(sq);
                return (
                  <span
                    key={sq}
                    className="absolute opacity-30 text-yellow-200 flex items-center justify-center ghost-pulse"
                    style={{
                      left: `${col * 12.5}%`,
                      top: `${row * 12.5}%`,
                      width: '12.5%',
                      height: '12.5%',
                      fontSize: 'min(4vw, 32px)',
                    }}
                  >
                    {GHOST_PIECE_UNICODE[step.ghostPiece!]}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
