'use client';

import { useState, useCallback, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { getBestMove, DifficultyLevel } from '@/lib/chess-ai';
import confetti from 'canvas-confetti';

interface ChessBoardProps {
  difficulty: DifficultyLevel;
  onGameEnd: (result: 'win' | 'loss' | 'draw') => void;
  playerColor?: 'white' | 'black';
}

export default function ChessBoard({ difficulty, onGameEnd, playerColor = 'white' }: ChessBoardProps) {
  const [game, setGame] = useState(new Chess());
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<string>('');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [thinking, setThinking] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  const makeAIMove = useCallback(() => {
    if (game.isGameOver() || gameOver) return;

    setThinking(true);
    setTimeout(() => {
      const gameCopy = new Chess(game.fen());
      const aiMove = getBestMove(gameCopy, difficulty);

      if (aiMove) {
        const newGame = new Chess(game.fen());
        newGame.move(aiMove);
        setGame(newGame);
        setMoveHistory(prev => [...prev, aiMove.san]);
        setLastMove({ from: aiMove.from, to: aiMove.to });
        checkGameOver(newGame);
      }
      setThinking(false);
    }, 500 + Math.random() * 1000);
  }, [game, difficulty, gameOver]);

  useEffect(() => {
    if (playerColor === 'black' && game.turn() === 'w' && !gameOver && moveHistory.length === 0) {
      makeAIMove();
    }
  }, [playerColor, game, gameOver, moveHistory.length, makeAIMove]);

  function checkGameOver(currentGame: Chess) {
    if (currentGame.isGameOver()) {
      setGameOver(true);
      if (currentGame.isCheckmate()) {
        const loser = currentGame.turn();
        const playerIsWhite = playerColor === 'white';
        if ((loser === 'b' && playerIsWhite) || (loser === 'w' && !playerIsWhite)) {
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
      } else if (currentGame.isDraw()) {
        setGameResult("It's a Draw! 🤝");
        onGameEnd('draw');
      } else if (currentGame.isStalemate()) {
        setGameResult('Stalemate! 🤝');
        onGameEnd('draw');
      }
    }
  }

  function handlePieceDrop({ sourceSquare, targetSquare }: { piece: { isSparePiece: boolean; position: string; pieceType: string }; sourceSquare: string; targetSquare: string | null }): boolean {
    if (gameOver || thinking || !targetSquare) return false;

    const playerTurn = playerColor === 'white' ? 'w' : 'b';
    if (game.turn() !== playerTurn) return false;

    try {
      const newGame = new Chess(game.fen());
      const move = newGame.move({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        promotion: 'q',
      });

      if (!move) return false;

      setGame(newGame);
      setMoveHistory(prev => [...prev, move.san]);
      setLastMove({ from: sourceSquare, to: targetSquare });
      checkGameOver(newGame);

      if (!newGame.isGameOver()) {
        setTimeout(() => makeAIMove(), 300);
      }

      return true;
    } catch {
      return false;
    }
  }

  function resetGame() {
    setGame(new Chess());
    setGameOver(false);
    setGameResult('');
    setMoveHistory([]);
    setThinking(false);
    setLastMove(null);
  }

  const customSquareStyles: Record<string, React.CSSProperties> = {};
  if (lastMove) {
    customSquareStyles[lastMove.from] = { backgroundColor: 'rgba(108, 92, 231, 0.3)' };
    customSquareStyles[lastMove.to] = { backgroundColor: 'rgba(108, 92, 231, 0.5)' };
  }

  if (game.isCheck()) {
    const board = game.board();
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece && piece.type === 'k' && piece.color === game.turn()) {
          const square = String.fromCharCode('a'.charCodeAt(0) + file) + (8 - rank);
          customSquareStyles[square] = { backgroundColor: 'rgba(255, 0, 0, 0.4)' };
        }
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
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

      <div className="chess-board-container w-full max-w-[min(90vw,480px)] aspect-square magic-glow rounded-xl overflow-hidden">
        <Chessboard
          options={{
            position: game.fen(),
            onPieceDrop: handlePieceDrop,
            boardOrientation: playerColor,
            boardStyle: { borderRadius: '12px' },
            darkSquareStyle: { backgroundColor: '#6c5ce7' },
            lightSquareStyle: { backgroundColor: '#ddd6fe' },
            squareStyles: customSquareStyles,
            animationDurationInMs: 300,
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
