import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Star, Shield, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { useProviders } from '../api/providers';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Categories - can be moved to API later
const categories = [
  { id: 'plumbing', name: 'Plumbing', icon: '🔧' },
  { id: 'electrical', name: 'Electrical', icon: '⚡' },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
  { id: 'tiffin', name: 'Tiffin Service', icon: '🍱' },
  { id: 'salon', name: 'Salon & Beauty', icon: '💇' },
  { id: 'tutoring', name: 'Tutoring', icon: '📚' },
  { id: 'fitness', name: 'Fitness', icon: '💪' },
  { id: 'catering', name: 'Catering', icon: '🍽️' },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  // Fetch featured providers (approved, with ratings)
  const { data: providersData, isLoading, error } = useProviders({
    limit: 4,
    page: 1,
  });
  
  // Safely extract featured providers with fallback
  const featuredProviders = (providersData?.data || []).filter(
    (p) => p.status === 'APPROVED' && (p.averageRating || 0) >= 4.0
  ).slice(0, 4);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/services');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-gray-900 mb-4">
                Find Trusted Local Service Providers in Nanded
              </h1>
              <p className="text-gray-600 mb-6">
                Connect with verified professionals for plumbing, electrical, tiffin services, home cleaning, and more. Quality services at your doorstep.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-2 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <Input
                    type="text"
                    placeholder="Search for services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(e);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3"
                  />
                </div>
                <Button type="submit" variant="default" size="default" className="px-5">
                  Search
                </Button>
              </form>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-orange-600 font-semibold mb-1">1200+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div>
                  <div className="text-orange-600 font-semibold mb-1">87</div>
                  <div className="text-sm text-gray-600">Service Providers</div>
                </div>
                <div>
                  <div className="text-orange-600 font-semibold mb-1">4.8★</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1742535035610-c5865df05858?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBzZXJ2aWNlJTIwcHJvZmVzc2lvbmFscyUyMHdvcmtlcnxlbnwxfHx8fDE3NjI5MjQzNDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Service professionals"
                className="rounded-2xl shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-gray-900 mb-2">Popular Service Categories</h2>
            <p className="text-gray-600">Find the right service provider for your needs</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                to={`/services?category=${category.id}`}
                className="p-6 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition-all text-center group"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-600 transition-colors">
                  <span className="text-orange-600 group-hover:text-white text-xl">{category.icon}</span>
                </div>
                <p className="text-gray-900 group-hover:text-orange-600 transition-colors font-medium">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/services">
              <Button variant="outline" className="gap-2">
                View All Categories
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-gray-900 mb-2">Top Rated Providers</h2>
            <p className="text-gray-600">Verified professionals you can trust</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProviders.map((provider) => (
              <Link
                key={provider.id}
                to={`/provider/${provider.id}`}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[4/3] bg-gray-200 relative">
                  {provider.gallery && provider.gallery[0] ? (
                    <ImageWithFallback
                      src={provider.gallery[0]}
                      alt={provider.businessName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-xl font-bold text-gray-400">
                            {provider.businessName?.charAt(0) || 'P'}
                          </span>
                        </div>
                        <span className="text-sm">No Image</span>
                      </div>
                    </div>
                  )}
                  {provider.status === 'APPROVED' && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Verified
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-gray-900 mb-1">{provider.businessName}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {provider.primaryCategory}
                    {provider.secondaryCategory && `, ${provider.secondaryCategory}`}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{provider.averageRating?.toFixed(1) || '0.0'}</span>
                      <span className="text-xs text-gray-400">({provider.totalRatings || 0})</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {provider.city || 'Nanded'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/services">
              <Button variant="default" className="gap-2">
                Browse All Providers
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 mb-2">How MH26 Services Works</h2>
            <p className="text-gray-600">Simple steps to connect with the best providers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-gray-900 mb-2">1. Search Services</h3>
              <p className="text-gray-600">
                Browse categories or search for specific services you need in Nanded
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-gray-900 mb-2">2. Choose Provider</h3>
              <p className="text-gray-600">
                Compare ratings, reviews, and pricing. Contact verified providers directly
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-gray-900 mb-2">3. Get Service</h3>
              <p className="text-gray-600">
                Book instantly and get quality service at your convenience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-[#ff6b35] to-[#ff5722]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-white mb-4">Ready to Provide Your Services?</h2>
          <p className="text-white/90 mb-6">
            Join hundreds of service providers on MH26 Services and grow your business in Nanded
          </p>
          <Link to="/provider-onboarding">
            <Button size="lg" variant="secondary" className="gap-2">
              Start Provider Onboarding
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
