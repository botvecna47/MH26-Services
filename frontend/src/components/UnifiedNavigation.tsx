import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, User, LogOut, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useUser } from '../context/UserContext';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export default function UnifiedNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isProvider } = useUser();
  const { logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white">MH</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-semibold text-gray-900">MH26 Services</div>
              <div className="text-xs text-gray-500">Nanded, Maharashtra</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`${
                isActive('/') ? 'text-primary-500' : 'text-gray-600 hover:text-primary-500'
              } transition-colors`}
            >
              Home
            </Link>
            <Link
              to="/services"
              className={`${
                isActive('/services') ? 'text-primary-500' : 'text-gray-600 hover:text-primary-500'
              } transition-colors`}
            >
              Services
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`${
                  isActive('/dashboard') ? 'text-primary-500' : 'text-gray-600 hover:text-primary-500'
                } transition-colors`}
              >
                Dashboard
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/messages"
                className={`${
                  isActive('/messages') ? 'text-primary-500' : 'text-gray-600 hover:text-primary-500'
                } transition-colors`}
              >
                Messages
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`${
                  isActive('/admin') ? 'text-primary-500' : 'text-gray-600 hover:text-primary-500'
                } transition-colors`}
              >
                Admin
              </Link>
            )}
            {!isAuthenticated && !isProvider && (
              <Link to="/provider-onboarding">
                <Button variant="outline" size="sm">
                  Become a Provider
                </Button>
              </Link>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                  {showNotifications && (
                    <NotificationDropdown onClose={() => setShowNotifications(false)} />
                  )}
                </div>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatarUrl} />
                        <AvatarFallback>
                          {user?.name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline">{user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg">
                    <div className="px-2 py-2 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user?.avatarUrl} />
                          <AvatarFallback>
                            {user?.name?.charAt(0)?.toUpperCase() || <User className="h-5 w-5" />}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                        </div>
                      </div>
                      <p className="text-xs text-primary-600 font-medium">Role: {user?.role || 'N/A'}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" variant="default">
                    Become a Provider
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
