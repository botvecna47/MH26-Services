/**
 * Admin API
 */
import { axiosClient } from './axiosClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Analytics {
  stats: {
    totalUsers: number;
    totalProviders: number;
    pendingProviders: number;
    totalBookings: number;
    completedBookings: number;
    totalRevenue: number;
  };
  recentBookings: any[];
  topProviders: any[];
}

export const adminApi = {
  getAnalytics: async () => {
    const response = await axiosClient.get('/admin/analytics');
    return response.data;
  },

  getPendingProviders: async () => {
    const response = await axiosClient.get('/admin/providers/pending');
    return response.data;
  },

  getAllProviders: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await axiosClient.get('/admin/providers', { params });
    return response.data;
  },

  approveProvider: async (id: string) => {
    const response = await axiosClient.post(`/admin/providers/${id}/approve`);
    return response.data;
  },

  rejectProvider: async (id: string, reason?: string) => {
    const response = await axiosClient.post(`/admin/providers/${id}/reject`, { reason });
    return response.data;
  },

  getUsers: async (params?: { role?: string; page?: number; limit?: number }) => {
    const response = await axiosClient.get('/admin/users', { params });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await axiosClient.get(`/admin/users/${id}`);
    return response.data;
  },

  banUser: async (id: string, reason?: string) => {
    const response = await axiosClient.patch(`/admin/users/${id}/ban`, { reason });
    return response.data;
  },

  getReports: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await axiosClient.get('/admin/reports', { params });
    return response.data;
  },

  updateSettings: async (settings: any) => {
    const response = await axiosClient.patch('/admin/settings', settings);
    return response.data;
  },

  exportProviders: async (format: 'json' | 'csv' = 'json') => {
    const response = await axiosClient.get('/admin/export/providers', { params: { format } });
    return response.data;
  },

  suspendProvider: async (id: string) => {
    const response = await axiosClient.patch(`/admin/providers/${id}/suspend`);
    return response.data;
  },

  unsuspendProvider: async (id: string) => {
    const response = await axiosClient.patch(`/admin/providers/${id}/unsuspend`);
    return response.data;
  },

  updateReport: async (id: string, data: { status: string; adminNotes?: string }) => {
    const response = await axiosClient.patch(`/reports/${id}`, data);
    return response.data;
  },
};

// React Query hooks
export function useAdminAnalytics() {
  return useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: adminApi.getAnalytics,
  });
}

export function usePendingProviders() {
  return useQuery({
    queryKey: ['admin', 'providers', 'pending'],
    queryFn: adminApi.getPendingProviders,
  });
}

export function useAllProviders(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin', 'providers', 'all', params],
    queryFn: () => adminApi.getAllProviders(params),
  });
}

export function useApproveProvider() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminApi.approveProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    },
  });
}

export function useRejectProvider() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminApi.rejectProvider(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    },
  });
}

export function useAdminUsers(params?: { role?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.getUsers(params),
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => adminApi.getUser(id),
    enabled: !!id,
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminApi.banUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useAdminReports(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin', 'reports', params],
    queryFn: () => adminApi.getReports(params),
  });
}

export function useSuspendProvider() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminApi.suspendProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers', 'all'] });
    },
  });
}

export function useUnsuspendProvider() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminApi.unsuspendProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['appeals'] });
    },
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; status: string; adminNotes?: string }) =>
      adminApi.updateReport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
