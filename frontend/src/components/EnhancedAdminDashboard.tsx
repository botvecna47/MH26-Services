import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { 
  LayoutDashboard,
  Users,
  Package,
  Settings,
  BarChart3,
  FileText,
  Menu,
  LogOut,
  Bell,
  Search,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Star,
  ShoppingBag,
  Activity,
  Calendar,
  MessageSquare,
  Filter,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Shield,
  AlertCircle,
  ChevronRight,
  HelpCircle,
  Layers,
  Target,
  Zap,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface UserData {
  email: string;
  userType: 'customer' | 'provider' | 'admin' | null;
  firstName?: string;
  lastName?: string;
  isAuthenticated: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  active: boolean;
}

interface ServiceProvider {
  id: string;
  name: string;
  businessName: string;
  category: string;
  rating: number;
  reviewCount: number;
  location: string;
  priceRange: string;
  experience: string;
  services: string[];
  phone: string;
  verified: boolean;
  image: string;
}

interface EnhancedAdminDashboardProps {
  userData: UserData;
  onLogout: () => void;
  categories: Category[];
  setCategories: (cats: Category[]) => void;
  providers: ServiceProvider[];
}

export default function EnhancedAdminDashboard({ userData, onLogout, categories, setCategories, providers }: EnhancedAdminDashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Mock analytics data
  const revenueData = [
    { month: 'Jan', revenue: 45000, users: 120, bookings: 89 },
    { month: 'Feb', revenue: 52000, users: 145, bookings: 102 },
    { month: 'Mar', revenue: 48000, users: 138, bookings: 95 },
    { month: 'Apr', revenue: 61000, users: 167, bookings: 118 },
    { month: 'May', revenue: 55000, users: 156, bookings: 108 },
    { month: 'Jun', revenue: 67000, users: 189, bookings: 134 }
  ];

  const categoryDistribution = [
    { name: 'Tiffin Services', value: 35, color: '#ff6b35' },
    { name: 'Plumbing', value: 25, color: '#4f46e5' },
    { name: 'Electrical', value: 20, color: '#10b981' },
    { name: 'Tourism', value: 15, color: '#f59e0b' },
    { name: 'Others', value: 5, color: '#8b5cf6' }
  ];

  const weeklyActivity = [
    { day: 'Mon', bookings: 12, revenue: 8500 },
    { day: 'Tue', bookings: 19, revenue: 12300 },
    { day: 'Wed', bookings: 15, revenue: 9800 },
    { day: 'Thu', bookings: 22, revenue: 14200 },
    { day: 'Fri', bookings: 28, revenue: 18900 },
    { day: 'Sat', bookings: 31, revenue: 21500 },
    { day: 'Sun', bookings: 18, revenue: 11800 }
  ];

  const sidebarItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: null },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', badge: null },
    { id: 'users', icon: Users, label: 'Users', badge: '3' },
    { id: 'providers', icon: Shield, label: 'Providers', badge: providers.length.toString() },
    { id: 'categories', icon: Layers, label: 'Categories', badge: categories.length.toString() },
    { id: 'bookings', icon: Calendar, label: 'Bookings', badge: '24' },
    { id: 'reviews', icon: Star, label: 'Reviews', badge: '89' },
    { id: 'revenue', icon: DollarSign, label: 'Revenue', badge: null },
    { id: 'reports', icon: FileText, label: 'Reports', badge: null },
    { id: 'settings', icon: Settings, label: 'Settings', badge: null }
  ];

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        className="bg-white border-r border-border flex flex-col shadow-lg relative z-10"
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Logo & Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <p className="font-bold text-sm">MH26 Admin</p>
                <p className="text-xs text-muted-foreground">Control Panel</p>
              </div>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <Menu className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-primary text-white shadow-md'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.badge && (
                  <Badge variant={activeSection === item.id ? "secondary" : "outline"} className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </motion.button>
            ))}
          </div>

          {!sidebarCollapsed && (
            <div className="mt-6 px-3">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
                <div className="flex items-start space-x-2">
                  <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Need Help?</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Check our documentation or contact support
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-3 w-full"
                      onClick={() => setShowHelp(!showHelp)}
                    >
                      View Guide
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* User Section */}
        <div className="border-t border-border p-4 bg-muted/30">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                  {userData.firstName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{userData.firstName} {userData.lastName}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onLogout} title="Logout">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={onLogout} className="w-full">
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {sidebarItems.find(item => item.id === activeSection)?.label}
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeSection === 'dashboard' && 'Overview of your platform performance'}
              {activeSection === 'analytics' && 'Detailed insights and metrics'}
              {activeSection === 'users' && 'Manage customer accounts'}
              {activeSection === 'providers' && 'Manage service providers'}
              {activeSection === 'categories' && 'Organize service categories'}
              {activeSection === 'bookings' && 'Track all bookings'}
              {activeSection === 'reviews' && 'Monitor customer feedback'}
              {activeSection === 'revenue' && 'Financial overview'}
              {activeSection === 'reports' && 'Generate comprehensive reports'}
              {activeSection === 'settings' && 'Platform configuration'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search..."
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === 'dashboard' && <DashboardSection revenueData={revenueData} categoryDistribution={categoryDistribution} weeklyActivity={weeklyActivity} providers={providers} categories={categories} />}
              {activeSection === 'analytics' && <AnalyticsSection revenueData={revenueData} weeklyActivity={weeklyActivity} />}
              {activeSection === 'users' && <UsersSection />}
              {activeSection === 'providers' && <ProvidersSection providers={providers} />}
              {activeSection === 'categories' && <CategoriesSection categories={categories} setCategories={setCategories} />}
              {activeSection === 'bookings' && <BookingsSection />}
              {activeSection === 'reviews' && <ReviewsSection />}
              {activeSection === 'revenue' && <RevenueSection revenueData={revenueData} />}
              {activeSection === 'reports' && <ReportsSection />}
              {activeSection === 'settings' && <SettingsSection />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Admin Panel Guide</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowHelp(false)}>
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-4">
                <HelpSection title="Dashboard" icon={LayoutDashboard} description="View overall platform metrics, recent activity, and quick stats." />
                <HelpSection title="Analytics" icon={BarChart3} description="Deep dive into detailed charts and graphs showing platform performance over time." />
                <HelpSection title="Users" icon={Users} description="Manage customer accounts, view user activity, and handle account issues." />
                <HelpSection title="Providers" icon={Shield} description="Review, approve, or reject service provider applications. Manage active providers." />
                <HelpSection title="Categories" icon={Layers} description="Create, edit, and organize service categories. Control what services are available." />
                <HelpSection title="Bookings" icon={Calendar} description="Monitor all platform bookings, track status, and resolve booking issues." />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Dashboard Section
