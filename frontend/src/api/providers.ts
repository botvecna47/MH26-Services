/**
 * Providers API
 */
import { axiosClient } from './axiosClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Provider {
  id: string;
  userId: string;
  businessName: string;
  description?: string;
  primaryCategory: string;
  secondaryCategory?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
  averageRating: number;
  totalRatings: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  phoneVisible: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
  };
  services?: Service[];
  documents?: ProviderDocument[];
  availability?: Record<string, string[]>;
  gallery?: string[];
  bio?: string;
  phone?: string;
  experienceYears?: number;
  serviceRadius?: number;
  createdAt: string;
}

export interface Service {
  id: string;
  providerId: string;
  title: string;
  description?: string;
  price: number;
  durationMin: number;
  imageUrl?: string;
}

export interface ProviderDocument {
  id: string;
  type: string;
  url: string;
  filename: string;
}

export interface ProviderFilters {
  city?: string;
  category?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedProviders {
  data: Provider[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const providersApi = {
  getProviders: async (filters?: ProviderFilters): Promise<PaginatedProviders> => {
    const response = await axiosClient.get<PaginatedProviders>('/providers', { params: filters });
    return response.data;
  },

  getProvider: async (id: string): Promise<Provider> => {
    const response = await axiosClient.get<Provider>(`/providers/${id}`);
    return response.data;
  },

  createProvider: async (data: Partial<Provider>): Promise<Provider> => {
    const response = await axiosClient.post<Provider>('/providers', data);
    return response.data;
  },

  updateProvider: async (id: string, data: Partial<Provider>): Promise<Provider> => {
    const response = await axiosClient.patch<Provider>(`/providers/${id}`, data);
    return response.data;
  },

  revealPhone: async (id: string): Promise<{ phone: string }> => {
    try {
      const response = await axiosClient.post<{ phone: string }>(`/providers/${id}/reveal-phone`);
      return response.data;
    } catch (error: any) {
      // Re-throw 401 errors so components can handle them
      if (error?.response?.status === 401) {
        throw error;
      }
      throw error;
    }
  },

  getStats: async (): Promise<any> => {
    const response = await axiosClient.get('/providers/stats');
    return response.data;
  },
};

// React Query hooks
export function useProviders(filters?: ProviderFilters) {
  return useQuery({
    queryKey: ['providers', filters],
    queryFn: () => providersApi.getProviders(filters),
    retry: (failureCount, error: any) => {
      // Don't retry on 429 (Too Many Requests) errors
      if (error?.response?.status === 429) {
        return false;
      }
      // Only retry once for other errors
      return failureCount < 1;
    },
    retryDelay: (_attemptIndex, error: any) => {
      // If 429 error, wait longer before retry
      if (error?.response?.status === 429) {
        return 30000; // Wait 30 seconds for rate limit
      }
      return 5000; // Wait 5 seconds for other errors
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - providers don't change often
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    refetchOnReconnect: false, // Don't refetch on reconnect
  });
}

export function useProvider(id: string) {
  return useQuery({
    queryKey: ['provider', id],
    queryFn: () => providersApi.getProvider(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 2000,
  });
}

export function useUpdateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Provider> }) =>
      providersApi.updateProvider(id, data),
    onSuccess: (data: Provider) => {
      queryClient.invalidateQueries({ queryKey: ['provider', data.id] });
      queryClient.setQueryData(['provider', data.id], data);
    },
  });
}

export function useProviderStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['provider-stats'],
    queryFn: providersApi.getStats,
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 (Auth/Permission errors)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    }
  });
}
