import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Search, MapPin, Star, Phone, MessageCircle, Filter, Clock, Verified, Users } from "lucide-react";

interface ServiceListingsProps {
  onPageChange: (page: string) => void;
}

export function ServiceListings({ onPageChange }: ServiceListingsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRating, setSelectedRating] = useState([]);

  const providers = [
    {
      id: 1,
      name: "Maharashtrian Tiffin Express",
      service: "Tiffin Service",
      rating: 4.8,
      reviews: 156,
      distance: "0.8 km",
      price: "₹150-200/day",
      image: "https://images.unsplash.com/photo-1718114243715-8252d5382319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmb29kJTIwdGlmZmluJTIwc2VydmljZXxlbnwxfHx8fDE3NTgwMDQ0NTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      speciality: "Authentic Maharashtrian meals, fresh daily",
      phone: "+91 9876543210",
      verified: true,
      available: true,
      location: "Shivaji Nagar, Nanded"
    },
    {
      id: 2,
      name: "QuickFix Plumbing Services",
      service: "Plumber",
      rating: 4.9,
      reviews: 89,
      distance: "1.2 km",
      price: "₹300-500/visit",
      image: "https://images.unsplash.com/photo-1657558665549-bd7d82afed8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2lhbiUyMHBsdW1iZXIlMjBzZXJ2aWNlc3xlbnwxfHx8fDE3NTgwMDQ0NTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      speciality: "24/7 Emergency service, pipe repairs, installations",
      phone: "+91 9876543211",
      verified: true,
      available: true,
      location: "Civil Lines, Nanded"
    },
    {
      id: 3,
      name: "PowerTech Electricians",
      service: "Electrician",
      rating: 4.7,
      reviews: 124,
      distance: "2.0 km",
      price: "₹200-400/hour",
      image: "https://images.unsplash.com/photo-1657558665549-bd7d82afed8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2lhbiUyMHBsdW1iZXIlMjBzZXJ2aWNlc3xlbnwxfHx8fDE3NTgwMDQ0NTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      speciality: "Home wiring, appliance repair, LED installations",
      phone: "+91 9876543212",
      verified: true,
      available: false,
      location: "Vazirabad, Nanded"
    },
    {
      id: 4,
      name: "Nanded Heritage Tours",
      service: "Tourism Guide",
      rating: 4.7,
      reviews: 234,
      distance: "2.1 km",
      price: "₹1000-1500/day",
      image: "https://images.unsplash.com/photo-1577949619851-db947ef972af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3VyaXNtJTIwZ3VpZGUlMjB0cmF2ZWwlMjBuYW5kZWR8ZW58MXx8fHwxNzU4MDA0NDU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      speciality: "Historical sites, cultural tours, multi-language guide",
      phone: "+91 9876543213",
      verified: true,
      available: true,
      location: "Near Hazur Sahib, Nanded"
    },
    {
      id: 5,
      name: "Home Style Tiffin",
      service: "Tiffin Service",
      rating: 4.6,
      reviews: 78,
      distance: "1.5 km",
      price: "₹120-180/day",
      image: "https://images.unsplash.com/photo-1718114243715-8252d5382319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhpbmRpYW4lMjBmb29kJTIwdGlmZmluJTIwc2VydmljZXxlbnwxfHx8fDE3NTgwMDQ0NTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      speciality: "North Indian cuisine, customizable menu",
      phone: "+91 9876543214",
      verified: true,
      available: true,
      location: "Taroda Road, Nanded"
    },
    {
      id: 6,
      name: "Reliable Pipe Works",
      service: "Plumber",
      rating: 4.5,
      reviews: 67,
      distance: "3.2 km",
      price: "₹250-450/visit",
      image: "https://images.unsplash.com/photo-1657558665549-bd7d82afed8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2lhbiUyMHBsdW1iZXIlMjBzZXJ2aWNlc3xlbnwxfHx8fDE3NTgwMDQ0NTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      speciality: "Bathroom fittings, drainage systems, water heaters",
      phone: "+91 9876543215",
      verified: true,
      available: true,
      location: "Panch Hwd, Nanded"
    }
  ];

  const serviceTypes = [
    { value: "all", label: "All Services" },
    { value: "tiffin", label: "Tiffin Service" },
    { value: "plumber", label: "Plumber" },
    { value: "electrician", label: "Electrician" },
    { value: "tourism", label: "Tourism Guide" }
  ];

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.speciality.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesService = selectedService === "all" || 
                          provider.service.toLowerCase().includes(selectedService);
    
    return matchesSearch && matchesService;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <section className="bg-gradient-to-r from-primary/5 to-accent/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">
            Find Services in Nanded
          </h1>
          
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search services, providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input-background border-0 h-12"
                />
              </div>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="h-12 bg-input-background border-0">
                  <SelectValue placeholder="Service Type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="h-12"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <div className="border-t pt-4 grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating</label>
                  <div className="space-y-2">
                    {[4.5, 4.0, 3.5, 3.0].map(rating => (
                      <div key={rating} className="flex items-center space-x-2">
                        <Checkbox id={`rating-${rating}`} />
                        <label htmlFor={`rating-${rating}`} className="text-sm flex items-center">
                          {rating}+ <Star className="w-3 h-3 ml-1 fill-yellow-400 text-yellow-400" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Distance</label>
                  <div className="space-y-2">
                    {["Under 1 km", "1-2 km", "2-5 km", "5+ km"].map(distance => (
                      <div key={distance} className="flex items-center space-x-2">
                        <Checkbox id={`distance-${distance}`} />
                        <label htmlFor={`distance-${distance}`} className="text-sm">
                          {distance}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Availability</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="available-now" />
                      <label htmlFor="available-now" className="text-sm">
                        Available Now
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="verified-only" />
                      <label htmlFor="verified-only" className="text-sm">
                        Verified Only
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {filteredProviders.length} Providers Found
            </h2>
            <Select defaultValue="rating">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="distance">Nearest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6">
            {filteredProviders.map((provider) => (
              <Card 
                key={provider.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onPageChange('provider-detail')}
              >
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-4 gap-0">
                    {/* Image */}
                    <div className="md:col-span-1">
                      <ImageWithFallback
                        src={provider.image}
                        alt={provider.name}
                        className="w-full h-48 md:h-full object-cover md:rounded-l-lg"
                      />
                    </div>

                    {/* Content */}
                    <div className="md:col-span-2 p-6 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-xl font-medium">{provider.name}</h3>
                              {provider.verified && (
                                <Verified className="w-5 h-5 text-blue-500 fill-current" />
                              )}
                            </div>
                            <p className="text-primary">{provider.service}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {provider.available ? (
                              <Badge className="bg-green-100 text-green-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Available
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                Busy
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-muted-foreground">{provider.speciality}</p>

                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{provider.rating}</span>
                            <span className="text-muted-foreground">({provider.reviews} reviews)</span>
                          </div>
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{provider.distance}</span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          📍 {provider.location}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-1 p-6 border-t md:border-t-0 md:border-l border-border">
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{provider.price}</p>
                          <p className="text-sm text-muted-foreground">Starting price</p>
                        </div>

                        <div className="space-y-2">
                          <Button className="w-full" size="sm">
                            <Phone className="w-4 h-4 mr-2" />
                            Call Now
                          </Button>
                          <Button variant="outline" className="w-full" size="sm">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Chat
                          </Button>
                        </div>

                        <div className="text-xs text-center text-muted-foreground">
                          Response time: ~15 mins
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProviders.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">No providers found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or location
              </p>
              <Button onClick={() => setSearchTerm("")}>Clear Filters</Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}