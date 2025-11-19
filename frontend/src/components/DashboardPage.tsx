import { useUser } from '../context/UserContext';
import { Calendar, DollarSign, Users, TrendingUp, Clock, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import AnalyticsCharts from './AnalyticsCharts';
import { useBookings } from '../api/bookings';
import { useAdminAnalytics } from '../api/admin';
import { useProviders } from '../api/providers';
import { useState } from 'react';
import UnbanRequestForm from './UnbanRequestForm';
import { useProvider } from '../api/providers';

export default function DashboardPage() {
  const { user, isAdmin, isProvider } = useUser();
  const [showUnbanForm, setShowUnbanForm] = useState(false);
  
  // Fetch real data from API
  const { data: bookingsData, isLoading: bookingsLoading } = useBookings();
  const { data: analyticsData, isLoading: analyticsLoading } = useAdminAnalytics();
  const { data: providersData } = useProviders();
  
  // Get provider data if user is a provider
  const providerId = isProvider && user?.id ? providersData?.data?.find((p: any) => p.userId === user.id)?.id : null;
  const { data: providerData } = useProvider(providerId || '');

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

  // Transform API bookings data
  const allBookings = bookingsData?.data || [];
  const userBookings = isProvider
    ? allBookings.filter((b: any) => b.provider?.userId === user.id)
    : allBookings.filter((b: any) => b.userId === user.id);

  const getStatusColor = (status: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">
            Welcome back, {user.name}
          </h1>
          <p className="text-gray-600">
            {isAdmin
              ? 'Manage providers, bookings, and platform analytics'
              : isProvider
              ? 'Track your bookings and manage your services'
              : 'View your bookings and explore services'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* KPI Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {isAdmin ? (
                analyticsLoading ? (
                  <div className="col-span-3 flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                <>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Total Users</span>
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                      <div className="text-gray-900">{analyticsData?.stats?.totalUsers || 0}</div>
                      <p className="text-xs text-green-600 mt-1">Active users</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Total Providers</span>
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                      <div className="text-gray-900">{analyticsData?.stats?.totalProviders || 0}</div>
                      <p className="text-xs text-green-600 mt-1">Approved providers</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Revenue</span>
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                      <div className="text-gray-900">₹{(analyticsData?.stats?.totalRevenue || 0).toLocaleString('en-IN')}</div>
                      <p className="text-xs text-green-600 mt-1">Total revenue</p>
                  </div>
                </>
                )
              ) : isProvider ? (
                <>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Total Bookings</span>
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-gray-900">{userBookings.length}</div>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Completed</span>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-gray-900">
                      {userBookings.filter(b => b.status === 'COMPLETED').length}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Services delivered</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Revenue</span>
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-gray-900">
                      ₹{userBookings.reduce((sum, b) => sum + b.price, 0).toLocaleString('en-IN')}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Total earnings</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Total Bookings</span>
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-gray-900">{userBookings.length}</div>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Pending</span>
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="text-gray-900">
                      {userBookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').length}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Awaiting service</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Spent</span>
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-gray-900">
                      ₹{userBookings.reduce((sum, b) => sum + b.price, 0).toLocaleString('en-IN')}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Total spent</p>
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
                  <Button variant="ghost" size="sm">Pending</Button>
                  <Button variant="ghost" size="sm">Completed</Button>
                </div>
              </div>

              {bookingsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : userBookings.length === 0 ? (
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
                  {userBookings.slice(0, 5).map((booking: any) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-[#ff6b35] transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="text-gray-900 mb-1">{booking.service?.title || 'Service'}</h3>
                          <p className="text-sm text-gray-600">{booking.provider?.businessName || booking.provider?.user?.name || 'Provider'}</p>
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
                          <span className="font-medium text-gray-900">₹{Number(booking.totalAmount).toFixed(2)}</span>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/invoices?bookingId=${booking.id}`}>
                              <Button variant="ghost" size="sm">View Invoice</Button>
                            </Link>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Analytics Charts (Admin Only) */}
            {isAdmin && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-gray-900 mb-4">Platform Analytics</h2>
                <AnalyticsCharts />
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
                    {providerData && (providerData.status === 'SUSPENDED' || providerData.status === 'REJECTED') && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-orange-600 border-orange-200 hover:bg-orange-50"
                        onClick={() => setShowUnbanForm(true)}
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Request Unban / Appeal
                      </Button>
                    )}
                    <Link to={`/provider/${providerId || user.id}`}>
                      <Button variant="outline" className="w-full justify-start">
                        View My Profile
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start">
                      Manage Services
                    </Button>
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
                <Link to="/messages">
                  <Button variant="outline" className="w-full justify-start">
                    Messages
                  </Button>
                </Link>
                <Link to="/invoices">
                  <Button variant="outline" className="w-full justify-start">
                    View Invoices
                  </Button>
                </Link>
              </div>
            </div>

            {/* Pending Items (Admin) */}
            {isAdmin && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-gray-900 mb-4">Pending Approvals</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">New Providers</p>
                      <p className="text-xs text-gray-600">2 awaiting verification</p>
                    </div>
                    <Link to="/admin?tab=providers">
                      <Button size="sm" variant="outline">Review</Button>
                    </Link>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Reports</p>
                      <p className="text-xs text-gray-600">2 open tickets</p>
                    </div>
                    <Link to="/admin?tab=reports">
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900">Booking completed</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900">New message received</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900">Booking confirmed</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unban Request Form Modal */}
      {isProvider && providerData && (
        <UnbanRequestForm
          isOpen={showUnbanForm}
          onClose={() => setShowUnbanForm(false)}
          providerStatus={providerData.status}
        />
      )}
    </div>
  );
}
