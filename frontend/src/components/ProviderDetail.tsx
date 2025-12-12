import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useProvider } from '../api/providers'; // Use real API
import { 
  Star, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Verified, 
  ArrowLeft,
  Calendar,
  Users,
  Trophy,
  Heart,
  Share2,
  Loader2,
  AlertCircle
} from "lucide-react";

interface ProviderDetailProps {
  onPageChange?: (page: string) => void; // Optional now as we use routing
}

export function ProviderDetail({ onPageChange }: ProviderDetailProps) {
  const { id } = useParams<{ id: string }>();
  const { data: provider, isLoading, error } = useProvider(id || '');

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff6b35]" />
      </div>
    );
  }

  // Error State
  if (error || !provider) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Provider not found</h2>
        <Link to="/services">
           <Button variant="outline">Back to Services</Button>
        </Link>
      </div>
    );
  }

  // Transform API data to component structure if needed
  // Assuming API returns a structure compatible or we map it here
  const { 
    businessName, 
    primaryCategory, 
    averageRating, 
    totalRatings, 
    city, 
    address, 
    bio, 
    gallery = [], 
    status,
    phone,
    experienceYears,
    serviceRadius
  } = provider;

  const coverImage = gallery && gallery.length > 0 ? gallery[0] : 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/services">
            <Button 
                variant="ghost" 
                className="mb-0"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Search
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <ImageWithFallback
                    src={coverImage}
                    alt={businessName}
                    className="w-full h-80 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <Button variant="secondary" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h1 className="text-3xl font-bold text-foreground">{businessName}</h1>
                          {status === 'APPROVED' && (
                            <Verified className="w-6 h-6 text-blue-500 fill-current" />
                          )}
                        </div>
                        <p className="text-lg text-primary capitalize">{primaryCategory}</p>
                        <p className="text-muted-foreground">{address}, {city}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Available
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm">
                      <div className="flex items-center space-x-1">
                        <Star className={`w-4 h-4 ${averageRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        <span className="font-medium">{averageRating ? averageRating.toFixed(1) : 'New'}</span>
                        <span className="text-muted-foreground">({totalRatings} reviews)</span>
                      </div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{city}</span>
                      </div>
                      {experienceYears && (
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{experienceYears} Years Exp.</span>
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="about" className="space-y-6">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-medium">About</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{bio || 'No description provided.'}</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium">Service Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Service Radius:</span>
                            <span className="text-muted-foreground">{serviceRadius || 5} km</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <span className="text-muted-foreground">{city}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Verified Info</h4>
                        <div className="space-y-2">
                           {status === 'APPROVED' && (
                              <div className="flex items-center space-x-2">
                                <Verified className="w-4 h-4 text-blue-500" />
                                <span className="text-sm">Verified Business</span>
                              </div>
                           )}
                           <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Community Trusted</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-medium">Customer Reviews</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        {totalRatings > 0 ? 'Reviews loading...' : 'No reviews yet.'}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Gallery Tab */}
              <TabsContent value="gallery">
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-medium">Photo Gallery</h3>
                  </CardHeader>
                  <CardContent>
                    {gallery && gallery.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {gallery.map((image, index) => (
                            <ImageWithFallback
                            key={index}
                            src={image}
                            alt={`Gallery image ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                            />
                        ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No images available.
                        </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <h3 className="text-xl font-medium">Contact Provider</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <Phone className="w-5 h-5 mr-2" />
                    {phone || 'Contact'}
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Service
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Typically responds within 24 hours
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Safety Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Verified className="w-5 h-5 text-blue-500 mt-1" />
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Verified Provider</h4>
                    <p className="text-xs text-muted-foreground">
                      Identity verified and business license confirmed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}