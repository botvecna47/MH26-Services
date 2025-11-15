import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
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
  Share2
} from "lucide-react";

interface ProviderDetailProps {
  onPageChange: (page: string) => void;
}

export function ProviderDetail({ onPageChange }: ProviderDetailProps) {
  const provider = {
    id: 1,
    name: "Maharashtrian Tiffin Express",
    service: "Tiffin Service",
    rating: 4.8,
    reviews: 156,
    distance: "0.8 km",
    price: "₹150-200/day",
    image: "https://images.unsplash.com/photo-1718114243715-8252d5382319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhpbmRpYW4lMjBmb29kJTIwdGlmZmluJTIwc2VydmljZXxlbnwxfHx8fDE3NTgwMDQ0NTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    speciality: "Authentic Maharashtrian meals, fresh daily preparation",
    phone: "+91 9876543210",
    verified: true,
    available: true,
    location: "Shivaji Nagar, Nanded",
    experience: "5+ years",
    totalOrders: "2,500+",
    description: "We provide authentic Maharashtrian tiffin service with fresh, home-cooked meals delivered daily. Our menu includes traditional recipes passed down through generations, prepared with the finest ingredients and utmost care for hygiene.",
    operatingHours: "7:00 AM - 9:00 PM",
    deliveryArea: "Within 5 km radius from Shivaji Nagar",
    menu: [
      {
        category: "Daily Tiffin",
        items: [
          { name: "Maharashtrian Thali", price: "₹150", description: "Rice, dal, sabji, roti, pickle, sweet" },
          { name: "North Indian Combo", price: "₹180", description: "Rice, dal makhani, paneer curry, roti, salad" },
          { name: "Special Misal Pav", price: "₹80", description: "Authentic Kolhapuri misal with pav" }
        ]
      },
      {
        category: "Weekly Subscription",
        items: [
          { name: "Lunch Only", price: "₹900/week", description: "Monday to Saturday lunch delivery" },
          { name: "Lunch + Dinner", price: "₹1500/week", description: "Complete meal solution" }
        ]
      }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1718114243715-8252d5382319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhpbmRpYW4lMjBmb29kJTIwdGlmZmluJTIwc2VydmljZXxlbnwxfHx8fDE3NTgwMDQ0NTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1718114243715-8252d5382319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhpbmRpYW4lMjBmb29kJTIwdGlmZmluJTIwc2VydmljZXxlbnwxfHx8fDE3NTgwMDQ0NTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1718114243715-8252d5382319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhpbmRpYW4lMjBmb29kJTIwdGlmZmluJTIwc2VydmljZXxlbnwxfHx8fDE3NTgwMDQ0NTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    ]
  };

  const reviews = [
    {
      id: 1,
      name: "Priya Sharma",
      avatar: "PS",
      rating: 5,
      date: "2 days ago",
      comment: "Excellent food quality and timely delivery. The Maharashtrian thali tastes just like home-cooked food. Highly recommend!",
      helpful: 12
    },
    {
      id: 2,
      name: "Rajesh Patil",
      avatar: "RP",
      rating: 5,
      date: "1 week ago",
      comment: "Been ordering for 2 months now. Consistent quality and the misal pav is absolutely authentic. Great service!",
      helpful: 8
    },
    {
      id: 3,
      name: "Anita Desai",
      avatar: "AD",
      rating: 4,
      date: "2 weeks ago",
      comment: "Good food variety and taste. Sometimes delivery is slightly delayed but overall satisfied with the service.",
      helpful: 5
    },
    {
      id: 4,
      name: "Suresh Kumar",
      avatar: "SK",
      rating: 5,
      date: "3 weeks ago",
      comment: "Best tiffin service in Nanded! Fresh ingredients, proper packaging, and very reasonable prices. 5 stars!",
      helpful: 15
    }
  ];

  const ratingDistribution = [
    { stars: 5, count: 98, percentage: 63 },
    { stars: 4, count: 35, percentage: 22 },
    { stars: 3, count: 15, percentage: 10 },
    { stars: 2, count: 5, percentage: 3 },
    { stars: 1, count: 3, percentage: 2 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button 
            variant="ghost" 
            onClick={() => onPageChange('services')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
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
                    src={provider.image}
                    alt={provider.name}
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
                          <h1 className="text-3xl font-bold text-foreground">{provider.name}</h1>
                          {provider.verified && (
                            <Verified className="w-6 h-6 text-blue-500 fill-current" />
                          )}
                        </div>
                        <p className="text-lg text-primary">{provider.service}</p>
                        <p className="text-muted-foreground">{provider.speciality}</p>
                      </div>
                      {provider.available ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Available Now
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Busy</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{provider.rating}</span>
                        <span className="text-muted-foreground">({provider.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{provider.distance} away</span>
                      </div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{provider.experience} experience</span>
                      </div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{provider.totalOrders} served</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="about" className="space-y-6">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="menu">Menu</TabsTrigger>
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
                    <p className="text-muted-foreground">{provider.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium">Service Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Operating Hours:</span>
                            <span className="text-muted-foreground">{provider.operatingHours}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Delivery Area:</span>
                            <span className="text-muted-foreground">{provider.deliveryArea}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <span className="text-muted-foreground">{provider.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Achievements</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm">Top Rated Provider 2024</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Verified className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">Verified Business</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-green-500" />
                            <span className="text-sm">500+ Happy Customers</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Map placeholder */}
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-medium">Location</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <MapPin className="w-12 h-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">Interactive map would be displayed here</p>
                        <p className="text-sm text-muted-foreground">{provider.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Menu Tab */}
              <TabsContent value="menu" className="space-y-6">
                {provider.menu.map((category, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <h3 className="text-xl font-medium">{category.category}</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex justify-between items-start py-3 border-b last:border-0">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            </div>
                            <div className="text-lg font-medium text-primary ml-4">
                              {item.price}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-medium">Customer Reviews</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-8">
                      {/* Rating Summary */}
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-foreground">{provider.rating}</div>
                          <div className="flex items-center justify-center space-x-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-5 h-5 ${i < Math.floor(provider.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Based on {provider.reviews} reviews
                          </p>
                        </div>

                        <div className="space-y-2">
                          {ratingDistribution.map(({ stars, count, percentage }) => (
                            <div key={stars} className="flex items-center space-x-2 text-sm">
                              <span className="w-8">{stars}★</span>
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-yellow-400 h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="w-8 text-muted-foreground">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Reviews List */}
                      <div className="md:col-span-2 space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b pb-4 last:border-0">
                            <div className="flex items-start space-x-3">
                              <Avatar>
                                <AvatarFallback>{review.avatar}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">{review.name}</h4>
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
                                <div className="flex items-center space-x-4 text-sm">
                                  <Button variant="ghost" size="sm">
                                    Helpful ({review.helpful})
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {provider.gallery.map((image, index) => (
                        <ImageWithFallback
                          key={index}
                          src={image}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))}
                    </div>
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
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{provider.price}</p>
                  <p className="text-sm text-muted-foreground">Starting price</p>
                </div>

                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <Phone className="w-5 h-5 mr-2" />
                    Call Now
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <Calendar className="w-5 h-5 mr-2" />
                    Schedule Order
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Typically responds within 15 minutes
                  </p>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span className="text-muted-foreground">{provider.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="text-muted-foreground">{provider.location}</span>
                  </div>
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