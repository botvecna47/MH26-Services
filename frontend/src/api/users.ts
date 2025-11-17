/**
 * Users API Client
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from './axiosClient';
import { useAuth } from '../hooks/useAuth';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
  emailVerified: boolean;
  phoneVerified: boolean;
  provider?: {
    id: string;
    businessName: string;
    status: string;
  };
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface AvatarUploadResponse {
  url: string;
  key: string;
  message?: string;
}

const usersApi = {
  getMe: async (): Promise<User> => {
    try {
      const response = await axiosClient.get<User>('/users/me');
      return response.data;
    } catch (error: any) {
      // Suppress 401 errors silently (expected when not authenticated)
      if (error?.response?.status === 401) {
        // Re-throw but it will be handled by React Query's enabled flag
        throw error;
      }
      throw error;
    }
  },

  updateMe: async (data: UpdateUserData): Promise<User> => {
    const response = await axiosClient.patch<User>('/users/me', data);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<AvatarUploadResponse> => {
    // Upload directly to backend (no CORS issues!)
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axiosClient.post<AvatarUploadResponse>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

// React Query hooks
export function useMe() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => usersApi.getMe(),
    enabled: isAuthenticated, // Only fetch when authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
    onError: (error: any) => {
      // Suppress 401 errors from console
      if (error?.response?.status !== 401) {
        console.error('Error fetching user:', error);
      }
    },
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateUserData) => usersApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

export default usersApi;

