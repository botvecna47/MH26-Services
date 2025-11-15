import { useState, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { 
  Filter, 
  Search, 
  MapPin, 
  Star, 
  DollarSign, 
  Clock, 
  Calendar,
  SlidersHorizontal,
  X,
  ChevronDown,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface FilterOptions {
  query?: string;
  category?: string;
  location?: {
    city: string;
    radius: number; // in km
  };
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  availability?: {
    date?: string;
    time?: string;
    isAvailable?: boolean;
  };
  sortBy?: 'relevance' | 'rating' | 'price_low' | 'price_high' | 'distance' | 'newest';
  features?: string[];
  providerType?: 'individual' | 'business' | 'all';
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onApply: () => void;
  onReset: () => void;
  isLoading?: boolean;
  resultCount?: number;
}

const CATEGORIES = [
  { id: 'all', name: 'All Services', icon: '🔍' },
  { id: 'tiffin', name: 'Tiffin Services', icon: '🍱' },
  { id: 'plumber', name: 'Plumbers', icon: '🔧' },
  { id: 'electrician', name: 'Electricians', icon: '⚡' },
  { id: 'tourism', name: 'Tourism Guides', icon: '🧳' }
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'distance', label: 'Nearest First' },
  { value: 'newest', label: 'Newest First' }
];

const COMMON_FEATURES = [
  'Emergency Service',
  'Home Delivery',
  'Online Payment',
  'Licensed',
  'Insured',
  'Warranty',
  'Same Day Service',
  'Weekend Available',
  'Multi-language',
  'Eco-friendly'
];

const CITIES = [
  'Nanded',
  'Aurangabad',
  'Latur',
  'Parbhani',
  'Hingoli',
  'Beed'
];

export function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  onApply, 
  onReset,
  isLoading = false,
  resultCount 
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  // Update temp filters when props change
  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const updateFilter = useCallback((key: keyof FilterOptions, value: any) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const updateNestedFilter = useCallback((key: keyof FilterOptions, nestedKey: string, value: any) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] as any),
        [nestedKey]: value
      }
    }));
  }, []);

  const handleFeatureToggle = useCallback((feature: string) => {
    setTempFilters(prev => {
      const currentFeatures = prev.features || [];
      const hasFeature = currentFeatures.includes(feature);
      
      return {
        ...prev,
        features: hasFeature 
          ? currentFeatures.filter(f => f !== feature)
          : [...currentFeatures, feature]
      };
    });
  }, []);

  const handleApply = useCallback(() => {
    onFiltersChange(tempFilters);
    onApply();
    setIsExpanded(false);
  }, [tempFilters, onFiltersChange, onApply]);

  const handleReset = useCallback(() => {
    const resetFilters: FilterOptions = {
      query: '',
      category: 'all',
      location: { city: 'Nanded', radius: 10 },
      priceRange: { min: 0, max: 5000 },
      rating: 0,
      sortBy: 'relevance',
      features: [],
      providerType: 'all'
    };
    
    setTempFilters(resetFilters);
    onFiltersChange(resetFilters);
    onReset();
  }, [onFiltersChange, onReset]);

  const getActiveFilterCount = () => {
    let count = 0;
    
    if (filters.query) count++;
    if (filters.category && filters.category !== 'all') count++;
    if (filters.location?.city !== 'Nanded') count++;
    if (filters.location?.radius !== 10) count++;
    if (filters.priceRange?.min !== 0 || filters.priceRange?.max !== 5000) count++;
    if (filters.rating && filters.rating > 0) count++;
    if (filters.features && filters.features.length > 0) count++;
    if (filters.providerType && filters.providerType !== 'all') count++;
    if (filters.availability?.isAvailable) count++;
    
    return count;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Filters</CardTitle>
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="text-xs">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {resultCount !== undefined && (
              <span className="text-sm text-muted-foreground">
                {resultCount} results
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search"
                placeholder="Search services, providers..."
                value={tempFilters.query || ''}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select 
              value={tempFilters.category || 'all'} 
              onValueChange={(value) => updateFilter('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select 
              value={tempFilters.sortBy || 'relevance'} 
              onValueChange={(value) => updateFilter('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters - Expandable */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 border-t pt-4"
            >
              {/* Location & Radius */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>City</span>
                  </Label>
                  <Select 
                    value={tempFilters.location?.city || 'Nanded'} 
                    onValueChange={(value) => updateNestedFilter('location', 'city', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Radius: {tempFilters.location?.radius || 10} km</Label>
                  <Slider
                    value={[tempFilters.location?.radius || 10]}
                    onValueChange={([value]) => updateNestedFilter('location', 'radius', value)}
                    max={50}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Price Range: ₹{tempFilters.priceRange?.min || 0} - ₹{tempFilters.priceRange?.max || 5000}</span>
                </Label>
                <Slider
                  value={[tempFilters.priceRange?.min || 0, tempFilters.priceRange?.max || 5000]}
                  onValueChange={([min, max]) => updateFilter('priceRange', { min, max })}
                  max={5000}
                  min={0}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹0</span>
                  <span>₹5000+</span>
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Star className="w-4 h-4" />
                  <span>Minimum Rating</span>
                </Label>
                <div className="flex space-x-2">
                  {[0, 1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={tempFilters.rating === rating ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilter('rating', rating)}
                      className="flex items-center space-x-1"
                    >
                      <Star className={`w-3 h-3 ${rating > 0 ? 'fill-current' : ''}`} />
                      <span>{rating === 0 ? 'Any' : `${rating}+`}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Provider Type */}
              <div className="space-y-2">
                <Label>Provider Type</Label>
                <div className="flex space-x-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'individual', label: 'Individual' },
                    { value: 'business', label: 'Business' }
                  ].map((type) => (
                    <Button
                      key={type.value}
                      variant={tempFilters.providerType === type.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilter('providerType', type.value)}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-3">
                <Label className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Availability</span>
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={tempFilters.availability?.isAvailable || false}
                    onCheckedChange={(checked) => updateNestedFilter('availability', 'isAvailable', checked)}
                  />
                  <span className="text-sm">Available now</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <Label>Features</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {COMMON_FEATURES.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        checked={tempFilters.features?.includes(feature) || false}
                        onCheckedChange={() => handleFeatureToggle(feature)}
                      />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Filters */}
              {getActiveFilterCount() > 0 && (
                <div className="space-y-2">
                  <Label>Active Filters</Label>
                  <div className="flex flex-wrap gap-2">
                    {tempFilters.query && (
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <span>Search: {tempFilters.query}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-4 h-4 p-0 hover:bg-transparent"
                          onClick={() => updateFilter('query', '')}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    )}
                    
                    {tempFilters.category && tempFilters.category !== 'all' && (
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <span>Category: {CATEGORIES.find(c => c.id === tempFilters.category)?.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-4 h-4 p-0 hover:bg-transparent"
                          onClick={() => updateFilter('category', 'all')}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    )}
                    
                    {tempFilters.features?.map((feature) => (
                      <Badge key={feature} variant="secondary" className="flex items-center space-x-1">
                        <span>{feature}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-4 h-4 p-0 hover:bg-transparent"
                          onClick={() => handleFeatureToggle(feature)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Reset</span>
          </Button>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={isLoading}
            >
              {isExpanded ? 'Hide Filters' : 'More Filters'}
            </Button>
            
            <Button
              onClick={handleApply}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary/80"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Apply Filters</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for managing filter state
export function useAdvancedFilters(initialFilters: FilterOptions = {}) {
  const [filters, setFilters] = useState<FilterOptions>({
    query: '',
    category: 'all',
    location: { city: 'Nanded', radius: 10 },
    priceRange: { min: 0, max: 5000 },
    rating: 0,
    sortBy: 'relevance',
    features: [],
    providerType: 'all',
    ...initialFilters
  });

  const [isLoading, setIsLoading] = useState(false);

  const updateFilters = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      query: '',
      category: 'all',
      location: { city: 'Nanded', radius: 10 },
      priceRange: { min: 0, max: 5000 },
      rating: 0,
      sortBy: 'relevance',
      features: [],
      providerType: 'all'
    });
  }, []);

  const applyFilters = useCallback(async (applyFn: (filters: FilterOptions) => Promise<void>) => {
    setIsLoading(true);
    try {
      await applyFn(filters);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  return {
    filters,
    isLoading,
    updateFilters,
    resetFilters,
    applyFilters
  };
}