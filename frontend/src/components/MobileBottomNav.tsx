import { Link, useLocation } from 'react-router-dom';
import { Home, Search, LayoutDashboard } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useUser();

  const isActive = (path: string) => location.pathname === path;

  const navItems = isAuthenticated
    ? [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/services', icon: Search, label: 'Services' },
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      ]
    : [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/services', icon: Search, label: 'Services' },
      ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive(item.path)
            } ${
              isActive(item.path)
                ? 'text-[#ff6b35]'
                : 'text-gray-600'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
