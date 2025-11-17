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

  // NOTE: This component appears to be unused in the main app (only used in EnhancedApp.tsx)
  // If this component is to be used, it should fetch providers from the API using useProviders hook
  // instead of using hardcoded test data. For now, using empty array to prevent test data from appearing.
  const providers: any[] = [];

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