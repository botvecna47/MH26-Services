import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Star, Shield, MapPin, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useProviders } from '../api/providers';
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
  const [sortBy, setSortBy] = useState('rating');
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

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
    setSearchParams(params, { replace: true });
  }, [debouncedQuery, selectedCategory, setSearchParams]);

  // Fetch providers from API
  const { data: providersData, isLoading, error } = useProviders({
    q: debouncedQuery || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    city: 'Nanded',
    page: 1,
    limit: 50,
  });

  // Filter and sort providers
  const filteredProviders = useMemo(() => {
    setIsSearching(false);
    if (!providersData?.data) return [];
    
    let filtered = [...providersData.data];

    // Additional client-side filtering if needed
    // (API already filters by category and search query)

    // Sort
    if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.businessName.localeCompare(b.businessName));
    }

    return filtered;
  }, [providersData, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery, category: selectedCategory });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
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
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="tiffin">Tiffin Service</SelectItem>
                <SelectItem value="salon">Salon & Beauty</SelectItem>
                <SelectItem value="tutoring">Tutoring</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="catering">Catering</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
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
            <h1 className="text-gray-900 mb-1">
              {selectedCategory !== 'all' ? selectedCategory : 'All Services'}
            </h1>
            <p className="text-gray-600">
              {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} found
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
        ) : filteredProviders.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">No providers found</h3>
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
            {filteredProviders.map((provider) => (
              <Link
                key={provider.id}
                to={`/provider/${provider.id}`}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-200 hover:border-primary-500"
              >
                {/* Provider Image */}
                <div className="aspect-[4/3] bg-gray-200 relative">
                  {provider.user?.avatarUrl ? (
                    <ImageWithFallback
                      src={provider.user.avatarUrl}
                      alt={provider.businessName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  {provider.status === 'APPROVED' && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Verified
                    </div>
                  )}
                  {provider.status === 'PENDING' && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
                      Pending
                    </div>
                  )}
                </div>

                {/* Provider Info */}
                <div className="p-4">
                  <h3 className="text-gray-900 mb-2">{provider.businessName}</h3>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                      {provider.primaryCategory}
                    </span>
                    {provider.secondaryCategory && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        {provider.secondaryCategory}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {provider.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{provider.description}</p>
                  )}

                  {/* Rating & Location */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{provider.averageRating?.toFixed(1) || 'New'}</span>
                      {provider.totalRatings > 0 && (
                        <span className="text-gray-400">({provider.totalRatings})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span className="text-xs truncate max-w-[120px]">
                        {provider.city || 'Nanded'}
                      </span>
                    </div>
                  </div>

                  {/* Contact Preview */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <span>View Details</span>
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
