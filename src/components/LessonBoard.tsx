'use client';

import { useState, useCallback } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { customPieces } from './ChessPieces';
import { LessonChallenge } from '@/lib/lessons';
import confetti from 'canvas-confetti';

interface LessonBoardProps {
  fen: string;
  highlightSquares?: string[];
  arrows?: [string, string][];
  interactive?: boolean;
  challenge?: LessonChallenge;
  onChallengeComplete?: () => void;
}

function ensureKings(fen: string): string {
  const parts = fen.split(' ');
  const position = parts[0];
  if (position === '8/8/8/8/8/8/8/8') return fen;
  const hasWhiteKing = position.includes('K');
  const hasBlackKing = position.includes('k');
  if (hasWhiteKing && hasBlackKing) return fen;

  const rows = position.split('/');
  if (!hasBlackKing) {
    const row0 = rows[0];
    if (row0 === '8') {
      rows[0] = 'k7';
    } else if (row0.endsWith('1')) {
      rows[0] = row0.slice(0, -1) + 'k';
    } else {
      const lastChar = row0[row0.length - 1];
      if (lastChar >= '2' && lastChar <= '8') {
        rows[0] = row0.slice(0, -1) + String(Number(lastChar) - 1) + 'k';
      } else {
        rows[0] = row0 + 'k';
      }
    }
  }
  if (!hasWhiteKing) {
    const row7 = rows[7];
    if (row7 === '8') {
      rows[7] = '7K';
    } else if (row7.startsWith('1')) {
      rows[7] = 'K' + row7.slice(1);
    } else {
      const firstChar = row7[0];
      if (firstChar >= '2' && firstChar <= '8') {
        rows[7] = 'K' + String(Number(firstChar) - 1) + row7.slice(1);
      } else {
        rows[7] = 'K' + row7;
      }
    }
  }
  parts[0] = rows.join('/');
  return parts.join(' ');
}

function isKinglessFen(fen: string): boolean {
  const position = fen.split(' ')[0];
  return !position.includes('K') || !position.includes('k');
}

