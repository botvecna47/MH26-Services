import { DataCard } from './ui/DataCard';
import { ContentCard } from './ui/ContentCard';
import { DataTable } from './ui/DataTable';
import { EmptyState } from './ui/EmptyState';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Calendar,
  TrendingUp,
  Star,
  Package,
  Users,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Briefcase,
  Settings,
  Activity,
  Award,
} from 'lucide-react';
import { sampleTransactions, sampleProviders, sampleUsers } from '../utils/sampleData';
import { SuperAdminPanel } from './SuperAdminPanel';
import { RevenueChart, ServiceDistributionChart } from './AnalyticsCharts';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'provider' | 'admin';
  businessName?: string;
}

interface UnifiedDashboardProps {
  user: User;
  onNavigate: (page: string, data?: any) => void;
}

export function UnifiedDashboard({ user, onNavigate }: UnifiedDashboardProps) {
  // Customer Dashboard
  if (user.role === 'user') {
    const userTransactions = sampleTransactions.filter(t => t.customerId === user.id);
    const activeBookings = userTransactions.filter(t => t.status === 'active');
    const totalSpent = userTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Header */}
          <div>
            <h2>Welcome back, {user.firstName}</h2>
            <p className="text-muted-foreground mt-1">
              Here's an overview of your account activity
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DataCard
              icon={Calendar}
              label="Active Bookings"
              value={activeBookings.length}
              change={{ value: '+2 this month', trend: 'up' }}
            />
            <DataCard
              icon={DollarSign}
              label="Total Spent"
              value={`₹${totalSpent.toLocaleString()}`}
              change={{ value: '+15%', trend: 'up' }}
            />
            <DataCard
              icon={Package}
              label="Services Used"
              value={userTransactions.length}
            />
            <DataCard
              icon={Star}
              label="Avg. Rating Given"
              value="4.5"
            />
          </div>

          {/* Recent Activity */}
          <ContentCard
            title="Recent Bookings"
            description="Your latest service bookings and their status"
          >
            {userTransactions.length > 0 ? (
              <DataTable
                columns={[
                  {
                    key: 'orderId',
                    label: 'Order',
                    sortable: true,
                  },
                  {
                    key: 'providerName',
                    label: 'Provider',
                    sortable: true,
                  },
                  {
                    key: 'service',
                    label: 'Service',
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
                            : status === 'pending'
                            ? 'bg-warning/10 text-warning border-warning/20'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {status}
                      </Badge>
                    ),
                  },
                  {
                    key: 'date',
                    label: 'Date',
                    sortable: true,
                  },
                  {
                    key: 'amount',
                    label: 'Amount',
                    align: 'right',
                    render: (amount) => `₹${amount.toLocaleString()}`,
                  },
                ]}
                data={userTransactions}
              />
            ) : (
              <EmptyState
                icon={Calendar}
                title="No bookings yet"
                description="Start browsing services to make your first booking"
                action={{
                  label: 'Browse Services',
                  onClick: () => onNavigate('services'),
                }}
              />
            )}
          </ContentCard>
        </div>
      </div>
    );
  }

  // Provider Dashboard
  if (user.role === 'provider') {
    const providerTransactions = sampleTransactions.filter(t => t.providerId.includes('provider'));
    const activeJobs = providerTransactions.filter(t => t.status === 'active');
    const completedJobs = providerTransactions.filter(t => t.status === 'completed');
    const totalEarnings = completedJobs.reduce((sum, t) => sum + t.amount, 0);

    // Mock revenue data for provider
    const providerRevenueData = [
      { month: 'Jan', revenue: 8500, transactions: 18 },
      { month: 'Feb', revenue: 9200, transactions: 21 },
      { month: 'Mar', revenue: 7800, transactions: 16 },
      { month: 'Apr', revenue: 11000, transactions: 24 },
      { month: 'May', revenue: 13500, transactions: 28 },
      { month: 'Jun', revenue: 12200, transactions: 26 },
    ];

    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <h2>Provider Dashboard</h2>
              <p className="text-muted-foreground mt-1">
                {user.businessName || 'Manage your services and bookings'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                Toggle Availability
              </Button>
              <Button variant="outline" onClick={() => onNavigate('profile')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DataCard
              icon={Briefcase}
              label="Active Jobs"
              value={activeJobs.length}
              change={{ value: '+3 this week', trend: 'up' }}
            />
            <DataCard
              icon={CheckCircle}
              label="Completed Jobs"
              value={completedJobs.length}
              change={{ value: '+12 this month', trend: 'up' }}
            />
            <DataCard
              icon={DollarSign}
              label="Total Earnings"
              value={`₹${totalEarnings.toLocaleString()}`}
              change={{ value: '+8%', trend: 'up' }}
            />
            <DataCard
              icon={Star}
              label="Rating"
              value="4.8"
              change={{ value: '156 reviews', trend: 'neutral' }}
            />
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            <ContentCard
              title="Earnings Overview"
              description="Your monthly revenue and job trends"
            >
              <RevenueChart data={providerRevenueData} />
            </ContentCard>

            <ContentCard
              title="Performance Metrics"
              description="Key performance indicators"
            >
              <div className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                      <Award className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Response Rate</p>
                      <p className="text-xl font-semibold">98%</p>
                    </div>
                  </div>
                  <Badge className="bg-success/10 text-success border-success/20">Excellent</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Response Time</p>
                      <p className="text-xl font-semibold">28 min</p>
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">Fast</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-info" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Job Completion</p>
                      <p className="text-xl font-semibold">96%</p>
                    </div>
                  </div>
                  <Badge className="bg-info/10 text-info border-info/20">Great</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Repeat Customers</p>
                      <p className="text-xl font-semibold">42%</p>
                    </div>
                  </div>
                  <Badge className="bg-warning/10 text-warning border-warning/20">Good</Badge>
                </div>
              </div>
            </ContentCard>
          </div>

          {/* Recent Jobs */}
          <ContentCard
            title="Recent Jobs"
            description="Your latest bookings and their status"
          >
            {providerTransactions.length > 0 ? (
              <DataTable
                columns={[
                  {
                    key: 'orderId',
                    label: 'Order',
                    sortable: true,
                  },
                  {
                    key: 'customerName',
                    label: 'Customer',
                    sortable: true,
                  },
                  {
                    key: 'service',
                    label: 'Service',
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
                            : status === 'pending'
                            ? 'bg-warning/10 text-warning border-warning/20'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {status}
                      </Badge>
                    ),
                  },
                  {
                    key: 'date',
                    label: 'Date',
                    sortable: true,
                  },
                  {
                    key: 'amount',
                    label: 'Amount',
                    align: 'right',
                    render: (amount) => `₹${amount.toLocaleString()}`,
                  },
                ]}
                data={providerTransactions}
              />
            ) : (
              <EmptyState
                icon={Briefcase}
                title="No jobs yet"
                description="Jobs will appear here once customers book your services"
              />
            )}
          </ContentCard>
        </div>
      </div>
    );
  }

  // Admin Dashboard - Full Control Center
  if (user.role === 'admin') {
    return <SuperAdminPanel user={user} />;
  }

  return null;
}
