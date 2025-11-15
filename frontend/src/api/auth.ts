/**
 * Authentication API
 */
import { axiosClient } from './axiosClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: 'CUSTOMER' | 'PROVIDER';
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
    emailVerified: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await axiosClient.post('/auth/logout', { refreshToken });
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await axiosClient.post<{ accessToken: string }>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await axiosClient.post<{ message: string }>('/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await axiosClient.post<{ message: string }>('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  },
};

