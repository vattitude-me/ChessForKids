'use client';

import { useState, useCallback } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { generatePuzzles, Puzzle } from '@/lib/puzzle-generator';
import { useGameStore } from '@/lib/store';
import confetti from 'canvas-confetti';

export default function PuzzlesPage() {
  const { currentDifficultyIndex, recordPuzzleSolved, stats } = useGameStore();
  const [puzzles] = useState<Puzzle[]>(() => generatePuzzles(currentDifficultyIndex, 10));
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [game, setGame] = useState<Chess>(() => new Chess(puzzles[0].fen));
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [attempts, setAttempts] = useState(0);

  const currentPuzzle = puzzles[currentPuzzleIndex];

  const loadPuzzle = useCallback((index: number) => {
    const puzzle = puzzles[index];
    setGame(new Chess(puzzle.fen));
    setSolved(false);
    setShowHint(false);
    setFeedback('');
    setAttempts(0);
    setCurrentPuzzleIndex(index);
  }, [puzzles]);

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
        setFeedback('Correct! Well done, young wizard! ✨');
        recordPuzzleSolved();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#6c5ce7', '#a29bfe', '#fdcb6e'],
        });
      } else {
        setAttempts(prev => prev + 1);
        setFeedback(attempts >= 1 ? 'Not quite... try using the hint! 💡' : 'Not quite... try again! 🤔');
        newGame.undo();
      }

      return move.san === expectedMove;
    } catch {
      return false;
    }
  }

  function nextPuzzle() {
    if (currentPuzzleIndex < puzzles.length - 1) {
      loadPuzzle(currentPuzzleIndex + 1);
    }
  }

  const turn = game.turn() === 'w' ? 'White' : 'Black';

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pt-8">
      <div className="text-center mb-4">
        <span className="text-4xl block mb-2">🧩</span>
        <h1 className="text-2xl font-bold magic-text mb-1">Puzzle Chamber</h1>
        <p className="text-purple-300 text-sm">
          Puzzle {currentPuzzleIndex + 1} of {puzzles.length}
        </p>
      </div>

      <div className="fantasy-card p-4 mb-4 text-center max-w-md w-full">
        <h3 className="font-bold text-lg mb-1">{currentPuzzle.title}</h3>
        <p className="text-purple-300 text-sm mb-2">{currentPuzzle.description}</p>
        <p className="text-xs text-yellow-300">{turn} to move</p>
      </div>

      <div className="chess-board-container w-full max-w-[min(90vw,420px)] aspect-square magic-glow rounded-xl overflow-hidden">
        <Chessboard
          options={{
            position: game.fen(),
            onPieceDrop: handlePieceDrop,
            boardOrientation: game.turn() === 'w' ? 'white' : 'black',
            boardStyle: { borderRadius: '12px' },
            darkSquareStyle: { backgroundColor: '#6c5ce7' },
            lightSquareStyle: { backgroundColor: '#ddd6fe' },
            animationDurationInMs: 300,
          }}
        />
      </div>

      {feedback && (
        <div className={`mt-4 text-center p-3 rounded-xl ${
          solved ? 'bg-green-900/30 border border-green-500/30' : 'bg-red-900/30 border border-red-500/30'
        }`}>
          <p className="font-bold">{feedback}</p>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        {!solved && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="px-4 py-2 rounded-xl bg-yellow-900/30 border border-yellow-500/30 text-yellow-300 text-sm hover:bg-yellow-900/50 transition"
          >
            💡 {showHint ? 'Hide' : 'Show'} Hint
          </button>
        )}

        {solved && currentPuzzleIndex < puzzles.length - 1 && (
          <button onClick={nextPuzzle} className="sparkle-btn">
            Next Puzzle →
          </button>
        )}
      </div>

      {showHint && !solved && (
        <div className="mt-3 p-3 rounded-xl bg-yellow-900/20 border border-yellow-500/20 max-w-md">
          <p className="text-yellow-200 text-sm">💡 {currentPuzzle.hint}</p>
        </div>
      )}

      <div className="mt-6 flex gap-2 flex-wrap justify-center">
        {puzzles.map((_, index) => (
          <button
            key={index}
            onClick={() => loadPuzzle(index)}
            className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
              index === currentPuzzleIndex
                ? 'bg-purple-500 text-white'
                : index < currentPuzzleIndex
                  ? 'bg-green-600/50 text-green-200'
                  : 'bg-purple-900/30 text-purple-400'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="mt-4 text-center text-sm text-purple-400">
        Total puzzles solved: {stats.puzzlesSolved} 🧩
      </div>
    </div>
  );
}
