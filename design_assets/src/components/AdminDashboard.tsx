import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  BarChart3,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  Settings,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Search,
  Filter,
  Bell,
  LogOut,
  User,
  Plus,
  MapPin,
  Clock,
  Star,
  Phone,
  Mail,
  Calendar,
  FileText,
  PieChart,
  UserCheck,
  UserX,
  CreditCard,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area } from "recharts";

interface AdminDashboardProps {
  userData: any;
  onLogout: () => void;
}

export function AdminDashboard({ userData, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock data
  const platformStats = {
    totalUsers: 2847,
    activeProviders: 156,
    totalBookings: 8463,
    monthlyRevenue: "₹5,24,300",
    averageRating: 4.8,
    platformGrowth: "+23%",
    disputeCount: 12,
    pendingApprovals: 8
  };

  const revenueData = [
    { month: 'Jan', revenue: 342000, bookings: 1200 },
    { month: 'Feb', revenue: 389000, bookings: 1400 },
    { month: 'Mar', revenue: 456000, bookings: 1650 },
    { month: 'Apr', revenue: 524300, bookings: 1890 },
    { month: 'May', revenue: 478000, bookings: 1720 },
    { month: 'Jun', revenue: 524300, bookings: 1890 }
  ];

  const serviceDistribution = [
    { name: 'Tiffin Services', value: 35, color: '#ff6b35', users: 985 },
    { name: 'Plumbers', value: 25, color: '#4ade80', users: 712 },
    { name: 'Electricians', value: 22, color: '#3b82f6', users: 627 },
    { name: 'Tourism Guides', value: 18, color: '#f59e0b', users: 523 }
  ];

  const userGrowthData = [
    { month: 'Jan', customers: 1800, providers: 120 },
    { month: 'Feb', customers: 2100, providers: 128 },
    { month: 'Mar', customers: 2350, providers: 142 },
    { month: 'Apr', customers: 2600, providers: 156 },
    { month: 'May', customers: 2750, providers: 148 },
    { month: 'Jun', customers: 2847, providers: 156 }
  ];

  const recentUsers = [
    {
      id: 1,
      name: "Priya Sharma",
      email: "priya.sharma@email.com",
      type: "customer",
      joinDate: "2024-01-15",
      status: "active",
      orders: 12,
      phone: "+91 98765 43210"
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      email: "rajesh.kumar@email.com",
      type: "provider",
      joinDate: "2024-01-14",
      status: "pending",
      rating: 4.8,
      phone: "+91 87654 32109"
    },
    {
      id: 3,
      name: "Anita Desai",
      email: "anita.desai@email.com",
      type: "customer",
      joinDate: "2024-01-13",
      status: "active",
      orders: 5,
      phone: "+91 76543 21098"
    },
    {
      id: 4,
      name: "Santosh Patil",
      email: "santosh.patil@email.com",
      type: "provider",
      joinDate: "2024-01-12",
      status: "suspended",
      rating: 3.2,
      phone: "+91 65432 10987"
    }
  ];

  const pendingProviders = [
    {
      id: 1,
      name: "Mumbai Tiffin Express",
      ownerName: "Suresh Jadhav",
      serviceType: "Tiffin Service",
      submittedDate: "2024-01-15",
      documents: ["Business License", "Food License", "ID Proof"],
      phone: "+91 98765 43210",
      location: "Nanded Central"
    },
    {
      id: 2,
      name: "Elite Electricals",
      ownerName: "Mahesh Gaikwad",
      serviceType: "Electrician",
      submittedDate: "2024-01-14",
      documents: ["Electrical License", "ID Proof", "Experience Certificate"],
      phone: "+91 87654 32109",
      location: "Nanded East"
    }
  ];

  const recentTransactions = [
    {
      id: 1,
      customerName: "Priya Sharma",
      providerName: "Maharashtrian Tiffin",
      amount: "₹840",
      service: "Weekly Meal Plan",
      date: "2024-01-15",
      status: "completed",
      commission: "₹84"
    },
    {
      id: 2,
      customerName: "Rajesh Patil",
      providerName: "QuickFix Plumbing",
      amount: "₹400",
      service: "Pipe Repair",
      date: "2024-01-14",
      status: "completed",
      commission: "₹40"
    }
  ];

  const systemHealth = [
    { metric: 'Server Uptime', value: '99.9%', status: 'good' },
    { metric: 'Response Time', value: '250ms', status: 'good' },
    { metric: 'Error Rate', value: '0.1%', status: 'good' },
    { metric: 'Active Sessions', value: '1,247', status: 'warning' }
  ];

  const notifications = [
    {
      id: 1,
      type: "alert",
      title: "High Server Load",
      message: "Server load is above 80%. Monitor closely.",
      time: "5 mins ago",
      read: false,
      priority: "high"
    },
    {
      id: 2,
      type: "approval",
      title: "New Provider Application",
      message: "Mumbai Tiffin Express submitted application for review.",
      time: "15 mins ago",
      read: false,
      priority: "medium"
    },
    {
      id: 3,
      type: "dispute",
      title: "Customer Complaint",
      message: "Dispute raised for booking #12847. Requires attention.",
      time: "1 hour ago",
      read: true,
      priority: "high"
    }
  ];

  const handleApproveProvider = (providerId: number) => {
    toast.success("Provider approved successfully!");
  };

  const handleRejectProvider = (providerId: number) => {
    toast.error("Provider application rejected.");
  };

  const handleSuspendUser = (userId: number) => {
    toast.warning("User account suspended.");
  };

  const handleActivateUser = (userId: number) => {
    toast.success("User account activated.");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <motion.header 
        className="bg-white border-b border-border shadow-sm sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <h1 className="font-bold text-foreground">MH26 Services</h1>
                <p className="text-xs text-muted-foreground">Admin Dashboard</p>
              </div>
            </div>

            {/* System Status */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">System Healthy</span>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Uptime: 99.9%
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </Button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-12 w-96 bg-white border border-border rounded-lg shadow-xl p-4 space-y-3"
                    >
                      <h3 className="font-medium text-foreground">System Notifications</h3>
                      {notifications.map((notification) => (
                        <div key={notification.id} className={`p-3 rounded-lg border ${
                          notification.read ? 'bg-muted/30' : 
                          notification.priority === 'high' ? 'bg-red-50 border-red-200' :
                          notification.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-blue-50 border-blue-200'
                        }`}>
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.read ? 'bg-muted-foreground' : 
                              notification.priority === 'high' ? 'bg-red-500' :
                              notification.priority === 'medium' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`} />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-foreground">{notification.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" className="w-full">
                        View All Notifications
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-medium text-sm text-foreground">{userData.fullName}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
                <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-purple-500" />
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6 bg-white shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="providers" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <UserCheck className="w-4 h-4 mr-2" />
              Providers
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <CreditCard className="w-4 h-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <PieChart className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Platform Stats */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold text-foreground">{platformStats.totalUsers.toLocaleString()}</p>
                      <p className="text-xs text-blue-600 flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {platformStats.platformGrowth} this month
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-foreground">{platformStats.monthlyRevenue}</p>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <DollarSign className="w-3 h-3 mr-1" />
                        +15% from last month
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Providers</p>
                      <p className="text-2xl font-bold text-foreground">{platformStats.activeProviders}</p>
                      <p className="text-xs text-purple-600 flex items-center mt-1">
                        <Activity className="w-3 h-3 mr-1" />
                        {platformStats.pendingApprovals} pending
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Bookings</p>
                      <p className="text-2xl font-bold text-foreground">{platformStats.totalBookings.toLocaleString()}</p>
                      <p className="text-xs text-yellow-600 flex items-center mt-1">
                        <Star className="w-3 h-3 mr-1" />
                        {platformStats.averageRating}★ avg rating
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Card className="border-0 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle>Revenue & Bookings Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip formatter={(value, name) => [
                          name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                          name === 'revenue' ? 'Revenue' : 'Bookings'
                        ]} />
                        <Area yAxisId="left" type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Area yAxisId="right" type="monotone" dataKey="bookings" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Card className="border-0 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle>Service Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={serviceDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({name, value}) => `${name}: ${value}%`}
                        >
                          {serviceDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* System Health & Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Card className="border-0 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {systemHealth.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="font-medium">{item.metric}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">{item.value}</span>
                          <div className={`w-3 h-3 rounded-full ${
                            item.status === 'good' ? 'bg-green-500' :
                            item.status === 'warning' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <Card className="border-0 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentTransactions.slice(0, 4).map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <div>
                          <p className="font-medium text-sm">{transaction.customerName}</p>
                          <p className="text-xs text-muted-foreground">{transaction.service}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">{transaction.amount}</p>
                          <p className="text-xs text-green-600">+{transaction.commission}</p>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      View All Transactions
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">User Management</h2>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Users
                  </Button>
                  <Button className="bg-gradient-to-r from-purple-500 to-purple-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>

              {/* Search & Filter */}
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        placeholder="Search users by name, email, or phone..."
                        className="pl-10 h-12 bg-input-background"
                      />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="customer">Customers</SelectItem>
                        <SelectItem value="provider">Providers</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="lg" className="h-12">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Users Table */}
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Activity</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentUsers.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                        >
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                <p className="text-xs text-muted-foreground">{user.phone}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${
                              user.type === 'customer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            } border-0`}>
                              {user.type === 'customer' ? 'Customer' : 'Provider'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${
                              user.status === 'active' ? 'bg-green-100 text-green-800' :
                              user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            } border-0`}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.joinDate}</TableCell>
                          <TableCell>
                            {user.type === 'customer' ? (
                              <span className="text-sm">{user.orders} orders</span>
                            ) : (
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{user.rating}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              {user.status === 'active' ? (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleSuspendUser(user.id)}
                                >
                                  <UserX className="w-4 h-4 text-red-600" />
                                </Button>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleActivateUser(user.id)}
                                >
                                  <UserCheck className="w-4 h-4 text-green-600" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">Provider Approvals</h2>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  {pendingProviders.length} Pending Review
                </Badge>
              </div>

              {pendingProviders.map((provider, index) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <Card className="border-0 shadow-sm bg-white">
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-bold text-lg text-foreground">{provider.name}</h3>
                            <p className="text-muted-foreground">{provider.serviceType}</p>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span>{provider.ownerName}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span>{provider.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span>{provider.location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>Applied: {provider.submittedDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-medium">Submitted Documents</h4>
                          <div className="space-y-2">
                            {provider.documents.map((doc, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{doc}</span>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-medium">Actions</h4>
                          <div className="space-y-3">
                            <Button 
                              className="w-full bg-green-500 hover:bg-green-600"
                              onClick={() => handleApproveProvider(provider.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve Provider
                            </Button>
                            <Button 
                              variant="outline" 
                              className="w-full border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => handleRejectProvider(provider.id)}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject Application
                            </Button>
                            <Button variant="outline" className="w-full">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Request More Info
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-12"
            >
              <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Transaction Management</h3>
              <p className="text-muted-foreground mb-6">Monitor all platform transactions and commissions</p>
              <Button variant="outline">
                View All Transactions
              </Button>
            </motion.div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle>User Growth Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="customers" stroke="#3b82f6" strokeWidth={3} name="Customers" />
                      <Line type="monotone" dataKey="providers" stroke="#10b981" strokeWidth={3} name="Providers" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-2 gap-6"
            >
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span>Maintenance Mode</span>
                    <Switch />
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>New User Registration</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>Provider Auto-Approval</span>
                    <Switch />
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>Email Notifications</span>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="pt-4 border-t space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Commission Rate (%)</label>
                      <Input value="10" className="bg-input-background" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Min Service Rating</label>
                      <Input value="3.0" className="bg-input-background" />
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600">
                    Save Settings
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle>System Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export Platform Data
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Activity className="w-4 h-4 mr-2" />
                    System Health Check
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Bulk Notifications
                  </Button>
                  
                  <div className="pt-4 border-t space-y-2">
                    <Button variant="destructive" className="w-full">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Emergency Shutdown
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Use only in critical situations
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}