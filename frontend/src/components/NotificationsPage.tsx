import { useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { format } from 'date-fns';
import { Bell, Check, Trash2, MailOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  // Mark all as read when visiting page (optional, user might prefer manual)
  // useEffect(() => {
  //   markAllAsRead();
  // }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-[#ff6b35]" />
            Notifications
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            You have {unreadCount} unread notifications
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all hover:shadow-md ${
                !notification.read ? 'bg-orange-50/50 border-orange-100' : 'bg-white'
              }`}
            >
              <CardContent className="p-4 flex gap-4">
                <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${
                  !notification.read ? 'bg-orange-100 text-[#ff6b35]' : 'bg-gray-100 text-gray-500'
                }`}>
                  <MailOpen className="h-5 w-5" />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.body}
                  </p>
                  
                  {!notification.read && (
                    <div className="mt-3 flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs h-7 text-[#ff6b35] hover:text-[#e65a25] hover:bg-orange-50"
                      >
                        Mark as read
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
