import { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useGameSocket } from '../hooks/useGameSocket';
import ChessBoardComponent from '../components/ChessBoardComponent';
import { LogOut, Loader2, Trophy, AlertTriangle } from 'lucide-react';

const Game = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const playerName = queryParams.get('name');

  const { gameState, makeMove } = useGameSocket(roomId, playerName);

  useEffect(() => {
    if (!playerName) {
      navigate('/');
    }
  }, [playerName, navigate]);

  if (gameState.error) {
    return (
      <div className="game-container center-content">
        <div className="glass-card error-card">
          <AlertTriangle size={48} className="icon-error" />
          <h2>Connection Error</h2>
          <p>{gameState.error}</p>
          <button className="btn-primary mt-4" onClick={() => navigate('/')}>Return Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <header className="game-header">
        <div className="room-info">
          <h2>Room: <span className="highlight">{roomId}</span></h2>
          <p>Playing as: <span className="highlight capitalize">{gameState.color || 'Spectator'}</span></p>
        </div>
        <button className="btn-icon" onClick={() => navigate('/')} title="Leave Room">
          <LogOut size={20} />
          Leave
        </button>
      </header>

      <main className="game-main">
        {!gameState.opponentJoined ? (
          <div className="waiting-overlay glass-card">
            <Loader2 className="spinner" size={48} />
            <h2>Waiting for Opponent...</h2>
            <p>Share Room ID <strong>{roomId}</strong> with a friend.</p>
          </div>
        ) : (
          <>
            <div className="board-section">
              <div className="board-wrapper glass-card">
                <ChessBoardComponent 
                  fen={gameState.fen} 
                  color={gameState.color} 
                  onMove={makeMove}
                  turn={gameState.turn}
                  isGameOver={gameState.isGameOver}
                />
              </div>
            </div>

            <div className="status-section glass-card">
              <h3>Game Status</h3>
              
              <div className={`turn-indicator ${gameState.turn}`}>
                It's {gameState.turn}'s turn
              </div>

              {gameState.isGameOver && (
                <div className="game-over-banner">
                  <Trophy size={32} className="icon-glow" />
                  <h4>Game Over!</h4>
                  {gameState.isCheckmate && <p>Checkmate!</p>}
                  {gameState.isDraw && <p>Draw!</p>}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Game;
