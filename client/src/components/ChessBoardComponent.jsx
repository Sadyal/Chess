import { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const ChessBoardComponent = ({ fen, color, onMove, turn, isGameOver }) => {
  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState(null);
  const [promotionSquare, setPromotionSquare] = useState(null);
  const [pendingMove, setPendingMove] = useState(null);

  useEffect(() => {
    if (fen && fen !== 'start') {
      try {
        setGame(new Chess(fen));
      } catch (e) {
        console.error("Invalid FEN from server", fen);
      }
    } else if (fen === 'start') {
       setGame(new Chess());
    }
  }, [fen]);

  function handleMove(sourceSquare, targetSquare, promotionPiece = 'q') {
    if (isGameOver || turn !== color) return false;

    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: promotionPiece,
      });

      if (move === null) return false;
      
      setGame(gameCopy);
      setMoveFrom(null);
      
      onMove({
        from: sourceSquare,
        to: targetSquare,
        promotion: promotionPiece
      });
      return true;
    } catch (e) {
      return false; 
    }
  }

  function onDrop(sourceSquare, targetSquare, piece) {
    if (isGameOver || turn !== color) return false;

    const isPromotion = 
      (piece === 'wP' && sourceSquare[1] === '7' && targetSquare[1] === '8') ||
      (piece === 'bP' && sourceSquare[1] === '2' && targetSquare[1] === '1');

    if (isPromotion) {
      setPendingMove({ from: sourceSquare, to: targetSquare });
      setPromotionSquare(targetSquare);
      return true; // allow optimistic visual drop
    }

    return handleMove(sourceSquare, targetSquare);
  }

  function onSquareClick(square) {
    if (isGameOver || turn !== color) return;
    
    if (moveFrom === null) {
      // First click: select piece
      const piece = game.get(square);
      if (piece && piece.color === (color === 'white' ? 'w' : 'b')) {
        setMoveFrom(square);
      }
    } else {
      // Second click: attempt to move
      const piece = game.get(moveFrom);
      const isPromotion = piece && piece.type === 'p' && 
        ((piece.color === 'w' && moveFrom[1] === '7' && square[1] === '8') ||
         (piece.color === 'b' && moveFrom[1] === '2' && square[1] === '1'));
         
      if (isPromotion) {
        setPendingMove({ from: moveFrom, to: square });
        setPromotionSquare(square);
      } else {
        const success = handleMove(moveFrom, square);
        if (!success) {
          // If click was invalid, check if they clicked another of their own pieces
          const newPiece = game.get(square);
          if (newPiece && newPiece.color === (color === 'white' ? 'w' : 'b')) {
            setMoveFrom(square);
          } else {
             setMoveFrom(null);
          }
        }
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

  return (
    <div className="chessboard-container" style={{ position: 'relative' }}>
      <Chessboard 
        position={game.fen()} 
        onPieceDrop={onDrop} 
        onSquareClick={onSquareClick}
        boardOrientation={color || 'white'}
        customDarkSquareStyle={{ backgroundColor: '#2d3748' }}
        customLightSquareStyle={{ backgroundColor: '#a0aec0' }}
        customSquareStyles={{
          ...(moveFrom ? { [moveFrom]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' } } : {})
        }}
        animationDuration={200}
      />
      
      {promotionSquare && (
        <div className="promotion-dialog">
          <h4>Promote to:</h4>
          <div className="promotion-options">
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
