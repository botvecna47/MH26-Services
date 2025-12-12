// Advanced analytics dashboard with real-time charts and insights
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Star,
  MapPin,
  Clock,
  Target,
  Activity,
  Eye,
  MousePointer,
  Smartphone,
  Monitor,
  Tablet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { DatePickerWithRange } from './ui/date-picker';
import { Progress } from './ui/progress';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ComponentType<any>;
  color: string;
  trend: 'up' | 'down' | 'neutral';
}

interface AnalyticsData {
  overview: {
    totalBookings: number;
    totalRevenue: number;
    activeUsers: number;
    averageRating: number;
    completionRate: number;
    responseTime: number;
  };
  bookings: {
    daily: Array<{ date: string; bookings: number; revenue: number }>;
    monthly: Array<{ month: string; bookings: number; revenue: number }>;
    byCategory: Array<{ category: string; count: number; percentage: number }>;
    byStatus: Array<{ status: string; count: number; color: string }>;
  };
  users: {
    growth: Array<{ month: string; customers: number; providers: number }>;
    demographics: Array<{ age: string; count: number }>;
    devices: Array<{ device: string; percentage: number; color: string }>;
    locations: Array<{ city: string; users: number }>;
  };
  performance: {
    pageViews: Array<{ page: string; views: number; bounce: number }>;
    conversionFunnel: Array<{ step: string; users: number; conversion: number }>;
    loadTimes: Array<{ page: string; time: number }>;
  };
  financial: {
    revenue: Array<{ month: string; revenue: number; profit: number; expenses: number }>;
    paymentMethods: Array<{ method: string; amount: number; percentage: number }>;
    topEarners: Array<{ provider: string; earnings: number; bookings: number }>;
  };
}

interface AnalyticsProps {
  userType: 'admin' | 'provider';
  userId?: string;
  className?: string;
}

const COLORS = ['#ff6b35', '#ff8c5a', '#ffad7f', '#ffc8a4', '#ffe3c9'];

