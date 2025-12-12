// Authentication Service with proper token management
import { User, AuthTokens, LoginCredentials, RegisterData } from '../types/database';
import { API } from './api';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

class AuthService {
  private state: AuthState = {
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
  };

  private listeners: Array<(state: AuthState) => void> = [];

  // Subscribe to auth state changes
  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of state changes
  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Get current auth state
  getState(): AuthState {
    return { ...this.state };
  }

  // Initialize auth service (check for existing session)
  async init(): Promise<void> {
    this.state.isLoading = true;
    this.notify();

    try {
      const tokens = this.getStoredTokens();
      if (tokens) {
        const response = await API.User.getProfile(tokens.accessToken);
        if (response.success && response.data) {
          this.state = {
            user: response.data,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          };
          this.notify();
          return;
        } else {
          // Invalid token, try to refresh
          const refreshResponse = await API.Auth.refreshToken(tokens.refreshToken);
          if (refreshResponse.success && refreshResponse.data) {
            this.storeTokens(refreshResponse.data);
            const userResponse = await API.User.getProfile(refreshResponse.data.accessToken);
            if (userResponse.success && userResponse.data) {
              this.state = {
                user: userResponse.data,
                tokens: refreshResponse.data,
                isAuthenticated: true,
                isLoading: false,
              };
              this.notify();
              return;
            }
          }
          // Refresh failed, clear tokens
          this.clearStoredTokens();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.clearStoredTokens();
    }

    this.state = {
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    };
    this.notify();
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    this.state.isLoading = true;
    this.notify();

    try {
      const response = await API.Auth.login(credentials);
      
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        
        this.storeTokens(tokens);
        this.state = {
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        };
        this.notify();
        
        return { success: true };
      } else {
        this.state.isLoading = false;
        this.notify();
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      this.state.isLoading = false;
      this.notify();
      return { success: false, error: 'Network error' };
    }
  }

  // Register user
  async register(data: RegisterData): Promise<{ success: boolean; error?: string }> {
    this.state.isLoading = true;
    this.notify();

    try {
      const response = await API.Auth.register(data);
      
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        
        this.storeTokens(tokens);
        this.state = {
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        };
        this.notify();
        
        return { success: true };
      } else {
        this.state.isLoading = false;
        this.notify();
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error) {
      this.state.isLoading = false;
      this.notify();
      return { success: false, error: 'Network error' };
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      if (this.state.tokens) {
        await API.Auth.logout(this.state.tokens.accessToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearStoredTokens();
      this.state = {
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      };
      this.notify();
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    if (!this.state.tokens) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await API.User.updateProfile(this.state.tokens.accessToken, updates);
      
      if (response.success && response.data) {
        this.state.user = response.data;
        this.notify();
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Update failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  // Change password
  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (!this.state.tokens) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await API.User.changePassword(
        this.state.tokens.accessToken,
        oldPassword,
        newPassword
      );
      
      if (response.success) {
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Password change failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await API.Auth.forgotPassword(email);
      
      if (response.success) {
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to send reset email' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  // Get access token for API calls
  getAccessToken(): string | null {
    return this.state.tokens?.accessToken || null;
  }

  // Check if user has specific role
  hasRole(role: 'customer' | 'provider' | 'admin'): boolean {
    return this.state.user?.userType === role;
  }

  // Check if user is verified
  isVerified(): boolean {
    return this.state.user?.isVerified || false;
  }

  // Private methods for token storage
  private storeTokens(tokens: AuthTokens): void {
    try {
      localStorage.setItem('mh26_auth_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  private getStoredTokens(): AuthTokens | null {
    try {
      const stored = localStorage.getItem('mh26_auth_tokens');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get stored tokens:', error);
      return null;
    }
  }

  private clearStoredTokens(): void {
    try {
      localStorage.removeItem('mh26_auth_tokens');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  // Auto-refresh token before expiration
  private async autoRefreshToken(): Promise<void> {
    if (!this.state.tokens) return;

    try {
      const response = await API.Auth.refreshToken(this.state.tokens.refreshToken);
      if (response.success && response.data) {
        this.storeTokens(response.data);
        this.state.tokens = response.data;
        this.notify();
      } else {
        // Refresh failed, logout user
        await this.logout();
      }
    } catch (error) {
      console.error('Auto refresh failed:', error);
      await this.logout();
    }
  }

  // Start auto-refresh timer (in real app, this would be more sophisticated)
  startAutoRefresh(): void {
    // Refresh token every 6 days (before 7-day expiration)
    setInterval(() => {
      if (this.state.isAuthenticated) {
        this.autoRefreshToken();
      }
    }, 6 * 24 * 60 * 60 * 1000);
  }
}

// Create singleton instance
export const authService = new AuthService();

// React hook for using auth service
import { useState, useEffect } from 'react';

export function useAuth() {
  const [authState, setAuthState] = useState(authService.getState());

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  return {
    ...authState,
    login: authService.login.bind(authService),
    register: authService.register.bind(authService),
    logout: authService.logout.bind(authService),
    updateProfile: authService.updateProfile.bind(authService),
    changePassword: authService.changePassword.bind(authService),
    forgotPassword: authService.forgotPassword.bind(authService),
    hasRole: authService.hasRole.bind(authService),
    isVerified: authService.isVerified.bind(authService),
  };
}

export default authService;