function DashboardSection({ revenueData, categoryDistribution, weeklyActivity, providers, categories }: any) {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to MH26 Admin Panel! 👋</h2>
              <p className="text-white/90">Here's what's happening with your platform today.</p>
            </div>
            <Award className="w-16 h-16 opacity-20" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value="₹67,000"
          change="+12.5%"
          trend="up"
          icon={DollarSign}
          color="green"
          description="This month's earnings"
        />
        <StatsCard
          title="Active Users"
          value="189"
          change="+8.2%"
          trend="up"
          icon={Users}
          color="blue"
          description="Registered customers"
        />
        <StatsCard
          title="Service Providers"
          value={providers.length.toString()}
          change="0%"
          trend="neutral"
          icon={Shield}
          color="purple"
          description="Verified providers"
        />
        <StatsCard
          title="Total Bookings"
          value="134"
          change="+15.3%"
          trend="up"
          icon={Calendar}
          color="orange"
          description="This month"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff6b35" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <RechartsTooltip />
                <Area type="monotone" dataKey="revenue" stroke="#ff6b35" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Providers by service category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
          <CardDescription>Bookings and revenue for the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#888" />
              <YAxis stroke="#888" />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="bookings" fill="#4f46e5" name="Bookings" />
              <Bar dataKey="revenue" fill="#ff6b35" name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest customer bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Booking #{1000 + i}</p>
                      <p className="text-sm text-muted-foreground">Customer {i} • Plumbing</p>
                    </div>
                  </div>
                  <Badge>Pending</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Providers</CardTitle>
            <CardDescription>Best performing service providers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {providers.slice(0, 4).map((provider: any) => (
                <div key={provider.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ImageWithFallback
                      src={provider.image}
                      alt={provider.businessName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{provider.businessName}</p>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-sm">{provider.rating}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{provider.category}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, change, trend, icon: Icon, color, description }: any) {
  const colorClasses = {
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold mb-2">{value}</p>
            <div className="flex items-center space-x-2">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : trend === 'down' ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : (
                <Activity className="w-4 h-4 text-gray-500" />
              )}
              <span className={`text-sm ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                {change}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          </div>
          <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Analytics Section
function AnalyticsSection({ revenueData, weeklyActivity }: any) {
  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">Analytics Overview</p>
              <p className="text-sm text-blue-700 mt-1">
                This section provides detailed insights into your platform's performance. Use these metrics to make data-driven decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Target className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-3xl font-bold mt-2">24.5%</p>
              <p className="text-xs text-green-500 mt-1">+3.2% from last month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Activity className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Avg. Session</p>
              <p className="text-3xl font-bold mt-2">8m 42s</p>
              <p className="text-xs text-green-500 mt-1">+12s from last week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Active Now</p>
              <p className="text-3xl font-bold mt-2">47</p>
              <p className="text-xs text-muted-foreground mt-1">Live users</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue & Users Growth</CardTitle>
          <CardDescription>Compare revenue and user growth over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis yAxisId="left" stroke="#888" />
              <YAxis yAxisId="right" orientation="right" stroke="#888" />
              <RechartsTooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#ff6b35" strokeWidth={2} name="Revenue (₹)" />
              <Line yAxisId="right" type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={2} name="Users" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// Users Section
function UsersSection() {
  const users = [
    { id: 1, name: 'Customer User', email: 'customer@mh26demo.com', type: 'Customer', status: 'Active', joined: 'Jan 15, 2024' },
    { id: 2, name: 'Provider User', email: 'provider@mh26demo.com', type: 'Provider', status: 'Active', joined: 'Jan 20, 2024' },
    { id: 3, name: 'Admin User', email: 'admin@mh26.com', type: 'Admin', status: 'Active', joined: 'Jan 1, 2024' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Users className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">User Management</p>
              <p className="text-sm text-green-700 mt-1">
                View and manage all platform users. You can activate/deactivate accounts, view user activity, and handle support requests.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage customer and provider accounts</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline">{user.type}</Badge>
                      <span className="text-xs text-muted-foreground">Joined {user.joined}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-green-500">{user.status}</Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Providers Section
function ProvidersSection({ providers }: { providers: ServiceProvider[] }) {
  return (
    <div className="space-y-6">
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-purple-500 mt-0.5" />
            <div>
              <p className="font-semibold text-purple-900">Provider Management</p>
              <p className="text-sm text-purple-700 mt-1">
                Review provider applications, verify credentials, and manage active service providers. Ensure quality by monitoring ratings and reviews.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{providers.filter(p => p.verified).length}</p>
            <p className="text-sm text-muted-foreground">Verified Providers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="w-10 h-10 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">4.7</p>
            <p className="text-sm text-muted-foreground">Avg Rating</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Providers ({providers.length})</CardTitle>
              <CardDescription>Manage service provider accounts</CardDescription>
            </div>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Provider
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {providers.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <ImageWithFallback
                    src={provider.image}
                    alt={provider.businessName}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold">{provider.businessName}</p>
                    <p className="text-sm text-muted-foreground">{provider.name}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge>{provider.category}</Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm">{provider.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">({provider.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{provider.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3" />
                        <span>{provider.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {provider.verified && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Categories Section
function CategoriesSection({ categories, setCategories }: { categories: Category[]; setCategories: (cats: Category[]) => void }) {
  return (
    <div className="space-y-6">
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Layers className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-900">Category Management</p>
              <p className="text-sm text-orange-700 mt-1">
                Organize your services by creating categories. You can add new categories, edit existing ones, and control which are visible to users.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Service Categories</CardTitle>
              <CardDescription>Organize and manage service types</CardDescription>
            </div>
            <Button onClick={() => {
              const newCat: Category = {
                id: Date.now().toString(),
                name: 'New Category',
                icon: '🆕',
                description: 'Enter description',
                active: false
              };
              setCategories([...categories, newCat]);
              toast.success("Category created! Click edit to customize it.");
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <Card key={cat.id} className={`border-2 ${cat.active ? 'border-green-200 bg-green-50/50' : 'border-gray-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="text-4xl">{cat.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{cat.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{cat.description}</p>
                        <Badge variant={cat.active ? 'default' : 'secondary'} className={cat.active ? 'bg-green-500' : ''}>
                          {cat.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setCategories(categories.map(c => 
                            c.id === cat.id ? { ...c, active: !c.active } : c
                          ));
                          toast.success(`Category ${cat.active ? 'deactivated' : 'activated'}!`);
                        }}
                      >
                        {cat.active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          if (confirm(`Delete "${cat.name}" category?`)) {
                            setCategories(categories.filter(c => c.id !== cat.id));
                            toast.success("Category deleted!");
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Bookings, Reviews, Revenue, Reports, Settings sections (simplified for space)
function BookingsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings Management</CardTitle>
        <CardDescription>Track and manage all platform bookings</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Booking management features coming soon...</p>
      </CardContent>
    </Card>
  );
}

function ReviewsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews & Ratings</CardTitle>
        <CardDescription>Monitor customer feedback</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Review management features coming soon...</p>
      </CardContent>
    </Card>
  );
}

function RevenueSection({ revenueData }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-3xl font-bold mt-2">₹3,28,000</p>
            <p className="text-sm text-green-500 mt-1">+18.2% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-3xl font-bold mt-2">₹67,000</p>
            <p className="text-sm text-green-500 mt-1">+12.5% vs last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Avg. Transaction</p>
            <p className="text-3xl font-bold mt-2">₹500</p>
            <p className="text-sm text-muted-foreground mt-1">Per booking</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="revenue" fill="#ff6b35" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports & Analytics</CardTitle>
        <CardDescription>Generate comprehensive platform reports</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Report generation features coming soon...</p>
      </CardContent>
    </Card>
  );
}

function SettingsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Settings</CardTitle>
        <CardDescription>Configure system preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Settings panel coming soon...</p>
      </CardContent>
    </Card>
  );
}

// Help Section Component
function HelpSection({ title, icon: Icon, description }: any) {
  return (
    <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
      <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}
