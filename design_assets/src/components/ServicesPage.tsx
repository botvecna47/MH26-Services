import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Star, MapPin, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ProviderAPI, ServiceAPI } from '../services/api';
import { Provider, ServiceCategory } from '../types/database';
import { GlassLoadingSkeleton } from './ui/GlassLoadingSkeleton';
import { GlassEmptyState } from './ui/GlassEmptyState';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category') || null
  );
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProviders();
  }, [selectedCategory, searchQuery]);

  const loadCategories = async () => {
    try {
      const response = await ServiceAPI.getServiceCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProviders = async () => {
    setLoading(true);
    try {
      const response = await ProviderAPI.getProviders({
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
      });

      if (response.success) {
        setProviders(response.data || []);
      }
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setSearchParams({ q: query });
    } else {
      setSearchParams({});
    }
  };

  const handleCategorySelect = (slug: string | null) => {
    setSelectedCategory(slug);
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setSearchParams({});
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-gray-900 mb-3">Categories</h3>
        <div className="space-y-2">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
              !selectedCategory
                ? 'bg-[#ff6b35] text-white shadow-lg'
                : 'glass hover:bg-white/40 text-gray-700'
            }`}
          >
            All Services
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.slug)}
              className={`w-full text-left px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                selectedCategory === category.slug
                  ? 'bg-[#ff6b35] text-white shadow-lg'
                  : 'glass hover:bg-white/40 text-gray-700'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {(selectedCategory || searchQuery) && (
        <Button
          onClick={clearFilters}
          variant="outline"
          className="w-full border-white/30 hover:bg-white/20"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-4">Browse Service Providers</h1>
          <p className="text-gray-600">
            Find and connect with verified local professionals in Nanded
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 flex gap-3">
          <div className="flex-1">
            <div className="relative">
              <div className="glass-strong rounded-xl shadow-lg border border-white/60">
                <div className="flex items-center">
                  <Search className="absolute left-4 h-5 w-5 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search providers..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-[#ff6b35]/30 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filter Button */}
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button className="md:hidden glass-strong hover:bg-white/40" size="lg">
                <Filter className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="glass-strong w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterSidebar />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden md:block">
            <div className="glass rounded-xl p-6 sticky top-20">
              <FilterSidebar />
            </div>
          </aside>

          {/* Providers Grid */}
          <main className="lg:col-span-3">
            {/* Active Filters */}
            {(selectedCategory || searchQuery) && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchQuery && (
                  <div className="glass rounded-full px-3 py-1 flex items-center gap-2 text-sm">
                    <span>Search: {searchQuery}</span>
                    <button onClick={() => handleSearch('')}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {selectedCategory && (
                  <div className="glass rounded-full px-3 py-1 flex items-center gap-2 text-sm">
                    <span>
                      {categories.find((c) => c.slug === selectedCategory)?.name}
                    </span>
                    <button onClick={() => handleCategorySelect(null)}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
              {loading ? 'Loading...' : `${providers.length} providers found`}
            </div>

            {/* Providers Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <GlassLoadingSkeleton key={i} height={320} />
                ))}
              </div>
            ) : providers.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider) => (
                  <Link
                    key={provider.id}
                    to={`/provider/${provider.id}`}
                    className="glass glass-hover rounded-xl overflow-hidden group transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-orange-500/10"
                  >
                    {/* Provider Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={
                          provider.businessImages?.[0] ||
                          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'
                        }
                        alt={provider.businessName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {provider.isApproved && (
                        <div className="absolute top-3 right-3 glass-strong rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                          <Check className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-gray-900">Verified</span>
                        </div>
                      )}
                    </div>

                    {/* Provider Info */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-gray-900 mb-1 line-clamp-1">
                          {provider.businessName}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {provider.businessDescription}
                        </p>
                      </div>

                      {/* Rating & Location */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-[#ff6b35]">
                          <Star className="h-4 w-4 fill-current" />
                          <span>{provider.ratings.average.toFixed(1)}</span>
                          <span className="text-gray-500">
                            ({provider.ratings.totalReviews})
                          </span>
                        </div>
                        {provider.businessAddress && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span>{provider.businessAddress.area}</span>
                          </div>
                        )}
                      </div>

                      {/* View Profile Button */}
                      <Button
                        className="w-full bg-[#ff6b35] hover:bg-[#e85a2d] text-white shadow-lg shadow-orange-200/50 active:scale-95 transition-all"
                        size="sm"
                      >
                        View Profile
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <GlassEmptyState
                icon={<Search className="h-12 w-12" />}
                message={
                  searchQuery || selectedCategory
                    ? 'No providers found matching your criteria'
                    : 'No providers available'
                }
                action={
                  (searchQuery || selectedCategory) && (
                    <Button onClick={clearFilters} variant="outline">
                      Clear Filters
                    </Button>
                  )
                }
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
