import io from 'socket.io-client';

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";


const socket = io(API_URL, {
  withCredentials: true, // Important for sending cookies (JWT)
  autoConnect: true, // Prevent auto-connection; connect when authenticated
});

export default socket;
