/**
 * Reviews API
 */
import { axiosClient } from './axiosClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Review {
  id: string;
  bookingId?: string;
  providerId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface CreateReviewData {
  bookingId?: string;
  providerId: string;
  rating: number;
  comment?: string;
}

export const reviewsApi = {
  getProviderReviews: async (providerId: string, page = 1, limit = 10) => {
    const response = await axiosClient.get(`/reviews/providers/${providerId}/reviews`, {
      params: { page, limit },
    });
    return response.data;
  },

  createReview: async (data: CreateReviewData) => {
    const response = await axiosClient.post('/reviews', data);
    return response.data;
  },
};

// React Query hooks
export function useProviderReviews(providerId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['reviews', providerId, page, limit],
    queryFn: () => reviewsApi.getProviderReviews(providerId, page, limit),
    enabled: !!providerId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: reviewsApi.createReview,
    onSuccess: (data) => {
      // Invalidate provider reviews cache
      queryClient.invalidateQueries({ queryKey: ['reviews', data.providerId] });
      // Invalidate provider cache to update rating
      queryClient.invalidateQueries({ queryKey: ['provider', data.providerId] });
    },
  });
}
