import { useState, useEffect } from 'react';
import { Users, TrendingUp, DollarSign, Package, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { AdminAPI } from '../services/api';
import { AnalyticsData } from '../types/database';
import { GlassLoadingSkeleton } from './ui/GlassLoadingSkeleton';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminPanel() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken') || '';
      const response = await AdminAPI.getAnalytics(token);

      if (response.success) {
        setAnalytics(response.data!);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassLoadingSkeleton height={400} />
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: analytics.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      change: `+${analytics.userGrowth}%`,
    },
    {
      title: 'Total Providers',
      value: analytics.totalProviders,
      icon: Shield,
      color: 'text-green-600',
      bg: 'bg-green-100',
      change: '+12%',
    },
    {
      title: 'Total Bookings',
      value: analytics.totalBookings,
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      change: '+8%',
    },
    {
      title: 'Total Revenue',
      value: `₹${analytics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      change: `+${analytics.revenueGrowth}%`,
    },
  ];

  const COLORS = ['#ff6b35', '#4ade80', '#60a5fa', '#f59e0b'];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Platform analytics and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="glass glass-hover rounded-xl p-6 transition-all duration-300 ease-out hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center shadow-md`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-gray-900 text-2xl">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Bookings Chart */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-gray-900 mb-6">Monthly Bookings</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyBookings}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(12px)',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#ff6b35"
                  strokeWidth={3}
                  dot={{ fill: '#ff6b35', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Bookings"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Services Chart */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-gray-900 mb-6">Top Services</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topServices}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="service" stroke="#6b7280" angle={-15} textAnchor="end" height={80} />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(12px)',
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#ff6b35" radius={[8, 8, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Distribution */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-gray-900 mb-6">User Distribution</h2>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Customers', value: analytics.totalCustomers },
                    { name: 'Providers', value: analytics.totalProviders },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[0, 1].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(12px)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-xl p-6 mt-6">
          <h2 className="text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="border-white/30 hover:bg-white/20 justify-start"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button
              variant="outline"
              className="border-white/30 hover:bg-white/20 justify-start"
            >
              <Shield className="h-4 w-4 mr-2" />
              Verify Providers
            </Button>
            <Button
              variant="outline"
              className="border-white/30 hover:bg-white/20 justify-start"
            >
              <Package className="h-4 w-4 mr-2" />
              View All Bookings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
