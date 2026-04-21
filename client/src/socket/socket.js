import { io } from 'socket.io-client';

const URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_SERVER_URL || 'https://your-chess-backend.onrender.com') 
  : 'http://localhost:5000';

export const socket = io(URL, {
  autoConnect: true,
});
