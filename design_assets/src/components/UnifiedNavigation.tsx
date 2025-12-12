import { Link, useLocation } from 'react-router-dom';
import { Bell, Menu, User, LogOut, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { useUser } from '../context/UserContext';
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
  const { user, setUser, isAuthenticated, isAdmin, isProvider } = useUser();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    setUser(null);
  };

  const handleToggleRole = (role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN') => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#ff6b35] rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white">MH</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-semibold text-gray-900">MH26 Services</div>
              <div className="text-xs text-gray-600">Nanded, Maharashtra</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`${
                isActive('/') ? 'text-[#ff6b35]' : 'text-gray-700 hover:text-[#ff6b35]'
              } transition-colors font-medium`}
            >
              Home
            </Link>
            <Link
              to="/services"
              className={`${
                isActive('/services') ? 'text-[#ff6b35]' : 'text-gray-700 hover:text-[#ff6b35]'
              } transition-colors font-medium`}
            >
              Services
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`${
                  isActive('/dashboard') ? 'text-[#ff6b35]' : 'text-gray-700 hover:text-[#ff6b35]'
                } transition-colors font-medium`}
              >
                Dashboard
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/messages"
                className={`${
                  isActive('/messages') ? 'text-[#ff6b35]' : 'text-gray-700 hover:text-[#ff6b35]'
                } transition-colors font-medium`}
              >
                Messages
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`${
                  isActive('/admin') ? 'text-[#ff6b35]' : 'text-gray-700 hover:text-[#ff6b35]'
                } transition-colors font-medium`}
              >
                Admin
              </Link>
            )}
            {!isAuthenticated && !isProvider && (
              <Link to="/provider-onboarding">
                <Button variant="outline" size="sm" className="border-white/30 hover:bg-white/20">
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
                    className="relative hover:bg-white/20"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#ff6b35] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
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
                    <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/20">
                      <User className="h-5 w-5" />
                      <span className="hidden sm:inline">{user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass">
                    <div className="px-2 py-2">
                      <p className="text-sm">{user?.name}</p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                      <p className="text-xs text-[#ff6b35] mt-1">Role: {user?.role}</p>
                    </div>
                    <DropdownMenuSeparator />
                    {/* Role switcher for testing */}
                    <div className="px-2 py-1">
                      <p className="text-xs text-gray-600 mb-1">Switch Role (Testing):</p>
                      <div className="flex gap-1">
                        <Button
                          variant={user?.role === 'CUSTOMER' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleRole('CUSTOMER')}
                          className="text-xs h-7"
                        >
                          User
                        </Button>
                        <Button
                          variant={user?.role === 'PROVIDER' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleRole('PROVIDER')}
                          className="text-xs h-7"
                        >
                          Provider
                        </Button>
                        <Button
                          variant={user?.role === 'ADMIN' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleRole('ADMIN')}
                          className="text-xs h-7"
                        >
                          Admin
                        </Button>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="hover:bg-white/20">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="bg-[#ff6b35] hover:bg-[#ff5722] shadow-lg">
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