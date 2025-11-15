import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DataTable } from './ui/DataTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Users,
  Briefcase,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Download,
  Filter,
  Search,
  Plus,
  MoreVertical,
} from 'lucide-react';
import { RevenueChart, ServiceDistributionChart, UserGrowthChart, TransactionBarChart } from './AnalyticsCharts';
import { DataCard } from './ui/DataCard';
import { ContentCard } from './ui/ContentCard';
import { sampleProviders, sampleTransactions, sampleUsers } from '../utils/sampleData';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'provider' | 'admin';
}

interface SuperAdminPanelProps {
  user: User;
}

// Mock analytics data
const revenueData = [
  { month: 'Jan', revenue: 45000, transactions: 120 },
  { month: 'Feb', revenue: 52000, transactions: 145 },
  { month: 'Mar', revenue: 48000, transactions: 132 },
  { month: 'Apr', revenue: 61000, transactions: 168 },
  { month: 'May', revenue: 72000, transactions: 189 },
  { month: 'Jun', revenue: 68000, transactions: 175 },
];

const serviceDistribution = [
  { name: 'Tiffin', value: 35 },
  { name: 'Plumbing', value: 25 },
  { name: 'Electrical', value: 15 },
  { name: 'Tourism', value: 15 },
  { name: 'Others', value: 10 },
];

const userGrowthData = [
  { week: 'Week 1', users: 120, providers: 15 },
  { week: 'Week 2', users: 145, providers: 18 },
  { week: 'Week 3', users: 162, providers: 22 },
  { week: 'Week 4', users: 189, providers: 28 },
];

const transactionData = [
  { day: 'Mon', completed: 12, pending: 3, cancelled: 1 },
  { day: 'Tue', completed: 15, pending: 4, cancelled: 2 },
  { day: 'Wed', completed: 18, pending: 2, cancelled: 1 },
  { day: 'Thu', completed: 14, pending: 5, cancelled: 0 },
  { day: 'Fri', completed: 20, pending: 3, cancelled: 1 },
  { day: 'Sat', completed: 25, pending: 2, cancelled: 3 },
  { day: 'Sun', completed: 22, pending: 4, cancelled: 1 },
];

