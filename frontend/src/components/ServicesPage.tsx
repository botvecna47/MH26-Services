import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Star, Shield, MapPin, Loader2, Clock, IndianRupee, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useServices } from '../api/services';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | 'newest' | 'name'>('rating');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (sortBy) params.set('sort', sortBy);
    setSearchParams(params, { replace: true });
  }, [debouncedQuery, selectedCategory, sortBy, setSearchParams]);

  // Fetch services from API
  const { data: servicesData, isLoading, error } = useServices({
    q: debouncedQuery || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    sortBy,
    minPrice,
    maxPrice,
    page: 1,
    limit: 50,
  });

  const services = servicesData?.data || [];

  // Update searching state
  useEffect(() => {
    setIsSearching(isLoading);
  }, [isLoading]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: any = { q: searchQuery, category: selectedCategory };
    if (sortBy) params.sort = sortBy;
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('rating');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search & Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <Input
                type="text"
                placeholder="Search services or providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(e);
                  }
                }}
                className="w-full pl-10 pr-4"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
              )}
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Plumbing">Plumbing</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="Cleaning">Cleaning</SelectItem>
                <SelectItem value="Salon">Salon</SelectItem>
                <SelectItem value="Tutoring">Tutoring</SelectItem>
                <SelectItem value="Fitness">Fitness</SelectItem>
                <SelectItem value="Catering">Catering</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit" variant="default" className="md:hidden">
              Apply Filters
            </Button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {selectedCategory !== 'all' ? `${selectedCategory} Services` : 'All Services in Nanded'}
            </h1>
            <p className="text-gray-600">
              {services.length} service{services.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <h3 className="text-gray-900 mb-2">Failed to load providers</h3>
            <p className="text-gray-600 mb-4">Please try again later</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters to find what you're looking for
            </p>
            <Button
              variant="outline"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service.id}
                to={`/provider/${service.provider.id}`}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-200 hover:border-primary-500"
              >
                {/* Service Image */}
                <div className="aspect-[4/3] bg-gray-200 relative">
                  {service.imageUrl ? (
                    <ImageWithFallback
                      src={service.imageUrl}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="text-center">
                        <Building2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No Image</p>
                      </div>
                    </div>
                  )}
                  {service.provider.averageRating > 4 && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Verified
                    </div>
                  )}
                </div>

                {/* Service Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{service.title}</h3>
                  
                  {/* Provider Name */}
                  <p className="text-sm text-gray-600 mb-2">by {service.provider.businessName}</p>

                  {/* Description */}
                  {service.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>
                  )}

                  {/* Category Badge */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                      {service.provider.primaryCategory}
                    </span>
                  </div>

                  {/* Price, Duration, Rating */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-green-600" />
                        <span className="text-xl font-bold text-gray-900">₹{Number(service.price).toFixed(0)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{service.durationMin} min</span>
                      </div>
                    </div>

                    {/* Rating & Location */}
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{service.provider.averageRating?.toFixed(1) || 'New'}</span>
                        {service.provider.totalRatings > 0 && (
                          <span className="text-gray-400">({service.provider.totalRatings})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs truncate max-w-[100px]">
                          {service.provider.city || 'Nanded'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <Button variant="outline" size="sm" className="w-full gap-1" asChild>
                      <span>
                        <Shield className="h-3 w-3 inline mr-1 text-green-600" />
                        View Verified Details
                      </span>
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
