// Custom hook for managing bookings
import { useState, useEffect, useCallback } from 'react';
import { Booking, PaginatedResponse } from '../types/database';
import { API } from '../services/api';
import { authService } from '../services/auth';
import { toast } from 'sonner@2.0.3';

interface BookingFilters {
  status?: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  serviceId?: string;
  providerId?: string;
}

interface BookingState {
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  isLoading: boolean;
  error: string | null;
}

export function useBookings() {
  const [state, setState] = useState<BookingState>({
    bookings: [],
    pagination: null,
    isLoading: false,
    error: null,
  });

  // Load bookings with filters
  const loadBookings = useCallback(async (filters: BookingFilters = {}) => {
    const token = authService.getAccessToken();
    if (!token) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await API.Booking.getBookings(token, filters);
      
      if (response.success && response.data) {
        setState({
          bookings: response.data.data,
          pagination: response.data.pagination,
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Failed to load bookings',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error while loading bookings',
      }));
    }
  }, []);

  // Create new booking
  const createBooking = useCallback(async (bookingData: Partial<Booking>) => {
    const token = authService.getAccessToken();
    if (!token) {
      toast.error('Please login to create a booking');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await API.Booking.createBooking(token, bookingData);
      
      if (response.success && response.data) {
        // Add new booking to the state
        setState(prev => ({
          ...prev,
          bookings: [response.data!, ...prev.bookings],
        }));
        
        toast.success('Booking created successfully!');
        return { success: true, data: response.data };
      } else {
        toast.error(response.error || 'Failed to create booking');
        return { success: false, error: response.error };
      }
    } catch (error) {
      toast.error('Network error while creating booking');
      return { success: false, error: 'Network error' };
    }
  }, []);

  // Update booking status
  const updateBookingStatus = useCallback(async (bookingId: string, status: string) => {
    const token = authService.getAccessToken();
    if (!token) {
      toast.error('Please login to update booking');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await API.Booking.updateBookingStatus(token, bookingId, status);
      
      if (response.success && response.data) {
        // Update booking in state
        setState(prev => ({
          ...prev,
          bookings: prev.bookings.map(booking =>
            booking.id === bookingId ? response.data! : booking
          ),
        }));
        
        const statusMessages = {
          confirmed: 'Booking confirmed successfully!',
          cancelled: 'Booking cancelled successfully!',
          completed: 'Booking marked as completed!',
          in_progress: 'Booking started!',
        };
        
        toast.success(statusMessages[status as keyof typeof statusMessages] || 'Booking updated successfully!');
        return { success: true, data: response.data };
      } else {
        toast.error(response.error || 'Failed to update booking');
        return { success: false, error: response.error };
      }
    } catch (error) {
      toast.error('Network error while updating booking');
      return { success: false, error: 'Network error' };
    }
  }, []);

  // Accept booking (for providers)
  const acceptBooking = useCallback(async (bookingId: string) => {
    return updateBookingStatus(bookingId, 'confirmed');
  }, [updateBookingStatus]);

  // Reject booking (for providers)
  const rejectBooking = useCallback(async (bookingId: string) => {
    return updateBookingStatus(bookingId, 'cancelled');
  }, [updateBookingStatus]);

  // Start booking (for providers)
  const startBooking = useCallback(async (bookingId: string) => {
    return updateBookingStatus(bookingId, 'in_progress');
  }, [updateBookingStatus]);

  // Complete booking (for providers)
  const completeBooking = useCallback(async (bookingId: string) => {
    return updateBookingStatus(bookingId, 'completed');
  }, [updateBookingStatus]);

  // Cancel booking (for customers)
  const cancelBooking = useCallback(async (bookingId: string) => {
    return updateBookingStatus(bookingId, 'cancelled');
  }, [updateBookingStatus]);

  // Get booking by ID
  const getBookingById = useCallback((bookingId: string) => {
    return state.bookings.find(booking => booking.id === bookingId);
  }, [state.bookings]);

  // Get bookings by status
  const getBookingsByStatus = useCallback((status: string) => {
    return state.bookings.filter(booking => booking.status === status);
  }, [state.bookings]);

  // Get upcoming bookings
  const getUpcomingBookings = useCallback(() => {
    const now = new Date();
    return state.bookings.filter(booking => {
      const bookingDate = new Date(booking.scheduledDate);
      return bookingDate >= now && (booking.status === 'confirmed' || booking.status === 'pending');
    }).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }, [state.bookings]);

  // Get past bookings
  const getPastBookings = useCallback(() => {
    const now = new Date();
    return state.bookings.filter(booking => {
      const bookingDate = new Date(booking.scheduledDate);
      return bookingDate < now || booking.status === 'completed' || booking.status === 'cancelled';
    }).sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  }, [state.bookings]);

  // Get today's bookings
  const getTodaysBookings = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return state.bookings.filter(booking => {
      const bookingDate = new Date(booking.scheduledDate);
      return bookingDate >= today && bookingDate < tomorrow;
    }).sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [state.bookings]);

  // Calculate booking statistics
  const getBookingStats = useCallback(() => {
    const stats = {
      total: state.bookings.length,
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      disputed: 0,
      totalEarnings: 0,
      averageRating: 0,
    };

    state.bookings.forEach(booking => {
      stats[booking.status as keyof typeof stats]++;
      if (booking.actualPrice) {
        stats.totalEarnings += booking.actualPrice;
      } else if (booking.estimatedPrice) {
        stats.totalEarnings += booking.estimatedPrice;
      }
    });

    return stats;
  }, [state.bookings]);

  // Check if booking can be cancelled
  const canCancelBooking = useCallback((booking: Booking) => {
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return false;
    }

    const bookingDateTime = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`);
    const now = new Date();
    const hoursDifference = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Can cancel if booking is more than 2 hours away
    return hoursDifference > 2;
  }, []);

  // Check if booking can be rescheduled
  const canRescheduleBooking = useCallback((booking: Booking) => {
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return false;
    }

    const bookingDateTime = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`);
    const now = new Date();
    const hoursDifference = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Can reschedule if booking is more than 4 hours away
    return hoursDifference > 4;
  }, []);

  // Auto-refresh bookings
  useEffect(() => {
    loadBookings();
    
    // Refresh every 2 minutes
    const interval = setInterval(() => loadBookings(), 120000);
    
    return () => clearInterval(interval);
  }, [loadBookings]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = authService.subscribe((authState) => {
      if (!authState.isAuthenticated) {
        setState({
          bookings: [],
          pagination: null,
          isLoading: false,
          error: null,
        });
      } else {
        loadBookings();
      }
    });

    return unsubscribe;
  }, [loadBookings]);

  return {
    ...state,
    loadBookings,
    createBooking,
    updateBookingStatus,
    acceptBooking,
    rejectBooking,
    startBooking,
    completeBooking,
    cancelBooking,
    getBookingById,
    getBookingsByStatus,
    getUpcomingBookings,
    getPastBookings,
    getTodaysBookings,
    getBookingStats,
    canCancelBooking,
    canRescheduleBooking,
  };
}

export default useBookings;