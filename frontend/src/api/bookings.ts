/**
 * Bookings API
 */
import { axiosClient } from './axiosClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Booking {
  id: string;
  userId: string;
  providerId: string;
  serviceId: string;
  scheduledAt?: string; // Legacy/Optional
  scheduledDate: string;
  scheduledTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED' | 'EXPIRED';
  totalAmount?: number; // Legacy
  estimatedPrice: number;
  actualPrice?: number;
  address?: string;
  requirements?: string;
  completionOtp?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  provider: {
    id: string;
    businessName: string;
    primaryCategory?: string;
    city?: string;
    state?: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  service: {
    id: string;
    title: string;
    price: number;
    durationMin: number;
    imageUrl?: string;
    description?: string;
  };
  cancellation?: {
    id: string;
    cancelledBy: string;
    reason?: string;
    createdAt: string;
  };
  review?: {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
  };
}

export interface CreateBookingData {
  providerId: string;
  serviceId: string;
  scheduledAt: string;
  totalAmount: number;
  address?: string;
  city?: string;
  pincode?: string;
  requirements?: string;
}

export interface UpdateBookingData {
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED' | 'EXPIRED';
}

export const bookingsApi = {
  getBookings: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await axiosClient.get('/bookings', { params });
    return response.data;
  },

  getBooking: async (id: string) => {
    const response = await axiosClient.get(`/bookings/${id}`);
    return response.data;
  },

  createBooking: async (data: CreateBookingData) => {
    const response = await axiosClient.post('/bookings', data);
    return response.data;
  },

  updateBooking: async (id: string, data: UpdateBookingData) => {
    const response = await axiosClient.patch(`/bookings/${id}`, data);
    return response.data;
  },

  cancelBooking: async (id: string, reason?: string) => {
    const response = await axiosClient.post(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  getInvoice: async (id: string) => {
    const response = await axiosClient.get(`/bookings/${id}/invoice`);
    return response.data;
  },

  acceptBooking: async (id: string) => {
    const response = await axiosClient.post(`/bookings/${id}/accept`);
    return response.data;
  },

  rejectBooking: async (id: string, reason?: string) => {
    const response = await axiosClient.post(`/bookings/${id}/reject`, { reason });
    return response.data;
  },

  initiateCompletion: async (id: string) => {
    const response = await axiosClient.post(`/bookings/${id}/completion-initiate`);
    return response.data;
  },

  verifyCompletion: async (id: string, otp: string) => {
    const response = await axiosClient.post(`/bookings/${id}/completion-verify`, { otp });
    return response.data;
  },
};

// React Query hooks
export function useBookings(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => bookingsApi.getBookings(params),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getBooking(id),
    enabled: !!id,
    retry: (failureCount, error: any) => {
      // Don't retry on 403 (Forbidden) or 404 (Not Found) errors
      if (error?.response?.status === 403 || error?.response?.status === 404) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bookingsApi.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookingData }) =>
      bookingsApi.updateBooking(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      bookingsApi.cancelBooking(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useAcceptBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => bookingsApi.acceptBooking(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
    },
  });
}

export function useRejectBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      bookingsApi.rejectBooking(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
    },
  });
}
export function useInvoice(id: string | null) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => bookingsApi.getInvoice(id!),
    enabled: !!id,
    retry: false,
  });
}

export function useInitiateCompletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.initiateCompletion(id),
    onSuccess: (data, variables) => {
       // Ideally we might want to update the booking logic or invalidate
       // But actually initiate doesn't change status, just adds OTP
       // We might not need to invalidate 'bookings' if we don't show the OTP there for provider
       // But for customer we do.
       queryClient.invalidateQueries({ queryKey: ['bookings'] });
       queryClient.invalidateQueries({ queryKey: ['booking', variables] }); 
    }
  });
}

export function useVerifyCompletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, otp }: { id: string, otp: string }) => bookingsApi.verifyCompletion(id, otp),
    onSuccess: (data) => {
       queryClient.invalidateQueries({ queryKey: ['bookings'] });
       queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
    }
  });
}

export function useStartService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.updateBooking(id, { status: 'IN_PROGRESS' }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
    },
  });
}
