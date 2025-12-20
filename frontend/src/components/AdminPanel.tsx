import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import {
  Shield,
  Users,
  Flag,
  DollarSign,
  UserCheck,
  CreditCard,
  PieChart,
  Settings,
  Calendar,
  BarChart3,
  Phone,
  MapPin,
  AlertCircle,
  User as UserIcon,
  CheckCircle,
  XCircle,
  Eye,
  LogOut,
  Download,
  Edit,
  Tag, 
  Plus,
  Trash2,
  X,
  Check,
  Package,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
// import { useNotifications } from '../context/NotificationContext';
import AnalyticsCharts from './AnalyticsCharts';
import CustomerProfilePage from './CustomerProfilePage';
import InvoicePreviewModal from './InvoicePreviewModal';
import AppealsTable from './AppealsTable';
import {
  useAnalytics,
  usePendingProviders,
  useAllProviders,
  useAdminUsers,
  useApproveProvider,
  useRejectProvider,
  useSuspendProvider,
  useUnsuspendProvider,
  useBanUser,
  useUnbanUser,
  useAdminBookings,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  usePendingServices,
  useApproveService,
  useRejectService
} from '../api/admin';
import { useCategories } from '../api/categories'; // Added
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import VerificationModal from './VerificationModal';
import { Booking } from '../api/bookings';
import { User as UserType } from '../types/database';
import UserDetailModal from './UserDetailModal';
import ProviderDetailModal from './ProviderDetailModal';
import BookingDetailModal from './BookingDetailModal';
import AddProviderModal from './AddProviderModal';

// Define the type expected by VerificationModal
interface VerificationProvider {
  id: string;
  businessName: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  documents?: { id: string; type: string; url: string }[];
}

export default function AdminPanel() {
  const { user, isAdmin } = useUser();
  // const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'expired'>('all');
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null); // New state for full details
  const [selectedVerificationProvider, setSelectedVerificationProvider] = useState<VerificationProvider | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedDetailProviderId, setSelectedDetailProviderId] = useState<string | null>(null); // New state
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);

  // Queries
  const { data: analytics } = useAnalytics();
  const { data: pendingProvidersData } = usePendingProviders();
  const { data: allProvidersData } = useAllProviders({ limit: 50 });
  const { data: usersData } = useAdminUsers({ limit: 50 });
  const { data: bookingsData } = useAdminBookings({ status: bookingFilter === 'all' ? undefined : bookingFilter.toUpperCase() });
  const { data: pendingServicesData } = usePendingServices();
  const { data: categoriesData } = useCategories();
  const categories = categoriesData || [];

  // Mutations
  const approveProviderMutation = useApproveProvider();
  const rejectProviderMutation = useRejectProvider();
  const suspendProviderMutation = useSuspendProvider();
  const unsuspendProviderMutation = useUnsuspendProvider();
  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();
  const approveServiceMutation = useApproveService();
  const rejectServiceMutation = useRejectService();
  const createCategoryMutation = useCreateCategory();

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page</p>
        </div>
      </div>
    );
  }

  const handleApproveProvider = async (providerId: string, category?: string) => {
    try {
      await approveProviderMutation.mutateAsync({ id: providerId, category });
      toast.success('Provider approved successfully');
    } catch (error) {
      toast.error('Failed to approve provider');
    }
  };

  const handleRejectProvider = async (providerId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        await rejectProviderMutation.mutateAsync({ id: providerId, reason });
        toast.success('Provider rejected');
      } catch (error) {
        toast.error('Failed to reject provider');
      }
    }
  };

  const handleSuspendProvider = async (providerId: string) => {
    const reason = prompt('Enter reason for suspension:');
    if (reason) {
      if (confirm('Are you sure you want to suspend this provider?')) {
        try {
          await suspendProviderMutation.mutateAsync({ id: providerId, reason });
          toast.success('Provider suspended');
        } catch (error) {
          toast.error('Failed to suspend provider');
        }
      }
    }
  };

  const handleUnsuspendProvider = async (providerId: string) => {
    const reason = prompt('Enter reason for unsuspension (optional):');
    try {
      await unsuspendProviderMutation.mutateAsync({ id: providerId, reason: reason || 'Admin Action' });
      toast.success('Provider unsuspended');
    } catch (error) {
      toast.error('Failed to unsuspend provider');
    }
  };

  const handleBanUser = async (userId: string) => {
    const reason = prompt('Enter reason for banning user:');
    if (reason) {
      try {
        await banUserMutation.mutateAsync({ id: userId, reason });
        toast.success('User banned');
      } catch (error) {
        toast.error('Failed to ban user');
      }
    }
  };

  const handleUnbanUser = async (userId: string) => {
    const reason = prompt('Enter reason for unbanning user (optional):');
    if (confirm('Are you sure you want to unban this user?')) {
      try {
        await unbanUserMutation.mutateAsync({ id: userId, reason: reason || 'Admin Action' });
        toast.success('User unbanned');
      } catch (error) {
        toast.error('Failed to unban user');
      }
    }
  };

  const pendingProviders = pendingProvidersData?.data || [];
  const allProviders = allProvidersData?.data || [];
  const recentBookings = analytics?.recentBookings || [];
  const pendingServices = pendingServicesData?.data || [];

  // Derived Stats
  const platformStats = analytics?.stats || {
    totalUsers: 0,
    totalProviders: 0,
    pendingProviders: 0,
    totalBookings: 0,
    completedBookings: 0,
    totalRevenue: 0
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#ff6b35] rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-lg leading-tight">MH26 Services</h1>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </div>

            {/* System Status */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">System Healthy</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="font-medium text-sm text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center border border-orange-200">
                  <Shield className="w-4 h-4 text-[#ff6b35]" />
                </div>
              </div>

              {/* Logout - strictly strictly strictly keep logout logic */}
              {/* <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="inline-flex w-auto bg-white/80 backdrop-blur-md rounded-2xl p-1.5 shadow-sm border border-gray-200/50 mb-8 gap-1">
            <TabsTrigger
              value="overview"
              className="flex-1 py-3 text-sm font-medium text-gray-600 rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:text-[#ff6b35] data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-gray-100 hover:bg-gray-50/80"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex-1 py-3 text-sm font-medium text-gray-600 rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:text-[#ff6b35] data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-gray-100 hover:bg-gray-50/80"
            >
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="providers"
              className="flex-1 py-3 text-sm font-medium text-gray-600 rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:text-[#ff6b35] data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-gray-100 hover:bg-gray-50/80"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Providers
              {pendingProviders.length > 0 && (
                <span className="ml-2 bg-[#ff6b35] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">{pendingProviders.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="flex-1 py-3 text-sm font-medium text-gray-600 rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:text-[#ff6b35] data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-gray-100 hover:bg-gray-50/80"
            >
              <Package className="w-4 h-4 mr-2" />
              Services
              {pendingServices.length > 0 && (
                <span className="ml-2 bg-[#ff6b35] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">{pendingServices.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="flex-1 py-3 text-sm font-medium text-gray-600 rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:text-[#ff6b35] data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-gray-100 hover:bg-gray-50/80"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex-1 py-3 text-sm font-medium text-gray-600 rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:text-[#ff6b35] data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-gray-100 hover:bg-gray-50/80"
            >
              <PieChart className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="appeals"
              className="flex-1 py-3 text-sm font-medium text-gray-600 rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:text-[#ff6b35] data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-gray-100 hover:bg-gray-50/80"
            >
              <Flag className="w-4 h-4 mr-2" />
              Appeals
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex-1 py-3 text-sm font-medium text-gray-600 rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:text-[#ff6b35] data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-gray-100 hover:bg-gray-50/80"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="flex-1 py-3 text-sm font-medium text-gray-600 rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:text-[#ff6b35] data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-gray-100 hover:bg-gray-50/80"
            >
              <Tag className="w-4 h-4 mr-2" />
              Categories
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{platformStats.totalUsers.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">₹{platformStats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Providers</p>
                      <p className="text-2xl font-bold text-gray-900">{platformStats.totalProviders}</p>
                      <p className="text-xs text-purple-600 font-medium mt-1">
                        {platformStats.pendingProviders} pending approval
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                      <p className="text-2xl font-bold text-gray-900">{platformStats.totalBookings.toLocaleString()}</p>
                      <p className="text-xs text-yellow-600 font-medium mt-1">
                        {platformStats.completedBookings} completed
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Admin Personal Stats Card */}
             <div className="mt-6 mb-6">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">My Total Spending</p>
                                <p className="text-2xl font-bold text-gray-900">₹{user?.totalSpending?.toLocaleString() || '0'}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
             </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AnalyticsCharts data={analytics} />
              </div>
              <div className="space-y-6">
                {/* Recent Transactions/Bookings */}
                <Card className="border-0 shadow-sm bg-white h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Bookings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentBookings.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No recent bookings</p>
                    ) : (
                      recentBookings.map((booking) => (
                        <div key={booking.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="overflow-hidden">
                            <p className="font-medium text-sm truncate">{booking.user?.name || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{booking.provider?.businessName || 'Provider'}</p>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <p className="font-bold text-sm">₹{booking.totalAmount}</p>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>{booking.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                    <Button variant="outline" className="w-full text-xs" onClick={() => setActiveTab('transactions')}>
                      View All Bookings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Providers Tab - Approval Workflow */}
          <TabsContent value="providers" className="space-y-6">
            <div className="grid gap-6">
              {pendingProviders.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="text-yellow-500 h-5 w-5" />
                    Pending Refiew ({pendingProviders.length})
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingProviders.map((provider) => (
                      <Card key={provider.id} className="border-l-4 border-l-yellow-400 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-gray-900">{provider.businessName}</h4>
                              <p className="text-sm text-gray-500">{provider.primaryCategory}</p>
                            </div>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
                          </div>

                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4" /> {provider.user?.name}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" /> {provider.user?.phone}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" /> {provider.city}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-gray-100 flex-wrap">
                            <Button size="sm" variant="outline" className="w-full mb-2" onClick={() => {
                              const mappedProvider: VerificationProvider = {
                                id: provider.id,
                                businessName: provider.businessName,
                                user: provider.user,
                                documents: provider.documents?.map((d: any) => ({
                                  id: d.id,
                                  type: d.type,
                                  url: d.fileUrl || d.url
                                })) || []
                              };
                              setSelectedVerificationProvider(mappedProvider);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Review Docs
                            </Button>
                            
                            {/* Check if category is custom (not in existing categories) */}
                            {(() => {
                              const existingCategories = categories?.map((c: any) => c.name.toLowerCase()) || [];
                              const isCustomCategory = !existingCategories.includes(provider.primaryCategory?.toLowerCase());
                              
                              if (isCustomCategory && provider.primaryCategory) {
                                return (
                                  <div className="w-full space-y-2">
                                    <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-sm">
                                      <p className="text-amber-800 font-medium">Custom Category: <span className="font-bold">{provider.primaryCategory}</span></p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button 
                                        size="sm" 
                                        className="flex-1 bg-blue-600 hover:bg-blue-700" 
                                        onClick={async () => {
                                          // Create new category and approve with it
                                          try {
                                            await createCategoryMutation.mutateAsync({
                                              name: provider.primaryCategory,
                                              slug: provider.primaryCategory.toLowerCase().replace(/\s+/g, '-'),
                                              icon: '📦',
                                            });
                                            await handleApproveProvider(provider.id);
                                            toast.success(`Category "${provider.primaryCategory}" created!`);
                                          } catch (error) {
                                            toast.error('Failed to create category');
                                          }
                                        }}
                                      >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Create Category
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        className="flex-1 bg-gray-600 hover:bg-gray-700" 
                                        onClick={() => handleApproveProvider(provider.id, 'Other')}
                                      >
                                        Assign to Other
                                      </Button>
                                    </div>
                                    <Button size="sm" variant="outline" className="w-full text-red-600 hover:bg-red-50" onClick={() => handleRejectProvider(provider.id)}>
                                      Reject
                                    </Button>
                                  </div>
                                );
                              }
                              
                              return (
                                <div className="flex gap-2 w-full">
                                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleApproveProvider(provider.id)}>
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="outline" className="flex-1 text-red-600 hover:bg-red-50" onClick={() => handleRejectProvider(provider.id)}>
                                    Reject
                                  </Button>
                                </div>
                              );
                            })()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* All Providers Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">All Providers</h3>
                  <Button size="sm" onClick={() => setIsAddProviderOpen(true)} className="bg-[#ff6b35] hover:bg-[#e65a25]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Provider
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allProviders.map((p: any) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{p.businessName}</p>
                              <p className="text-xs text-gray-500">{p.user?.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{p.primaryCategory}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{p.city}</td>
                          <td className="px-6 py-4">
                            <Badge variant={
                              p.status === 'APPROVED' ? 'default' :
                                p.status === 'PENDING' ? 'secondary' :
                                  p.status === 'SUSPENDED' ? 'destructive' :
                                    'outline'
                            }>
                              {p.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="ghost" onClick={() => setSelectedDetailProviderId(p.id)}>
                                <Eye className="h-4 w-4 text-gray-500" />
                              </Button>
                              {p.status === 'APPROVED' && (
                                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleSuspendProvider(p.id)}>
                                  Suspend
                                </Button>
                              )}
                              {p.status === 'SUSPENDED' && (
                                <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50" onClick={() => handleUnsuspendProvider(p.id)}>
                                  Unsuspend
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-semibold text-gray-900">User Management</h2>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {usersData?.data.map((u: UserType) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                              {(u.firstName || u.email || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {u.firstName ? `${u.firstName} ${u.lastName || ''}` : (u.email || 'Unknown User')}
                              </p>
                              <p className="text-xs text-gray-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <Badge variant={
                              (u as any).role === 'ADMIN' ? 'default' : 
                              (u as any).role === 'PROVIDER' ? 'secondary' : 
                              'outline'
                            }>
                              {(u as any).role || 'CUSTOMER'}
                            </Badge>
                            {/* Show provider onboarding status if applicable */}
                            {(u as any).provider?.status && (u as any).provider?.status !== 'APPROVED' && (
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                (u as any).provider?.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                (u as any).provider?.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                Provider: {(u as any).provider?.status}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {u.isBanned ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Banned
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setSelectedUserId(u.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {/* User Actions: Ban/Unban */}
                            {u.isBanned ? (
                              <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50" onClick={() => handleUnbanUser(u.id)}>
                                Unban
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleBanUser(u.id)} disabled={u.userType === 'admin'}>
                                Ban
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination would go here */}
            </div>
          </TabsContent>

          {/* Bookings / Transactions Tab */}
          <TabsContent value="transactions">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">All Transactions</h3>
                <div className="flex gap-2">
                  {/* Filter Buttons */}
                  {(['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'expired'] as const).map(f => (
                    <Button
                      key={f}
                      variant={bookingFilter === f ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBookingFilter(f as any)}
                      className="capitalize"
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Bookings Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">

                    {(bookingsData?.data || []).length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                          No bookings found for this filter.
                        </td>
                      </tr>
                    ) : (
                      (bookingsData?.data || []).map((booking: Booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-xs font-mono text-gray-500">#{booking.id?.slice(0, 8) || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">{booking.user?.name || 'Unknown'}</span>
                              <span className="text-xs text-gray-500">{booking.user?.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{booking.provider?.businessName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{booking.service?.title || 'Service'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'N/A'} <br />
                            <span className="text-xs text-gray-400">{booking.scheduledTime?.slice(0, 5) || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-gray-900">₹{booking.totalAmount}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                   ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                booking.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
                                booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                                  booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                    booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                    booking.status === 'EXPIRED' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                              {booking.status.toLowerCase()}
                            </span>
                            {/* OTP Display for Admin's Own Bookings */}
                            {booking.userId === user?.id && (booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS') && booking.completionOtp && (
                                <div className="mt-1">
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 font-mono text-xs">
                                        OTP: {booking.completionOtp}
                                    </Badge>
                                </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedBooking(booking)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4 text-gray-500" />
                              </Button>
                              {booking.status === 'COMPLETED' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedInvoiceBooking(booking)}
                                  title="View Invoice"
                                >
                                  <DollarSign className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Settings</h2>
              <CustomerProfilePage />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Detailed Analytics</h2>
              <AnalyticsCharts data={analytics} />
            </div>
          </TabsContent>

          <TabsContent value="appeals">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">Appeals Management</h3>
              </div>
              <AppealsTable />
            </div>
          </TabsContent>


          {/* Services Tab - Pending Services Verification */}
          <TabsContent value="services" className="space-y-6">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">Pending Services</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Review and approve services submitted by providers</p>
                  </div>
                  <Badge className="bg-orange-100 text-[#ff6b35]">
                    {pendingServices.length} pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {pendingServices.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No pending services to review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingServices.map((service: any) => (
                      <div key={service.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{service.title}</h4>
                              <Badge className="bg-yellow-100 text-yellow-700">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending Review
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{service.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span><strong>Price:</strong> ₹{service.price}</span>
                              <span><strong>Duration:</strong> {service.durationMin} min</span>
                              <span><strong>Provider:</strong> {service.provider?.businessName}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              onClick={async () => {
                                try {
                                  await approveServiceMutation.mutateAsync(service.id);
                                  toast.success('Service approved and now visible to customers');
                                } catch (error) {
                                  toast.error('Failed to approve service');
                                }
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                const reason = prompt('Enter reason for rejection:');
                                if (reason) {
                                  try {
                                    await rejectServiceMutation.mutateAsync({ id: service.id, reason });
                                    toast.success('Service rejected');
                                  } catch (error) {
                                    toast.error('Failed to reject service');
                                  }
                                }
                              }}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <div className="space-y-6">
               {/* Add Category Card */}
               <Card className="border-0 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Manage Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AddCategoryForm />
                  </CardContent>
               </Card>

               {/* Categories List */}
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <CategoryList />
               </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <ProviderDetailModal
        providerId={selectedDetailProviderId}
        isOpen={!!selectedDetailProviderId}
        onClose={() => setSelectedDetailProviderId(null)}
      />

      {/* Other Modals */}
      {selectedInvoiceBooking && (
        <InvoicePreviewModal
          isOpen={!!selectedInvoiceBooking}
          onClose={() => setSelectedInvoiceBooking(null)}
          bookingId={selectedInvoiceBooking.id}
        />
      )}

      {selectedVerificationProvider && (
        <VerificationModal
          isOpen={!!selectedVerificationProvider}
          onClose={() => setSelectedVerificationProvider(null)}
          provider={selectedVerificationProvider}
          onApprove={handleApproveProvider}
          onReject={(id) => {
             // Logic to handle reject from modal if needed, or just close
             handleRejectProvider(id);
             setSelectedVerificationProvider(null);
          }}
        />
      )}

      <AddProviderModal 
        isOpen={isAddProviderOpen} 
        onClose={() => setIsAddProviderOpen(false)} 
      />


      <UserDetailModal 
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
        userId={selectedUserId}
      />

      {/* Booking Detail Modal for Admin Actions */}
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

// Sub-components for Categories to keep main file clean
import { Input } from './ui/input';
import { Label } from './ui/label';

function AddCategoryForm() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('');
  const createCategoryMutation = useCreateCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    
    try {
      await createCategoryMutation.mutateAsync({ name, slug, icon });
      toast.success('Category added successfully');
      setName('');
      setSlug('');
      setIcon('');
    } catch (error) {
      toast.error('Failed to add category');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
      <div className="grid w-full gap-2">
        <Label htmlFor="cat-name">Name</Label>
        <Input 
            id="cat-name" 
            placeholder="e.g. Gardening" 
            value={name} 
            onChange={e => {
                setName(e.target.value);
                // Auto-generate slug
                if (!slug) setSlug(e.target.value.toLowerCase().replace(/ /g, '-'));
            }}
        />
      </div>
      <div className="grid w-full gap-2">
        <Label htmlFor="cat-slug">Slug</Label>
        <Input 
            id="cat-slug" 
            placeholder="e.g. gardening" 
            value={slug} 
            onChange={e => setSlug(e.target.value)}
        />
      </div>
      <div className="grid w-full gap-2">
        <Label htmlFor="cat-icon">Icon (Lucide Name)</Label>
        <Input 
            id="cat-icon" 
            placeholder="e.g. flower" 
            value={icon} 
            onChange={e => setIcon(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={createCategoryMutation.isPending} className="bg-[#ff6b35] hover:bg-[#ff5722] text-white">
        {createCategoryMutation.isPending ? 'Adding...' : <><Plus className="w-4 h-4 mr-2" /> Add</>}
      </Button>
    </form>
  );
}



function CategoryList() {
    const { data: categories } = useCategories();
    const updateCategoryMutation = useUpdateCategory();
    const deleteCategoryMutation = useDeleteCategory();
    
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editSlug, setEditSlug] = useState('');
    const [editIcon, setEditIcon] = useState('');

    if (!categories) return <div>Loading...</div>;

    const startEdit = (cat: any) => {
        setEditingId(cat.id);
        setEditName(cat.name);
        setEditSlug(cat.slug);
        setEditIcon(cat.icon || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditSlug('');
        setEditIcon('');
    };

    const handleUpdate = async (id: string) => {
        try {
            await updateCategoryMutation.mutateAsync({
                id,
                data: { name: editName, slug: editSlug, icon: editIcon }
            });
            toast.success('Category updated');
            cancelEdit();
        } catch (error) {
            toast.error('Failed to update category');
        }
    };

    const handleDelete = async (id: string) => {
        if(confirm('Are you sure you want to delete this category?')) {
            try {
                await deleteCategoryMutation.mutateAsync(id);
                toast.success('Category deleted');
            } catch (error) {
                toast.error('Failed to delete category');
            }
        }
    };

    return (
        <>
            {categories.map((cat: any) => (
                <div key={cat.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    {editingId === cat.id ? (
                        <div className="flex-1 flex flex-col gap-2">
                             <div className="flex gap-2">
                                <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Name" className="h-8 text-sm" />
                                <Input value={editSlug} onChange={e => setEditSlug(e.target.value)} placeholder="Slug" className="h-8 text-sm" />
                             </div>
                             <Input value={editIcon} onChange={e => setEditIcon(e.target.value)} placeholder="Icon" className="h-8 text-sm" />
                             <div className="flex gap-2 mt-1">
                                <Button size="sm" onClick={() => handleUpdate(cat.id)} disabled={updateCategoryMutation.isPending} className="h-7 bg-green-600 hover:bg-green-700">
                                    <Check className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEdit} className="h-7">
                                    <X className="h-3 w-3" />
                                </Button>
                             </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-orange-50 rounded-full flex items-center justify-center text-[#ff6b35]">
                                    <Tag className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{cat.name}</p>
                                    <p className="text-xs text-gray-500">{cat.slug}</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => startEdit(cat)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(cat.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </>
    );
}


// Icons imported from lucide-react