export function SuperAdminPanel({ user }: SuperAdminPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Calculate stats
  const totalRevenue = sampleTransactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const activeProviders = sampleProviders.filter(p => p.verified && p.available).length;
  const pendingApprovals = sampleProviders.filter(p => !p.verified).length;
  const totalTransactions = sampleTransactions.length;

  const handleApproveProvider = (providerId: string) => {
    toast.success('Provider approved successfully');
  };

  const handleRejectProvider = (providerId: string) => {
    toast.error('Provider application rejected');
  };

  const handleDeleteUser = (userId: string) => {
    toast.success('User deleted successfully');
    setDeleteDialogOpen(false);
  };

  const handleFreezeAccount = (userId: string) => {
    toast.warning('Account frozen');
  };

  const handleExportData = (type: string) => {
    toast.success(`Exporting ${type} data...`);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2>Admin Control Center</h2>
            <p className="text-muted-foreground mt-1">
              Complete platform management and analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExportData('all')}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DataCard
            icon={DollarSign}
            label="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            change={{ value: '+23%', trend: 'up' }}
          />
          <DataCard
            icon={Users}
            label="Total Users"
            value={sampleUsers.length}
            change={{ value: '+12 this month', trend: 'up' }}
          />
          <DataCard
            icon={Briefcase}
            label="Active Providers"
            value={activeProviders}
            change={{ value: `${pendingApprovals} pending`, trend: 'neutral' }}
          />
          <DataCard
            icon={TrendingUp}
            label="Transactions"
            value={totalTransactions}
            change={{ value: '+18%', trend: 'up' }}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <ContentCard
                title="Revenue Trends"
                description="Monthly revenue and transaction overview"
              >
                <RevenueChart data={revenueData} />
              </ContentCard>

              <ContentCard
                title="Service Distribution"
                description="Breakdown by service category"
              >
                <ServiceDistributionChart data={serviceDistribution} />
              </ContentCard>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <ContentCard
                title="User Growth"
                description="Users and providers over time"
              >
                <UserGrowthChart data={userGrowthData} />
              </ContentCard>

              <ContentCard
                title="Transaction Status"
                description="Weekly transaction breakdown"
              >
                <TransactionBarChart data={transactionData} />
              </ContentCard>
            </div>

            {/* Recent Activity */}
            <ContentCard
              title="Recent Transactions"
              description="Latest platform activity"
            >
              <DataTable
                columns={[
                  { key: 'orderId', label: 'Order ID', sortable: true },
                  { key: 'customerName', label: 'Customer' },
                  { key: 'providerName', label: 'Provider' },
                  {
                    key: 'amount',
                    label: 'Amount',
                    align: 'right',
                    render: (amount) => `₹${amount.toLocaleString()}`,
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (status) => (
                      <Badge
                        className={
                          status === 'completed'
                            ? 'bg-success/10 text-success border-success/20'
                            : status === 'active'
                            ? 'bg-info/10 text-info border-info/20'
                            : 'bg-warning/10 text-warning border-warning/20'
                        }
                      >
                        {status}
                      </Badge>
                    ),
                  },
                  { key: 'date', label: 'Date' },
                ]}
                data={sampleTransactions.slice(0, 10)}
              />
            </ContentCard>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <ContentCard
              title="User Management"
              description="Manage platform users and permissions"
              action={
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              }
            >
              <DataTable
                columns={[
                  { key: 'id', label: 'User ID' },
                  {
                    key: 'firstName',
                    label: 'Name',
                    render: (firstName, row) => `${firstName} ${row.lastName}`,
                  },
                  { key: 'email', label: 'Email' },
                  { key: 'phone', label: 'Phone' },
                  { key: 'joinDate', label: 'Joined' },
                  {
                    key: 'role',
                    label: 'Role',
                    render: (role) => (
                      <Badge variant="secondary">{role}</Badge>
                    ),
                  },
                  {
                    key: 'id',
                    label: 'Actions',
                    align: 'right',
                    render: (id) => (
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleFreezeAccount(id)}
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-error"
                          onClick={() => {
                            setSelectedItem(id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={sampleUsers}
              />
            </ContentCard>
          </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers" className="space-y-6">
            <ContentCard
              title="Provider Directory"
              description="Manage service providers and their status"
            >
              <DataTable
                columns={[
                  { key: 'businessName', label: 'Business Name', sortable: true },
                  { key: 'category', label: 'Category' },
                  { key: 'location', label: 'Location' },
                  {
                    key: 'rating',
                    label: 'Rating',
                    render: (rating) => (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{rating}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    ),
                  },
                  { key: 'completedJobs', label: 'Jobs' },
                  {
                    key: 'verified',
                    label: 'Status',
                    render: (verified, row) => (
                      <Badge
                        className={
                          verified
                            ? 'bg-success/10 text-success border-success/20'
                            : 'bg-warning/10 text-warning border-warning/20'
                        }
                      >
                        {verified ? 'Verified' : 'Pending'}
                      </Badge>
                    ),
                  },
                  {
                    key: 'available',
                    label: 'Availability',
                    render: (available) => (
                      <Badge
                        variant={available ? 'default' : 'secondary'}
                      >
                        {available ? 'Active' : 'Offline'}
                      </Badge>
                    ),
                  },
                  {
                    key: 'id',
                    label: 'Actions',
                    align: 'right',
                    render: (id) => (
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={sampleProviders}
              />
            </ContentCard>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <ContentCard
              title="All Transactions"
              description="Complete transaction history and management"
              action={
                <Button variant="outline" onClick={() => handleExportData('transactions')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              }
            >
              <DataTable
                columns={[
                  { key: 'orderId', label: 'Order ID', sortable: true },
                  { key: 'customerName', label: 'Customer' },
                  { key: 'providerName', label: 'Provider' },
                  { key: 'service', label: 'Service' },
                  {
                    key: 'amount',
                    label: 'Amount',
                    align: 'right',
                    sortable: true,
                    render: (amount) => `₹${amount.toLocaleString()}`,
                  },
                  { key: 'date', label: 'Date', sortable: true },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (status) => (
                      <Badge
                        className={
                          status === 'completed'
                            ? 'bg-success/10 text-success border-success/20'
                            : status === 'active'
                            ? 'bg-info/10 text-info border-info/20'
                            : status === 'pending'
                            ? 'bg-warning/10 text-warning border-warning/20'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {status}
                      </Badge>
                    ),
                  },
                ]}
                data={sampleTransactions}
              />
            </ContentCard>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <ContentCard
              title="Pending Approvals"
              description="Review and approve provider applications"
            >
              <div className="space-y-4">
                {sampleProviders
                  .filter(p => !p.verified)
                  .map((provider) => (
                    <div
                      key={provider.id}
                      className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{provider.businessName}</h4>
                            <Badge variant="outline">{provider.category}</Badge>
                            <Badge className="bg-warning/10 text-warning border-warning/20">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending Review
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {provider.description}
                          </p>
                          <div className="flex gap-6 text-sm">
                            <div>
                              <span className="text-muted-foreground">Location:</span>
                              <span className="ml-2 font-medium">{provider.location}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Pricing:</span>
                              <span className="ml-2 font-medium">{provider.pricing}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-success text-success hover:bg-success/10"
                            onClick={() => handleApproveProvider(provider.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-error text-error hover:bg-error/10"
                            onClick={() => handleRejectProvider(provider.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </ContentCard>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <ContentCard
                title="Revenue Analytics"
                description="Track revenue trends over time"
              >
                <RevenueChart data={revenueData} />
              </ContentCard>

              <ContentCard
                title="Service Category Performance"
                description="Distribution across service types"
              >
                <ServiceDistributionChart data={serviceDistribution} />
              </ContentCard>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <ContentCard
                title="Platform Growth"
                description="User and provider acquisition"
              >
                <UserGrowthChart data={userGrowthData} />
              </ContentCard>

              <ContentCard
                title="Transaction Metrics"
                description="Transaction status distribution"
              >
                <TransactionBarChart data={transactionData} />
              </ContentCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              and remove all associated data from the servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedItem && handleDeleteUser(selectedItem)}
              className="bg-error hover:bg-error/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
