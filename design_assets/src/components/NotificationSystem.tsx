import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  Star, 
  MessageCircle,
  Clock,
  TrendingUp,
  User,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";

interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'review' | 'system' | 'message' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  metadata?: any;
}

interface NotificationSystemProps {
  userType: 'customer' | 'provider' | 'admin';
  userId: string;
}

export function NotificationSystem({ userType, userId }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'today'>('all');

  // Mock notifications - in real app this would come from API/WebSocket
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'booking',
        title: 'New Booking Request',
        message: userType === 'provider' 
          ? 'You have a new booking request from Priya Sharma for pipe repair.'
          : 'Your booking with QuickFix Plumbing has been confirmed.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        priority: 'high'
      },
      {
        id: '2',
        type: 'payment',
        title: 'Payment Processed',
        message: userType === 'provider'
          ? 'Payment of ₹400 has been credited to your account.'
          : 'Payment of ₹400 has been processed for your recent service.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        priority: 'medium'
      },
      {
        id: '3',
        type: 'review',
        title: 'New Review Received',
        message: userType === 'provider'
          ? 'You received a 5-star review from Rajesh Kumar.'
          : 'Please rate your recent service with Maharashtrian Tiffin.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
        priority: 'low'
      },
      {
        id: '4',
        type: 'system',
        title: userType === 'admin' ? 'System Alert' : 'Service Update',
        message: userType === 'admin'
          ? 'Server load is above 80%. Monitoring required.'
          : 'New features have been added to your dashboard.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        read: true,
        priority: userType === 'admin' ? 'high' : 'low'
      }
    ];

    setNotifications(mockNotifications);
  }, [userType]);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 30 seconds
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: ['booking', 'payment', 'message'][Math.floor(Math.random() * 3)] as any,
          title: 'Real-time Update',
          message: 'This is a simulated real-time notification.',
          timestamp: new Date(),
          read: false,
          priority: 'medium'
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        toast.info('New notification received!');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'today':
        const today = new Date();
        return notification.timestamp.toDateString() === today.toDateString();
      default:
        return true;
    }
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking':
        return Calendar;
      case 'payment':
        return DollarSign;
      case 'review':
        return Star;
      case 'message':
        return MessageCircle;
      case 'system':
        return Settings;
      case 'reminder':
        return Clock;
      default:
        return Bell;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-100 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </Button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-12 w-96 bg-white border border-border rounded-lg shadow-xl z-50"
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Filter Tabs */}
                <div className="flex space-x-1 bg-muted rounded-lg p-1">
                  {(['all', 'unread', 'today'] as const).map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType)}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        filter === filterType
                          ? 'bg-white text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {filterType === 'all' ? 'All' : 
                       filterType === 'unread' ? `Unread (${unreadCount})` : 'Today'}
                    </button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="pt-0 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No notifications</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => {
                      const IconComponent = getNotificationIcon(notification.type);
                      
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                            notification.read 
                              ? 'bg-muted/30 border-border' 
                              : 'bg-white border-primary/20 shadow-sm hover:shadow-md'
                          }`}
                          onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              notification.read ? 'bg-muted' : 'bg-primary/10'
                            }`}>
                              <IconComponent className={`w-4 h-4 ${
                                notification.read ? 'text-muted-foreground' : 'text-primary'
                              }`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <h4 className={`font-medium text-sm ${
                                  notification.read ? 'text-muted-foreground' : 'text-foreground'
                                }`}>
                                  {notification.title}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  <Badge className={`text-xs px-2 py-0.5 ${getPriorityColor(notification.priority)}`}>
                                    {notification.priority}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 p-1 h-auto"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              <p className={`text-xs mt-1 ${
                                notification.read ? 'text-muted-foreground' : 'text-foreground'
                              }`}>
                                {notification.message}
                              </p>
                              
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatTime(notification.timestamp)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* Actions */}
                {filteredNotifications.length > 0 && (
                  <div className="pt-4 border-t mt-4 space-y-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={markAllAsRead}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark all as read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setIsOpen(false);
                        toast.info('Notification settings coming soon!');
                      }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Notification Settings
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}