const express = require('express');
const cors = require('cors');

const app = express();

// ✅ Proper CORS setup
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// ✅ Health route
app.get('/', (req, res) => {
  res.send('Backend running 🚀');
});

// ✅ API health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Chess backend is running' });
});

module.exports = app;