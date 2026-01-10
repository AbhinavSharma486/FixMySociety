import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import io from "socket.io-client";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const { currentUser } = useSelector(state => state.user);
  const { admin, token: adminToken } = useSelector(state => state.admin);

  useEffect(() => {
    const userOrAdmin = currentUser || admin;
    const token = currentUser ? localStorage.getItem("user-token") : (adminToken || localStorage.getItem("admin-token"));

    if (userOrAdmin && token && !socketRef.current) {
      const newSocket = io(API_URL, {
        auth: {
          token: token,
        },
      });

      newSocket.on('connect', () => {
      });

      newSocket.on('broadcast:created', (payload) => {
      });
      newSocket.on('broadcast:deleted', (payload) => {
      });

      newSocket.on('disconnect', (reason) => {
      });

      newSocket.on('connect_error', (error) => {
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      newSocket.on('connectionSuccess', ({ userId }) => {
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.off('connect');
          socketRef.current.off('disconnect');
          socketRef.current.off('connect_error');
          socketRef.current.off('connectionSuccess');
          socketRef.current.close();
          socketRef.current = null;
        }
        setSocket(null);
      };
    } else if (!userOrAdmin || !token) {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.off('connectionSuccess');
        socketRef.current.close();
        socketRef.current = null;
        setSocket(null);
      }
    } else if (userOrAdmin && token && socketRef.current) {
    }

  }, [currentUser, admin, adminToken]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
