import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Calendar,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download,
} from "lucide-react";

type UserRole = 'visitor' | 'user' | 'provider' | 'admin';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'provider' | 'admin';
}

interface BookingsPageProps {
  user: User;
  userRole: UserRole;
}

interface Booking {
  id: string;
  service: string;
  provider: string;
  customer?: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'pending';
  amount: string;
  location: string;
  rating?: number;
}

export function BookingsPage({ user, userRole }: BookingsPageProps) {
  const [activeTab, setActiveTab] = useState('all');

  // Mock bookings data - different for users vs providers
  const mockBookings: Booking[] = userRole === 'provider'
    ? [
        {
          id: 'BK-1234',
          service: 'Maharashtrian Thali Delivery',
          customer: 'Priya Sharma',
          date: 'Nov 12, 2024',
          time: '7:00 PM',
          status: 'upcoming',
          amount: '₹150',
          location: 'Shivaji Nagar',
        },
        {
          id: 'BK-1233',
          service: 'Weekly Tiffin Subscription',
          customer: 'Rajesh Patil',
          date: 'Nov 10, 2024',
          time: '1:00 PM',
          status: 'completed',
          amount: '₹900',
          location: 'Vazirabad',
          rating: 5,
        },
        {
          id: 'BK-1232',
          service: 'North Indian Combo',
          customer: 'Anita Desai',
          date: 'Nov 9, 2024',
          time: '8:00 PM',
          status: 'completed',
          amount: '₹180',
          location: 'SRTMU Campus',
          rating: 4,
        },
        {
          id: 'BK-1231',
          service: 'Special Misal Pav',
          customer: 'Suresh Kumar',
          date: 'Nov 8, 2024',
          time: '12:30 PM',
          status: 'cancelled',
          amount: '₹80',
          location: 'Old City',
        },
      ]
    : [
        {
          id: 'BK-5678',
          service: 'Plumbing Service',
          provider: 'QuickFix Plumbing',
          date: 'Nov 15, 2024',
          time: '10:00 AM',
          status: 'upcoming',
          amount: '₹850',
          location: 'My Home',
        },
        {
          id: 'BK-5677',
          service: 'Tiffin Delivery',
          provider: 'Maharashtrian Tiffin Express',
          date: 'Nov 12, 2024',
          time: '7:00 PM',
          status: 'upcoming',
          amount: '₹150',
          location: 'My Home',
        },
        {
          id: 'BK-5676',
          service: 'City Tour',
          provider: 'Nanded Heritage Tours',
          date: 'Nov 5, 2024',
          time: '9:00 AM',
          status: 'completed',
          amount: '₹1,500',
          location: 'Hazur Sahib',
          rating: 5,
        },
        {
          id: 'BK-5675',
          service: 'Electrical Repair',
          provider: 'Spark Electricals',
          date: 'Oct 28, 2024',
          time: '2:00 PM',
          status: 'completed',
          amount: '₹600',
          location: 'My Home',
          rating: 4,
        },
      ];

  const getFilteredBookings = () => {
    if (activeTab === 'all') return mockBookings;
    return mockBookings.filter(b => b.status === activeTab);
  };

  const filteredBookings = getFilteredBookings();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="w-3 h-3" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'cancelled':
        return <XCircle className="w-3 h-3" />;
      case 'pending':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const stats = [
    {
      label: 'Total Bookings',
      value: mockBookings.length.toString(),
      icon: Calendar,
      color: 'text-primary',
    },
    {
      label: 'Upcoming',
      value: mockBookings.filter(b => b.status === 'upcoming').length.toString(),
      icon: Clock,
      color: 'text-blue-600',
    },
    {
      label: 'Completed',
      value: mockBookings.filter(b => b.status === 'completed').length.toString(),
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      label: 'Cancelled',
      value: mockBookings.filter(b => b.status === 'cancelled').length.toString(),
      icon: XCircle,
      color: 'text-destructive',
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1>{userRole === 'provider' ? 'Jobs Management' : 'My Bookings'}</h1>
          <p className="text-muted-foreground mt-2">
            {userRole === 'provider' 
              ? 'Manage your customer orders and service requests'
              : 'View and manage your service bookings'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Bookings</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No bookings found</h3>
                    <p className="text-muted-foreground">
                      {activeTab === 'all' 
                        ? 'You don\'t have any bookings yet'
                        : `No ${activeTab} bookings`
                      }
                    </p>
                  </div>
                ) : (
                  filteredBookings.map((booking) => (
                    <Card key={booking.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          {/* Left Section */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium">{booking.service}</h3>
                                  <Badge className={getStatusColor(booking.status)}>
                                    {getStatusIcon(booking.status)}
                                    <span className="ml-1 capitalize">{booking.status}</span>
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {userRole === 'provider' ? 'Customer: ' : 'Provider: '}
                                  {booking.customer || booking.provider}
                                </p>
                              </div>
                              <p className="font-medium text-lg">{booking.amount}</p>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {booking.date}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {booking.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {booking.location}
                              </div>
                            </div>

                            {booking.rating && (
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < booking.rating!
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className="text-sm text-muted-foreground ml-2">
                                  {booking.rating}.0
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Right Section - Actions */}
                          <div className="flex md:flex-col gap-2">
                            {booking.status === 'upcoming' && (
                              <>
                                <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                                  <Phone className="w-4 h-4 md:mr-2" />
                                  <span className="hidden md:inline">Call</span>
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                                  <MessageSquare className="w-4 h-4 md:mr-2" />
                                  <span className="hidden md:inline">Message</span>
                                </Button>
                                {userRole === 'user' && (
                                  <Button variant="outline" size="sm" className="flex-1 md:flex-none text-destructive hover:text-destructive">
                                    <XCircle className="w-4 h-4 md:mr-2" />
                                    <span className="hidden md:inline">Cancel</span>
                                  </Button>
                                )}
                              </>
                            )}
                            {booking.status === 'completed' && !booking.rating && userRole === 'user' && (
                              <Button size="sm" className="flex-1 md:flex-none">
                                <Star className="w-4 h-4 md:mr-2" />
                                <span className="hidden md:inline">Rate Service</span>
                              </Button>
                            )}
                            <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
