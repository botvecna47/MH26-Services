import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Calendar, 
  DollarSign,
  Users,
  Star,
  Menu,
  LogOut,
  LayoutDashboard,
  Package,
  BarChart3,
  Settings,
  User,
  Download,
  Bell,
  TrendingUp,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { motion } from "motion/react";
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface UserData {
  email: string;
  userType: 'customer' | 'provider' | 'admin' | null;
  firstName?: string;
  lastName?: string;
  isAuthenticated: boolean;
}

interface EnhancedProviderDashboardProps {
  userData: UserData;
  onLogout: () => void;
}

export default function EnhancedProviderDashboard({ userData, onLogout }: EnhancedProviderDashboardProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const revenueData = [
    { month: 'Jan', revenue: 12000, bookings: 24 },
    { month: 'Feb', revenue: 15000, bookings: 30 },
    { month: 'Mar', revenue: 18000, bookings: 36 },
    { month: 'Apr', revenue: 22000, bookings: 44 },
    { month: 'May', revenue: 25000, bookings: 50 },
    { month: 'Jun', revenue: 28000, bookings: 56 }
  ];

  const categoryData = [
    { name: 'Pipe Repairs', value: 45, color: '#ff6b35' },
    { name: 'Tank Cleaning', value: 25, color: '#ff8c5a' },
    { name: 'Bathroom Fitting', value: 20, color: '#ffad7f' },
    { name: 'Emergency', value: 10, color: '#ffc8a4' }
  ];

  const sidebarItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'bookings', icon: Calendar, label: 'Bookings' },
    { id: 'services', icon: Package, label: 'My Services' },
    { id: 'earnings', icon: DollarSign, label: 'Earnings' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'reviews', icon: Star, label: 'Reviews' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        className="bg-white border-r border-border flex flex-col shadow-lg"
        animate={{ width: sidebarCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3 }}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <div>
                <p className="font-semibold text-sm">Provider Panel</p>
                <p className="text-xs text-muted-foreground">MH26 Services</p>
              </div>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <Menu className="w-4 h-4" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 transition-colors ${
                activeSection === item.id
                  ? 'bg-primary/10 text-primary border-r-4 border-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {userData.firstName?.[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{userData.firstName} {userData.lastName}</p>
                  <p className="text-xs text-muted-foreground">Provider</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onLogout}>
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
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-bold">
              {sidebarItems.find(item => item.id === activeSection)?.label}
            </h1>
            <p className="text-sm text-muted-foreground">Welcome back, {userData.firstName}!</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-primary to-primary/80 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Total Revenue</p>
                        <p className="text-3xl font-bold mt-2">₹28,000</p>
                        <div className="flex items-center mt-2 text-sm">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          <span>+12.5%</span>
                        </div>
                      </div>
                      <DollarSign className="w-12 h-12 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Bookings</p>
                        <p className="text-3xl font-bold mt-2">56</p>
                        <div className="flex items-center mt-2 text-sm text-green-600">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          <span>+18%</span>
                        </div>
                      </div>
                      <Calendar className="w-12 h-12 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Rating</p>
                        <p className="text-3xl font-bold mt-2">4.7</p>
                        <div className="flex items-center mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-4 h-4 text-yellow-500 fill-current" />
                          ))}
                        </div>
                      </div>
                      <Star className="w-12 h-12 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Customers</p>
                        <p className="text-3xl font-bold mt-2">89</p>
                        <div className="flex items-center mt-2 text-sm text-blue-600">
                          <Users className="w-4 h-4 mr-1" />
                          <span>+5 new</span>
                        </div>
                      </div>
                      <Users className="w-12 h-12 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
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
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#ff6b35" fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Service Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPie>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Customer #{i}</p>
                            <p className="text-sm text-muted-foreground">Pipe Repair Service</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{500 * i}</p>
                          <p className="text-sm text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'bookings' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Bookings</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      New
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Booking #{1000 + i}</p>
                          <p className="text-sm text-muted-foreground">Pipe Repair • Customer: John Doe</p>
                          <p className="text-xs text-muted-foreground mt-1">Jan {i}, 2024 • 10:00 AM</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={i % 3 === 0 ? 'default' : i % 3 === 1 ? 'secondary' : 'outline'}>
                          {i % 3 === 0 ? 'Completed' : i % 3 === 1 ? 'In Progress' : 'Pending'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'services' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Services</CardTitle>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {['Pipe Repairs', 'Tank Cleaning', 'Bathroom Fitting', 'Emergency Service'].map((service, idx) => (
                    <Card key={idx} className="border-2">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg mb-2">{service}</h3>
                            <p className="text-sm text-muted-foreground mb-3">From ₹{300 + idx * 200}</p>
                            <Badge variant="outline">Active</Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
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
          )}

          {activeSection === 'earnings' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-3xl font-bold mt-2">₹28,000</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Last Month</p>
                    <p className="text-3xl font-bold mt-2">₹25,000</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-3xl font-bold mt-2">₹1,20,000</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Earnings History</CardTitle>
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
          )}

          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">Response Time</span>
                          <span className="text-sm font-semibold">15 mins</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">Completion Rate</span>
                          <span className="text-sm font-semibold">94%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '94%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">Satisfaction</span>
                          <span className="text-sm font-semibold">4.7/5</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '94%' }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="bookings" stroke="#ff6b35" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {['customers', 'reviews', 'profile', 'settings'].includes(activeSection) && (
            <Card>
              <CardHeader>
                <CardTitle>{sidebarItems.find(item => item.id === activeSection)?.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">This section is under development.</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
