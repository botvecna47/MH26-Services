import { useNotifications } from '../context/NotificationContext';
import { Button } from './ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface NotificationDropdownProps {
  onClose: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
    >
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span className="font-semibold">Notifications</span>
        </div>
        {notifications.some(n => !n.read) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs h-7"
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{notification.body}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full mt-1 flex-shrink-0" />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-2 border-t border-gray-200 bg-gray-50">
          <Button variant="ghost" size="sm" className="w-full text-xs">
            View all notifications
          </Button>
        </div>
      )}
    </div>
  );
}
