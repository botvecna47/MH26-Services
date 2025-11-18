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
  scheduledAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  totalAmount: number;
  address?: string;
  requirements?: string;
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
  };
  cancellation?: {
    id: string;
    cancelledBy: string;
    reason?: string;
    createdAt: string;
  };
}

export interface CreateBookingData {
  providerId: string;
  serviceId: string;
  scheduledAt: string;
  totalAmount: number;
  address?: string;
  requirements?: string;
}

export interface UpdateBookingData {
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
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
    onError: (error: any) => {
      // Suppress console errors for expected 403/404 errors
      if (error?.response?.status === 403 || error?.response?.status === 404) {
        return;
      }
      console.error('Error fetching booking:', error);
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
