import { useUser } from '../context/UserContext';
import { Calendar, DollarSign, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Link, useSearchParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import AnalyticsCharts from './AnalyticsCharts';
import { useBookings, Booking } from '../api/bookings';
import { useAnalytics } from '../api/admin';

import CustomerProfilePage from './CustomerProfilePage';
import ProviderSchedulePage from './ProviderSchedulePage';
import MyServicesSection from './MyServicesSection';
import BookingDetailModal from './BookingDetailModal';
import { useState, useEffect } from 'react';
import { useProviderStats } from '../api/providers';


import { useSocket } from '../context/SocketContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, isAdmin, isProvider } = useUser();
  const isCustomer = !isAdmin && !isProvider; // Simple logic

  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);


  // Queries
  const { data: bookingsData, isLoading: bookingsLoading } = useBookings(
    // Fetch all bookings for the user/provider (pagination defaults might appy, but for dashboard maybe we want recent?)
    // The controller defaults to limit=10. We might want more or just rely on recent.
    { limit: 50 }
  );

  // Analytics for Admin
  const { data: analyticsData, isLoading: analyticsLoading } = useAnalytics({ enabled: isAdmin });

  // Analytics for Provider
  const { data: providerStats, isLoading: providerStatsLoading } = useProviderStats({ enabled: isProvider });

  // Socket for real-time updates
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleBookingUpdate = (updatedBooking: any) => {
      // Invalidate bookings query to refresh list
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      // Also invalidate provider stats if provider
      if (isProvider) {
         queryClient.invalidateQueries({ queryKey: ['provider-stats'] });
      }
      toast.info(`Booking updated: ${updatedBooking.status}`);
    };

    socket.on('booking:update', handleBookingUpdate);

    return () => {
      socket.off('booking:update', handleBookingUpdate);
    };
  }, [socket, queryClient, isProvider]);

  // Sync selectedBooking with latest data and handle Deep Linking
  useEffect(() => {
    // 1. Handle deep linking on load
    const bookingIdFromUrl = searchParams.get('bookingId');
    if (bookingIdFromUrl && bookingsData?.data && !selectedBooking) {
        const found = bookingsData.data.find((b: Booking) => b.id === bookingIdFromUrl);
        if (found) {
            setSelectedBooking(found);
            // Optional: Clear param from URL to prevent reopening on refresh?
            // setSearchParams(params => { params.delete('bookingId'); return params; });
        }
    }

    // 2. Sync selectedBooking with realtime updates
    if (selectedBooking && bookingsData?.data) {
        const freshBooking = bookingsData.data.find((b: Booking) => b.id === selectedBooking.id);
        if (freshBooking) {
            // Only update if changed deeply? React handles ref equality.
            if (JSON.stringify(freshBooking) !== JSON.stringify(selectedBooking)) {
                setSelectedBooking(freshBooking);
            }
        }
    }
  }, [bookingsData, selectedBooking, searchParams]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-gray-900 mb-2">Please sign in</h2>
          <p className="text-gray-600">You need to be logged in to view your dashboard</p>
        </div>
      </div>
    );
  }

  const userBookings: Booking[] = bookingsData?.data || [];
  const stats = analyticsData?.stats;

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100';
      case 'CONFIRMED':
        return 'text-blue-600 bg-blue-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (bookingsLoading || (isAdmin && analyticsLoading) || (isProvider && providerStatsLoading)) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-gray-900 mb-2">
                Welcome back, {user.name}
              </h1>
              <p className="text-gray-700">
                {isAdmin
                  ? 'Manage providers, bookings, and platform analytics'
                  : isProvider
                    ? 'Track your bookings and manage your services'
                    : 'View your bookings and explore services'}
              </p>
            </div>

            {/* Simple Tab Navigation */}
            {!isAdmin && (
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setSearchParams({ tab: 'overview' })}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currentTab === 'overview' ? 'bg-white text-[#ff6b35] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Overview
                </button>
                {isProvider && (
                  <button
                    onClick={() => setSearchParams({ tab: 'schedule' })}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currentTab === 'schedule' ? 'bg-white text-[#ff6b35] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    Schedule
                  </button>
                )}
                {isProvider && (
                  <button
                    onClick={() => setSearchParams({ tab: 'services' })}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currentTab === 'services' ? 'bg-white text-[#ff6b35] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    My Services
                  </button>
                )}
                <button
                  onClick={() => setSearchParams({ tab: 'profile' })}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currentTab === 'profile' ? 'bg-white text-[#ff6b35] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {currentTab === 'profile' ? (
          <div className="max-w-4xl mx-auto">
            <CustomerProfilePage />
          </div>
        ) : currentTab === 'schedule' && isProvider ? (
            <div className="max-w-4xl mx-auto">
               <ProviderSchedulePage />
            </div>
        ) : currentTab === 'services' && isProvider ? (
            <div className="max-w-5xl mx-auto">
               <MyServicesSection />
            </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* KPI Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {isAdmin && stats ? (
                  <>
                    <div className="glass glass-hover rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700">Total Users</span>
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-gray-900">{stats.totalUsers}</div>
                      <p className="text-xs text-green-600 mt-1">Total registered</p>
                    </div>
                    <div className="glass glass-hover rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700">Total Providers</span>
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-gray-900">{stats.totalProviders}</div>
                      <p className="text-xs text-green-600 mt-1">{stats.pendingProviders} pending</p>
                    </div>
                    <div className="glass glass-hover rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700">Revenue</span>
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-gray-900">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
                      <p className="text-xs text-green-600 mt-1">Total volume</p>
                    </div>
                  </>
                ) : isProvider ? (
                  <>
                    <div className="glass glass-hover rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700">Total Bookings</span>
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-gray-900">{providerStats?.totalBookings || 0}</div>
                      <p className="text-xs text-gray-600 mt-1">All time</p>
                    </div>
                    <div className="glass glass-hover rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700">Completed</span>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-gray-900">
                        {providerStats?.completedBookings || 0}
                      </div>
                      <p className="text-xs text-green-600 mt-1">Services delivered</p>
                    </div>
                    <div className="glass glass-hover rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700">Revenue</span>
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-gray-900">
                        ₹{(providerStats?.totalEarnings || 0).toLocaleString('en-IN')}
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                          {providerStats?.monthlyRevenue ? `₹${providerStats.monthlyRevenue} this month` : 'Total earnings'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="glass glass-hover rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700">Total Bookings</span>
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-gray-900">{userBookings.length}</div>
                      <p className="text-xs text-gray-600 mt-1">All time</p>
                    </div>
                    <div className="glass glass-hover rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700">Pending</span>
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="text-gray-900">
                        {userBookings.filter((b: Booking) => b.status === 'PENDING' || b.status === 'CONFIRMED').length}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Awaiting service</p>
                    </div>
                    <div className="glass glass-hover rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700">Spent</span>
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-gray-900">
                        ₹{userBookings.reduce((sum: number, b: Booking) => sum + (b.totalAmount || 0), 0).toLocaleString('en-IN')}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Total spent</p>
                    </div>
                  </>
                )}
              </div>

              {/* Bookings List */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-gray-900">Recent Bookings</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">All</Button>
                  </div>
                </div>

                {userBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No bookings yet</p>
                    <Link to="/services">
                      <Button className="bg-[#ff6b35] hover:bg-[#ff5722]">
                        Browse Services
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userBookings.slice(0, 5).map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="text-gray-900 mb-1">{booking.service?.title || 'Service'}</h3>
                            <p className="text-sm text-gray-600">{booking.provider?.businessName}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-4 text-gray-600">
                            <span>
                              <Calendar className="h-4 w-4 inline mr-1" />
                              {booking.scheduledAt
                                ? formatDistanceToNow(new Date(booking.scheduledAt), { addSuffix: true })
                                : 'Not scheduled'}
                            </span>
                            <span className="font-medium text-gray-900">₹{booking.totalAmount}</span>
                          </div>
                          <div className="flex gap-2">

                            





                            <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}>View Details</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>



              {/* Analytics Charts (Admin Only) */}
              {isAdmin && analyticsData && (
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="text-gray-900 mb-4">Platform Analytics</h2>
                  <AnalyticsCharts data={analyticsData} />
                </div>
              )}
            </div>

            {/* Sidebar - Quick Actions & Alerts */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {isAdmin ? (
                    <>
                      <Link to="/admin">
                        <Button variant="outline" className="w-full justify-start">
                          Admin Panel
                        </Button>
                      </Link>
                      <Link to="/services">
                        <Button variant="outline" className="w-full justify-start">
                          View Providers
                        </Button>
                      </Link>
                    </>
                  ) : isProvider ? (
                    <>
                      <Link to={`/provider/${user.id}`}>
                        <Button variant="outline" className="w-full justify-start">
                          View My Profile
                        </Button>
                      </Link>
                      <Link to="/services">
                        <Button variant="outline" className="w-full justify-start">
                          Manage Services
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/services">
                        <Button variant="outline" className="w-full justify-start">
                          Browse Services
                        </Button>
                      </Link>
                      <Link to="/provider-onboarding">
                        <Button variant="outline" className="w-full justify-start">
                          Become a Provider
                        </Button>
                      </Link>
                    </>
                  )}
                  {/* Messages etc */}
                </div>
              </div>

              {/* Pending Items (Admin) */}
              {isAdmin && stats && (
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-gray-900 mb-4">Pending Approvals</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">New Providers</p>
                        <p className="text-xs text-gray-600">{stats.pendingProviders} awaiting verification</p>
                      </div>
                      <Link to="/admin?tab=providers">
                        <Button size="sm" variant="outline">Review</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Activity Mock removed or needs real activity feed. Leaving blank/placeholder for now to clean up demo */}

            </div>
          </div>
        )}
      </div>

      {selectedBooking && (
        <BookingDetailModal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          booking={selectedBooking}
        />
      )}
    </div>
  );
}