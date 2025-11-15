/**
 * Socket.io Hook
 * Manages Socket.io connection with authentication
 */
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

const SOCKET_URL = (import.meta.env?.VITE_SOCKET_URL as string) || 'http://localhost:3000';

export function useSocket() {
  const { isAuthenticated, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      return;
    }

    // Connect to Socket.io
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // Socket connected - handle connection if needed
    });

    socket.on('disconnect', () => {
      // Socket disconnected - handle disconnection if needed
    });

    socket.on('error', (error) => {
      // TODO: Replace with proper error logging service
      // Log error to monitoring service (e.g., Sentry)
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user]);

  return socketRef.current;
}

