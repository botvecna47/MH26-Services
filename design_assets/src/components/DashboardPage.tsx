import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Package, TrendingUp, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { BookingAPI } from '../services/api';
import { Booking } from '../types/database';
import { useUser } from '../context/UserContext';
import { GlassLoadingSkeleton } from './ui/GlassLoadingSkeleton';
import { GlassEmptyState } from './ui/GlassEmptyState';
import { toast } from 'sonner@2.0.3';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken') || '';
      const response = await BookingAPI.getBookings(token, {
        status: filter || undefined,
      });

      if (response.success) {
        setBookings(response.data?.data || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('authToken') || '';
      const response = await BookingAPI.updateBookingStatus(token, bookingId, 'cancelled');

      if (response.success) {
        toast.success('Booking cancelled successfully');
        loadBookings();
      } else {
        toast.error(response.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const stats = [
    {
      title: 'Total Bookings',
      value: bookings.length,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Pending',
      value: bookings.filter((b) => b.status === 'pending').length,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      title: 'Completed',
      value: bookings.filter((b) => b.status === 'completed').length,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Total Spent',
      value: `₹${bookings.reduce((sum, b) => sum + (b.estimatedPrice || 0), 0)}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="glass glass-hover rounded-xl p-6 transition-all duration-300 ease-out hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-gray-900 text-2xl">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center shadow-md`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bookings Section */}
        <div className="glass rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-gray-900">My Bookings</h2>
            <div className="flex gap-2">
              <Button
                variant={filter === null ? 'default' : 'outline'}
                onClick={() => setFilter(null)}
                size="sm"
                className={filter === null ? 'bg-[#ff6b35] hover:bg-[#e85a2d]' : 'border-white/30 hover:bg-white/20'}
              >
                All
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
                size="sm"
                className={filter === 'pending' ? 'bg-[#ff6b35] hover:bg-[#e85a2d]' : 'border-white/30 hover:bg-white/20'}
              >
                Pending
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilter('completed')}
                size="sm"
                className={filter === 'completed' ? 'bg-[#ff6b35] hover:bg-[#e85a2d]' : 'border-white/30 hover:bg-white/20'}
              >
                Completed
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <GlassLoadingSkeleton key={i} height={120} />
              ))}
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="glass-strong rounded-lg p-4 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-gray-900 mb-1">Booking #{booking.id.slice(0, 8)}</h3>
                          <p className="text-sm text-gray-600">
                            Scheduled for {format(new Date(booking.scheduledDate), 'MMM dd, yyyy')} at {booking.scheduledTime}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Address:</strong> {booking.address.street}</p>
                        {booking.requirements && (
                          <p><strong>Requirements:</strong> {booking.requirements}</p>
                        )}
                        <p><strong>Price:</strong> ₹{booking.estimatedPrice}</p>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2">
                      {booking.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                          className="border-white/30 hover:bg-red-50 hover:text-red-600"
                        >
                          Cancel
                        </Button>
                      )}
                      {booking.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/30 hover:bg-white/20"
                        >
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <GlassEmptyState
              icon={<Calendar className="h-12 w-12" />}
              message={filter ? `No ${filter} bookings` : 'No bookings yet'}
            />
          )}
        </div>
      </div>
    </div>
  );
}
