import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  console.log("[SocketContext] SocketContextProvider Rendered.");
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null); // Use a ref to hold the mutable socket instance
  const { currentUser } = useSelector(state => state.user);
  const { admin, token: adminToken } = useSelector(state => state.admin);

  console.log("[SocketContext] Component rendered.");
  console.log("[SocketContext] Initial currentUser:", currentUser);
  console.log("[SocketContext] Initial admin:", admin);
  console.log("[SocketContext] Initial adminToken:", adminToken);

  useEffect(() => {
    console.log("[SocketContext] useEffect triggered.");
    console.log("[SocketContext] useEffect dependencies: currentUser=", currentUser, "admin=", admin, "adminToken=", adminToken);
    console.log("[SocketContext] Current socketRef.current (start of useEffect):");
    console.dir(socketRef.current);
    console.log("[SocketContext] Current socket state (start of useEffect):");
    console.dir(socket);

    const userOrAdmin = currentUser || admin;
    // prefer explicit admin token from redux, fall back to persisted admin token
    const token = currentUser ? localStorage.getItem("user-token") : (adminToken || localStorage.getItem("admin-token"));

    console.log("[SocketContext] Inside useEffect - userOrAdmin:", userOrAdmin);
    console.log("[SocketContext] Inside useEffect - token:", token);
    console.log("[SocketContext] Condition `userOrAdmin && token`:", !!(userOrAdmin && token));

    // Only connect if user/admin and token exist, AND no socket is currently active
    if (userOrAdmin && token && !socketRef.current) {
      console.log("[SocketContext] Attempting to connect Socket.IO...");
      const newSocket = io("http://localhost:5001", {
        auth: {
          token: token,
        },
      });

      newSocket.on('connect', () => {
        console.log("[SocketContext] Socket.IO client connected!");
      });

      // Ensure we don't double-attach global listeners elsewhere by tracking connection status
      newSocket.on('broadcast:created', (payload) => {
        console.debug('[SocketContext] received broadcast:created (socket-level)');
      });
      newSocket.on('broadcast:deleted', (payload) => {
        console.debug('[SocketContext] received broadcast:deleted (socket-level)');
      });

      newSocket.on('disconnect', (reason) => {
        console.log(`[SocketContext] Socket.IO client disconnected: ${reason}`);
      });

      newSocket.on('connect_error', (error) => {
        console.error("[SocketContext] Socket.IO connection error:", error);
      });

      socketRef.current = newSocket; // Store the new socket in the ref
      setSocket(newSocket); // Update state to trigger re-render for consumers
      console.log("[SocketContext] New socket created and set. socketRef.current:");
      console.dir(socketRef.current);
      console.log("[SocketContext] New socket created and set. socket state:");
      console.dir(newSocket);

      newSocket.on('connectionSuccess', ({ userId }) => {
        console.log(`[SocketContext] Socket.IO connected successfully for user/admin ID: ${userId}`);
      });

      return () => {
        console.log("[SocketContext] Cleanup function triggered. socketRef.current before cleanup:");
        console.dir(socketRef.current);
        if (socketRef.current) {
          console.log("[SocketContext] Closing existing socket.");
          socketRef.current.off('connect');
          socketRef.current.off('disconnect');
          socketRef.current.off('connect_error');
          socketRef.current.off('connectionSuccess');
          socketRef.current.close();
          socketRef.current = null; // Clear the ref
        }
        setSocket(null); // Clear the state
        console.log("[SocketContext] Cleanup complete. socketRef.current:", socketRef.current, "socket state:", socket);
      };
    } else if (!userOrAdmin || !token) {
      // If user/admin or token is missing, ensure any existing socket is closed
      console.log("[SocketContext] No user/admin or token found. Closing existing socket if any.");
      if (socketRef.current) {
        console.log("[SocketContext] Closing existing socket due to missing auth.");
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.off('connectionSuccess');
        socketRef.current.close();
        socketRef.current = null; // Clear the ref
        setSocket(null); // Clear the state
      }
    } else if (userOrAdmin && token && socketRef.current) {
      console.log("[SocketContext] Socket already active and authenticated. No new connection needed.");
    }

  }, [currentUser, admin, adminToken]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
