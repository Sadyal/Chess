const gameService = require('../services/gameService');
const Game = require('../models/Game'); // Mongoose model for later DB integration

module.exports = (io, socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // When a player joins a room
  socket.on('joinRoom', async ({ roomId, playerName }) => {
    const gameData = gameService.getOrCreateGame(roomId);
    const players = gameData.players;

    let color = null;

    // Support reconnects and React StrictMode double-mounts
    if (players.white?.name === playerName) {
      color = 'white';
      players.white.id = socket.id;
    } else if (players.black?.name === playerName) {
      color = 'black';
      players.black.id = socket.id;
    } else if (!players.white) {
      color = 'white';
      players.white = { name: playerName, id: socket.id };
    } else if (!players.black) {
      color = 'black';
      players.black = { name: playerName, id: socket.id };
    } else {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    // Join socket to room
    socket.join(roomId);
    
    // Attach room and color info to the socket
    socket.data = { roomId, playerName, color };

    // Let the player know they joined
    socket.emit('joined', {
      roomId,
      color,
      fen: gameData.chess.fen(),
      turn: gameData.chess.turn() === 'w' ? 'white' : 'black'
    });

    // Notify others in room
    socket.to(roomId).emit('playerJoined', {
      playerName,
      color
    });

    // Check if both players are present
    if (players.white && players.black) {
      io.to(roomId).emit('gameStart', { message: 'Game started!' });
    }
  });

  // When a player makes a move
  socket.on('makeMove', ({ roomId, move }) => {
    const result = gameService.validateAndMakeMove(roomId, move);
    
    if (result.success) {
      // Broadcast the valid move and new FEN to everyone in the room
      io.to(roomId).emit('gameUpdate', {
        fen: result.fen,
        turn: result.turn,
        isGameOver: result.isGameOver,
        isCheckmate: result.isCheckmate,
        isDraw: result.isDraw
      });

      if (result.isGameOver) {
        // You could save the game to MongoDB here
      }
    } else {
      socket.emit('error', { message: result.error });
    }
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    if (socket.data && socket.data.roomId) {
      // Notify opponent
      io.to(socket.data.roomId).emit('opponentDisconnected');
      // Could also clean up gameService if room is empty
    }
  });
};
