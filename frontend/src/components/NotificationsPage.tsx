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
    <div className="max-w-4xl mx-auto px-2 md:px-4 py-4 md:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Bell className="h-5 w-5 md:h-6 md:w-6 text-[#ff6b35]" />
            Notifications
          </h1>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            You have {unreadCount} unread notifications
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" size="sm" className="text-xs md:text-sm">
            <Check className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Mark all as read</span>
            <span className="sm:hidden">Mark all</span>
          </Button>
        )}
      </div>

      <div className="space-y-2 md:space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 md:py-12 bg-gray-50 rounded-xl border border-gray-100">
            <Bell className="h-10 w-10 md:h-12 md:w-12 text-gray-300 mx-auto mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-900">No notifications</h3>
            <p className="text-gray-500 text-sm">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all hover:shadow-md ${
                !notification.read ? 'bg-orange-50/50 border-orange-100' : 'bg-white'
              }`}
            >
              <CardContent className="p-3 md:p-4 flex gap-2 md:gap-4">
                <div className={`mt-0.5 md:mt-1 p-1.5 md:p-2 rounded-full flex-shrink-0 ${
                  !notification.read ? 'bg-orange-100 text-[#ff6b35]' : 'bg-gray-100 text-gray-500'
                }`}>
                  <MailOpen className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-xs md:text-sm font-semibold truncate ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-[10px] md:text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                      {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  
                  <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">
                    {notification.body}
                  </p>
                  
                  {!notification.read && (
                    <div className="mt-2 md:mt-3 flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => markAsRead(notification.id)}
                        className="text-[10px] md:text-xs h-6 md:h-7 text-[#ff6b35] hover:text-[#e65a25] hover:bg-orange-50 px-2"
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
