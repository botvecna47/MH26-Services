// WebSocket service for real-time features
import { io, Socket } from 'socket.io-client';
import { authService } from './auth';
import { toast } from 'sonner@2.0.3';

interface WebSocketEvents {
  // Booking events
  'booking:created': (data: any) => void;
  'booking:updated': (data: any) => void;
  'booking:status_changed': (data: any) => void;
  
  // Message events
  'message:received': (data: any) => void;
  'message:typing': (data: any) => void;
  
  // Notification events
  'notification:new': (data: any) => void;
  'notification:read': (data: any) => void;
  
  // User events
  'user:online': (data: any) => void;
  'user:offline': (data: any) => void;
  
  // Provider events
  'provider:availability_changed': (data: any) => void;
  'provider:location_updated': (data: any) => void;
  
  // System events
  'system:maintenance': (data: any) => void;
  'system:announcement': (data: any) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return; // Server-side rendering guard

    const serverUrl = process.env.REACT_APP_WS_URL || 'http://localhost:3001';
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectInterval,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🟢 WebSocket connected');
      this.reconnectAttempts = 0;
      this.authenticate();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔴 WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toast.error('Unable to connect to server. Please check your internet connection.');
      }
    });

    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      toast.error('Connection error occurred');
    });

    // Authentication response
    this.socket.on('auth:success', (data) => {
      console.log('✅ WebSocket authenticated:', data);
      this.joinUserRoom();
    });

    this.socket.on('auth:error', (error) => {
      console.error('❌ WebSocket authentication failed:', error);
      this.disconnect();
    });

    // Real-time event handlers
    this.setupRealtimeHandlers();
  }

  private setupRealtimeHandlers() {
    if (!this.socket) return;

    // Booking events
    this.socket.on('booking:created', (data) => {
      toast.success('New booking request received!');
      this.notifyListeners('booking:created', data);
    });

    this.socket.on('booking:updated', (data) => {
      this.notifyListeners('booking:updated', data);
    });

    this.socket.on('booking:status_changed', (data) => {
      const statusMessages = {
        confirmed: '✅ Booking confirmed!',
        cancelled: '❌ Booking cancelled',
        completed: '🎉 Booking completed!',
        in_progress: '🚀 Service started!',
      };
      
      if (statusMessages[data.status as keyof typeof statusMessages]) {
        toast.info(statusMessages[data.status as keyof typeof statusMessages]);
      }
      
      this.notifyListeners('booking:status_changed', data);
    });

    // Message events
    this.socket.on('message:received', (data) => {
      if (Notification.permission === 'granted') {
        new Notification('New Message', {
          body: data.content,
          icon: '/favicon.ico',
        });
      }
      this.notifyListeners('message:received', data);
    });

    this.socket.on('message:typing', (data) => {
      this.notifyListeners('message:typing', data);
    });

    // Notification events
    this.socket.on('notification:new', (data) => {
      this.notifyListeners('notification:new', data);
    });

    // User presence events
    this.socket.on('user:online', (data) => {
      this.notifyListeners('user:online', data);
    });

    this.socket.on('user:offline', (data) => {
      this.notifyListeners('user:offline', data);
    });

    // Provider events
    this.socket.on('provider:availability_changed', (data) => {
      this.notifyListeners('provider:availability_changed', data);
    });

    // System events
    this.socket.on('system:maintenance', (data) => {
      toast.warning('System maintenance scheduled: ' + data.message);
      this.notifyListeners('system:maintenance', data);
    });

    this.socket.on('system:announcement', (data) => {
      toast.info(data.message);
      this.notifyListeners('system:announcement', data);
    });
  }

  private authenticate() {
    const token = authService.getAccessToken();
    if (token && this.socket) {
      this.socket.emit('auth:authenticate', { token });
    }
  }

  private joinUserRoom() {
    const authState = authService.getState();
    if (authState.user && this.socket) {
      this.socket.emit('user:join', {
        userId: authState.user.id,
        userType: authState.user.userType,
      });
    }
  }

  private notifyListeners(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // Public methods
  connect() {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  on<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    };
  }

  off(event: string, callback?: Function) {
    if (callback) {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    } else {
      this.listeners.delete(event);
    }
  }

  emit(event: string, data: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected. Cannot emit event:', event);
    }
  }

  // Booking specific methods
  emitBookingUpdate(bookingId: string, status: string) {
    this.emit('booking:update_status', { bookingId, status });
  }

  // Message specific methods
  emitMessage(bookingId: string, content: string, receiverId: string) {
    this.emit('message:send', { bookingId, content, receiverId });
  }

  emitTyping(bookingId: string, isTyping: boolean) {
    this.emit('message:typing', { bookingId, isTyping });
  }

  // Location tracking for providers
  emitLocationUpdate(location: { lat: number; lng: number }) {
    this.emit('provider:location_update', location);
  }

  // Availability updates
  emitAvailabilityChange(availability: any) {
    this.emit('provider:availability_change', availability);
  }

  // Join specific rooms
  joinBookingRoom(bookingId: string) {
    this.emit('booking:join', { bookingId });
  }

  leaveBookingRoom(bookingId: string) {
    this.emit('booking:leave', { bookingId });
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Request notification permission
  static async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
}

// Create singleton instance
export const wsService = new WebSocketService();

// React hook for WebSocket
import { useEffect, useRef } from 'react';

export function useWebSocket() {
  const wsRef = useRef(wsService);

  useEffect(() => {
    const authState = authService.getState();
    
    if (authState.isAuthenticated) {
      wsRef.current.connect();
    } else {
      wsRef.current.disconnect();
    }

    // Listen for auth state changes
    const unsubscribe = authService.subscribe((newAuthState) => {
      if (newAuthState.isAuthenticated) {
        wsRef.current.connect();
      } else {
        wsRef.current.disconnect();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return wsRef.current;
}

export default wsService;