export default function LessonBoard({
  fen,
  highlightSquares = [],
  arrows = [],
  interactive = false,
  challenge,
  onChallengeComplete,
}: LessonBoardProps) {
  const displayOnly = isKinglessFen(fen) && !interactive;
  const safeFen = displayOnly ? fen : ensureKings(fen);
  const [game, setGame] = useState(() => new Chess(displayOnly ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' : safeFen));
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [completed, setCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [wrongMove, setWrongMove] = useState(false);

  const isInteractive = interactive && challenge && !completed;

  const resetBoard = useCallback(() => {
    setGame(new Chess(ensureKings(challenge?.fen || fen)));
    setSelectedSquare(null);
    setLegalMoves([]);
    setCompleted(false);
    setShowHint(false);
    setWrongMove(false);
  }, [challenge, fen]);

  function selectPiece(square: string) {
    const piece = game.get(square as Square);
    if (!piece || piece.color !== 'w') {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }
    setSelectedSquare(square);
    const moves = game.moves({ square: square as Square, verbose: true });
    setLegalMoves(moves);
  }

  function isValidChallengeMove(from: string, to: string): boolean {
    if (!challenge) return false;
    return challenge.validMoves.some(m => m.from === from && m.to === to);
  }

  function tryMove(from: string, to: string): boolean {
    if (!isInteractive) return false;

    if (!isValidChallengeMove(from, to)) {
      setWrongMove(true);
      setTimeout(() => setWrongMove(false), 1000);
      setSelectedSquare(null);
      setLegalMoves([]);
      return false;
    }

    try {
      const newGame = new Chess(game.fen());
      const move = newGame.move({ from: from as Square, to: to as Square, promotion: 'q' });
      if (!move) return false;

      setGame(newGame);
      setSelectedSquare(null);
      setLegalMoves([]);
      setCompleted(true);

      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#9b7fd4', '#7c5fc4', '#fdcb6e', '#00b894'],
      });

      setTimeout(() => {
        onChallengeComplete?.();
      }, 1500);

      return true;
    } catch {
      return false;
    }
  }

  function handleSquareClick({ square }: { piece: { pieceType: string } | null; square: string }) {
    if (!isInteractive) return;

    if (selectedSquare) {
      const isLegal = legalMoves.some(m => m.to === square);
      if (isLegal) {
        tryMove(selectedSquare, square);
        return;
      }
      const piece = game.get(square as Square);
      if (piece && piece.color === 'w') {
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
    if (!isInteractive || !square) return;

    if (selectedSquare && selectedSquare !== square) {
      const isLegal = legalMoves.some(m => m.to === square);
      if (isLegal) {
        tryMove(selectedSquare, square);
        return;
      }
    }
    selectPiece(square);
  }

  function handlePieceDrop({ sourceSquare, targetSquare }: { piece: { isSparePiece: boolean; position: string; pieceType: string }; sourceSquare: string; targetSquare: string | null }): boolean {
    if (!isInteractive || !targetSquare) return false;
    setSelectedSquare(null);
    setLegalMoves([]);
    return tryMove(sourceSquare, targetSquare);
  }

  function canDragPiece({ piece }: { isSparePiece: boolean; piece: { pieceType: string }; square: string | null }): boolean {
    if (!isInteractive) return false;
    return piece.pieceType.charAt(0) === 'w';
  }

  const squareStyles: Record<string, React.CSSProperties> = {};

  if (!isInteractive) {
    for (const sq of highlightSquares) {
      squareStyles[sq] = { backgroundColor: 'rgba(200, 140, 50, 0.45)' };
    }
  } else {
    if (challenge?.highlightSquares) {
      for (const sq of challenge.highlightSquares) {
        squareStyles[sq] = { backgroundColor: 'rgba(200, 140, 50, 0.3)' };
      }
    }
  }

  if (selectedSquare) {
    squareStyles[selectedSquare] = {
      backgroundColor: 'rgba(255, 215, 0, 0.6)',
      boxShadow: 'inset 0 0 8px rgba(255, 215, 0, 0.8)',
    };
  }

  if (isInteractive) {
    for (const move of legalMoves) {
      if (isValidChallengeMove(selectedSquare || '', move.to)) {
        const targetPiece = game.get(move.to as Square);
        if (targetPiece) {
          squareStyles[move.to] = {
            background: 'radial-gradient(circle, transparent 55%, rgba(255, 80, 80, 0.7) 55%)',
            borderRadius: '50%',
          };
        } else {
          squareStyles[move.to] = {
            background: 'radial-gradient(circle, rgba(0, 200, 100, 0.7) 25%, transparent 25%)',
          };
        }
      }
    }
  }

  const boardArrows = !isInteractive
    ? arrows.map(([from, to]) => ({ startSquare: from, endSquare: to, color: 'rgba(170, 80, 30, 0.85)' }))
    : [];

  return (
    <div className="lesson-board-wrapper relative w-full aspect-square">
      <div className="chess-board-container w-full aspect-square rounded-xl overflow-hidden shadow-lg border-3 border-[#8b5e34]">
        <Chessboard
          options={{
            position: displayOnly ? safeFen : game.fen(),
            onPieceDrop: isInteractive ? handlePieceDrop : undefined,
            onSquareClick: isInteractive ? handleSquareClick : undefined,
            onPieceClick: isInteractive ? handlePieceClick : undefined,
            canDragPiece: isInteractive ? canDragPiece : () => false,
            boardOrientation: 'white' as const,
            pieces: customPieces,
            boardStyle: { borderRadius: '12px' },
            darkSquareStyle: { backgroundColor: '#b58863' },
            lightSquareStyle: { backgroundColor: '#f0d9b5' },
            squareStyles,
            arrows: boardArrows,
            animationDurationInMs: 250,
            showNotation: true,
          }}
        />
      </div>

      {/* Feedback overlays */}
      {completed && challenge && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl backdrop-blur-sm z-10">
          <div className="text-center px-4">
            <span className="text-5xl block mb-3">🎉</span>
            <p className="text-lg font-bold text-[#4a3b6b]">{challenge.successMessage}</p>
          </div>
        </div>
      )}

      {wrongMove && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl px-6 py-3 shadow-lg animate-bounce">
            <p className="text-red-600 font-bold text-sm">Not quite! Try again.</p>
          </div>
        </div>
      )}

      {/* Hint and Reset buttons for interactive mode */}
      {isInteractive && (
        <div className="flex items-center justify-center gap-3 mt-3">
          {challenge.hintMessage && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-sm px-4 py-2 rounded-xl bg-[#f5f0ff] border border-[#e8dff5] text-[#6b5b8a] font-semibold hover:bg-[#ede6ff] transition-colors"
            >
              💡 {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
          )}
          <button
            onClick={resetBoard}
            className="text-sm px-4 py-2 rounded-xl bg-[#f5f0ff] border border-[#e8dff5] text-[#6b5b8a] font-semibold hover:bg-[#ede6ff] transition-colors"
          >
            🔄 Reset
          </button>
        </div>
      )}

      {showHint && challenge?.hintMessage && (
        <div className="mt-2 text-center px-4 py-2 bg-[#fffbeb] border border-[#fde68a] rounded-xl">
          <p className="text-sm text-[#92400e] font-medium">💡 {challenge.hintMessage}</p>
        </div>
      )}
    </div>
  );
}
