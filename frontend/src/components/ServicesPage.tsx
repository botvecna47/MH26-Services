import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Map,
  Plane,
  Dumbbell,
  Star, 
  IndianRupee,
  Loader2,
  Wrench,
  Paintbrush,
  Droplets,
  Zap,
  Truck,
  Scissors,
  Utensils
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useServices } from '../api/services';
import { useCategories } from '../api/categories';
import { useDebounce } from '../hooks/useDebounce';
import ImageWithFallback from './ImageWithFallback';

// Map slugs to Icons
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    'plumbing': <Droplets className="h-4 w-4" />,
    'cleaning': <Paintbrush className="h-4 w-4" />,
    'electrical': <Zap className="h-4 w-4" />,
    'painting': <Paintbrush className="h-4 w-4" />,
    'carpentry': <Wrench className="h-4 w-4" />,
    'appliance-repair': <Wrench className="h-4 w-4" />,
    'moving': <Truck className="h-4 w-4" />,
    'beauty': <Scissors className="h-4 w-4" />,
    'food': <Utensils className="h-4 w-4" />,
    'tiffin': <Utensils className="h-4 w-4" />,
    'catering': <Utensils className="h-4 w-4" />,
    'salon': <Scissors className="h-4 w-4" />,
    'tourism': <Plane className="h-4 w-4" />,
    'fitness': <Dumbbell className="h-4 w-4" />,
};

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | 'newest' | 'name'>('newest');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch Categories
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();

  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12; // Better grid layout (2x6 or 3x4)

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  // Scroll Detection
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Services (Service-First Approach)
  const { 
    data: servicesData, 
    isLoading: isLoadingServices, 
    error 
  } = useServices({
    q: debouncedSearchQuery || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    sortBy: sortBy === 'rating' ? 'rating' : sortBy,
    limit: ITEMS_PER_PAGE,
    page: page
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ 
        q: searchQuery, 
        category: selectedCategory,
        sortBy: sortBy
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getIcon = (slug: string) => {
      // Try exact match or partial match
      if (CATEGORY_ICONS[slug]) return CATEGORY_ICONS[slug];
      const key = Object.keys(CATEGORY_ICONS).find(k => slug.includes(k));
      return key ? CATEGORY_ICONS[key] : <Wrench className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen">
       {/* Category Icons Bar (Quick Access) */}
       {!isLoadingCategories && categories.length > 0 && (
        <div className="bg-white border-b border-gray-100 z-40 shadow-sm">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="flex flex-wrap items-center gap-3 py-3 justify-center md:justify-start">
                    {isScrolled && (
                        <button 
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="bg-white/70 hover:bg-white hover:text-[#ff6b35] text-gray-700 border border-white/40 p-2 rounded-full shadow-sm transition-all"
                            title="Search"
                        >
                            <Search className="h-4 w-4" />
                        </button>
                    )}

                    <button 
                        onClick={() => {
                            setSelectedCategory('all');
                            setSearchParams(prev => { prev.delete('category'); return prev; });
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            selectedCategory === 'all' 
                            ? 'bg-[#ff6b35] text-white shadow-md' 
                            : 'bg-white/70 hover:bg-white text-gray-700 border border-white/40'
                        }`}
                    >
                        {!isScrolled && <Search className="h-4 w-4" />}
                        All
                    </button>
                    {categories.map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => {
                                setSelectedCategory(cat.slug);
                                setSearchParams(prev => { prev.set('category', cat.slug); return prev; });
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                                selectedCategory === cat.slug 
                                ? 'bg-[#ff6b35] text-white shadow-md' 
                                : 'bg-white/70 hover:bg-white text-gray-700 border border-white/40'
                            }`}
                        >
                            {getIcon(cat.slug)}
                            {cat.name}
                        </button>
                    ))}
                 </div>
             </div>
        </div>
       )}

      {/* Search & Filter Bar - Static (Scrolls away) */}
      <div className="glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            {/* Search Input - Refactored for better alignment */}
            <div className="flex-1 relative">
              <div className="flex items-center w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-[#ff6b35] focus-within:ring-offset-2">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                  type="text"
                  placeholder="Search for services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex h-full w-full bg-transparent p-0 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 border-none focus:ring-0"
                />
              </div>
            </div>

            {/* Sort By (Removed Category Select) */}
            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger className="w-full md:w-40 glass-light border-white/30">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="glass">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated Provider</SelectItem>
              </SelectContent>
            </Select>

            {/* Available Only Toggle */}
            <button
              type="button"
              onClick={() => setShowAvailableOnly(!showAvailableOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                showAvailableOnly
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white/70 hover:bg-white text-gray-700 border border-gray-200'
              }`}
            >
              🟢 Available Only
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-gray-900 mb-1 font-bold text-2xl">
              {selectedCategory !== 'all' 
                ? categories.find(c => c.slug === selectedCategory)?.name || selectedCategory
                : 'All Services'}
            </h1>
            <p className="text-gray-600">
               {isLoadingServices ? 'Loading...' : `${servicesData?.pagination.total || 0} services found`}
            </p>
          </div>
        </div>

        {isLoadingServices ? (
            <div className="flex justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-[#ff6b35]" />
            </div>
        ) : error ? (
             <div className="glass rounded-2xl p-12 text-center text-red-500">
                <p>Failed to load services. Please try again.</p>
                <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                    Retry
                </Button>
            </div>
        ) : !servicesData?.data || servicesData.data.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <Search className="h-8 w-8 text-[#ff6b35]" />
            </div>
            <h3 className="text-gray-900 mb-2 font-semibold">No services found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search to find what you need.
            </p>
            <Button
              variant="outline"
              className="glass border-white/30"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {servicesData.data
                .filter(service => !showAvailableOnly || (service.provider as any).isAvailable)
                .map((service) => (
                <div
                  key={service.id}
                  className="glass glass-hover rounded-xl overflow-hidden flex flex-col h-full border border-white/40 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Service Image (or Provider Image fallback) */}
                  <div className="aspect-video bg-gray-100 relative overflow-hidden group">
                      <ImageWithFallback
                        src={service.imageUrl || (service.provider.user.avatarUrl) || undefined}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-gray-900 shadow-sm flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          {service.price}
                      </div>
                  </div>

                  {/* Service Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-gray-900 font-bold text-lg line-clamp-1 group-hover:text-[#ff6b35] transition-colors">{service.title}</h3>
                    </div>

                    {service.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">{service.description}</p>
                    )}
                    
                    {/* Provider metadata */}
                    <div className="pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                                  <ImageWithFallback 
                                      src={service.provider.user.avatarUrl} 
                                      alt={service.provider.businessName} 
                                      className="h-full w-full object-cover"
                                  />
                              </div>
                              <div>
                                  <p className="text-sm font-semibold text-gray-900 line-clamp-1 hover:underline">
                                      <Link to={`/provider/${service.providerId}`}>{service.provider.businessName}</Link>
                                  </p>
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <MapPin className="h-3 w-3" />
                                      <span className="truncate max-w-[100px]">{service.provider.city}</span>
                                  </div>
                              </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                              {/* Availability Badge */}
                              {(service.provider as any).isAvailable !== undefined && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  (service.provider as any).isAvailable 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-600'
                                }`}>
                                  {(service.provider as any).isAvailable ? '🟢 Available' : '🔴 Busy'}
                                </span>
                              )}
                              <div className="flex items-center gap-1 bg-orange-50 px-1.5 py-0.5 rounded text-xs font-medium text-orange-600">
                                  <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
                                  {service.provider.averageRating.toFixed(1)}
                              </div>
                          </div>
                      </div>

                      <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 text-xs h-8" asChild>
                              <Link to={`/provider/${service.providerId}`}>View Provider</Link>
                          </Button>
                          <Button size="sm" className="flex-1 bg-[#ff6b35] hover:bg-[#ff5722] text-xs h-8 shadow-md" asChild>
                              <Link to={`/provider/${service.providerId}?book=${service.id}`}>Book Now</Link>
                          </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {servicesData.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 py-4">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="w-24"
                >
                  Previous
                </Button>
                <span className="text-sm font-medium text-gray-600">
                  Page {page} of {servicesData.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(Math.min(servicesData.pagination.totalPages, page + 1))}
                  disabled={page === servicesData.pagination.totalPages}
                  className="w-24"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}