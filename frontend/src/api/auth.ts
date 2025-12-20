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
  address?: string;
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

  resetPassword: async (email: string, otp: string, newPassword: string): Promise<{ message: string }> => {
    const response = await axiosClient.post<{ message: string }>('/auth/reset-password', {
      email,
      otp,
      newPassword,
    });
    return response.data;
  },



  resendRegistrationOTP: async (email: string): Promise<{ message: string; email: string }> => {
    const response = await axiosClient.post<{ message: string; email: string }>('/auth/resend-registration-otp', {
      email,
    });
    return response.data;
  },

  verifyRegistrationOTP: async (email: string, otp: string): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/verify-registration-otp', {
      email,
      otp,
    });
    return response.data;
  },

  checkAvailability: async (params: { email?: string; phone?: string }): Promise<{
    emailAvailable?: boolean;
    phoneAvailable?: boolean;
    emailValid?: boolean;
    phoneValid?: boolean;
  }> => {
    const response = await axiosClient.get('/auth/check-availability', { params });
    return response.data;
  },
};

