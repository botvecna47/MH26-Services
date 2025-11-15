import { createContext, useContext, ReactNode } from 'react';
import { useNotifications as useNotificationsQuery, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../api/notifications';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
  meta?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  // Fetch notifications from API
  const { data: notificationsData, isLoading, error } = useNotificationsQuery();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  // Transform API notifications to match our interface
  // Handle both direct array and paginated response
  const notificationsArray = notificationsData?.data || notificationsData || [];
  const notifications: Notification[] = Array.isArray(notificationsArray) 
    ? notificationsArray.map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.payload?.title || n.type || 'Notification',
        body: n.payload?.body || n.payload?.message || n.text || '',
        read: n.read || false,
        createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
        meta: n.payload || n,
      }))
    : [];

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    // This is for local notifications (toasts, etc.)
    // Real notifications come from the API
    console.log('Local notification:', notification);
  };

  const markAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAsRead, markAllAsRead, unreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
