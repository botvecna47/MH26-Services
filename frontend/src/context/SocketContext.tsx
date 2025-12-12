import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUser } from './UserContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Initialize socket outside component to prevent multiple connections during re-renders
// But we need auth token, so we'll connect inside effect
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    // Only connect if user is logged in AND we have a token
    if (!user || !token) {
        if (socket) {
            socket.disconnect();
            setSocket(null);
            setIsConnected(false);
        }
        return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: {
        token, // Pass JWT
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      // Join user-specific room
      newSocket.emit('join', user.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        // If authentication error, likely expired token.
        if (err.message.includes('Authentication error') || err.message.includes('Invalid token')) {
             // Token invalid - force logout to prevent infinite retry loops
             console.error('Socket Auth Failed - Forcing Logout');
             localStorage.removeItem('user');
             localStorage.removeItem('accessToken');
             localStorage.removeItem('refreshToken');
             window.location.href = '/login'; 
        }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id]); // Re-connect only if user ID changes (login/logout)

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
