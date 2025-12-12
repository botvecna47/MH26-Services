import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Calendar,
  MessageSquare,
  Share2,
  Heart,
  Lock,
  Shield,
  DollarSign,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type UserRole = 'visitor' | 'user' | 'provider' | 'admin';

interface ServiceDetailPageProps {
  userRole: UserRole;
  serviceId: string | null;
  onNavigate: (page: string) => void;
}

export function ServiceDetailPage({ userRole, serviceId, onNavigate }: ServiceDetailPageProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const isLoggedIn = userRole !== 'visitor';

  // Mock service data
  const service = {
    id: '1',
    name: 'QuickFix Plumbing Services',
    category: 'Plumbing',
    rating: 4.8,
    reviews: 127,
    verified: true,
    location: 'Shivaji Nagar, Nanded',
    responseTime: 'Within 2 hours',
    experience: '15 years',
    completedJobs: 1234,
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39',
    description: 'Professional plumbing services with over 15 years of experience. We specialize in residential and commercial plumbing repairs, installations, and maintenance. Available 24/7 for emergency services.',
    services: [
      { name: 'Pipe Repairs', price: '₹300-800', duration: '1-2 hours' },
      { name: 'Tank Cleaning', price: '₹800-2000', duration: '2-4 hours' },
      { name: 'Bathroom Fitting', price: '₹1500-5000', duration: '1-2 days' },
      { name: 'Emergency Service', price: '₹500-1500', duration: '30 min arrival' },
    ],
    features: [
      'Licensed and insured',
      '24/7 emergency service',
      'Free estimates',
      'Warranty on all work',
      'Latest equipment',
      'Transparent pricing',
    ],
    availability: {
      monday: '7:00 AM - 9:00 PM',
      tuesday: '7:00 AM - 9:00 PM',
      wednesday: '7:00 AM - 9:00 PM',
      thursday: '7:00 AM - 9:00 PM',
      friday: '7:00 AM - 9:00 PM',
      saturday: '8:00 AM - 6:00 PM',
      sunday: 'Emergency only',
    },
    contact: {
      phone: '+91 9876543210',
      email: 'quickfixplumbing@example.com',
      whatsapp: '+91 9876543210',
    },
  };

  const reviews = [
    {
      id: 1,
      customer: 'Priya Sharma',
      rating: 5,
      comment: 'Excellent service! Very professional and quick. Highly recommend.',
      date: '2 weeks ago',
      verified: true,
    },
    {
      id: 2,
      customer: 'Rajesh Patil',
      rating: 5,
      comment: 'Fixed my bathroom leak in no time. Great work!',
      date: '1 month ago',
      verified: true,
    },
    {
      id: 3,
      customer: 'Anita Desai',
      rating: 4,
      comment: 'Good service, slightly expensive but worth it for the quality.',
      date: '2 months ago',
      verified: true,
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Section */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">{service.name}</h1>
                    {service.verified && (
                      <Badge className="bg-success text-success-foreground">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{service.category}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{service.rating}</span>
                  <span className="text-muted-foreground">({service.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {service.location}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {service.responseTime}
                </div>
              </div>

              {/* Image */}
              <div className="relative rounded-lg overflow-hidden mb-6">
                <ImageWithFallback
                  src={service.image}
                  alt={service.name}
                  className="w-full h-64 object-cover"
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="mb-3">About</h2>
                <p className="text-muted-foreground">{service.description}</p>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="mb-3">What We Offer</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Card (Locked for Visitors) */}
            <div className="lg:col-span-1">
              <Card className={`sticky top-20 ${!isLoggedIn ? 'relative' : ''}`}>
                {!isLoggedIn && (
                  <div className="absolute inset-0 z-10 backdrop-blur-sm bg-white/80 rounded-lg flex items-center justify-center">
                    <div className="text-center p-6">
                      <Lock className="w-12 h-12 mx-auto text-primary mb-4" />
                      <h3 className="font-medium mb-2">Sign in to Book</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create an account to view contact details and book services
                      </p>
                      <Button onClick={() => onNavigate('home')} className="w-full">
                        Sign Up / Sign In
                      </Button>
                    </div>
                  </div>
                )}
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="mb-1">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-2xl font-bold">{service.completedJobs}</p>
                        <p className="text-sm text-muted-foreground">Jobs Done</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{service.experience}</p>
                        <p className="text-sm text-muted-foreground">Experience</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className={!isLoggedIn ? 'blur-sm' : ''}>
                          {service.contact.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className={!isLoggedIn ? 'blur-sm' : ''}>
                          {service.contact.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {isLoggedIn && (
                    <div className="space-y-2">
                      <Button className="w-full">
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Now
                      </Button>
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Services & Pricing (Blurred for Visitors) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`relative ${!isLoggedIn ? 'content-locked' : ''}`}>
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-6">Services & Pricing</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {service.services.map((item, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{item.name}</h4>
                        <Badge variant="secondary">{item.duration}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-primary font-medium">
                          <DollarSign className="w-4 h-4" />
                          <span>{item.price}</span>
                        </div>
                        {isLoggedIn && (
                          <Button size="sm" variant="outline">Select</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {!isLoggedIn && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/95 rounded-lg shadow-lg p-6 text-center max-w-sm pointer-events-auto">
                <Lock className="w-10 h-10 mx-auto text-primary mb-3" />
                <h3 className="font-medium mb-2">View Full Pricing</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign in to see detailed pricing and book services
                </p>
                <Button onClick={() => onNavigate('home')}>
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Availability */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h2 className="mb-6">Availability</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(service.availability).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium capitalize">{day}</span>
                  <span className="text-sm text-muted-foreground">{hours}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2>Customer Reviews</h2>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{service.rating}</span>
                <span className="text-muted-foreground">({service.reviews} reviews)</span>
              </div>
            </div>

            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-border pb-6 last:border-0">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {review.customer.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{review.customer}</h4>
                            {review.verified && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{review.date}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isLoggedIn && (
              <Button variant="outline" className="w-full mt-6">
                Write a Review
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}