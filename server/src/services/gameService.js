const { Chess } = require('chess.js');

// In-memory store for active games
// Map room ID to chess instance
const activeGames = new Map();

class GameService {
  getOrCreateGame(roomId) {
    if (!activeGames.has(roomId)) {
      activeGames.set(roomId, { chess: new Chess(), players: { white: null, black: null } });
    }
    return activeGames.get(roomId);
  }

  getGame(roomId) {
    const gameData = activeGames.get(roomId);
    return gameData ? gameData.chess : null;
  }

  deleteGame(roomId) {
    activeGames.delete(roomId);
  }

  validateAndMakeMove(roomId, move) {
    const game = this.getGame(roomId);
    if (!game) return { success: false, error: 'Game not found' };

    try {
      const result = game.move(move);
      if (result) {
        return {
          success: true,
          fen: game.fen(),
          isGameOver: game.isGameOver(),
          isCheckmate: game.isCheckmate(),
          isDraw: game.isDraw(),
          turn: game.turn() === 'w' ? 'white' : 'black',
        };
      }
    } catch (e) {
      return { success: false, error: 'Invalid move' };
    }
    return { success: false, error: 'Invalid move' };
  }
}

module.exports = new GameService();
