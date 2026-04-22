require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const gameHandler = require('./src/sockets/gameHandler');

const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB
connectDB();

// ✅ Create server
const server = http.createServer(app);

// ✅ Socket.IO setup (FIXED)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*', // 🔥 important
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ✅ Socket connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  gameHandler(io, socket);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ✅ Health check route (REQUIRED for Render debugging)
app.get('/', (req, res) => {
  res.send('Backend running 🚀');
});

// ✅ Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});