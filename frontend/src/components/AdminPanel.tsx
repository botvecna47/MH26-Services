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
  PlatformStats,
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
  primaryCategory?: string; // Added for custom category check
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  documents?: { id: string; type: string; url: string }[];
  gallery?: string[];
  aadharPanUrl?: string;
  portfolioUrls?: string[];
  socialMediaLinks?: any;
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
  const { data: usersData } = useAdminUsers({ limit: 100 });
  const { data: bookingsData } = useAdminBookings({ status: bookingFilter === 'all' ? undefined : bookingFilter.toUpperCase() });
  const { data: categoriesData } = useCategories();
  const categories = categoriesData || [];

  // Mutations
  const approveProviderMutation = useApproveProvider();
  const rejectProviderMutation = useRejectProvider();
  const suspendProviderMutation = useSuspendProvider();
  const unsuspendProviderMutation = useUnsuspendProvider();
  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();
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
      toast.success(`Provider approved successfully${category ? ` as "${category}" category` : ''}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to approve provider';
      toast.error(errorMessage);
    }
  };

  const handleRejectProvider = async (providerId: string, providedReason?: string) => {
    const reason = providedReason || prompt('Enter rejection reason (required):');
    if (!reason || reason.trim().length === 0) {
      toast.error('Rejection reason is required');
      return;
    }
    try {
      await rejectProviderMutation.mutateAsync({ id: providerId, reason: reason.trim() });
      toast.success('Provider rejected');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to reject provider';
      toast.error(errorMessage);
    }
  };

  const handleSuspendProvider = async (providerId: string) => {
    const reason = prompt('Enter reason for suspension (required):');
    if (!reason || reason.trim().length === 0) {
      toast.error('Suspension reason is required');
      return;
    }
    if (!confirm(`Are you sure you want to suspend this provider?\n\nReason: ${reason}`)) {
      return;
    }
    try {
      await suspendProviderMutation.mutateAsync({ id: providerId, reason: reason.trim() });
      toast.success('Provider suspended');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to suspend provider';
      toast.error(errorMessage);
    }
  };

  const handleUnsuspendProvider = async (providerId: string) => {
    if (!confirm('Are you sure you want to unsuspend this provider?')) {
      return;
    }
    const reason = prompt('Enter reason for unsuspension (optional):') || 'Admin Action';
    try {
      await unsuspendProviderMutation.mutateAsync({ id: providerId, reason });
      toast.success('Provider unsuspended and reactivated');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to unsuspend provider';
      toast.error(errorMessage);
    }
  };

  const handleBanUser = async (userId: string) => {
    const reason = prompt('Enter reason for banning user (minimum 5 characters):');
    if (!reason || reason.trim().length < 5) {
      toast.error('Ban reason must be at least 5 characters');
      return;
    }
    if (!confirm(`Are you sure you want to ban this user?\n\nReason: ${reason}\n\nThis will revoke their access and send a notification email.`)) {
      return;
    }
    try {
      await banUserMutation.mutateAsync({ id: userId, reason: reason.trim() });
      toast.success('User banned successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to ban user';
      toast.error(errorMessage);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to unban this user?\n\nThis will restore their access to the platform.')) {
      return;
    }
    const reason = prompt('Enter reason for unbanning (optional):') || 'Admin Action';
    try {
      await unbanUserMutation.mutateAsync({ id: userId, reason });
      toast.success('User unbanned successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to unban user';
      toast.error(errorMessage);
    }
  };

  const pendingProviders = pendingProvidersData?.data || [];
  const allProviders = allProvidersData?.data || [];
  const recentBookings = analytics?.recentBookings || [];

  // Derived Stats
  const platformStats: PlatformStats = analytics?.stats || {
    totalUsers: 0,
    totalProviders: 0,
    pendingProviders: 0,
    totalBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    grossVolume: 0,
    totalTaxCollected: 0
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-4">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile Tile Grid Navigation - Hidden on md+ */}
          <div className="grid grid-cols-3 gap-2 mb-4 md:hidden">
            {[
              { value: 'overview', icon: BarChart3, label: 'Overview' },
              { value: 'users', icon: Users, label: 'Users' },
              { value: 'providers', icon: UserCheck, label: 'Providers', badge: pendingProviders.length },
              { value: 'transactions', icon: CreditCard, label: 'Bookings' },
              { value: 'analytics', icon: PieChart, label: 'Analytics' },
              { value: 'appeals', icon: Flag, label: 'Appeals' },
              { value: 'reports', icon: AlertCircle, label: 'Reports' },
              { value: 'categories', icon: Tag, label: 'Categories' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
                  activeTab === tab.value
                    ? 'bg-[#ff6b35] text-white shadow-md'
                    : 'bg-white/80 text-gray-600 border border-gray-200/50 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Desktop Horizontal Tabs - Hidden on mobile */}
          <div className="hidden md:flex justify-center">
          <TabsList className="inline-flex w-auto bg-white/80 backdrop-blur-md rounded-2xl p-1.5 shadow-sm border border-gray-200/50 mb-4 gap-1">
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
              value="reports"
              className="flex-1 py-3 text-sm font-medium text-gray-600 rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:text-[#ff6b35] data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-gray-100 hover:bg-gray-50/80"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Reports
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
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

              <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Gross Volume</p>
                      <p className="text-2xl font-bold text-gray-900">₹{platformStats.grossVolume?.toLocaleString('en-IN') || '0'}</p>
                      <p className="text-xs text-green-600 font-medium mt-1">Total processed</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Platform Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">₹{platformStats.totalRevenue.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-green-600 font-medium mt-1">7% Commission</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-cyan-50 to-cyan-100/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tax Collected</p>
                      <p className="text-2xl font-bold text-gray-900">₹{platformStats.totalTaxCollected?.toLocaleString('en-IN') || '0'}</p>
                      <p className="text-xs text-cyan-600 font-medium mt-1">8% GST</p>
                    </div>
                    <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-50 to-rose-100/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">My Spending</p>
                      <p className="text-2xl font-bold text-gray-900">₹{user?.totalSpending?.toLocaleString() || '0'}</p>
                      <p className="text-xs text-rose-600 font-medium mt-1">As Admin</p>
                    </div>
                    <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                      <CreditCard className="w-6 h-6 text-white" />
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
                      recentBookings.map((booking: any) => (
                        <div key={booking.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                          <div className="overflow-hidden">
                            <p className="font-bold text-sm truncate text-gray-900">{booking.user?.name || 'User'}</p>
                            <p className="text-[10px] text-gray-500 truncate uppercase font-black tracking-widest">{booking.provider?.businessName || 'Provider'}</p>
                          </div>
                          <div className="text-right flex items-center gap-4">
                            <div className="hidden sm:block">
                                <p className="font-black text-sm">₹{booking.totalAmount}</p>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>{booking.status}</span>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 rounded-full hover:bg-orange-600 hover:text-white transition-all shadow-sm bg-white"
                                onClick={() => setSelectedBooking(booking)}
                            >
                                <Eye className="h-4 h-4" />
                            </Button>
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
                    Pending Review ({pendingProviders.length})
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingProviders.map((provider) => {
                      // Determine if this is a custom (unknown) category
                      const existingCategories = categories?.map((c: any) => c.name.toLowerCase()) || [];
                      const isCustomCategory = !existingCategories.includes(provider.primaryCategory?.toLowerCase());
                      const hasCustomCategory = isCustomCategory && provider.primaryCategory;
                      
                      return (
                        <Card key={provider.id} className="border-l-4 border-l-yellow-400 shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-5">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-bold text-gray-900">{provider.businessName}</h4>
                                <p className="text-sm text-gray-500">{provider.primaryCategory}</p>
                              </div>
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
                            </div>

                            {/* Provider Info */}
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

                            {/* Action Buttons */}
                            <div className="pt-3 border-t border-gray-100 space-y-3">
                              {/* Step 1: Always show Review Docs button */}
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="w-full" 
                                onClick={() => {
                                  const mappedProvider: VerificationProvider = {
                                    id: provider.id,
                                    businessName: provider.businessName,
                                    primaryCategory: provider.primaryCategory,
                                    user: provider.user,
                                    documents: provider.documents?.map((d: any) => ({
                                      id: d.id,
                                      type: d.type,
                                      url: d.fileUrl || d.url
                                    })) || [],
                                    gallery: provider.gallery || [],
                                    aadharPanUrl: provider.aadharPanUrl,
                                    portfolioUrls: provider.portfolioUrls || [],
                                    socialMediaLinks: provider.socialMediaLinks
                                  };
                                  setSelectedVerificationProvider(mappedProvider);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Review Documents
                              </Button>

                              {/* Custom Category Warning & Actions */}
                              {hasCustomCategory && (
                                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg space-y-3">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-sm font-medium text-amber-800">Unknown Category</p>
                                      <p className="text-xs text-amber-600 mt-0.5">
                                        "<span className="font-bold">{provider.primaryCategory}</span>" is not in the system. Choose an action:
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* Option 1: Create new category (doesn't approve) */}
                                  <Button 
                                    size="sm" 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={createCategoryMutation.isPending}
                                    onClick={async () => {
                                      try {
                                        await createCategoryMutation.mutateAsync({
                                          name: provider.primaryCategory,
                                          slug: provider.primaryCategory.toLowerCase().replace(/\s+/g, '-'),
                                          icon: '📦',
                                        });
                                        toast.success(`Category "${provider.primaryCategory}" created successfully!`);
                                        // After creating, the card will re-render and show normal Approve/Reject
                                      } catch (error: any) {
                                        const errorMessage = error.response?.data?.error || 'Failed to create category';
                                        toast.error(errorMessage);
                                      }
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    {createCategoryMutation.isPending ? 'Creating...' : `Create "${provider.primaryCategory}" Category`}
                                  </Button>
                                  
                                  {/* Option 2: Approve with "Other" category */}
                                  <Button 
                                    size="sm" 
                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                    disabled={approveProviderMutation.isPending}
                                    onClick={() => handleApproveProvider(provider.id, 'Other')}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    {approveProviderMutation.isPending ? 'Approving...' : 'Approve as "Other" Category'}
                                  </Button>
                                </div>
                              )}

                              {/* Standard Approve/Reject buttons for known categories */}
                              {!hasCustomCategory && (
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    disabled={approveProviderMutation.isPending}
                                    onClick={() => handleApproveProvider(provider.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    {approveProviderMutation.isPending ? 'Approving...' : 'Approve'}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="flex-1 text-red-600 hover:bg-red-50 border-red-200"
                                    onClick={() => handleRejectProvider(provider.id)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}

                              {/* Reject button for custom category case */}
                              {hasCustomCategory && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="w-full text-red-600 hover:bg-red-50 border-red-200"
                                  onClick={() => handleRejectProvider(provider.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject Application
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
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
                {/* Mobile Card View - Hidden on md+ */}
                <div className="md:hidden divide-y divide-gray-200">
                  {allProviders.map((p: any) => (
                    <div key={p.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{p.businessName}</p>
                          <p className="text-xs text-gray-500">{p.user?.email}</p>
                        </div>
                        <Badge variant={
                          p.status === 'APPROVED' ? 'default' :
                          p.status === 'PENDING' ? 'secondary' :
                          p.status === 'SUSPENDED' ? 'destructive' : 'outline'
                        }>
                          {p.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded">{p.primaryCategory}</span>
                          <span>{p.city}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedDetailProviderId(p.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {p.status === 'APPROVED' && (
                            <Button size="sm" variant="outline" className="text-red-600 text-xs" onClick={() => handleSuspendProvider(p.id)}>
                              Suspend
                            </Button>
                          )}
                          {p.status === 'SUSPENDED' && (
                            <Button size="sm" variant="outline" className="text-green-600 text-xs" onClick={() => handleUnsuspendProvider(p.id)}>
                              Unsuspend
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View - Hidden on mobile */}
                <div className="overflow-x-auto hidden md:block">
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

              {/* Mobile Card View - Hidden on md+ */}
              <div className="md:hidden divide-y divide-gray-200">
                {usersData?.data.map((u: UserType) => (
                  <div key={u.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                          {(u.firstName || u.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {u.firstName ? `${u.firstName} ${u.lastName || ''}` : (u.email || 'Unknown User')}
                          </p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                      {u.isBanned ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">Banned</span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Active</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={(u as any).role === 'ADMIN' ? 'default' : (u as any).role === 'PROVIDER' ? 'secondary' : 'outline'}>
                          {(u as any).role || 'CUSTOMER'}
                        </Badge>
                        <span className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedUserId(u.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {u.isBanned ? (
                          <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleUnbanUser(u.id)}>
                            Unban
                          </Button>
                        ) : (u as any).role !== 'ADMIN' && (
                          <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleBanUser(u.id)}>
                            Ban
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View - Hidden on mobile */}
              <div className="overflow-x-auto hidden md:block">
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
                              // Admin users cannot be banned - hide button entirely for admins
                              (u as any).role !== 'ADMIN' && (
                                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleBanUser(u.id)}>
                                  Ban
                                </Button>
                              )
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
              <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">All Transactions</h3>
                {/* Mobile-friendly scrollable filter buttons */}
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                <div className="flex gap-2 min-w-max">
                  {/* Filter Buttons */}
                  {(['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'expired'] as const).map(f => (
                    <Button
                      key={f}
                      variant={bookingFilter === f ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBookingFilter(f as any)}
                      className="capitalize whitespace-nowrap"
                    >
                      {f.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
                </div>
              </div>

              {/* Mobile Card View - Hidden on md+ */}
              <div className="md:hidden divide-y divide-gray-200">
                {(bookingsData?.data || []).length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No bookings found for this filter.</div>
                ) : (
                  (bookingsData?.data || []).map((booking: Booking) => (
                    <div key={booking.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{booking.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{booking.provider?.businessName}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                          ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          booking.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
                          booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          booking.status === 'EXPIRED' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}
                        >
                          {booking.status.toLowerCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">{booking.service?.title || 'Service'}</span>
                        <span className="font-bold text-gray-900">₹{booking.totalAmount}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'N/A'} {booking.scheduledTime?.slice(0, 5)}</span>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(booking)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {booking.status === 'COMPLETED' && (
                            <Button variant="ghost" size="sm" onClick={() => setSelectedInvoiceBooking(booking)}>
                              <DollarSign className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {booking.userId === user?.id && (booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS') && booking.completionOtp && (
                        <div className="mt-2">
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 font-mono text-xs">
                            OTP: {booking.completionOtp}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View - Hidden on mobile */}
              <div className="overflow-x-auto hidden md:block">
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

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Provider Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">Reports Management</p>
                  <p className="text-sm mt-2">Provider reports from customers will appear here.</p>
                  <p className="text-xs mt-4 text-gray-400">
                    Reports are tied to completed bookings and require admin review.
                  </p>
                </div>
              </CardContent>
            </Card>
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
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

      {selectedVerificationProvider && (() => {
        // Check if this provider has a custom (unknown) category
        const existingCategoryNames = categories?.map((c: any) => c.name.toLowerCase()) || [];
        const isCustomCat = selectedVerificationProvider.primaryCategory 
          ? !existingCategoryNames.includes(selectedVerificationProvider.primaryCategory.toLowerCase())
          : false;
        
        return (
          <VerificationModal
            isOpen={!!selectedVerificationProvider}
            onClose={() => setSelectedVerificationProvider(null)}
            provider={selectedVerificationProvider}
            onApprove={handleApproveProvider}
            onReject={(id, reason) => {
              handleRejectProvider(id, reason);
              setSelectedVerificationProvider(null);
            }}
            isCustomCategory={isCustomCat}
          />
        );
      })()}

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
import { format } from 'date-fns'; // Added for date formatting

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
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to add category';
      toast.error(errorMessage);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat: any) => (
                <div key={cat.id} className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-orange-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
                    
                    {editingId === cat.id ? (
                        <div className="space-y-4 relative z-10">
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-gray-400">Name</Label>
                                <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-10 rounded-xl border-gray-100" />
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-gray-400">Slug</Label>
                                <Input value={editSlug} onChange={e => setEditSlug(e.target.value)} className="h-10 rounded-xl border-gray-100" />
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-gray-400">Icon (Emoji/Lucide)</Label>
                                <Input value={editIcon} onChange={e => setEditIcon(e.target.value)} className="h-10 rounded-xl border-gray-100 text-center text-xl" />
                             </div>
                             <div className="flex gap-2 pt-2">
                                <Button size="sm" onClick={() => handleUpdate(cat.id)} disabled={updateCategoryMutation.isPending} className="flex-1 rounded-xl bg-orange-600 hover:bg-orange-700 h-10 font-bold">
                                    {updateCategoryMutation.isPending ? '...' : <Check className="w-4 h-4 mr-2" />} Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEdit} className="rounded-xl h-10 border-gray-100">
                                    <X className="w-4 h-4" />
                                </Button>
                             </div>
                        </div>
                    ) : (
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-gray-50 group-hover:scale-110 transition-transform duration-300">
                                    {cat.icon || '📦'}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="sm" variant="ghost" onClick={() => startEdit(cat)} className="h-9 w-9 p-0 rounded-xl hover:bg-orange-50 text-orange-600">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(cat.id)} className="h-9 w-9 p-0 rounded-xl hover:bg-red-50 text-red-600">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-black text-gray-900 text-lg group-hover:text-orange-600 transition-colors uppercase tracking-tight leading-none mb-1">{cat.name}</h4>
                                <div className="flex items-center gap-2">
                                    <code className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">/{cat.slug}</code>
                                    <div className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}


// Icons imported from lucide-react
