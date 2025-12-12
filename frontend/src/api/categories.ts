
import { axiosClient } from './axiosClient';
import { useQuery } from '@tanstack/react-query';

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const categoriesApi = {
  getCategories: async () => {
    const response = await axiosClient.get<ServiceCategory[]>('/services/categories');
    return response.data;
  },
};

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getCategories,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
