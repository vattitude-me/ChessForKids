'use client';

import { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { tutorials, getCategories, TutorialLesson, TutorialStep } from '@/lib/tutorials';
import { useGameStore } from '@/lib/store';

export default function LearnPage() {
  const { tutorialProgress, recordLessonCompleted } = useGameStore();
  const [selectedLesson, setSelectedLesson] = useState<TutorialLesson | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
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
    <div className="min-h-screen flex flex-col items-center p-4 pt-8">
      <div className="text-center mb-6">
        <span className="text-4xl block mb-2">📚</span>
        <h1 className="text-2xl font-bold magic-text mb-1">Magic Academy</h1>
        <p className="text-purple-300 text-sm">Learn the secrets of chess!</p>
        <p className="text-xs text-purple-400 mt-1">
          {tutorialProgress.length}/{tutorials.length} lessons completed
        </p>
      </div>

      <div className="w-full max-w-lg">
        {categories.map(category => {
          const categoryLessons = tutorials.filter(t => t.category === category.id);
          if (categoryLessons.length === 0) return null;

          return (
            <div key={category.id} className="mb-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span>{category.icon}</span>
                {category.name}
              </h3>
              <div className="grid gap-2">
                {categoryLessons.map(lesson => {
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
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">{lesson.title}</h4>
                        <p className="text-xs text-purple-300">{lesson.description}</p>
                      </div>
                      {isCompleted && (
                        <span className="text-yellow-400 text-sm">⭐</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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
    <div className="w-full max-w-md">
      {step.title && (
        <h3 className="text-xl font-bold text-center mb-3">{step.title}</h3>
      )}

      <p className="text-purple-200 text-center mb-4 whitespace-pre-line leading-relaxed">
        {step.text}
      </p>

      {step.fen && (
        <div className="chess-board-container w-full max-w-[min(80vw,380px)] lg:max-w-[min(75vw,560px)] xl:max-w-[min(70vw,640px)] mx-auto aspect-square magic-glow rounded-xl overflow-hidden">
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
        </div>
      )}
    </div>
  );
}
