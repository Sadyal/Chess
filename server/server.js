require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const gameHandler = require('./src/sockets/gameHandler');

const PORT = process.env.PORT || 5000;

// ✅ Create server
const server = http.createServer(app);

// ✅ Socket.IO setup (Render-safe)
const io = new Server(server, {
  cors: {
    origin: [
      "https://chess-black-seven.vercel.app",   // ✅ production domain
      "https://chess-dzj8l96rp-nikhil-sadyals-projects.vercel.app" // ✅ preview
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['polling', 'websocket']
});

// ✅ Attach socket handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  gameHandler(io, socket);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ✅ Health route
app.get('/', (req, res) => {
  res.send('Backend running 🚀');
});

// ✅ Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});