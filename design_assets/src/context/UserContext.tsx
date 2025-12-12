import { createContext, useContext, useState, ReactNode } from 'react';

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

export function UserProvider({ children }: { children: ReactNode }) {
  // Start logged out - users must sign in via /auth
  // For testing different roles, use the role switcher in the user menu after signing in
  const [user, setUser] = useState<User | null>(null);

  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'ADMIN';
  const isProvider = user?.role === 'PROVIDER';

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
