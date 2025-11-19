import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
  Loader2,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useBookings, useAcceptBooking, useRejectBooking } from "../api/bookings";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Textarea } from "./ui/textarea";

export default function BookingsPage() {
  const { user, isProvider } = useUser();
  const [activeTab, setActiveTab] = useState('all');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch real bookings from API
  const { data: bookingsData, isLoading: bookingsLoading } = useBookings({ limit: 100 });
  const acceptBooking = useAcceptBooking();
  const rejectBooking = useRejectBooking();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-gray-900 mb-2">Please sign in</h2>
          <p className="text-gray-600">You need to be logged in to view bookings</p>
        </div>
      </div>
    );
  }

  // Transform API bookings to component format
  const allBookings = (bookingsData?.data || []).map((booking: any) => ({
    id: booking.id,
    service: booking.service?.title || 'Service',
    provider: isProvider ? undefined : (booking.provider?.businessName || booking.provider?.user?.name || 'Provider'),
    customer: isProvider ? (booking.user?.name || 'Customer') : undefined,
    date: booking.scheduledAt ? format(new Date(booking.scheduledAt), 'MMM dd, yyyy') : 'N/A',
    time: booking.scheduledAt ? format(new Date(booking.scheduledAt), 'h:mm a') : 'N/A',
    status: booking.status?.toLowerCase() || 'pending',
    amount: `₹${Number(booking.totalAmount || 0).toFixed(2)}`,
    location: booking.address || 'Location not specified',
    rating: booking.rating,
    booking: booking, // Keep original for actions
  }));

  const getFilteredBookings = () => {
    if (activeTab === 'all') return allBookings;
    return allBookings.filter(b => b.status === activeTab);
  };

  const filteredBookings = getFilteredBookings();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Clock className="w-3 h-3" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'cancelled':
      case 'rejected':
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
      value: allBookings.length.toString(),
      icon: Calendar,
      color: 'text-primary',
    },
    {
      label: 'Upcoming',
      value: allBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length.toString(),
      icon: Clock,
      color: 'text-blue-600',
    },
    {
      label: 'Completed',
      value: allBookings.filter(b => b.status === 'completed').length.toString(),
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      label: 'Cancelled',
      value: allBookings.filter(b => b.status === 'cancelled').length.toString(),
      icon: XCircle,
      color: 'text-destructive',
    },
  ];

  const handleCancelBooking = (bookingId: string) => {
    // TODO: Implement cancel booking
    toast.info('Cancel booking functionality coming soon');
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      await acceptBooking.mutateAsync(bookingId);
      toast.success('Booking accepted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to accept booking');
    }
  };

  const handleRejectBooking = async () => {
    if (!selectedBookingId) return;
    
    try {
      await rejectBooking.mutateAsync({ 
        id: selectedBookingId, 
        reason: rejectReason || undefined 
      });
      toast.success('Booking rejected');
      setRejectDialogOpen(false);
      setSelectedBookingId(null);
      setRejectReason('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject booking');
    }
  };

  const openRejectDialog = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setRejectDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1>{isProvider ? 'Jobs Management' : 'My Bookings'}</h1>
          <p className="text-muted-foreground mt-2">
            {isProvider 
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
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="confirmed">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                  {isProvider && <TabsTrigger value="rejected">Rejected</TabsTrigger>}
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
                                    {isProvider ? 'Customer: ' : 'Provider: '}
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
                              {/* Provider actions for pending bookings */}
                              {isProvider && booking.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    className="flex-1 md:flex-none bg-green-600 hover:bg-green-700"
                                    onClick={() => handleAcceptBooking(booking.id)}
                                    disabled={acceptBooking.isPending}
                                  >
                                    <CheckCircle className="w-4 h-4 md:mr-2" />
                                    <span className="hidden md:inline">
                                      {acceptBooking.isPending ? 'Accepting...' : 'Accept'}
                                    </span>
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1 md:flex-none text-destructive hover:text-destructive"
                                    onClick={() => openRejectDialog(booking.id)}
                                    disabled={rejectBooking.isPending}
                                  >
                                    <XCircle className="w-4 h-4 md:mr-2" />
                                    <span className="hidden md:inline">
                                      {rejectBooking.isPending ? 'Rejecting...' : 'Reject'}
                                    </span>
                                  </Button>
                                </>
                              )}
                              
                              {/* Customer actions */}
                              {!isProvider && (booking.status === 'confirmed' || booking.status === 'pending') && (
                              <>
                                  {booking.booking?.provider?.user?.phone && (
                                    <Button variant="outline" size="sm" className="flex-1 md:flex-none" asChild>
                                      <a href={`tel:${booking.booking.provider.user.phone}`}>
                                  <Phone className="w-4 h-4 md:mr-2" />
                                  <span className="hidden md:inline">Call</span>
                                      </a>
                                </Button>
                                  )}
                                  <Button variant="outline" size="sm" className="flex-1 md:flex-none" asChild>
                                    <Link to={`/messages?provider=${booking.booking?.providerId}`}>
                                  <MessageSquare className="w-4 h-4 md:mr-2" />
                                  <span className="hidden md:inline">Message</span>
                                    </Link>
                                </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1 md:flex-none text-destructive hover:text-destructive"
                                    onClick={() => handleCancelBooking(booking.id)}
                                  >
                                    <XCircle className="w-4 h-4 md:mr-2" />
                                    <span className="hidden md:inline">Cancel</span>
                                  </Button>
                                </>
                              )}
                              
                              {/* Provider actions for confirmed bookings */}
                              {isProvider && booking.status === 'confirmed' && (
                                <>
                                  {booking.booking?.user?.phone && (
                                    <Button variant="outline" size="sm" className="flex-1 md:flex-none" asChild>
                                      <a href={`tel:${booking.booking.user.phone}`}>
                                        <Phone className="w-4 h-4 md:mr-2" />
                                        <span className="hidden md:inline">Call</span>
                                      </a>
                                  </Button>
                                )}
                                  <Button variant="outline" size="sm" className="flex-1 md:flex-none" asChild>
                                    <Link to={`/messages?user=${booking.booking?.userId}`}>
                                      <MessageSquare className="w-4 h-4 md:mr-2" />
                                      <span className="hidden md:inline">Message</span>
                                    </Link>
                                  </Button>
                              </>
                            )}
                              
                              {booking.status === 'completed' && !booking.rating && !isProvider && (
                                <Button size="sm" className="flex-1 md:flex-none" asChild>
                                  <Link to={`/provider/${booking.booking?.providerId}`}>
                                <Star className="w-4 h-4 md:mr-2" />
                                <span className="hidden md:inline">Rate Service</span>
                                  </Link>
                              </Button>
                            )}
                              <Button variant="outline" size="sm" className="flex-1 md:flex-none" asChild>
                                <Link to={`/bookings/${booking.id}`}>
                              View Details
                                </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reject Booking Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this booking? You can optionally provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Reason (Optional)
              </label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
                className="w-full"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectReason('');
                  setSelectedBookingId(null);
                }}
                disabled={rejectBooking.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectBooking}
                disabled={rejectBooking.isPending}
              >
                {rejectBooking.isPending ? 'Rejecting...' : 'Reject Booking'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
