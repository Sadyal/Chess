import { io } from 'socket.io-client';

// ✅ Correct backend URL handling
const URL = import.meta.env.PROD
  ? import.meta.env.VITE_BACKEND_URL
  : 'http://localhost:5000';

// ❗ Safety check
if (!URL) {
  throw new Error("Backend URL is not defined. Check VITE_BACKEND_URL");
}

// ✅ FINAL PRODUCTION SOCKET
export const socket = io(URL, {
  transports: ['polling', 'websocket'], // 🔥 FIX (polling FIRST)
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});