export function Analytics({ userType, userId, className = '' }: AnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Mock data generation
  useEffect(() => {
    const generateMockData = (): AnalyticsData => ({
      overview: {
        totalBookings: 1247,
        totalRevenue: 234500,
        activeUsers: 3456,
        averageRating: 4.6,
        completionRate: 92.5,
        responseTime: 12,
      },
      bookings: {
        daily: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          bookings: Math.floor(Math.random() * 50) + 20,
          revenue: Math.floor(Math.random() * 10000) + 5000,
        })),
        monthly: [
          { month: 'Jan', bookings: 890, revenue: 145000 },
          { month: 'Feb', bookings: 1120, revenue: 178000 },
          { month: 'Mar', bookings: 980, revenue: 156000 },
          { month: 'Apr', bookings: 1340, revenue: 234000 },
          { month: 'May', bookings: 1247, revenue: 198000 },
          { month: 'Jun', bookings: 1456, revenue: 267000 },
        ],
        byCategory: [
          { category: 'Tiffin Services', count: 456, percentage: 36.6 },
          { category: 'Electrical', count: 298, percentage: 23.9 },
          { category: 'Plumbing', count: 234, percentage: 18.8 },
          { category: 'Tourism', count: 189, percentage: 15.2 },
          { category: 'Others', count: 70, percentage: 5.6 },
        ],
        byStatus: [
          { status: 'Completed', count: 1156, color: '#10b981' },
          { status: 'Pending', count: 45, color: '#f59e0b' },
          { status: 'Cancelled', count: 32, color: '#ef4444' },
          { status: 'In Progress', count: 14, color: '#3b82f6' },
        ],
      },
      users: {
        growth: [
          { month: 'Jan', customers: 2340, providers: 145 },
          { month: 'Feb', customers: 2567, providers: 167 },
          { month: 'Mar', customers: 2890, providers: 189 },
          { month: 'Apr', customers: 3234, providers: 234 },
          { month: 'May', customers: 3456, providers: 267 },
          { month: 'Jun', customers: 3789, providers: 298 },
        ],
        demographics: [
          { age: '18-25', count: 876 },
          { age: '26-35', count: 1234 },
          { age: '36-45', count: 987 },
          { age: '46-55', count: 456 },
          { age: '55+', count: 234 },
        ],
        devices: [
          { device: 'Mobile', percentage: 68, color: '#ff6b35' },
          { device: 'Desktop', percentage: 24, color: '#ff8c5a' },
          { device: 'Tablet', percentage: 8, color: '#ffad7f' },
        ],
        locations: [
          { city: 'Nanded', users: 2456 },
          { city: 'Aurangabad', users: 567 },
          { city: 'Latur', users: 234 },
          { city: 'Parbhani', users: 123 },
          { city: 'Others', users: 89 },
        ],
      },
      performance: {
        pageViews: [
          { page: '/services', views: 12456, bounce: 34 },
          { page: '/providers', views: 8967, bounce: 28 },
          { page: '/booking', views: 5678, bounce: 45 },
          { page: '/profile', views: 3456, bounce: 23 },
          { page: '/dashboard', views: 2345, bounce: 19 },
        ],
        conversionFunnel: [
          { step: 'Visitors', users: 10000, conversion: 100 },
          { step: 'Service Views', users: 6500, conversion: 65 },
          { step: 'Provider Views', users: 3200, conversion: 32 },
          { step: 'Booking Started', users: 1800, conversion: 18 },
          { step: 'Payment', users: 1200, conversion: 12 },
          { step: 'Completed', users: 980, conversion: 9.8 },
        ],
        loadTimes: [
          { page: 'Homepage', time: 1.2 },
          { page: 'Services', time: 1.8 },
          { page: 'Booking', time: 2.1 },
          { page: 'Payment', time: 1.5 },
          { page: 'Dashboard', time: 2.3 },
        ],
      },
      financial: {
        revenue: [
          { month: 'Jan', revenue: 145000, profit: 43500, expenses: 101500 },
          { month: 'Feb', revenue: 178000, profit: 53400, expenses: 124600 },
          { month: 'Mar', revenue: 156000, profit: 46800, expenses: 109200 },
          { month: 'Apr', revenue: 234000, profit: 70200, expenses: 163800 },
          { month: 'May', revenue: 198000, profit: 59400, expenses: 138600 },
          { month: 'Jun', revenue: 267000, profit: 80100, expenses: 186900 },
        ],
        paymentMethods: [
          { method: 'UPI', amount: 156780, percentage: 66.8 },
          { method: 'Card', amount: 45230, percentage: 19.3 },
          { method: 'Net Banking', amount: 23450, percentage: 10.0 },
          { method: 'Wallet', amount: 9540, percentage: 4.1 },
        ],
        topEarners: [
          { provider: 'Kumar Tiffin Services', earnings: 45600, bookings: 234 },
          { provider: 'Sharma Electricals', earnings: 34500, bookings: 167 },
          { provider: 'Patel Plumbing', earnings: 28900, bookings: 145 },
          { provider: 'Gupta Tourism', earnings: 23400, bookings: 89 },
          { provider: 'Singh Repairs', earnings: 19800, bookings: 123 },
        ],
      },
    });

    setTimeout(() => {
      setData(generateMockData());
      setLoading(false);
    }, 1000);
  }, [timeRange, userId]);

  if (loading || !data) {
    return (
      <div className={`space-y-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricCards: MetricCard[] = [
    {
      title: 'Total Bookings',
      value: data.overview.totalBookings.toLocaleString(),
      change: 12.5,
      icon: Calendar,
      color: 'blue',
      trend: 'up',
    },
    {
      title: 'Revenue',
      value: `₹${(data.overview.totalRevenue / 1000).toFixed(0)}K`,
      change: 8.3,
      icon: DollarSign,
      color: 'green',
      trend: 'up',
    },
    {
      title: 'Active Users',
      value: data.overview.activeUsers.toLocaleString(),
      change: 15.7,
      icon: Users,
      color: 'purple',
      trend: 'up',
    },
    {
      title: 'Avg Rating',
      value: data.overview.averageRating.toFixed(1),
      change: 2.1,
      icon: Star,
      color: 'yellow',
      trend: 'up',
    },
    {
      title: 'Completion Rate',
      value: `${data.overview.completionRate}%`,
      change: -1.2,
      icon: Target,
      color: 'orange',
      trend: 'down',
    },
    {
      title: 'Response Time',
      value: `${data.overview.responseTime}m`,
      change: -5.8,
      icon: Clock,
      color: 'red',
      trend: 'up',
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Insights and performance metrics for your {userType === 'admin' ? 'platform' : 'services'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      )}
                      <span className={`text-xs ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {Math.abs(metric.change)}%
                      </span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-${metric.color}-100 flex items-center justify-center`}>
                    <metric.icon className={`w-5 h-5 text-${metric.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bookings Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Bookings Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.bookings.daily.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="bookings" stroke="#ff6b35" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.financial.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#ff6b35" fill="#ff6b35" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bookings by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.bookings.byCategory}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {data.bookings.byCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.users.devices.map((device, index) => (
                  <div key={device.device} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {device.device === 'Mobile' && <Smartphone className="w-4 h-4" />}
                        {device.device === 'Desktop' && <Monitor className="w-4 h-4" />}
                        {device.device === 'Tablet' && <Tablet className="w-4 h-4" />}
                        <span className="font-medium">{device.device}</span>
                      </div>
                      <span className="font-semibold">{device.percentage}%</span>
                    </div>
                    <Progress value={device.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.bookings.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="bookings" fill="#ff6b35" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.bookings.byStatus.map((status, index) => (
                  <div key={status.status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <span>{status.status}</span>
                    </div>
                    <Badge variant="secondary">{status.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.users.growth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="customers" stroke="#ff6b35" strokeWidth={2} />
                    <Line type="monotone" dataKey="providers" stroke="#ff8c5a" strokeWidth={2} />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.users.demographics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#ff6b35" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.performance.pageViews}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="page" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="views" fill="#ff6b35" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.performance.conversionFunnel.map((step, index) => (
                  <div key={step.step} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{step.step}</span>
                      <div className="text-right">
                        <span className="font-semibold">{step.users.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({step.conversion}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={step.conversion} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.financial.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="#ff6b35" />
                    <Bar dataKey="profit" fill="#10b981" />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.financial.paymentMethods.map((method, index) => (
                  <div key={method.method} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{method.method}</span>
                      <div className="text-right">
                        <span className="font-semibold">₹{method.amount.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({method.percentage}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={method.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Earning Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.financial.topEarners.map((provider, index) => (
                  <div key={provider.provider} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{provider.provider}</p>
                        <p className="text-sm text-muted-foreground">
                          {provider.bookings} bookings
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{provider.earnings.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Analytics;