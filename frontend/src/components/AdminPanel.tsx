import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { 
  Shield, 
  Users, 
  Flag, 
  DollarSign, 
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Search,
  Loader2,
  AlertCircle,
  FileText as FileTextIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications } from '../context/NotificationContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import AnalyticsCharts from './AnalyticsCharts';
import { 
  useAdminAnalytics, 
  usePendingProviders,
  useAllProviders,
  useApproveProvider, 
  useRejectProvider,
  useAdminReports,
  useAdminUsers,
  useSuspendProvider,
  useUnsuspendProvider,
  useUpdateReport,
  useBanUser,
  adminApi
} from '../api/admin';
import { useQueryClient } from '@tanstack/react-query';
import { useBookings } from '../api/bookings';
import UserDetailsModal from './UserDetailsModal';
import { useAppeals, useReviewAppeal } from '../api/appeals';

export default function AdminPanel() {
  const { user, isAdmin } = useUser();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [providerFilter, setProviderFilter] = useState<'all' | 'pending' | 'rejected' | 'suspended'>('all');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [appealFilter, setAppealFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Fetch real data from API
  const { data: analyticsData, isLoading: analyticsLoading } = useAdminAnalytics();
  const { data: pendingProvidersData, isLoading: pendingProvidersLoading } = usePendingProviders();
  const { data: allProvidersData, isLoading: allProvidersLoading } = useAllProviders({ 
    status: providerFilter === 'all' ? undefined : providerFilter === 'pending' ? 'PENDING' : providerFilter === 'rejected' ? 'REJECTED' : providerFilter === 'suspended' ? 'SUSPENDED' : undefined,
    limit: 100 
  });
  const approveProviderMutation = useApproveProvider();
  const rejectProviderMutation = useRejectProvider();
  const { data: reportsData, isLoading: reportsLoading } = useAdminReports();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers();
  const { data: bookingsData, isLoading: bookingsLoading } = useBookings({ limit: 100 });
  const suspendProviderMutation = useSuspendProvider();
  const unsuspendProviderMutation = useUnsuspendProvider();
  const updateReportMutation = useUpdateReport();
  const banUserMutation = useBanUser();
  const { data: appealsData, isLoading: appealsLoading } = useAppeals({ 
    status: appealFilter === 'all' ? undefined : appealFilter.toUpperCase(),
    limit: 100 
  });
  const reviewAppealMutation = useReviewAppeal();

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

  const pendingProviders = pendingProvidersData?.data || [];
  const allProviders = allProvidersData?.data || [];
  const openReports = (reportsData?.data || []).filter((r: any) => r.status === 'OPEN' || r.status === 'INVESTIGATING');
  const allUsers = usersData?.data || [];
  const allBookings = bookingsData?.data || [];
  const allAppeals = appealsData?.data || [];
  
  // Use allProviders for the providers tab, pendingProviders for overview
  const providersForTab = providerFilter === 'all' ? allProviders : allProviders.filter((p: any) => {
    if (providerFilter === 'pending') return p.status === 'PENDING';
    if (providerFilter === 'rejected') return p.status === 'REJECTED';
    if (providerFilter === 'suspended') return p.status === 'SUSPENDED';
    return true;
  });
  
  const providersLoading = providerFilter === 'all' ? allProvidersLoading : pendingProvidersLoading;

  const filteredBookings = allBookings.filter((b: any) => {
    if (bookingFilter === 'all') return true;
    return b.status === bookingFilter.toUpperCase();
  });

  const handleApproveProvider = async (providerId: string) => {
    try {
      await approveProviderMutation.mutateAsync(providerId);
      toast.success('Provider approved and verified');
      // Invalidate all provider-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      addNotification({
        type: 'provider_approved',
        title: 'Provider Approved',
        body: 'A provider has been verified and activated',
        read: false
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve provider');
    }
  };

  const handleRejectProvider = async (providerId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        await rejectProviderMutation.mutateAsync({ id: providerId, reason });
        toast.success('Provider application rejected');
        // Invalidate all provider-related queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['providers'] });
        queryClient.invalidateQueries({ queryKey: ['admin'] });
        addNotification({
          type: 'provider_rejected',
          title: 'Provider Rejected',
          body: `Application rejected: ${reason}`,
          read: false
        });
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to reject provider');
      }
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      await updateReportMutation.mutateAsync({
        id: reportId,
        status: 'RESOLVED',
      });
      toast.success('Report marked as resolved');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resolve report');
    }
  };

  const handleSuspendProvider = async (providerId: string) => {
    if (!confirm('Are you sure you want to suspend this provider?')) {
      return;
    }
    try {
      await suspendProviderMutation.mutateAsync(providerId);
      toast.warning('Provider account suspended');
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to suspend provider');
    }
  };

  const handleUnsuspendProvider = async (providerId: string) => {
    if (!confirm('Are you sure you want to unsuspend this provider?')) {
      return;
    }
    try {
      await unsuspendProviderMutation.mutateAsync(providerId);
      toast.success('Provider account unsuspended');
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      queryClient.invalidateQueries({ queryKey: ['appeals'] });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to unsuspend provider');
    }
  };

  const handleBanUser = async (userId: string) => {
    const reason = prompt('Enter reason for banning this user:');
    if (!reason) return;
    
    try {
      await banUserMutation.mutateAsync({ id: userId, reason });
      toast.success('User banned successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to ban user');
    }
  };

  const handleExportData = async (dataType: string) => {
    try {
      if (dataType === 'Providers') {
        const response = await adminApi.exportProviders('json');
        // Create download link
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `providers_${new Date().toISOString()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Providers data exported');
      } else {
        toast.info('Export for ' + dataType + ' is not yet implemented');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to export data');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage providers, users, reports, and platform analytics</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="providers">
              Providers {pendingProviders.length > 0 && (
                <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5">
                  {pendingProviders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reports">
              Reports {openReports.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {openReports.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              {analyticsLoading ? (
                <div className="col-span-4 flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Total Users</span>
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-gray-900 mb-1">{analyticsData?.stats?.totalUsers || 0}</div>
                    <p className="text-xs text-green-600">Active users</p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Total Providers</span>
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-gray-900 mb-1">{analyticsData?.stats?.totalProviders || 0}</div>
                    <p className="text-xs text-yellow-600">{pendingProviders.length} pending</p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Open Reports</span>
                      <Flag className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="text-gray-900 mb-1">{openReports.length}</div>
                    <p className="text-xs text-red-600">Needs attention</p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Platform Revenue</span>
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-gray-900 mb-1">₹{(analyticsData?.stats?.totalRevenue || 0).toLocaleString('en-IN')}</div>
                    <p className="text-xs text-green-600">Total revenue</p>
                  </div>
                </>
              )}
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-gray-900 mb-4">Pending Approvals</h3>
                <div className="space-y-3">
                  {pendingProviders.slice(0, 3).map((provider: any) => (
                    <div key={provider.id} className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                          <ImageWithFallback
                            src={provider.user?.avatarUrl}
                            alt={provider.businessName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{provider.businessName}</p>
                          <p className="text-xs text-gray-600">{provider.primaryCategory}{provider.secondaryCategory ? `, ${provider.secondaryCategory}` : ''}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedProvider(provider.id);
                          setActiveTab('providers');
                        }}
                      >
                        Review
                      </Button>
                    </div>
                  ))}
                  {pendingProviders.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No pending approvals</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-gray-900 mb-4">Recent Reports</h3>
                <div className="space-y-3">
                  {openReports.slice(0, 3).map((report: any) => (
                    <div key={report.id} className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{report.reason}</p>
                        <p className="text-xs text-gray-600">Against: {report.provider?.businessName || report.provider?.user?.name || 'Unknown'}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedReport(report.id);
                          setActiveTab('reports');
                        }}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                  {openReports.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No open reports</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-gray-900">Provider Management</h2>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search providers..."
                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35] text-sm"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportData('Providers')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={providerFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setProviderFilter('all')}
                  >
                    All ({allProviders.length})
                  </Button>
                  <Button
                    variant={providerFilter === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setProviderFilter('pending')}
                  >
                    Pending ({allProviders.filter((p: any) => p.status === 'PENDING').length})
                  </Button>
                  <Button
                    variant={providerFilter === 'rejected' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setProviderFilter('rejected')}
                  >
                    Rejected ({allProviders.filter((p: any) => p.status === 'REJECTED').length})
                  </Button>
                  <Button
                    variant={providerFilter === 'suspended' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setProviderFilter('suspended')}
                  >
                    Suspended ({allProviders.filter((p: any) => p.status === 'SUSPENDED').length})
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categories</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {providersLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
                        </td>
                      </tr>
                    ) : providersForTab.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No providers found
                        </td>
                      </tr>
                    ) : (
                      providersForTab.map((provider: any) => (
                        <tr key={provider.id} className={selectedProvider === provider.id ? 'bg-orange-50' : ''}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                <ImageWithFallback
                                  src={provider.user?.avatarUrl}
                                  alt={provider.businessName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{provider.businessName}</p>
                                <p className="text-xs text-gray-500">{provider.user?.email || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {provider.primaryCategory}
                              </span>
                              {provider.secondaryCategory && (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  {provider.secondaryCategory}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{provider.city}, {provider.state}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {provider.averageRating > 0 ? `${provider.averageRating.toFixed(1)} (${provider.totalRatings})` : 'New'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              provider.status === 'APPROVED'
                                ? 'bg-green-100 text-green-700'
                                : provider.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : provider.status === 'REJECTED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {provider.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {provider.status === 'PENDING' ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApproveProvider(provider.id)}
                                    className="text-green-600 hover:bg-green-50"
                                    disabled={approveProviderMutation.isPending}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRejectProvider(provider.id)}
                                    className="text-red-600 hover:bg-red-50"
                                    disabled={rejectProviderMutation.isPending}
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(`/provider/${provider.id}`, '_blank')}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  {provider.status === 'SUSPENDED' ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUnsuspendProvider(provider.id)}
                                      className="text-green-600 hover:bg-green-50"
                                      disabled={unsuspendProviderMutation.isPending}
                                    >
                                      Unsuspend
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSuspendProvider(provider.id)}
                                      className="text-orange-600 hover:bg-orange-50"
                                      disabled={suspendProviderMutation.isPending}
                                    >
                                      Suspend
                                    </Button>
                                  )}
                                </>
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

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-gray-900">User Management</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportData('Users')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {usersLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
                        </td>
                      </tr>
                    ) : allUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      allUsers.map((user: any) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{user.phone || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-700'
                                : user.role === 'PROVIDER'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              {user.role !== 'ADMIN' && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => handleBanUser(user.id)}
                                  disabled={banUserMutation.isPending}
                                >
                                  {banUserMutation.isPending ? 'Banning...' : 'Ban'}
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
          <TabsContent value="reports">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-gray-900">Reports & Moderation</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {reportsLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : (reportsData?.data || []).length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No reports found</p>
                  </div>
                ) : (
                  (reportsData?.data || []).map((report: any) => (
                  <div
                    key={report.id}
                    className={`p-6 ${selectedReport === report.id ? 'bg-orange-50' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-gray-900">{report.reason}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.status === 'OPEN'
                              ? 'bg-red-100 text-red-700'
                              : report.status === 'INVESTIGATING'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Provider:</strong> {report.provider?.businessName || report.provider?.user?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Reporter:</strong> {report.reporter?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-700 mb-2">{report.details}</p>
                        <p className="text-xs text-gray-500">
                          Reported {new Date(report.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {report.status !== 'RESOLVED' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Set to investigating
                            toast.success('Report marked as investigating');
                          }}
                          className="text-yellow-600 hover:bg-yellow-50"
                        >
                          Investigate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveReport(report.id)}
                          className="text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSuspendProvider(report.providerId)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          Suspend Provider
                        </Button>
                      </div>
                    )}
                  </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-gray-900">All Bookings</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportData('Bookings')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={bookingFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBookingFilter('all')}
                  >
                    All ({allBookings.length})
                  </Button>
                  <Button
                    variant={bookingFilter === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBookingFilter('pending')}
                  >
                    Pending ({allBookings.filter((b: any) => b.status === 'PENDING').length})
                  </Button>
                  <Button
                    variant={bookingFilter === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBookingFilter('completed')}
                  >
                    Completed ({allBookings.filter((b: any) => b.status === 'COMPLETED').length})
                  </Button>
                  <Button
                    variant={bookingFilter === 'cancelled' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBookingFilter('cancelled')}
                  >
                    Cancelled ({allBookings.filter((b: any) => b.status === 'CANCELLED').length})
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookingsLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
                        </td>
                      </tr>
                    ) : filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          No bookings found
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking: any) => (
                        <tr key={booking.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/bookings/${booking.id}`)}>
                          <td className="px-6 py-4 text-sm font-mono text-gray-700">{booking.id.slice(0, 8)}...</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{booking.service?.title || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{booking.provider?.businessName || booking.provider?.user?.name || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{Number(booking.totalAmount).toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-700'
                                : booking.status === 'CONFIRMED'
                                ? 'bg-blue-100 text-blue-700'
                                : booking.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleDateString('en-IN') : 'Not scheduled'}
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/bookings/${booking.id}`);
                              }}
                            >
                              <Eye className="h-4 w-4 text-gray-500" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Appeals Tab */}
          <TabsContent value="appeals">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-gray-900">Provider Appeals</h2>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={appealFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAppealFilter('all')}
                  >
                    All ({allAppeals.length})
                  </Button>
                  <Button
                    variant={appealFilter === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAppealFilter('pending')}
                  >
                    Pending ({allAppeals.filter((a: any) => a.status === 'PENDING').length})
                  </Button>
                  <Button
                    variant={appealFilter === 'approved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAppealFilter('approved')}
                  >
                    Approved ({allAppeals.filter((a: any) => a.status === 'APPROVED').length})
                  </Button>
                  <Button
                    variant={appealFilter === 'rejected' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAppealFilter('rejected')}
                  >
                    Rejected ({allAppeals.filter((a: any) => a.status === 'REJECTED').length})
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {appealsLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
                        </td>
                      </tr>
                    ) : allAppeals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No appeals found
                        </td>
                      </tr>
                    ) : (
                      allAppeals.map((appeal: any) => (
                        <tr key={appeal.id}>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {appeal.provider?.businessName || 'N/A'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {appeal.provider?.user?.email || ''}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {appeal.type.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                            {appeal.reason}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              appeal.status === 'APPROVED'
                                ? 'bg-green-100 text-green-700'
                                : appeal.status === 'REJECTED'
                                ? 'bg-red-100 text-red-700'
                                : appeal.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {appeal.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {new Date(appeal.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {appeal.status === 'PENDING' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 hover:bg-green-50"
                                    onClick={() => {
                                      reviewAppealMutation.mutate({
                                        id: appeal.id,
                                        status: 'APPROVED',
                                      });
                                    }}
                                    disabled={reviewAppealMutation.isPending}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                      const notes = prompt('Enter rejection reason (optional):');
                                      reviewAppealMutation.mutate({
                                        id: appeal.id,
                                        status: 'REJECTED',
                                        adminNotes: notes || undefined,
                                      });
                                    }}
                                    disabled={reviewAppealMutation.isPending}
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // TODO: Show appeal details modal
                                  toast.info('Appeal details: ' + appeal.details);
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
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

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-gray-900 mb-6">Platform Analytics & Insights</h2>
              <AnalyticsCharts />
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {selectedUser && (
          <UserDetailsModal
            isOpen={!!selectedUser}
            onClose={() => setSelectedUser(null)}
            user={selectedUser}
          />
        )}


      </div>
    </div>
  );
}
