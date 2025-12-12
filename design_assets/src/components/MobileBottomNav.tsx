import { Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageSquare, LayoutDashboard, User } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useUser();

  const isActive = (path: string) => location.pathname === path;

  const navItems = isAuthenticated
    ? [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/services', icon: Search, label: 'Services' },
        { path: '/messages', icon: MessageSquare, label: 'Messages' },
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      ]
    : [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/services', icon: Search, label: 'Services' },
        { path: '/auth', icon: User, label: 'Sign In' },
      ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-strong border-t border-white/30 z-50 shadow-lg">
      <div className="flex justify-around items-center h-16 safe-bottom">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-95 ${
              isActive(item.path)
                ? 'text-[#ff6b35]'
                : 'text-gray-600 hover:text-[#ff6b35]'
            }`}
          >
            <item.icon className={`h-6 w-6 ${isActive(item.path) ? 'fill-current' : ''}`} />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}