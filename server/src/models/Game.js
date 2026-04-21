const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  fen: { type: String, default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' },
  whitePlayer: { type: String, default: null },
  blackPlayer: { type: String, default: null },
  history: [{ type: String }], // Array of SAN moves
  status: { type: String, enum: ['waiting', 'playing', 'finished'], default: 'waiting' },
  winner: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Game', gameSchema);
