/**
 * Socket.io Client
 * Can be replaced with real Socket.io instance
 */
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta.env?.VITE_SOCKET_URL as string) || 'http://localhost:3000';

let socketInstance: Socket | null = null;

export function getSocket(token?: string): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
  }
  return socketInstance;
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export default getSocket;

