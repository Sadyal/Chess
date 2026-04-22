import { io } from 'socket.io-client';

// ✅ Correct backend URL handling
const URL = import.meta.env.PROD
  ? import.meta.env.VITE_BACKEND_URL   // 🔥 must match Vercel env
  : 'http://localhost:5000';

// ❗ Optional safety check (helps debugging)
if (!URL) {
  throw new Error("Backend URL is not defined. Check VITE_BACKEND_URL");
}

// ✅ Create socket connection
export const socket = io(URL, {
  transports: ['websocket'],   // 🔥 important for Render
  withCredentials: true,
  autoConnect: true,
});