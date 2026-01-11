import io from 'socket.io-client';

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : import.meta.env.VITE_BACKEND_URL;


const socket = io(API_URL, {
  withCredentials: true, // Important for sending cookies (JWT)
  autoConnect: true, // Prevent auto-connection; connect when authenticated
  transports: ["websocket"], 
});

export default socket;
