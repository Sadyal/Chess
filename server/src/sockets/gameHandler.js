const gameService = require('../services/gameService');

module.exports = (io, socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // JOIN ROOM
  socket.on('joinRoom', ({ roomId, playerName }) => {
    if (!roomId) {
      socket.emit('error', { message: 'Room ID required' });
      return;
    }

    const gameData = gameService.getOrCreateGame(roomId);
    const players = gameData.players;

    let color = 'spectator';

    // ✅ STRICT SLOT ASSIGNMENT (NO NAME DEPENDENCY)
    if (!players.white) {
      players.white = { id: socket.id, name: playerName || 'Player 1' };
      color = 'white';
    } else if (!players.black) {
      players.black = { id: socket.id, name: playerName || 'Player 2' };
      color = 'black';
    } else {
      color = 'spectator';
    }

    // Join room
    socket.join(roomId);

    // Save socket metadata
    socket.data = { roomId, color };

    console.log(`JOIN → Room: ${roomId}`);
    console.log("PLAYERS:", players);

    // Send initial state
    socket.emit('joined', {
      roomId,
      color,
      fen: gameData.chess.fen(),
      turn: gameData.chess.turn() === 'w' ? 'white' : 'black'
    });

    // Notify others
    socket.to(roomId).emit('playerJoined', {
      playerName,
      color
    });

    // Start game if ready
    if (players.white && players.black) {
      io.to(roomId).emit('gameStart', {
        message: 'Game started!',
        players
      });
    }
  });

  // MAKE MOVE
  socket.on('makeMove', ({ roomId, move }) => {
    const gameData = gameService.getOrCreateGame(roomId);

    // ❗ Prevent spectators from moving
    if (socket.data?.color === 'spectator') {
      socket.emit('error', { message: 'Spectators cannot move' });
      return;
    }

    const result = gameService.validateAndMakeMove(roomId, move);

    if (result.success) {
      io.to(roomId).emit('gameUpdate', {
        fen: result.fen,
        turn: result.turn,
        isGameOver: result.isGameOver,
        isCheckmate: result.isCheckmate,
        isDraw: result.isDraw
      });
    } else {
      socket.emit('error', { message: result.error });
    }
  });

  // DISCONNECT (CRITICAL FIX)
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);

    const { roomId, color } = socket.data || {};
    if (!roomId) return;

    const gameData = gameService.getOrCreateGame(roomId);
    const players = gameData.players;

    // ✅ FREE SLOT WHEN PLAYER LEAVES
    if (color === 'white' && players.white?.id === socket.id) {
      players.white = null;
    }

    if (color === 'black' && players.black?.id === socket.id) {
      players.black = null;
    }

    console.log("AFTER DISCONNECT:", players);

    socket.to(roomId).emit('opponentDisconnected');
  });
};