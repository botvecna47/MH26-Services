import { Link, useLocation } from 'react-router-dom';
import { Bell, User, LogOut, Settings } from 'lucide-react';
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
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
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
                    <Button variant="ghost" size="sm" className="pl-2 pr-3 py-1.5 h-10 gap-2 hover:bg-white/50 data-[state=open]:bg-white/50 rounded-full border border-transparent hover:border-gray-200 transition-all duration-200 group">
                      <div className="h-8 w-8 bg-gradient-to-br from-[#ff6b35] to-[#ff9f7d] rounded-full flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="hidden sm:inline font-medium text-gray-700 group-hover:text-gray-900">{user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-0 overflow-hidden bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20">
                    <div className="px-5 py-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 font-medium truncate mt-0.5">{user?.email}</p>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                            isAdmin ? 'bg-purple-100 text-purple-700 border-purple-200' :
                            isProvider ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            'bg-green-100 text-green-700 border-green-200'
                        }`}>
                            {user?.role}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-1.5">
                        <DropdownMenuItem asChild className="rounded-lg hover:bg-orange-50 focus:bg-orange-50 cursor-pointer px-3 py-2.5">
                        <Link to="/dashboard?tab=profile" className="flex items-center w-full">
                            <div className="mr-3 p-1.5 bg-gray-100 rounded-md group-hover:bg-white">
                                <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="flex-1">
                                <span className="text-sm font-medium text-gray-700">My Profile</span>
                            </div>
                        </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild className="rounded-lg hover:bg-orange-50 focus:bg-orange-50 cursor-pointer px-3 py-2.5">
                        <Link to="/dashboard?tab=overview" className="flex items-center w-full">
                            <div className="mr-3 p-1.5 bg-gray-100 rounded-md group-hover:bg-white">
                                <Settings className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="flex-1">
                                <span className="text-sm font-medium text-gray-700">Dashboard</span>
                            </div>
                        </Link>
                        </DropdownMenuItem>
                    </div>

                    <div className="p-1.5 border-t border-gray-100">
                        <DropdownMenuItem onClick={handleLogout} className="rounded-lg hover:bg-red-50 focus:bg-red-50 cursor-pointer px-3 py-2.5 text-red-600 focus:text-red-700">
                            <div className="mr-3 p-1.5 bg-red-100 rounded-md">
                                <LogOut className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-semibold">Sign Out</span>
                        </DropdownMenuItem>
                    </div>
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
                <Link to="/auth?mode=signup">
                  <Button size="sm" className="bg-[#ff6b35] hover:bg-[#ff5722] shadow-lg">
                    Sign Up
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