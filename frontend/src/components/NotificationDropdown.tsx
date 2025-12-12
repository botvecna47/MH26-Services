import { useNotifications } from '../context/NotificationContext';
import { Button } from './ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, CheckCheck, Calendar, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface NotificationDropdownProps {
  onClose: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    
    // Navigate based on payload
    if (notification.bookingId) {
        navigate(`/dashboard?bookingId=${notification.bookingId}`);
    } else if (notification.type === 'BOOKING_REQUEST') {
         // Provider specific logic if needed, but dashboard generally handles it
         navigate(`/dashboard?tab=schedule`);
    } else {
        navigate('/dashboard');
    }
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
        case 'BOOKING_UPDATE': return <Calendar className="h-4 w-4 text-blue-500" />;
        case 'BOOKING_REQUEST': return <Calendar className="h-4 w-4 text-[#ff6b35]" />;
        case 'COMPLETION_OTP': 
        case 'COMPLETION_INITIATED': return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'PAYMENT_SUCCESS': return <Check className="h-4 w-4 text-green-500" />;
        default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
    >
      <div className="p-4 bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-100 rounded-lg">
             <Bell className="h-4 w-4 text-[#ff6b35]" />
          </div>
          <span className="font-semibold text-gray-900">Notifications</span>
        </div>
        {notifications.some(n => !n.read) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs h-8 text-[#ff6b35] hover:text-[#e45a25] hover:bg-orange-50"
          >
            <CheckCheck className="h-3 w-3 mr-1.5" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="max-h-[28rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center">
            <div className="bg-gray-50 p-4 rounded-full mb-3">
                <Bell className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-900">All caught up!</p>
            <p className="text-xs text-gray-500 mt-1">No new notifications to show.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map(notification => (
                <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 group relative ${
                    !notification.read ? 'bg-orange-50/30' : 'bg-white'
                }`}
                >
                {!notification.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff6b35]" />
                )}
                <div className="flex gap-3">
                    <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center border shadow-sm flex-shrink-0 ${
                        !notification.read ? 'bg-white border-orange-100' : 'bg-gray-50 border-gray-100'
                    }`}>
                        {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                {notification.title}
                            </p>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                        <p className={`text-xs mt-1 line-clamp-2 ${!notification.read ? 'text-gray-600' : 'text-gray-500'}`}>
                            {notification.body}
                        </p>
                    </div>
                </div>
                </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-gray-100 bg-gray-50">
        <Button variant="ghost" size="sm" className="w-full text-xs text-gray-600 hover:text-gray-900 justify-center h-8" onClick={() => { navigate('/dashboard'); onClose(); }}>
          View Dashboard
        </Button>
      </div>
    </div>
  );
}
