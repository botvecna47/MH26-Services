/**
 * Notifications API
 */
import { axiosClient } from './axiosClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  payload: any;
  read: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getNotifications: async (params?: { read?: boolean; page?: number; limit?: number }) => {
    try {
      const response = await axiosClient.get('/notifications', { params });
      return response.data;
    } catch (error: any) {
      // Suppress 401 errors silently (expected when not authenticated)
      if (error?.response?.status === 401) {
        // Return empty array instead of throwing
        return { data: [], total: 0 };
      }
      throw error;
    }
  },

  markAsRead: async (id: string) => {
    try {
      const response = await axiosClient.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error: any) {
      // Suppress 401 errors silently
      if (error?.response?.status === 401) {
        return { success: false };
      }
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await axiosClient.patch('/notifications/read-all');
      return response.data;
    } catch (error: any) {
      // Suppress 401 errors silently
      if (error?.response?.status === 401) {
        return { success: false };
      }
      throw error;
    }
  },
};

// React Query hooks
export function useNotifications(params?: { read?: boolean; page?: number; limit?: number }, enabled: boolean = true) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationsApi.getNotifications(params),
    enabled: enabled, // Only fetch when enabled (user is authenticated)
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    refetchOnReconnect: false, // Don't refetch on reconnect
    retry: (failureCount, error: any) => {
      // Don't retry on 401 (Unauthorized) or 429 (Too Many Requests) errors
      if (error?.response?.status === 401 || error?.response?.status === 429) {
        return false;
      }
      // Only retry once for other errors
      return failureCount < 1;
    },
    retryDelay: (attemptIndex, error: any) => {
      // If 429 error, wait longer before retry
      if (error?.response?.status === 429) {
        return 30000; // Wait 30 seconds for rate limit
      }
      return 5000; // Wait 5 seconds for other errors
    },
    // Suppress errors for unauthenticated users
    onError: (error: any) => {
      // Only log non-401 errors
      if (error?.response?.status !== 401) {
        console.error('Error fetching notifications:', error);
      }
    },
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
