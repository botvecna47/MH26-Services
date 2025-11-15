// Advanced search component with filters, geolocation, and AI-powered suggestions
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  X, 
  Sliders,
  Navigation,
  Zap,
  TrendingUp
} from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';

interface SearchFilters {
  query: string;
  category: string;
  location: {
    address: string;
    lat?: number;
    lng?: number;
    radius: number; // in km
  };
  priceRange: [number, number];
  rating: number;
  availability: 'any' | 'now' | 'today' | 'this_week';
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'distance' | 'newest';
  serviceFeatures: string[];
  providerType: 'individual' | 'business' | 'any';
  verified: boolean;
  instantBooking: boolean;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'service' | 'location' | 'provider' | 'recent';
  icon?: string;
  meta?: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onFiltersChange?: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  className?: string;
  showMap?: boolean;
  recentSearches?: SearchSuggestion[];
  trendingSearches?: SearchSuggestion[];
}

const defaultFilters: SearchFilters = {
  query: '',
  category: 'all',
  location: {
    address: '',
    radius: 10,
  },
  priceRange: [0, 1000],
  rating: 0,
  availability: 'any',
  sortBy: 'relevance',
  serviceFeatures: [],
  providerType: 'any',
  verified: false,
  instantBooking: false,
};

const categories = [
  { value: 'all', label: 'All Services', icon: '🔍' },
  { value: 'tiffin', label: 'Tiffin Services', icon: '🍱' },
  { value: 'plumbing', label: 'Plumbing', icon: '🔧' },
  { value: 'electrical', label: 'Electrical', icon: '⚡' },
  { value: 'tourism', label: 'Tourism Guide', icon: '🗺️' },
  { value: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { value: 'beauty', label: 'Beauty & Wellness', icon: '💄' },
  { value: 'fitness', label: 'Fitness', icon: '💪' },
  { value: 'education', label: 'Education', icon: '📚' },
];

const serviceFeatures = [
  'Emergency Service',
  'Same Day Service',
  'Weekend Available',
  'Online Consultation',
  'Home Visit',
  'Free Estimate',
  'Warranty Included',
  'Insurance Covered',
];

export function AdvancedSearch({
  onSearch,
  onFiltersChange,
  initialFilters = {},
  className = '',
  showMap = true,
  recentSearches = [],
  trendingSearches = [],
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({ ...defaultFilters, ...initialFilters });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Generate search suggestions
  useEffect(() => {
    if (filters.query.length < 2) {
      const combined = [
        ...trendingSearches.slice(0, 3),
        ...recentSearches.slice(0, 3),
      ];
      setSuggestions(combined);
      return;
    }

    // Simulate AI-powered suggestions
    const mockSuggestions: SearchSuggestion[] = [
      {
        id: '1',
        text: `${filters.query} in Nanded`,
        type: 'location',
        icon: '📍',
        meta: 'Near you',
      },
      {
        id: '2',
        text: `Best ${filters.query} providers`,
        type: 'service',
        icon: '⭐',
        meta: 'Top rated',
      },
      {
        id: '3',
        text: `Affordable ${filters.query}`,
        type: 'service',
        icon: '💰',
        meta: 'Budget friendly',
      },
      {
        id: '4',
        text: `Emergency ${filters.query}`,
        type: 'service',
        icon: '🚨',
        meta: '24/7 available',
      },
    ];

    setSuggestions(mockSuggestions);
  }, [filters.query, trendingSearches, recentSearches]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          // Geolocation error - user denied or unavailable
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 300000 }
      );
    }
  }, []);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setShowSuggestions(false);
    
    try {
      await onSearch(filters);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    updateFilters({ query: suggestion.text });
    setShowSuggestions(false);
    handleSearch();
  };

  const useCurrentLocation = () => {
    if (userLocation) {
      updateFilters({
        location: {
          ...filters.location,
          lat: userLocation.lat,
          lng: userLocation.lng,
          address: 'Current Location',
        },
      });
    } else {
      // Request location permission
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          updateFilters({
            location: {
              ...filters.location,
              ...location,
              address: 'Current Location',
            },
          });
        },
        (error) => {
          // Error getting location - log to error tracking service
        }
      );
    }
  };

  const clearAllFilters = () => {
    const clearedFilters = { ...defaultFilters };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.category !== 'all' ||
      filters.location.address !== '' ||
      filters.priceRange[0] > 0 ||
      filters.priceRange[1] < 1000 ||
      filters.rating > 0 ||
      filters.availability !== 'any' ||
      filters.serviceFeatures.length > 0 ||
      filters.providerType !== 'any' ||
      filters.verified ||
      filters.instantBooking
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                ref={searchInputRef}
                placeholder="Search for services, providers, or locations..."
                value={filters.query}
                onChange={(e) => updateFilters({ query: e.target.value })}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                  if (e.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                }}
                className="pl-10 h-12 bg-input-background border-border/50 focus:border-primary"
              />

              {/* Search Suggestions */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 z-50 mt-1"
                  >
                    <Card className="shadow-xl border">
                      <CardContent className="p-0">
                        <Command>
                          <CommandList>
                            {trendingSearches.length > 0 && (
                              <CommandGroup heading="Trending">
                                {trendingSearches.slice(0, 3).map((suggestion) => (
                                  <CommandItem
                                    key={suggestion.id}
                                    onSelect={() => handleSuggestionClick(suggestion)}
                                    className="cursor-pointer"
                                  >
                                    <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                                    <span>{suggestion.text}</span>
                                    {suggestion.meta && (
                                      <Badge variant="secondary" className="ml-auto text-xs">
                                        {suggestion.meta}
                                      </Badge>
                                    )}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}

                            <CommandGroup heading="Suggestions">
                              {suggestions.map((suggestion) => (
                                <CommandItem
                                  key={suggestion.id}
                                  onSelect={() => handleSuggestionClick(suggestion)}
                                  className="cursor-pointer"
                                >
                                  <span className="mr-2">{suggestion.icon}</span>
                                  <span>{suggestion.text}</span>
                                  {suggestion.meta && (
                                    <Badge variant="outline" className="ml-auto text-xs">
                                      {suggestion.meta}
                                    </Badge>
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>

                            {recentSearches.length > 0 && (
                              <CommandGroup heading="Recent">
                                {recentSearches.slice(0, 3).map((suggestion) => (
                                  <CommandItem
                                    key={suggestion.id}
                                    onSelect={() => handleSuggestionClick(suggestion)}
                                    className="cursor-pointer"
                                  >
                                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <span>{suggestion.text}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Category Select */}
            <Select
              value={filters.category}
              onValueChange={(value) => updateFilters({ category: value })}
            >
              <SelectTrigger className="w-48 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center space-x-2">
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Advanced Filters Toggle */}
            <Button
              variant={showAdvanced ? "default" : "outline"}
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="h-12 px-4"
            >
              <Sliders className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters() && (
                <Badge variant="secondary" className="ml-2 px-1 min-w-[1.25rem] h-5">
                  !
                </Badge>
              )}
            </Button>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="h-12 px-6 bg-gradient-to-r from-primary to-primary/80"
            >
              {isSearching ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Search className="w-4 h-4" />
                </motion.div>
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span className="ml-2 hidden sm:inline">Search</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Advanced Filters</CardTitle>
                  <div className="flex items-center space-x-2">
                    {hasActiveFilters() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-xs"
                      >
                        Clear All
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvanced(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Location */}
                  <div className="space-y-3">
                    <label className="font-medium text-sm">Location</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Enter address or area"
                          value={filters.location.address}
                          onChange={(e) =>
                            updateFilters({
                              location: { ...filters.location, address: e.target.value },
                            })
                          }
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={useCurrentLocation}
                          className="p-2"
                        >
                          <Navigation className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">
                          Search radius: {filters.location.radius} km
                        </label>
                        <Slider
                          value={[filters.location.radius]}
                          onValueChange={([value]) =>
                            updateFilters({
                              location: { ...filters.location, radius: value },
                            })
                          }
                          max={50}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <label className="font-medium text-sm">Price Range</label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>₹{filters.priceRange[0]}</span>
                        <span>₹{filters.priceRange[1]}</span>
                      </div>
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(value) =>
                          updateFilters({ priceRange: value as [number, number] })
                        }
                        max={1000}
                        min={0}
                        step={50}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="space-y-3">
                    <label className="font-medium text-sm">Minimum Rating</label>
                    <div className="flex items-center space-x-2">
                      {[0, 1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          variant={filters.rating === rating ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateFilters({ rating })}
                          className="p-2"
                        >
                          <Star className="w-4 h-4 mr-1" />
                          {rating === 0 ? 'Any' : rating}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="space-y-3">
                    <label className="font-medium text-sm">Availability</label>
                    <Select
                      value={filters.availability}
                      onValueChange={(value: any) => updateFilters({ availability: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any time</SelectItem>
                        <SelectItem value="now">Available now</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="this_week">This week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-3">
                    <label className="font-medium text-sm">Sort By</label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value: any) => updateFilters({ sortBy: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="price_low">Price: Low to High</SelectItem>
                        <SelectItem value="price_high">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="distance">Nearest First</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Provider Type */}
                  <div className="space-y-3">
                    <label className="font-medium text-sm">Provider Type</label>
                    <Select
                      value={filters.providerType}
                      onValueChange={(value: any) => updateFilters({ providerType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Service Features */}
                <div className="space-y-3">
                  <label className="font-medium text-sm">Service Features</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {serviceFeatures.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={feature}
                          checked={filters.serviceFeatures.includes(feature)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFilters({
                                serviceFeatures: [...filters.serviceFeatures, feature],
                              });
                            } else {
                              updateFilters({
                                serviceFeatures: filters.serviceFeatures.filter(
                                  (f) => f !== feature
                                ),
                              });
                            }
                          }}
                        />
                        <label htmlFor={feature} className="text-sm cursor-pointer">
                          {feature}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Quick Options */}
                <div className="space-y-3">
                  <label className="font-medium text-sm">Quick Options</label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verified"
                        checked={filters.verified}
                        onCheckedChange={(checked) =>
                          updateFilters({ verified: checked as boolean })
                        }
                      />
                      <label htmlFor="verified" className="text-sm cursor-pointer flex items-center">
                        <Badge variant="secondary" className="mr-2">
                          <Zap className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                        Verified providers only
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="instant"
                        checked={filters.instantBooking}
                        onCheckedChange={(checked) =>
                          updateFilters({ instantBooking: checked as boolean })
                        }
                      />
                      <label htmlFor="instant" className="text-sm cursor-pointer flex items-center">
                        <Badge variant="secondary" className="mr-2">
                          <Clock className="w-3 h-3 mr-1" />
                          Instant
                        </Badge>
                        Instant booking available
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      <AnimatePresence>
        {hasActiveFilters() && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex flex-wrap gap-2">
              {filters.category !== 'all' && (
                <Badge variant="secondary" className="px-3 py-1">
                  Category: {categories.find(c => c.value === filters.category)?.label}
                  <X
                    className="w-3 h-3 ml-2 cursor-pointer"
                    onClick={() => updateFilters({ category: 'all' })}
                  />
                </Badge>
              )}
              
              {filters.location.address && (
                <Badge variant="secondary" className="px-3 py-1">
                  Near: {filters.location.address}
                  <X
                    className="w-3 h-3 ml-2 cursor-pointer"
                    onClick={() => updateFilters({ location: { ...filters.location, address: '' } })}
                  />
                </Badge>
              )}
              
              {filters.rating > 0 && (
                <Badge variant="secondary" className="px-3 py-1">
                  {filters.rating}+ stars
                  <X
                    className="w-3 h-3 ml-2 cursor-pointer"
                    onClick={() => updateFilters({ rating: 0 })}
                  />
                </Badge>
              )}
              
              {filters.serviceFeatures.map((feature) => (
                <Badge key={feature} variant="secondary" className="px-3 py-1">
                  {feature}
                  <X
                    className="w-3 h-3 ml-2 cursor-pointer"
                    onClick={() => updateFilters({
                      serviceFeatures: filters.serviceFeatures.filter(f => f !== feature)
                    })}
                  />
                </Badge>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdvancedSearch;