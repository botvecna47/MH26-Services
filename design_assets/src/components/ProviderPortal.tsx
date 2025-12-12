import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  BarChart3,
  Calendar,
  Users,
  DollarSign,
  Star,
  Clock,
  Phone,
  MessageCircle,
  Settings,
  Bell,
  LogOut,
  User,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  MapPin,
  Camera,
  Save,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ProviderPortalProps {
  userData: any;
  onLogout: () => void;
}

export function ProviderPortal({ userData, onLogout }: ProviderPortalProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAvailable, setIsAvailable] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock data
  const dashboardStats = {
    totalEarnings: "₹24,500",
    thisMonth: "₹8,200",
    totalBookings: 147,
    activeBookings: 3,
    rating: 4.8,
    reviews: 89,
    responseTime: "15 mins",
    completionRate: "96%"
  };

  const earningsData = [
    { month: 'Jan', earnings: 5200 },
    { month: 'Feb', earnings: 6800 },
    { month: 'Mar', earnings: 7200 },
    { month: 'Apr', earnings: 8200 },
    { month: 'May', earnings: 9100 },
    { month: 'Jun', earnings: 8200 }
  ];

  const bookingsData = [
    { day: 'Mon', bookings: 8 },
    { day: 'Tue', bookings: 12 },
    { day: 'Wed', bookings: 10 },
    { day: 'Thu', bookings: 15 },
    { day: 'Fri', bookings: 18 },
    { day: 'Sat', bookings: 22 },
    { day: 'Sun', bookings: 16 }
  ];

  const serviceDistribution = [
    { name: 'Emergency Calls', value: 45, color: '#ff6b35' },
    { name: 'Scheduled Repairs', value: 35, color: '#4ade80' },
    { name: 'Maintenance', value: 20, color: '#3b82f6' }
  ];

  const upcomingBookings = [
    {
      id: 1,
      customerName: "Priya Sharma",
      service: "Pipe Repair",
      time: "10:00 AM",
      date: "Today",
      status: "confirmed",
      amount: "₹400",
      phone: "+91 98765 43210",
      address: "123 MG Road, Nanded"
    },
    {
      id: 2,
      customerName: "Rajesh Patil",
      service: "Bathroom Fitting",
      time: "2:30 PM",
      date: "Today",
      status: "pending",
      amount: "₹1,200",
      phone: "+91 87654 32109",
      address: "456 Station Road, Nanded"
    },
    {
      id: 3,
      customerName: "Anita Desai",
      service: "Kitchen Plumbing",
      time: "11:00 AM",
      date: "Tomorrow",
      status: "confirmed",
      amount: "₹800",
      phone: "+91 76543 21098",
      address: "789 College Road, Nanded"
    }
  ];

  const recentReviews = [
    {
      id: 1,
      customerName: "Priya Sharma",
      rating: 5,
      comment: "Excellent service! Very professional and quick response.",
      date: "2 days ago",
      service: "Pipe Repair"
    },
    {
      id: 2,
      customerName: "Rajesh Kumar",
      rating: 4,
      comment: "Good work, but could have been faster.",
      date: "1 week ago",
      service: "Tap Installation"
    }
  ];

  const notifications = [
    {
      id: 1,
      type: "booking",
      title: "New Booking Request",
      message: "Priya Sharma requested pipe repair service.",
      time: "5 mins ago",
      read: false
    },
    {
      id: 2,
      type: "payment",
      title: "Payment Received",
      message: "₹400 payment received from completed service.",
      time: "1 hour ago",
      read: true
    }
  ];

  const handleAcceptBooking = (bookingId: number) => {
    toast.success("Booking accepted! Customer will be notified.");
  };

  const handleRejectBooking = (bookingId: number) => {
    toast.error("Booking rejected. Customer will be notified.");
  };

  const handleCompleteService = (bookingId: number) => {
    toast.success("Service marked as completed. Payment will be processed.");
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
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <h1 className="font-bold text-foreground">MH26 Services</h1>
                <p className="text-xs text-muted-foreground">Provider Portal</p>
              </div>
            </div>

            {/* Status Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Available</span>
                <Switch 
                  checked={isAvailable} 
                  onCheckedChange={setIsAvailable}
                  className="data-[state=checked]:bg-green-500"
                />
                <Badge className={`${isAvailable ? 'bg-green-500' : 'bg-red-500'} text-white border-0`}>
                  {isAvailable ? 'Online' : 'Offline'}
                </Badge>
              </div>

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
                      className="absolute right-0 top-12 w-80 bg-white border border-border rounded-lg shadow-xl p-4 space-y-3"
                    >
                      <h3 className="font-medium text-foreground">Notifications</h3>
                      {notifications.map((notification) => (
                        <div key={notification.id} className={`p-3 rounded-lg border ${notification.read ? 'bg-muted/30' : 'bg-green-50 border-green-200'}`}>
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${notification.read ? 'bg-muted-foreground' : 'bg-green-500'}`} />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-foreground">{notification.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-medium text-sm text-foreground">{userData.fullName}</p>
                  <p className="text-xs text-muted-foreground">Provider</p>
                </div>
                <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-green-500" />
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
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <Calendar className="w-4 h-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* Stats Overview */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                      <p className="text-2xl font-bold text-foreground">{dashboardStats.totalEarnings}</p>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +12% from last month
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Bookings</p>
                      <p className="text-2xl font-bold text-foreground">{dashboardStats.totalBookings}</p>
                      <p className="text-xs text-blue-600 flex items-center mt-1">
                        <Activity className="w-3 h-3 mr-1" />
                        {dashboardStats.activeBookings} active
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p className="text-2xl font-bold text-foreground">{dashboardStats.rating}</p>
                      <p className="text-xs text-yellow-600 flex items-center mt-1">
                        <Star className="w-3 h-3 mr-1" />
                        {dashboardStats.reviews} reviews
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Response Time</p>
                      <p className="text-2xl font-bold text-foreground">{dashboardStats.responseTime}</p>
                      <p className="text-xs text-purple-600 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {dashboardStats.completionRate} completion
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
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
                    <CardTitle>Earnings Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={earningsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`₹${value}`, 'Earnings']} />
                        <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={3} />
                      </LineChart>
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
                    <CardTitle>Weekly Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={bookingsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}`, 'Bookings']} />
                        <Bar dataKey="bookings" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Service Distribution & Recent Reviews */}
            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Card className="border-0 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle>Service Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
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
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
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
                    <CardTitle>Recent Reviews</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentReviews.map((review) => (
                      <div key={review.id} className="border-b border-border pb-4 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-foreground">{review.customerName}</h4>
                            <p className="text-sm text-muted-foreground">{review.service}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">"{review.comment}"</p>
                        <p className="text-xs text-muted-foreground mt-2">{review.date}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">Upcoming Bookings</h2>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Calendar View
                  </Button>
                  <Button className="bg-gradient-to-r from-green-500 to-green-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Availability
                  </Button>
                </div>
              </div>

              {upcomingBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <Card className="border-0 shadow-sm bg-white">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-foreground">{booking.customerName}</h3>
                              <p className="text-sm text-muted-foreground">{booking.service}</p>
                            </div>
                            <Badge 
                              className={`${
                                booking.status === 'confirmed' ? 'bg-green-500' :
                                booking.status === 'pending' ? 'bg-yellow-500' :
                                'bg-blue-500'
                              } text-white border-0`}
                            >
                              {booking.status === 'confirmed' ? 'Confirmed' :
                               booking.status === 'pending' ? 'Pending' :
                               'Completed'}
                            </Badge>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{booking.date} at {booking.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span>{booking.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span>{booking.address}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-lg text-foreground">{booking.amount}</p>
                          
                          <div className="flex space-x-2 mt-3">
                            {booking.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-green-500 hover:bg-green-600"
                                  onClick={() => handleAcceptBooking(booking.id)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Accept
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleRejectBooking(booking.id)}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <>
                                <Button variant="outline" size="sm">
                                  <Phone className="w-4 h-4 mr-1" />
                                  Call
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="bg-blue-500 hover:bg-blue-600"
                                  onClick={() => handleCompleteService(booking.id)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Complete
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-12"
            >
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Customer Management</h3>
              <p className="text-muted-foreground mb-6">View and manage your customer relationships</p>
              <Button variant="outline">
                View Customer List
              </Button>
            </motion.div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">Service Management</h2>
                <Button className="bg-gradient-to-r from-green-500 to-green-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Service
                </Button>
              </div>

              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle>Service Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Business Name</label>
                        <Input value="QuickFix Plumbing" className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Service Type</label>
                        <Select defaultValue="plumber">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="plumber">Plumber</SelectItem>
                            <SelectItem value="electrician">Electrician</SelectItem>
                            <SelectItem value="tiffin">Tiffin Service</SelectItem>
                            <SelectItem value="tourism">Tourism Guide</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Hourly Rate</label>
                        <Input value="₹200" className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Service Area</label>
                        <Input value="Nanded City" className="mt-1" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Specialty</label>
                        <Input value="24/7 Emergency Service" className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Experience</label>
                        <Input value="8 years" className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Phone Number</label>
                        <Input value="+91 98765 43210" className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Address</label>
                        <Input value="123 Service Street, Nanded" className="mt-1" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Service Description</label>
                    <Textarea 
                      value="Professional plumbing services with 8+ years of experience. Specializing in emergency repairs, pipe installations, bathroom fittings, and maintenance work. Available 24/7 for urgent situations."
                      className="mt-1"
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t">
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <span className="text-sm">Service Active</span>
                    </div>
                    <Button className="bg-gradient-to-r from-green-500 to-green-600">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-2 gap-6"
            >
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-12 h-12 text-green-600" />
                    </div>
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input value={userData.fullName} className="bg-input-background" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input value={userData.email} readOnly className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input value="+91 98765 43210" className="bg-input-background" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address</label>
                    <Textarea value="123 Service Street, Nanded, MH 431601" className="bg-input-background" />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-green-500 to-green-600">
                    <Save className="w-4 h-4 mr-2" />
                    Update Profile
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle>Business Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span>Accept New Bookings</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>Email Notifications</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>SMS Alerts</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>Auto-Accept Familiar Customers</span>
                    <Switch />
                  </div>
                  
                  <div className="pt-4 border-t space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Working Hours</label>
                      <div className="flex space-x-2">
                        <Input placeholder="9:00 AM" className="bg-input-background" />
                        <span className="self-center">to</span>
                        <Input placeholder="6:00 PM" className="bg-input-background" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Service Radius (km)</label>
                      <Input value="10" className="bg-input-background" />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="destructive" className="w-full">
                      Deactivate Account
                    </Button>
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