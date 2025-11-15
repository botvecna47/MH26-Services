import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Star,
  Package,
  X,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'default';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-warning" />;
      case 'info':
        return <Info className="w-5 h-5 text-info" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white rounded-full flex items-center justify-center text-xs font-medium"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h4 className="font-semibold">Notifications</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {unreadCount} unread
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onMarkAllAsRead}
              className="text-xs"
            >
              <Check className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <AnimatePresence>
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => !notification.read && onMarkAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDismiss(notification.id);
                            }}
                            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {notification.time}
                          </span>
                          {!notification.read && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// Sample notifications for demonstration
export const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'New Booking Confirmed',
    message: 'Your service booking #48219 has been confirmed',
    time: '2 minutes ago',
    read: false,
  },
  {
    id: '2',
    type: 'info',
    title: 'Provider Application',
    message: 'A new provider has submitted their application for review',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Payment Pending',
    message: 'You have a pending payment of ₹1,200 for booking #48210',
    time: '3 hours ago',
    read: false,
  },
  {
    id: '4',
    type: 'success',
    title: 'Review Received',
    message: 'You received a 5-star review from Devansh Patel',
    time: 'Yesterday',
    read: true,
  },
  {
    id: '5',
    type: 'default',
    title: 'Profile Updated',
    message: 'Your profile information has been successfully updated',
    time: '2 days ago',
    read: true,
  },
];
