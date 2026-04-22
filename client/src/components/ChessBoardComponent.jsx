import { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const ChessBoardComponent = ({ fen, color, onMove, turn, isGameOver }) => {
  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [promotionSquare, setPromotionSquare] = useState(null);
  const [pendingMove, setPendingMove] = useState(null);

  // Sync game with server FEN
  useEffect(() => {
    try {
      if (fen && fen !== 'start') {
        setGame(new Chess(fen));
      } else {
        setGame(new Chess());
      }

      // reset UI state when board updates
      setMoveFrom(null);
      setPossibleMoves([]);
      setPromotionSquare(null);
      setPendingMove(null);
    } catch (e) {
      console.error("Invalid FEN:", fen);
    }
  }, [fen]);

  // Core move handler (SAFE)
  function handleMove(from, to, promotion = 'q') {
    if (isGameOver || turn !== color) return false;

    try {
      const gameCopy = new Chess(game.fen());

      const move = gameCopy.move({
        from,
        to,
        promotion,
      });

      if (!move) return false;

      setGame(gameCopy);
      setMoveFrom(null);
      setPossibleMoves([]);

      onMove({ from, to, promotion });

      return true;
    } catch (e) {
      return false;
    }
  }

  // Drag & Drop support (desktop)
  function onDrop(sourceSquare, targetSquare, piece) {
    if (isGameOver || turn !== color) return false;

    const isPromotion =
      (piece === 'wP' && sourceSquare[1] === '7' && targetSquare[1] === '8') ||
      (piece === 'bP' && sourceSquare[1] === '2' && targetSquare[1] === '1');

    if (isPromotion) {
      setPendingMove({ from: sourceSquare, to: targetSquare });
      setPromotionSquare(targetSquare);
      return true;
    }

    return handleMove(sourceSquare, targetSquare);
  }

  // 🔥 MOBILE + CLICK MOVE (FIXED)
  function onSquareClick(square) {
    if (isGameOver || turn !== color) return;

    const piece = game.get(square);

    // FIRST CLICK
    if (!moveFrom) {
      if (piece && piece.color === (color === 'white' ? 'w' : 'b')) {
        setMoveFrom(square);

        const moves = game.moves({
          square,
          verbose: true,
        });

        setPossibleMoves(moves.map(m => m.to));
      }
      return;
    }

    // SECOND CLICK
    const selectedPiece = game.get(moveFrom);

    const isPromotion =
      selectedPiece &&
      selectedPiece.type === 'p' &&
      ((selectedPiece.color === 'w' && moveFrom[1] === '7' && square[1] === '8') ||
       (selectedPiece.color === 'b' && moveFrom[1] === '2' && square[1] === '1'));

    if (isPromotion) {
      setPendingMove({ from: moveFrom, to: square });
      setPromotionSquare(square);
      return;
    }

    const success = handleMove(moveFrom, square);

    if (!success) {
      // If clicking another own piece → switch selection
      if (piece && piece.color === (color === 'white' ? 'w' : 'b')) {
        setMoveFrom(square);

        const moves = game.moves({
          square,
          verbose: true,
        });

        setPossibleMoves(moves.map(m => m.to));
      } else {
        // reset
        setMoveFrom(null);
        setPossibleMoves([]);
      }
    }
  }

  function handlePromotionSelect(piece) {
    if (pendingMove) {
      handleMove(pendingMove.from, pendingMove.to, piece);
    }

    setPromotionSquare(null);
    setPendingMove(null);
  }

  // 🎯 Highlight styles
  const squareStyles = {
    ...(moveFrom
      ? {
          [moveFrom]: {
            backgroundColor: 'rgba(255,255,0,0.5)',
          },
        }
      : {}),

    ...possibleMoves.reduce((acc, sq) => {
      acc[sq] = {
        background:
          'radial-gradient(circle, rgba(0,0,0,0.2) 25%, transparent 25%)',
        borderRadius: '50%',
      };
      return acc;
    }, {}),
  };

  return (
    <div style={{ position: 'relative' }}>
      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop}
        onSquareClick={onSquareClick}
        boardOrientation={color || 'white'}
        customDarkSquareStyle={{ backgroundColor: '#2d3748' }}
        customLightSquareStyle={{ backgroundColor: '#a0aec0' }}
        customSquareStyles={squareStyles}
        animationDuration={200}
      />

      {promotionSquare && (
        <div
          style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '10px',
            borderRadius: '8px',
            zIndex: 10,
          }}
        >
          <h4>Promote to:</h4>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => handlePromotionSelect('q')}>Queen</button>
            <button onClick={() => handlePromotionSelect('r')}>Rook</button>
            <button onClick={() => handlePromotionSelect('b')}>Bishop</button>
            <button onClick={() => handlePromotionSelect('n')}>Knight</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessBoardComponent;