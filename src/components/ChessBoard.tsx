'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { getBestMove, DifficultyLevel } from '@/lib/chess-ai';
import { customPieces } from './ChessPieces';
import { fantasyPieces } from './ChessPiecesFantasy';
import confetti from 'canvas-confetti';

interface ChessBoardProps {
  difficulty: DifficultyLevel;
  onGameEnd: (result: 'win' | 'loss' | 'draw') => void;
  onMove?: (move: { san: string; color: 'w' | 'b'; captured?: string }) => void;
  playerColor?: 'white' | 'black';
  boardTheme?: { dark: string; light: string; label: string };
  pieceTheme?: 'classic' | 'fantasy';
  minimal?: boolean;
}

const pieceThemes = {
  classic: customPieces,
  fantasy: fantasyPieces,
};

export default function ChessBoard({ difficulty, onGameEnd, onMove, playerColor = 'white', boardTheme, pieceTheme = 'classic', minimal = false }: ChessBoardProps) {
  const activePieces = pieceThemes[pieceTheme];
  const [game, setGame] = useState(new Chess());
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<string>('');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [thinking, setThinking] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const gameEndCalled = useRef(false);
  const gameRef = useRef(game);

  const playerTurn = playerColor === 'white' ? 'w' : 'b';
  const aiColor = playerColor === 'white' ? 'b' : 'w';

  function updateGame(newGame: Chess) {
    gameRef.current = newGame;
    setGame(newGame);
  }

  const isPlayerTurn = useCallback(() => {
    return gameRef.current.turn() === playerTurn;
  }, [playerTurn]);

  const checkGameOver = useCallback((currentGame: Chess) => {
    if (currentGame.isGameOver() && !gameEndCalled.current) {
      gameEndCalled.current = true;
      setGameOver(true);
      if (currentGame.isCheckmate()) {
        const loser = currentGame.turn();
        if (loser !== playerTurn) {
          setGameResult('You Win! 🎉');
          onGameEnd('win');
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'],
          });
        } else {
          setGameResult('You Lost! Try again! 💪');
          onGameEnd('loss');
        }
      } else if (currentGame.isDraw() || currentGame.isStalemate()) {
        setGameResult("It's a Draw! 🤝");
        onGameEnd('draw');
      }
    }
  }, [onGameEnd, playerTurn]);

  const makeAIMove = useCallback(() => {
    const currentGame = gameRef.current;
    if (currentGame.isGameOver() || gameEndCalled.current) return;
    if (currentGame.turn() !== aiColor) return;

    setThinking(true);
    const fen = currentGame.fen();

    setTimeout(() => {
      const gameCopy = new Chess(fen);
      const aiMove = getBestMove(gameCopy, difficulty);

      if (aiMove) {
        const newGame = new Chess(fen);
        const madeMove = newGame.move(aiMove);
        updateGame(newGame);
        setMoveHistory(prev => [...prev, aiMove.san]);
        setLastMove({ from: aiMove.from, to: aiMove.to });
        if (madeMove) {
          onMove?.({ san: madeMove.san, color: madeMove.color, captured: madeMove.captured });
        }
        checkGameOver(newGame);
      }
      setThinking(false);
    }, 500 + Math.random() * 800);
  }, [difficulty, aiColor, checkGameOver, onMove]);

  useEffect(() => {
    if (playerColor === 'black' && game.turn() === 'w' && !gameOver && moveHistory.length === 0) {
      makeAIMove();
    }
  }, [playerColor, game, gameOver, moveHistory.length, makeAIMove]);

  function selectPiece(square: string) {
    const currentGame = gameRef.current;
    const piece = currentGame.get(square as Square);
    if (!piece || piece.color !== playerTurn) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    setSelectedSquare(square);
    const moves = currentGame.moves({ square: square as Square, verbose: true });
    setLegalMoves(moves);
  }

  function tryMove(from: string, to: string): boolean {
    const currentGame = gameRef.current;
    if (gameOver || thinking) return false;
    if (currentGame.turn() !== playerTurn) return false;

    try {
      const newGame = new Chess(currentGame.fen());
      const move = newGame.move({
        from: from as Square,
        to: to as Square,
        promotion: 'q',
      });

      if (!move) return false;

      updateGame(newGame);
      setMoveHistory(prev => [...prev, move.san]);
      setLastMove({ from, to });
      setSelectedSquare(null);
      setLegalMoves([]);
      onMove?.({ san: move.san, color: move.color, captured: move.captured });
      checkGameOver(newGame);

      if (!newGame.isGameOver()) {
        setTimeout(() => makeAIMove(), 300);
      }

      return true;
    } catch {
      return false;
    }
  }

  function handleSquareClick({ square }: { piece: { pieceType: string } | null; square: string }) {
    if (gameOver || thinking) return;
    if (!isPlayerTurn()) return;

    if (selectedSquare) {
      const isLegalTarget = legalMoves.some(m => m.to === square);
      if (isLegalTarget) {
        tryMove(selectedSquare, square);
        return;
      }

      const currentGame = gameRef.current;
      const piece = currentGame.get(square as Square);
      if (piece && piece.color === playerTurn) {
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
    if (gameOver || thinking || !square) return;
    if (!isPlayerTurn()) return;

    if (selectedSquare && selectedSquare !== square) {
      const isLegalTarget = legalMoves.some(m => m.to === square);
      if (isLegalTarget) {
        tryMove(selectedSquare, square);
        return;
      }
    }

    selectPiece(square);
  }

  function handlePieceDrop({ sourceSquare, targetSquare }: { piece: { isSparePiece: boolean; position: string; pieceType: string }; sourceSquare: string; targetSquare: string | null }): boolean {
    if (!targetSquare) return false;
    setSelectedSquare(null);
    setLegalMoves([]);
    return tryMove(sourceSquare, targetSquare);
  }

  function canDragPiece({ piece }: { isSparePiece: boolean; piece: { pieceType: string }; square: string | null }): boolean {
    if (gameOver || thinking) return false;
    if (!isPlayerTurn()) return false;
    const pieceColor = piece.pieceType.charAt(0) === 'w' ? 'w' : 'b';
    return pieceColor === playerTurn;
  }

  function resetGame() {
    const newGame = new Chess();
    gameRef.current = newGame;
    setGame(newGame);
    setGameOver(false);
    setGameResult('');
    setMoveHistory([]);
    setThinking(false);
    setLastMove(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    gameEndCalled.current = false;
  }

  const customSquareStyles: Record<string, React.CSSProperties> = {};

  if (lastMove) {
    customSquareStyles[lastMove.from] = { backgroundColor: 'rgba(108, 92, 231, 0.3)' };
    customSquareStyles[lastMove.to] = { backgroundColor: 'rgba(108, 92, 231, 0.5)' };
  }

  if (selectedSquare) {
    customSquareStyles[selectedSquare] = {
      backgroundColor: 'rgba(255, 215, 0, 0.6)',
      boxShadow: 'inset 0 0 8px rgba(255, 215, 0, 0.8)',
    };
  }

  for (const move of legalMoves) {
    const targetPiece = game.get(move.to as Square);
    if (targetPiece) {
      customSquareStyles[move.to] = {
        background: 'radial-gradient(circle, transparent 55%, rgba(255, 80, 80, 0.7) 55%)',
        borderRadius: '50%',
      };
    } else {
      customSquareStyles[move.to] = {
        background: 'radial-gradient(circle, rgba(0, 200, 100, 0.7) 25%, transparent 25%)',
      };
    }
  }

  if (game.isCheck()) {
    const board = game.board();
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece && piece.type === 'k' && piece.color === game.turn()) {
          const square = String.fromCharCode('a'.charCodeAt(0) + file) + (8 - rank);
          customSquareStyles[square] = {
            backgroundColor: 'rgba(255, 0, 0, 0.5)',
            boxShadow: 'inset 0 0 12px rgba(255, 0, 0, 0.8)',
          };
        }
      }
    }
  }

  if (minimal) {
    return (
      <div className="w-full aspect-square">
        <div className="chess-board-container w-full aspect-square magic-glow rounded-xl overflow-hidden">
          <Chessboard
            options={{
              position: game.fen(),
              onPieceDrop: handlePieceDrop,
              onSquareClick: handleSquareClick,
              onPieceClick: handlePieceClick,
              canDragPiece: canDragPiece,
              boardOrientation: playerColor,
              pieces: activePieces,
              boardStyle: { borderRadius: '12px' },
              darkSquareStyle: { backgroundColor: boardTheme?.dark ?? '#6c5ce7' },
              lightSquareStyle: { backgroundColor: boardTheme?.light ?? '#ddd6fe' },
              squareStyles: customSquareStyles,
              animationDurationInMs: 200,
              showNotation: true,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{difficulty.icon}</span>
        <div>
          <h3 className="text-lg font-bold text-white">{difficulty.label}</h3>
          <p className="text-xs text-purple-300">{difficulty.description}</p>
        </div>
        {thinking && (
          <div className="ml-4 flex items-center gap-2 text-purple-300 text-sm">
            <div className="animate-spin h-4 w-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
            Thinking...
          </div>
        )}
      </div>

      {!gameOver && (
        <div className="text-sm text-center">
          {isPlayerTurn() && !thinking ? (
            <span className="text-green-300 font-medium">Your turn! {selectedSquare ? 'Tap where to move' : 'Tap a piece to see moves'}</span>
          ) : (
            <span className="text-purple-300">Opponent is thinking...</span>
          )}
        </div>
      )}

      <div className="chess-board-container w-full max-w-[min(90vw,480px)] lg:max-w-full aspect-square magic-glow rounded-xl overflow-hidden">
        <Chessboard
          options={{
            position: game.fen(),
            onPieceDrop: handlePieceDrop,
            onSquareClick: handleSquareClick,
            onPieceClick: handlePieceClick,
            canDragPiece: canDragPiece,
            boardOrientation: playerColor,
            pieces: activePieces,
            boardStyle: { borderRadius: '12px' },
            darkSquareStyle: { backgroundColor: boardTheme?.dark ?? '#6c5ce7' },
            lightSquareStyle: { backgroundColor: boardTheme?.light ?? '#ddd6fe' },
            squareStyles: customSquareStyles,
            animationDurationInMs: 200,
            showNotation: true,
          }}
        />
      </div>

      {gameOver && (
        <div className="text-center mt-4">
          <p className="text-2xl font-bold mb-3 celebrate">{gameResult}</p>
          <button onClick={resetGame} className="sparkle-btn">
            Play Again ⚔️
          </button>
        </div>
      )}

      {moveHistory.length > 0 && (
        <div className="w-full max-w-md mt-4">
          <h4 className="text-sm text-purple-300 mb-2">Move History</h4>
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
            {moveHistory.map((move, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 rounded bg-purple-900/30 text-purple-200"
              >
                {Math.floor(index / 2) + 1}{index % 2 === 0 ? '.' : '...'}{move}
              </span>
            ))}
          </div>
        </div>
      )}

      {!gameOver && (
        <button
          onClick={resetGame}
          className="mt-2 text-sm text-purple-400 hover:text-purple-200 transition"
        >
          🔄 New Game
        </button>
      )}
    </div>
  );
}
