/**
 * Appeals API
 */
import { axiosClient } from './axiosClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ProviderAppeal {
  id: string;
  providerId: string;
  type: 'UNBAN_REQUEST' | 'REJECTION_APPEAL' | 'SUSPENSION_APPEAL' | 'OTHER';
  reason: string;
  details?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  provider?: {
    id: string;
    businessName: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateAppealData {
  type: 'UNBAN_REQUEST' | 'REJECTION_APPEAL' | 'SUSPENSION_APPEAL' | 'OTHER';
  reason: string;
  details?: string;
}

export interface ReviewAppealData {
  status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  adminNotes?: string;
}

export const appealsApi = {
  createAppeal: async (data: CreateAppealData) => {
    const response = await axiosClient.post('/appeals', data);
    return response.data;
  },

  getMyAppeals: async () => {
    const response = await axiosClient.get('/appeals/my-appeals');
    return response.data;
  },

  getAppeals: async (params?: { status?: string; type?: string; page?: number; limit?: number }) => {
    const response = await axiosClient.get('/appeals', { params });
    return response.data;
  },

  getAppeal: async (id: string) => {
    const response = await axiosClient.get(`/appeals/${id}`);
    return response.data;
  },

  reviewAppeal: async (id: string, data: ReviewAppealData) => {
    const response = await axiosClient.patch(`/appeals/${id}/review`, data);
    return response.data;
  },
};

// React Query hooks
export function useMyAppeals() {
  return useQuery({
    queryKey: ['appeals', 'my'],
    queryFn: appealsApi.getMyAppeals,
  });
}

export function useAppeals(params?: { status?: string; type?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['appeals', params],
    queryFn: () => appealsApi.getAppeals(params),
  });
}

export function useAppeal(id: string) {
  return useQuery({
    queryKey: ['appeal', id],
    queryFn: () => appealsApi.getAppeal(id),
    enabled: !!id,
  });
}

export function useCreateAppeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: appealsApi.createAppeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appeals'] });
    },
  });
}

export function useReviewAppeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & ReviewAppealData) =>
      appealsApi.reviewAppeal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appeals'] });
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    },
  });
}

