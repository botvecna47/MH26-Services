import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserRole = 'CUSTOMER' | 'PROVIDER' | 'ADMIN' | null;

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isProvider: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * UserProvider that syncs with localStorage (which is managed by AuthProvider)
 * This ensures UserContext stays in sync with the actual authentication state
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);

  // Sync with localStorage (which is updated by AuthProvider)
  useEffect(() => {
    const syncUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Validate user data structure
          if (userData && userData.id && userData.email) {
            setUserState({
              id: userData.id,
              name: userData.name || 'User',
              email: userData.email,
              phone: userData.phone,
              role: (userData.role as UserRole) || null,
              avatarUrl: userData.avatarUrl,
            });
          } else {
            // Invalid user data, clear it
            localStorage.removeItem('user');
            setUserState(null);
          }
        } else {
          setUserState(null);
        }
      } catch (error) {
        // If parsing fails, clear invalid data
        console.error('Error syncing user:', error);
        localStorage.removeItem('user');
        setUserState(null);
      }
    };

    // Initial sync
    syncUser();

    // Listen for storage changes (when AuthProvider updates localStorage)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        syncUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Use a custom event for same-tab updates (more efficient than polling)
    const handleUserUpdate = () => {
      syncUser();
    };

    window.addEventListener('userUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'ADMIN';
  const isProvider = user?.role === 'PROVIDER';

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
      // Dispatch custom event for same-tab sync
      window.dispatchEvent(new Event('userUpdated'));
    } catch (error) {
      console.error('Error setting user:', error);
      // If localStorage fails, still update state
      setUserState(newUser);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, isAuthenticated, isAdmin, isProvider }}>
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
