/**
 * Authentication Hook and Context
 * Manages user authentication state and token storage
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosClient } from '../api/axiosClient';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: 'CUSTOMER' | 'PROVIDER';
  otp?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Throttle refreshUser to prevent rate limiting
  let lastRefreshTime = 0;
  const REFRESH_THROTTLE_MS = 10000; // Only allow refresh every 10 seconds

  // Define refreshUser first (before useEffect that uses it)
  const refreshUser = async (): Promise<void> => {
    const now = Date.now();
    if (now - lastRefreshTime < REFRESH_THROTTLE_MS) {
      // Too soon, skip this refresh
      return;
    }
    lastRefreshTime = now;
    
    // Check if we have a token before making the request
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      // No token, user is not authenticated - don't make request
      setUser(null);
      return;
    }
    
    try {
      const response = await axiosClient.get('/users/me');
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      // Dispatch event to sync UserContext
      window.dispatchEvent(new Event('userUpdated'));
    } catch (error: any) {
      // Only handle 401 errors silently (expected when token is invalid)
      if (error?.response?.status === 401) {
        // Token invalid, logout silently (don't show error toast or log)
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        window.dispatchEvent(new Event('userUpdated'));
      }
      // For other errors, let them propagate (but don't log expected 401s)
      // Don't navigate here to avoid redirect loops
    }
  };

  // Initialize user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');
        
        if (storedUser && accessToken) {
          try {
            const userData = JSON.parse(storedUser);
            // Validate user data structure
            if (userData && userData.id && userData.email) {
              setUser(userData);
              // Dispatch event to sync UserContext
              try {
                window.dispatchEvent(new Event('userUpdated'));
              } catch (e) {
                // Ignore event dispatch errors
              }
              
              // Optionally verify token is still valid (non-blocking)
              // Don't await this to prevent blocking the UI
              setTimeout(() => {
                refreshUser().catch(() => {
                  // If refresh fails, user will be logged out
                  // This is handled by refreshUser itself
                });
              }, 100);
            } else {
              // Invalid user data, clear it
              localStorage.removeItem('user');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
            }
          } catch (error) {
            // Invalid JSON, clear it
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear potentially corrupted data
        try {
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        } catch (e) {
          // Ignore localStorage errors
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Use setTimeout to ensure this runs after initial render
    const timer = setTimeout(() => {
      loadUser();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      const { user: userData, tokens } = response.data;

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      // Dispatch event to sync UserContext
      window.dispatchEvent(new Event('userUpdated'));
      toast.success('Welcome back!');

      // Navigate based on role
      if (userData.role === 'ADMIN') {
        navigate('/admin');
      } else if (userData.role === 'PROVIDER') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<any> => {
    try {
      const response = await axiosClient.post('/auth/register', data);
      
      // Check if OTP is required
      if (response.data.requiresOTP) {
        return { requiresOTP: true };
      }

      const { user: userData, tokens } = response.data;

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      // Dispatch event to sync UserContext
      window.dispatchEvent(new Event('userUpdated'));
      toast.success('Account created successfully!');

      // Navigate based on role
      if (userData.role === 'PROVIDER') {
        navigate('/provider-onboarding');
      } else {
        navigate('/dashboard');
      }
      
      return { success: true };
    } catch (error: any) {
      // If error indicates OTP required, return that
      if (error.response?.data?.requiresOTP || error.response?.status === 200) {
        return { requiresOTP: true };
      }
      toast.error(error.response?.data?.error || 'Registration failed');
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await axiosClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      // TODO: Replace with proper error logging service
      // Log error to monitoring service (e.g., Sentry)
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      // Dispatch event to sync UserContext
      window.dispatchEvent(new Event('userUpdated'));
      navigate('/auth');
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

