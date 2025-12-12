import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, Check, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { ProviderAPI, ServiceAPI } from '../services/api';
import { Provider, ServiceCategory } from '../types/database';
import { GlassLoadingSkeleton } from './ui/GlassLoadingSkeleton';
import { GlassEmptyState } from './ui/GlassEmptyState';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProviders, setFeaturedProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [providersRes, categoriesRes] = await Promise.all([
        ProviderAPI.getFeatured(),
        ServiceAPI.getServiceCategories(),
      ]);

      if (providersRes.success) {
        setFeaturedProviders(providersRes.data || []);
      }

      if (categoriesRes.success) {
        setCategories(categoriesRes.data || []);
      }
    } catch (error) {
      console.error('Error loading homepage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="tracking-tight text-gray-900">
                  Find Trusted Services in Nanded
                </h1>
                <p className="text-gray-600">
                  Connect with verified local professionals for all your service needs.
                  Quality work, reliable service, fair prices.
                </p>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="w-full">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="glass-strong rounded-xl shadow-lg border border-white/60">
                      <div className="flex items-center">
                        <Search className="absolute left-4 h-5 w-5 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search for services..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/30 rounded-xl transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="bg-[#ff6b35] hover:bg-[#e85a2d] text-white shadow-lg shadow-orange-200/50 active:scale-95 transition-all px-8"
                    size="lg"
                  >
                    Search
                  </Button>
                </div>
              </form>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass rounded-xl p-4 text-center transition-all duration-300 hover:shadow-xl">
                  <div className="text-[#ff6b35] mb-1">50+</div>
                  <p className="text-xs text-gray-600">Providers</p>
                </div>
                <div className="glass rounded-xl p-4 text-center transition-all duration-300 hover:shadow-xl">
                  <div className="text-[#ff6b35] mb-1">4.8★</div>
                  <p className="text-xs text-gray-600">Avg Rating</p>
                </div>
                <div className="glass rounded-xl p-4 text-center transition-all duration-300 hover:shadow-xl">
                  <div className="text-[#ff6b35] mb-1">24/7</div>
                  <p className="text-xs text-gray-600">Support</p>
                </div>
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="hidden md:block">
              <div className="glass-strong rounded-2xl p-3 shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80"
                  alt="Professional services in Nanded"
                  className="w-full h-auto rounded-xl object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-gray-900 mb-2">Browse by Category</h2>
            <p className="text-gray-600">Explore our wide range of professional services</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <GlassLoadingSkeleton key={i} height={120} />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/services?category=${category.slug}`}
                  className="glass glass-hover rounded-xl p-6 text-center group transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-orange-500/10"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-[#ff6b35] group-hover:to-[#ff8c5a] transition-all shadow-md">
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <h3 className="text-gray-900 group-hover:text-[#ff6b35] transition-colors mb-1">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-600">{category.description}</p>
                </Link>
              ))}
            </div>
          ) : (
            <GlassEmptyState
              icon={<Search className="h-12 w-12" />}
              message="No categories available"
            />
          )}
        </div>
      </section>

      {/* Featured Providers Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-gray-900 mb-2">Top Rated Providers</h2>
              <p className="text-gray-600">Trusted professionals in Nanded</p>
            </div>
            <Link to="/services">
              <Button variant="ghost" className="gap-2 hover:bg-white/40">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <GlassLoadingSkeleton key={i} height={320} />
              ))}
            </div>
          ) : featuredProviders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProviders.map((provider) => (
                <Link
                  key={provider.id}
                  to={`/provider/${provider.id}`}
                  className="glass glass-hover rounded-xl overflow-hidden group transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-orange-500/10"
                >
                  {/* Provider Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={provider.businessImages?.[0] || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'}
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
                        <span className="text-gray-500">({provider.ratings.totalReviews})</span>
                      </div>
                      {provider.businessAddress && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{provider.businessAddress.area}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <GlassEmptyState
              icon={<Star className="h-12 w-12" />}
              message="No featured providers available"
            />
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-gray-900 mb-2">How It Works</h2>
            <p className="text-gray-600">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass rounded-xl p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-gray-900">Search & Browse</h3>
              <p className="text-sm text-gray-600">
                Find the right service provider by browsing categories or searching for specific services
              </p>
            </div>

            <div className="glass rounded-xl p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-gray-900">Book Service</h3>
              <p className="text-sm text-gray-600">
                Select your preferred date and time, provide details, and confirm your booking instantly
              </p>
            </div>

            <div className="glass rounded-xl p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-gray-900">Get It Done</h3>
              <p className="text-sm text-gray-600">
                Sit back while our verified professionals deliver quality service at your doorstep
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-strong rounded-2xl p-8 md:p-12 text-center space-y-6 shadow-xl">
            <h2 className="text-gray-900">Are you a service provider?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join MH26 Services and connect with thousands of customers in Nanded.
              Grow your business with our platform.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/provider-onboarding">
                <Button className="bg-[#ff6b35] hover:bg-[#e85a2d] text-white shadow-lg shadow-orange-200/50 active:scale-95 transition-all">
                  Become a Provider
                </Button>
              </Link>
              <Link to="/services">
                <Button variant="outline" className="border-white/30 hover:bg-white/20">
                  Browse Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
