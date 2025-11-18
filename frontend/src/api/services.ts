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
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;
    
    const response = await axiosClient.get<PaginatedServices>('/services', { params });
    
    // Client-side filtering for category and price range
    let filteredData = response.data.data;
    
    if (filters?.category) {
      const categoryLower = filters.category.toLowerCase();
      filteredData = filteredData.filter(
        service => {
          const providerCategory = service.provider.primaryCategory?.toLowerCase() || '';
          // Match exact category or check if category is part of the provider category
          return providerCategory === categoryLower || 
                 providerCategory.includes(categoryLower) ||
                 categoryLower.includes(providerCategory);
        }
      );
    }
    
    if (filters?.minPrice !== undefined) {
      filteredData = filteredData.filter(service => Number(service.price) >= filters.minPrice!);
    }
    
    if (filters?.maxPrice !== undefined) {
      filteredData = filteredData.filter(service => Number(service.price) <= filters.maxPrice!);
    }
    
    // Client-side sorting
    if (filters?.sortBy) {
      filteredData = [...filteredData].sort((a, b) => {
        switch (filters.sortBy) {
          case 'price_asc':
            return Number(a.price) - Number(b.price);
          case 'price_desc':
            return Number(b.price) - Number(a.price);
          case 'rating':
            return (b.provider.averageRating || 0) - (a.provider.averageRating || 0);
          case 'name':
            return a.title.localeCompare(b.title);
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return 0;
        }
      });
    }
    
    return {
      data: filteredData,
      pagination: {
        ...response.data.pagination,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / (filters?.limit || 10)),
      },
    };
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

