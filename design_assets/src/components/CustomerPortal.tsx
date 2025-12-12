import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  Search, 
  MapPin, 
  Star, 
  Calendar, 
  Clock, 
  Phone, 
  MessageCircle, 
  CreditCard, 
  User, 
  Bell, 
  Settings, 
  LogOut,
  Filter,
  Bookmark,
  History,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Plus,
  Heart,
  Zap,
  ArrowRight,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";

interface CustomerPortalProps {
  userData: any;
  onLogout: () => void;
}

export function CustomerPortal({ userData, onLogout }: CustomerPortalProps) {
  const [activeTab, setActiveTab] = useState("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showNotifications, setShowNotifications] = useState(false);

  const categories = [
    { id: "all", name: "All Services", icon: "🔍" },
    { id: "tiffin", name: "Tiffin Services", icon: "🍱" },
    { id: "plumber", name: "Plumbers", icon: "🔧" },
    { id: "electrician", name: "Electricians", icon: "⚡" },
    { id: "tourism", name: "Tourism Guides", icon: "🧳" }
  ];

  const providers = [
    {
      id: 1,
      name: "Maharashtrian Tiffin Express",
      category: "tiffin",
      rating: 4.8,
      reviews: 156,
      distance: "0.8 km",
      price: "₹120/meal",
      image: "https://images.unsplash.com/photo-1718114243715-8252d5382319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmb29kJTIwdGlmZmluJTIwc2VydmljZXxlbnwxfHx8fDE3NTgwMDQ0NTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      specialty: "Authentic Maharashtrian meals",
      available: true,
      deliveryTime: "45 mins",
      features: ["Home Delivery", "Weekly Plans", "Vegetarian"]
    },
    {
      id: 2,
      name: "QuickFix Plumbing",
      category: "plumber",
      rating: 4.9,
      reviews: 89,
      distance: "1.2 km",
      price: "₹200/hour",
      image: "https://images.unsplash.com/photo-1657558665549-bd7d82afed8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2lhbiUyMHBsdW1iZXIlMjBzZXJ2aWNlc3xlbnwxfHx8fDE3NTgwMDQ0NTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      specialty: "24/7 Emergency Service",
      available: true,
      responseTime: "30 mins",
      features: ["Emergency Service", "Licensed", "Warranty"]
    },
    {
      id: 3,
      name: "Nanded Heritage Tours",
      category: "tourism",
      rating: 4.7,
      reviews: 234,
      distance: "2.1 km",
      price: "₹500/person",
      image: "https://images.unsplash.com/photo-1577949619851-db947ef972af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3VyaXNtJTIwZ3VpZGUlMjB0cmF2ZWwlMjBuYW5kZWR8ZW58MXx8fHwxNzU4MDA0NDU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      specialty: "Historical & Cultural Tours",
      available: true,
      tourDuration: "4 hours",
      features: ["Expert Guide", "Group Tours", "Photography"]
    }
  ];

  const bookings = [
    {
      id: 1,
      providerName: "Maharashtrian Tiffin Express",
      service: "Weekly Meal Plan",
      date: "Today",
      time: "12:30 PM",
      status: "confirmed",
      amount: "₹840",
      image: "https://images.unsplash.com/photo-1718114243715-8252d5382319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmb29kJTIwdGlmZmluJTIwc2VydmljZXxlbnwxfHx8fDE3NTgwMDQ0NTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: 2,
      providerName: "QuickFix Plumbing",
      service: "Pipe Repair",
      date: "Yesterday",
      time: "10:00 AM",
      status: "completed",
      amount: "₹400",
      rating: 5,
      image: "https://images.unsplash.com/photo-1657558665549-bd7d82afed8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2lhbiUyMHBsdW1iZXIlMjBzZXJ2aWNlc3xlbnwxfHx8fDE3NTgwMDQ0NTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  const notifications = [
    {
      id: 1,
      type: "booking",
      title: "Booking Confirmed",
      message: "Your tiffin service booking has been confirmed for today.",
      time: "5 mins ago",
      read: false
    },
    {
      id: 2,
      type: "payment",
      title: "Payment Successful",
      message: "Payment of ₹400 for plumbing service completed.",
      time: "1 hour ago",
      read: true
    },
    {
      id: 3,
      type: "review",
      title: "Review Reminder",
      message: "Please rate your recent service with QuickFix Plumbing.",
      time: "2 hours ago",
      read: false
    }
  ];

  const filteredProviders = providers.filter(provider => {
    const matchesCategory = selectedCategory === "all" || provider.category === selectedCategory;
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBookService = (providerId: number) => {
    toast.success("Booking request sent! Provider will contact you shortly.");
  };

  const handleCancelBooking = (bookingId: number) => {
    toast.success("Booking cancelled successfully. Refund will be processed.");
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
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <h1 className="font-bold text-foreground">MH26 Services</h1>
                <p className="text-xs text-muted-foreground">Customer Portal</p>
              </div>
            </div>

            {/* User Menu */}
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
                      className="absolute right-0 top-12 w-80 bg-white border border-border rounded-lg shadow-xl p-4 space-y-3"
                    >
                      <h3 className="font-medium text-foreground">Notifications</h3>
                      {notifications.map((notification) => (
                        <div key={notification.id} className={`p-3 rounded-lg border ${notification.read ? 'bg-muted/30' : 'bg-primary/5 border-primary/20'}`}>
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${notification.read ? 'bg-muted-foreground' : 'bg-primary'}`} />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-foreground">{notification.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowNotifications(false)}>
                        Mark all as read
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-medium text-sm text-foreground">{userData.fullName}</p>
                  <p className="text-xs text-muted-foreground">Customer</p>
                </div>
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
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
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="browse" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Search className="w-4 h-4 mr-2" />
              Browse Services
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Calendar className="w-4 h-4 mr-2" />
              My Bookings
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Browse Services Tab */}
          <TabsContent value="browse" className="space-y-6 mt-6">
            {/* Search & Filter */}
            <motion.div 
              className="bg-white rounded-lg shadow-sm border border-border p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      placeholder="Search for services, providers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 bg-input-background"
                    />
                  </div>
                  <div className="sm:w-48 relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      placeholder="Location"
                      defaultValue="Nanded, MH"
                      className="pl-10 h-12 bg-input-background"
                    />
                  </div>
                  <Button size="lg" className="h-12 px-8">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <motion.button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === category.id
                          ? 'bg-primary text-white shadow-lg'
                          : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Service Providers Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProviders.map((provider, index) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-500 border-0 bg-white">
                    <CardHeader className="p-0 relative">
                      <div className="relative overflow-hidden">
                        <ImageWithFallback
                          src={provider.image}
                          alt={provider.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                        
                        <div className="absolute top-3 left-3">
                          <Badge className={`${provider.available ? 'bg-green-500' : 'bg-red-500'} text-white border-0`}>
                            {provider.available ? 'Available' : 'Busy'}
                          </Badge>
                        </div>

                        <div className="absolute top-3 right-3">
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-white">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="absolute bottom-3 left-3">
                          <Badge variant="secondary" className="bg-white/90 text-foreground">
                            <MapPin className="w-3 h-3 mr-1" />
                            {provider.distance}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-4">
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{provider.rating}</span>
                          <span className="text-sm text-muted-foreground">({provider.reviews})</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{provider.price}</p>
                          {provider.deliveryTime && (
                            <p className="text-xs text-muted-foreground">{provider.deliveryTime}</p>
                          )}
                          {provider.responseTime && (
                            <p className="text-xs text-muted-foreground">{provider.responseTime}</p>
                          )}
                          {provider.tourDuration && (
                            <p className="text-xs text-muted-foreground">{provider.tourDuration}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {provider.features.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => toast.info("Contact feature coming soon!")}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                          onClick={() => handleBookService(provider.id)}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* My Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">My Bookings</h2>
                <Button className="bg-gradient-to-r from-primary to-primary/80">
                  <Plus className="w-4 h-4 mr-2" />
                  New Booking
                </Button>
              </div>

              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <Card className="border-0 shadow-sm bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden">
                          <ImageWithFallback
                            src={booking.image}
                            alt={booking.providerName}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-foreground">{booking.providerName}</h3>
                              <p className="text-sm text-muted-foreground">{booking.service}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{booking.date}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{booking.time}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <Badge 
                                className={`${
                                  booking.status === 'confirmed' ? 'bg-blue-500' :
                                  booking.status === 'completed' ? 'bg-green-500' :
                                  'bg-yellow-500'
                                } text-white border-0`}
                              >
                                {booking.status === 'confirmed' ? 'Confirmed' :
                                 booking.status === 'completed' ? 'Completed' :
                                 'Pending'}
                              </Badge>
                              <p className="font-bold text-lg text-foreground mt-2">{booking.amount}</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-4">
                            <div className="flex space-x-2">
                              {booking.status === 'confirmed' && (
                                <>
                                  <Button variant="outline" size="sm">
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call Provider
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleCancelBooking(booking.id)}>
                                    Cancel
                                  </Button>
                                </>
                              )}
                              {booking.status === 'completed' && !booking.rating && (
                                <Button variant="outline" size="sm">
                                  <Star className="w-4 h-4 mr-2" />
                                  Rate Service
                                </Button>
                              )}
                              {booking.status === 'completed' && booking.rating && (
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm text-muted-foreground">Your Rating:</span>
                                  {[...Array(booking.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                              )}
                            </div>

                            <Button variant="ghost" size="sm">
                              View Details
                              <ArrowRight className="w-4 h-4 ml-2" />
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

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-12"
            >
              <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Service History</h3>
              <p className="text-muted-foreground mb-6">Track all your completed bookings and payments</p>
              <Button variant="outline">
                View All Transactions
              </Button>
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input value={userData.fullName} readOnly className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input value={userData.email} readOnly className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input placeholder="Add phone number" className="bg-input-background" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address</label>
                    <Input placeholder="Add address" className="bg-input-background" />
                  </div>
                  <Button className="w-full">Update Profile</Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span>Email Notifications</span>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>SMS Alerts</span>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>Payment Methods</span>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>Privacy Settings</span>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="pt-4 border-t">
                    <Button variant="destructive" className="w-full">
                      Delete Account
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