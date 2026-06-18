import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export const useSocket = (userId) => {
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io(`${import.meta.env.VITE_BACKEND_URL}`);
    if (userId) {
      socketRef.current.emit("join", userId);
    }
    return () => {
      socketRef.current.disconnect();
    };
  }, [userId]);

  return socketRef.current;
};