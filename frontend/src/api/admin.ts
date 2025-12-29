import { axiosClient } from './axiosClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface PlatformStats {
  totalUsers: number;
  totalProviders: number;
  pendingProviders: number;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  grossVolume: number;
  totalTaxCollected: number;
}

export interface RecentBooking {
  id: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  user: {
    id: string;
    name: string;
  };
  provider: {
    businessName: string;
  };
}

export interface AnalyticsData {
  stats: PlatformStats;
  recentBookings: RecentBooking[];
  userGrowth: Array<{ month: string; users: number }>;
  revenueGrowth: Array<{ month: string; revenue: number }>;
  categoryDistribution: Array<{ name: string; value: number }>;
}

export interface PendingProvider {
  id: string;
  businessName: string;
  primaryCategory: string;
  address: string;
  city: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone: string;
    avatarUrl?: string;
  };
  documents: Array<{ id: string; type: string; url: string }>;
  gallery?: string[];
  services: Array<{ title: string; price: number }>;
  aadharPanUrl?: string;
  portfolioUrls?: string[];
  socialMediaLinks?: any;
}

export interface UserListParams {
  role?: string;
  page?: number;
  limit?: number;
  q?: string;
}

export const adminApi = {
  getAnalytics: async (): Promise<AnalyticsData> => {
    const response = await axiosClient.get('/admin/analytics');
    return response.data;
  },

  getPendingProviders: async (): Promise<{ data: PendingProvider[] }> => {
    const response = await axiosClient.get('/admin/providers/pending');
    return response.data;
  },

  getAllProviders: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await axiosClient.get('/admin/providers', { params });
    return response.data;
  },

  approveProvider: async (id: string, category?: string) => {
    const response = await axiosClient.post(`/admin/providers/${id}/approve`, { category });
    return response.data;
  },

  rejectProvider: async (id: string, reason: string) => {
    const response = await axiosClient.post(`/admin/providers/${id}/reject`, { reason });
    return response.data;
  },

  getUsers: async (params?: UserListParams) => {
    const response = await axiosClient.get('/admin/users', { params });
    return response.data;
  },

  suspendUser: async (id: string, reason?: string) => {
    // Assuming ban endpoint is what we want for suspend
    const response = await axiosClient.patch(`/admin/users/${id}/ban`, { reason });
    return response.data;
  },

  unsuspendUser: async (id: string, reason?: string) => {
    const response = await axiosClient.patch(`/admin/users/${id}/unban`, { reason });
    return response.data;
  },

  getBookings: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await axiosClient.get('/admin/bookings', { params });
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

  getAppeals: async (params?: { status?: string; type?: string; page?: number; limit?: number }) => {
    const response = await axiosClient.get('/admin/appeals', { params });
    return response.data;
  },

  getReports: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await axiosClient.get('/admin/reports', { params });
    return response.data;
  },

  getAuditLogs: async (params: { entityId: string; entityType: string; limit?: number }) => {
    const response = await axiosClient.get('/admin/audit-logs', { params });
    return response.data;
  },

  createCategory: async (data: { name: string; slug: string; icon?: string }) => {
    const response = await axiosClient.post('/services/categories', data);
    return response.data;
  },

  updateCategory: async ({ id, data }: { id: string; data: { name: string; slug: string; icon?: string } }) => {
    const response = await axiosClient.put(`/services/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await axiosClient.delete(`/services/categories/${id}`);
    return response.data;
  },

  createProvider: async (data: any) => {
    const response = await axiosClient.post('/admin/providers/create', data);
    return response.data;
  },

  // Service verification
  getPendingServices: async () => {
    const response = await axiosClient.get('/admin/services/pending');
    return response.data;
  },

  approveService: async (id: string) => {
    const response = await axiosClient.post(`/admin/services/${id}/approve`);
    return response.data;
  },

  rejectService: async (id: string, reason?: string) => {
    const response = await axiosClient.post(`/admin/services/${id}/reject`, { reason });
    return response.data;
  },
};

export function useCreateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-providers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    },
  });
}

// Hooks
// ... (omitted hooks, assuming they are fine or I update specific hook below)
// Wait, I need to update useUnbanUser which is further down.
// I will just replace the API function first.
// Actually, I can replace the hook in a separate block or same block if close.
// `useUnbanUser` is at the end.
// I will do two edits or one large edit.
// Let's do `unsuspendUser` definition first.

// Hooks
export function useAnalytics(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: adminApi.getAnalytics,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    enabled: options?.enabled,
  });
}

export function usePendingProviders() {
  return useQuery({
    queryKey: ['pending-providers'],
    queryFn: adminApi.getPendingProviders,
  });
}

export function useAllProviders(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['all-providers', params],
    queryFn: () => adminApi.getAllProviders(params),
  });
}

export function useAdminUsers(params?: UserListParams) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => adminApi.getUsers(params),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

export function useAdminUser(id: string | null) {
  return useQuery({
    queryKey: ['admin-user', id],
    queryFn: async () => {
      const response = await axiosClient.get(`/admin/users/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useAdminBookings(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin-bookings', params],
    queryFn: () => adminApi.getBookings(params),
  });
}

export function useAppeals(params?: { status?: string; type?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin-appeals', params],
    queryFn: () => adminApi.getAppeals(params),
  });
}

export function useAdminReports(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin-reports', params],
    queryFn: () => adminApi.getReports(params),
  });
}

// Get Provider Details
export const useProviderDetails = (providerId: string | null) => {
  return useQuery({
    queryKey: ['admin-provider-details', providerId],
    queryFn: async () => {
      if (!providerId) return null;
      const { data } = await axiosClient.get(`/admin/providers/${providerId}/details`);
      return data;
    },
    enabled: !!providerId,
  });
};

// Approve Provider
export const useApproveProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, category }: { id: string; category?: string }) => {
      const { data } = await axiosClient.post(`/admin/providers/${id}/approve`, { category });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-providers'] });
      queryClient.invalidateQueries({ queryKey: ['all-providers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-provider-details'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    },
  });
};

export function useRejectProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminApi.rejectProvider(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-providers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    },
  });
}

export const useSuspendProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await axiosClient.patch(`/admin/providers/${id}/suspend`, { reason });
      return data;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['all-providers'] });
        queryClient.invalidateQueries({ queryKey: ['admin-provider-details'] });
        queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    },
  });
};

export const useUnsuspendProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await axiosClient.patch(`/admin/providers/${id}/unsuspend`, { reason });
      return data;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['all-providers'] });
        queryClient.invalidateQueries({ queryKey: ['admin-provider-details'] });
        queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    },
  });
};

export function useBanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminApi.suspendUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminApi.unsuspendUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useAuditLogs(params: { entityId: string; entityType: string; limit?: number }) {
  return useQuery({
    queryKey: ['audit-logs', params.entityId, params.entityType],
    queryFn: () => adminApi.getAuditLogs(params),
    enabled: !!params.entityId,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      // Also might want to invalidate 'services' if filters depend on it, but categories is main one.
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// Pending Services Hooks
export function usePendingServices() {
  return useQuery({
    queryKey: ['pending-services'],
    queryFn: adminApi.getPendingServices,
  });
}

export function useApproveService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.approveService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useRejectService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => adminApi.rejectService(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}
