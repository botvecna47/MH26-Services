import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Switch } from "./ui/switch";
import { 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { 
  Star, 
  TrendingUp, 
  DollarSign, 
  Users,
  Bell,
  Settings,
  Edit,
  Camera,
  Plus,
  MessageCircle,
  Phone,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Package,
  Eye
} from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'provider' | 'admin';
  avatar?: string;
  businessName?: string;
}

interface ProviderDashboardProps {
  user: User;
  onNavigate: (page: string) => void;
}

export function ProviderDashboard({ user, onNavigate }: ProviderDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAvailable, setIsAvailable] = useState(true);

  // Mock data for provider
  const provider = {
    name: "Maharashtrian Tiffin Express",
    service: "Tiffin Service",
    rating: 4.8,
    totalReviews: 156,
    totalOrders: 234,
    monthlyRevenue: "₹23,400",
    joinDate: "January 2023",
    profileImage: null
  };

  // Mock earnings data
  const earningsData = [
    { name: 'Week 1', earnings: 5200 },
    { name: 'Week 2', earnings: 6100 },
    { name: 'Week 3', earnings: 5800 },
    { name: 'Week 4', earnings: 6300 }
  ];

  // Mock orders data
  const recentOrders = [
    {
      id: "#1234",
      customer: "Priya Sharma",
      items: "Maharashtrian Thali x2",
      amount: "₹300",
      status: "Completed",
      date: "2 hours ago"
    },
    {
      id: "#1233",
      customer: "Rajesh Patil",
      items: "North Indian Combo x1",
      amount: "₹180",
      status: "In Progress",
      date: "4 hours ago"
    },
    {
      id: "#1232",
      customer: "Anita Desai",
      items: "Special Misal Pav x3",
      amount: "₹240",
      status: "Pending",
      date: "6 hours ago"
    },
    {
      id: "#1231",
      customer: "Suresh Kumar",
      items: "Weekly Subscription",
      amount: "₹900",
      status: "Completed",
      date: "1 day ago"
    }
  ];

  // Mock reviews
  const recentReviews = [
    {
      id: 1,
      customer: "Priya Sharma",
      rating: 5,
      comment: "Excellent food quality and timely delivery. Highly recommend!",
      date: "2 days ago"
    },
    {
      id: 2,
      customer: "Rajesh Patil",
      rating: 5,
      comment: "Been ordering for 2 months now. Consistent quality!",
      date: "1 week ago"
    },
    {
      id: 3,
      customer: "Anita Desai",
      rating: 4,
      comment: "Good food variety and taste. Sometimes delivery is slightly delayed.",
      date: "2 weeks ago"
    }
  ];

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: "new_order",
      message: "New order received from Priya Sharma",
      time: "5 minutes ago",
      unread: true
    },
    {
      id: 2,
      type: "review",
      message: "New 5-star review from Rajesh Patil",
      time: "2 hours ago",
      unread: true
    },
    {
      id: 3,
      type: "payment",
      message: "Weekly payment of ₹5,200 processed",
      time: "1 day ago",
      unread: false
    }
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => onNavigate('home')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Site
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Provider Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {provider.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm">Available</span>
                <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
              </div>
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full max-w-lg mb-8">
            <TabsTrigger value="dashboard">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="notifications">Alerts</TabsTrigger>
          </TabsList>

          {/* Dashboard Overview */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">This Month</p>
                      <p className="text-2xl font-bold">{provider.monthlyRevenue}</p>
                      <p className="text-xs text-green-600">↗ +18% from last month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold">{provider.totalOrders}</p>
                      <p className="text-xs text-blue-600">↗ +12 this week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p className="text-2xl font-bold">{provider.rating}</p>
                      <p className="text-xs text-muted-foreground">{provider.totalReviews} reviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Growth</p>
                      <p className="text-2xl font-bold">+28%</p>
                      <p className="text-xs text-green-600">vs last month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Earnings Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Weekly Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={earningsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value}`, 'Earnings']} />
                      <Line type="monotone" dataKey="earnings" stroke="#ff6b35" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" onClick={() => setActiveTab('profile')}>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Menu
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Special Offer
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab('reviews')}>
                    <Star className="w-4 h-4 mr-2" />
                    View Reviews
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Customer Support
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.customer}</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{order.items}</p>
                            <p className="text-xs text-muted-foreground">{order.date}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{order.amount}</p>
                          <Badge 
                            className={
                              order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab('orders')}>
                  View All Orders
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Order Management</h2>
              <div className="flex space-x-2">
                <Button variant="outline">Filter</Button>
                <Button variant="outline">Export</Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left py-3 px-4">Order ID</th>
                        <th className="text-left py-3 px-4">Customer</th>
                        <th className="text-left py-3 px-4">Items</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-right py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b last:border-0">
                          <td className="py-4 px-4 font-medium">{order.id}</td>
                          <td className="py-4 px-4">{order.customer}</td>
                          <td className="py-4 px-4 text-sm">{order.items}</td>
                          <td className="py-4 px-4 font-medium">{order.amount}</td>
                          <td className="py-4 px-4">
                            <Badge 
                              className={
                                order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {order.status === 'Completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {order.status === 'In Progress' && <Clock className="w-3 h-3 mr-1" />}
                              {order.status === 'Pending' && <AlertCircle className="w-3 h-3 mr-1" />}
                              {order.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-sm text-muted-foreground">{order.date}</td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Phone className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-bold">Profile Settings</h2>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarFallback className="text-lg">
                        {provider.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline">
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Business Name</label>
                    <Input defaultValue={provider.name} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Service Type</label>
                    <Input defaultValue={provider.service} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input defaultValue="+91 9876543210" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input defaultValue="maharashtriantiffin@gmail.com" />
                  </div>

                  <Button>Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea 
                      placeholder="Describe your service..."
                      defaultValue="Authentic Maharashtrian tiffin service with fresh, home-cooked meals delivered daily."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Operating Hours</label>
                      <Input defaultValue="7:00 AM - 9:00 PM" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Delivery Area</label>
                      <Input defaultValue="5 km radius" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input defaultValue="Shivaji Nagar, Nanded" />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Menu Items</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4 p-3 border border-border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">Maharashtrian Thali</p>
                          <p className="text-sm text-muted-foreground">Rice, dal, sabji, roti, pickle, sweet</p>
                        </div>
                        <div className="font-medium">₹150</div>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-4 p-3 border border-border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">North Indian Combo</p>
                          <p className="text-sm text-muted-foreground">Rice, dal makhani, paneer curry, roti, salad</p>
                        </div>
                        <div className="font-medium">₹180</div>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Menu Item
                    </Button>
                  </div>

                  <Button>Update Profile</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Customer Reviews</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xl font-bold">{provider.rating}</span>
                </div>
                <span className="text-muted-foreground">({provider.totalReviews} reviews)</span>
              </div>
            </div>

            <Card>
              <CardContent className="p-6 space-y-6">
                {recentReviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {review.customer.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{review.customer}</h4>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                        <Button variant="outline" size="sm">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Notifications & Alerts</h2>
              <Button variant="outline">Mark All as Read</Button>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`flex items-start space-x-4 p-4 rounded-lg border ${
                      notification.unread ? 'bg-accent/50 border-primary/20' : 'bg-background border-border'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.unread ? 'bg-primary' : 'bg-muted-foreground'
                    }`} />
                    <div className="flex-1">
                      <p className={`${notification.unread ? 'font-medium' : ''}`}>
                        {notification.message}
                      </p>
                      <p className="text-sm text-muted-foreground">{notification.time}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}