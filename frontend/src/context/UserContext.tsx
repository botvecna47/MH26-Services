import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { axiosClient } from '../api/axiosClient';

type UserRole = 'CUSTOMER' | 'PROVIDER' | 'ADMIN' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  emailVerified?: boolean;
  address?: string;
  city?: string;
  walletBalance?: number;
  totalSpending?: number;
  isBanned?: boolean;                  // User banned status
  providerStatus?: string | null;     // Provider status: PENDING, APPROVED, REJECTED, SUSPENDED
  requiresOnboarding?: boolean;       // True if provider needs to complete/resubmit step 3
  provider?: {
    id: string;
    businessName: string;
    status: string;
    totalRevenue?: number;
  };
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isProvider: boolean;
  isBanned: boolean;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * UserProvider that syncs with localStorage (which is managed by AuthProvider)
 * This ensures UserContext stays in sync with the actual authentication state
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUserState] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
    }
    return null;
  });

  // Sync with localStorage (which is updated by AuthProvider)
  useEffect(() => {
    const syncUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Validate user data structure - basic check
          if (userData && userData.id) {
             // Only update if different to avoid re-renders loop if deep equality fails?
             // For now, straightforward set is safer than complex diffing here.
             setUserState(userData);
          } else {
            localStorage.removeItem('user');
            setUserState(null);
          }
        } else {
          setUserState(null);
        }
      } catch (error) {
        console.error('Error syncing user:', error);
        localStorage.removeItem('user');
        setUserState(null);
      }
    };

    window.addEventListener('storage', (e) => {
        if (e.key === 'user') syncUser();
    });

    const handleUserUpdate = () => syncUser();
    window.addEventListener('userUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  // Verify session with backend on mount
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Use axiosClient to leverage interceptors for token refresh
        const response = await axiosClient.get('/users/me');
        
        const freshUser = response.data;
        // Always update local storage with fresh data
        localStorage.setItem('user', JSON.stringify(freshUser));
        setUserState(freshUser);
      } catch (error: any) {
        console.error('Session verification error:', error);
        
        // If axios throws, it means response was not 2xx.
        // Check if it was auth error that interceptor couldn't fix
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn('Session verification failed (401/403), logging out.');
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUserState(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'ADMIN';
  const isProvider = user?.role === 'PROVIDER';
  const isBanned = user?.isBanned === true;

  // setUser function - updates localStorage which will trigger sync
  const setUser = (newUser: User | null) => {
    try {
      if (newUser) {
        localStorage.setItem('user', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      setUserState(newUser);
      window.dispatchEvent(new Event('userUpdated'));
    } catch (error) {
      console.error('Error setting user:', error);
      setUserState(newUser);
    }
  };

  const refreshProfile = async () => {
    window.dispatchEvent(new Event('userUpdated'));
  };

  return (
    <UserContext.Provider value={{ user, setUser, isAuthenticated, isAdmin, isProvider, isBanned, isLoading, refreshProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
