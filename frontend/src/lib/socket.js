import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true, // Important for sending cookies (JWT)
  autoConnect: true, // Prevent auto-connection; connect when authenticated
});

export default socket;
