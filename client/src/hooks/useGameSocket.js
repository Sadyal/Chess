import { useEffect, useState } from 'react';
import { socket } from '../socket/socket';

export const useGameSocket = (roomId, playerName) => {
  const [gameState, setGameState] = useState({
    fen: 'start',
    turn: 'white',
    color: null,
    isGameOver: false,
    isCheckmate: false,
    isDraw: false,
    opponentJoined: false,
    error: null,
  });

  useEffect(() => {
    // Join room when component mounts
    if (roomId && playerName) {
      socket.emit('joinRoom', { roomId, playerName });
    }

    const onJoined = (data) => {
      setGameState(prev => ({ ...prev, fen: data.fen, turn: data.turn, color: data.color }));
    };

    const onPlayerJoined = (data) => {
      setGameState(prev => ({ ...prev, opponentJoined: true }));
    };

    const onGameStart = () => {
      setGameState(prev => ({ ...prev, opponentJoined: true }));
    };

    const onGameUpdate = (data) => {
      setGameState(prev => ({
        ...prev,
        fen: data.fen,
        turn: data.turn,
        isGameOver: data.isGameOver,
        isCheckmate: data.isCheckmate,
        isDraw: data.isDraw
      }));
    };

    const onError = (data) => {
      setGameState(prev => ({ ...prev, error: data.message }));
    };

    const onOpponentDisconnected = () => {
      setGameState(prev => ({ ...prev, opponentJoined: false, error: 'Opponent disconnected.' }));
    };

    socket.on('joined', onJoined);
    socket.on('playerJoined', onPlayerJoined);
    socket.on('gameStart', onGameStart);
    socket.on('gameUpdate', onGameUpdate);
    socket.on('error', onError);
    socket.on('opponentDisconnected', onOpponentDisconnected);

    return () => {
      socket.off('joined', onJoined);
      socket.off('playerJoined', onPlayerJoined);
      socket.off('gameStart', onGameStart);
      socket.off('gameUpdate', onGameUpdate);
      socket.off('error', onError);
      socket.off('opponentDisconnected', onOpponentDisconnected);
    };
  }, [roomId, playerName]);

  const makeMove = (move) => {
    socket.emit('makeMove', { roomId, move });
  };

  return { gameState, makeMove };
};
