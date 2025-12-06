/**
 * Services API
 */
import { axiosClient } from './axiosClient';
import { useQuery } from '@tanstack/react-query';

export interface Service {
  id: string;
  providerId: string;
  title: string;
  description?: string;
  price: number;
  durationMin: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  provider: {
    id: string;
    businessName: string;
    primaryCategory: string;
    averageRating: number;
    totalRatings: number;
    city: string;
    state: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl?: string;
    };
  };
}

export interface ServiceFilters {
  providerId?: string;
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'name';
}

export interface PaginatedServices {
  data: Service[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const servicesApi = {
  getServices: async (filters?: ServiceFilters): Promise<PaginatedServices> => {
    const params: any = {};
    if (filters?.providerId) params.providerId = filters.providerId;
    if (filters?.q) params.q = filters.q;
    if (filters?.category && filters.category !== 'all') params.category = filters.category;
    if (filters?.minPrice !== undefined) params.minPrice = filters.minPrice;
    if (filters?.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
    if (filters?.sortBy) params.sortBy = filters.sortBy;
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;
    
    const response = await axiosClient.get<PaginatedServices>('/services', { params });
    return response.data;
  },
};

// React Query hooks
export function useServices(filters?: ServiceFilters) {
  return useQuery({
    queryKey: ['services', filters],
    queryFn: () => servicesApi.getServices(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
}

