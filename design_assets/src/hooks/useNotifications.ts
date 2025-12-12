// Custom hook for managing notifications
import { useState, useEffect, useCallback } from 'react';
import { Notification } from '../types/database';
import { API } from '../services/api';
import { authService } from '../services/auth';
import { toast } from 'sonner@2.0.3';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
  });

  // Load notifications
  const loadNotifications = useCallback(async () => {
    const token = authService.getAccessToken();
    if (!token) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await API.Notification.getNotifications(token);
      
      if (response.success && response.data) {
        const notifications = response.data;
        const unreadCount = notifications.filter(n => !n.isRead).length;
        
        setState({
          notifications,
          unreadCount,
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Failed to load notifications',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error while loading notifications',
      }));
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    const token = authService.getAccessToken();
    if (!token) return;

    try {
      const response = await API.Notification.markAsRead(token, notificationId);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          notifications: prev.notifications.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, prev.unreadCount - 1),
        }));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    const token = authService.getAccessToken();
    if (!token) return;

    try {
      const response = await API.Notification.markAllAsRead(token);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          notifications: prev.notifications.map(n => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));
        
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  }, []);

  // Add new notification (for real-time updates)
  const addNotification = useCallback((notification: Notification) => {
    setState(prev => ({
      ...prev,
      notifications: [notification, ...prev.notifications],
      unreadCount: prev.unreadCount + (notification.isRead ? 0 : 1),
    }));

    // Show toast for new notification
    if (!notification.isRead) {
      toast.info(notification.title, {
        description: notification.message,
        action: {
          label: 'View',
          onClick: () => markAsRead(notification.id),
        },
      });
    }
  }, [markAsRead]);

  // Remove notification
  const removeNotification = useCallback((notificationId: string) => {
    setState(prev => {
      const notification = prev.notifications.find(n => n.id === notificationId);
      const unreadCountChange = notification && !notification.isRead ? -1 : 0;
      
      return {
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== notificationId),
        unreadCount: Math.max(0, prev.unreadCount + unreadCountChange),
      };
    });
  }, []);

  // Get notifications by type
  const getNotificationsByType = useCallback((type: string) => {
    return state.notifications.filter(n => n.type === type);
  }, [state.notifications]);

  // Get recent notifications (last 24 hours)
  const getRecentNotifications = useCallback(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return state.notifications.filter(n => 
      new Date(n.createdAt) > yesterday
    );
  }, [state.notifications]);

  // Auto-refresh notifications
  useEffect(() => {
    loadNotifications();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = authService.subscribe((authState) => {
      if (!authState.isAuthenticated) {
        setState({
          notifications: [],
          unreadCount: 0,
          isLoading: false,
          error: null,
        });
      } else {
        loadNotifications();
      }
    });

    return unsubscribe;
  }, [loadNotifications]);

  return {
    ...state,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    getNotificationsByType,
    getRecentNotifications,
  };
}

// Notification types and their configurations
export const notificationConfig = {
  booking_request: {
    title: 'New Booking Request',
    icon: '📅',
    color: 'blue',
    priority: 'high',
  },
  booking_confirmed: {
    title: 'Booking Confirmed',
    icon: '✅',
    color: 'green',
    priority: 'medium',
  },
  booking_cancelled: {
    title: 'Booking Cancelled',
    icon: '❌',
    color: 'red',
    priority: 'medium',
  },
  booking_completed: {
    title: 'Booking Completed',
    icon: '🎉',
    color: 'green',
    priority: 'low',
  },
  payment_received: {
    title: 'Payment Received',
    icon: '💰',
    color: 'green',
    priority: 'medium',
  },
  payment_failed: {
    title: 'Payment Failed',
    icon: '⚠️',
    color: 'red',
    priority: 'high',
  },
  review_received: {
    title: 'New Review',
    icon: '⭐',
    color: 'yellow',
    priority: 'low',
  },
  message_received: {
    title: 'New Message',
    icon: '💬',
    color: 'blue',
    priority: 'medium',
  },
  system_announcement: {
    title: 'System Announcement',
    icon: '📢',
    color: 'purple',
    priority: 'medium',
  },
};

// Utility function to get notification config
export function getNotificationConfig(type: string) {
  return notificationConfig[type as keyof typeof notificationConfig] || {
    title: 'Notification',
    icon: '🔔',
    color: 'gray',
    priority: 'low',
  };
}

export default useNotifications;