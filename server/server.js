require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const gameHandler = require('./src/sockets/gameHandler');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // Adjust for production
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  gameHandler(io, socket);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
