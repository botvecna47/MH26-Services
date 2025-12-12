import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
} from 'lucide-react';
import { Button } from './ui/button';

export default function HomePage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: any) => {
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
                <h1 className="tracking-tight text-gray-900 text-4xl md:text-5xl font-bold">
                  Find Trusted Services in Nanded
                </h1>
                <p className="text-gray-600 text-lg">
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
                          placeholder="Search for services (e.g. 'AC Repair')..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/30 rounded-xl transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="bg-[#ff6b35] hover:bg-[#e85a2d] text-white shadow-lg shadow-orange-200/50 active:scale-95 transition-all px-8 h-auto"
                    size="lg"
                  >
                    Search
                  </Button>
                </div>
              </form>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass rounded-xl p-4 text-center transition-all duration-300 hover:shadow-xl">
                  <div className="text-[#ff6b35] mb-1 font-bold text-xl">100+</div>
                  <p className="text-xs text-gray-600">Services</p>
                </div>
                <div className="glass rounded-xl p-4 text-center transition-all duration-300 hover:shadow-xl">
                  <div className="text-[#ff6b35] mb-1 font-bold text-xl">4.8★</div>
                  <p className="text-xs text-gray-600">Avg Rating</p>
                </div>
                <div className="glass rounded-xl p-4 text-center transition-all duration-300 hover:shadow-xl">
                  <div className="text-[#ff6b35] mb-1 font-bold text-xl">24/7</div>
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

      {/* How It Works Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-gray-900 mb-2 text-3xl font-bold">How It Works</h2>
            <p className="text-gray-600">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass rounded-xl p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-gray-900 font-semibold">Search & Browse</h3>
              <p className="text-sm text-gray-600">
                Find the right service provider by browsing categories or searching for specific services
              </p>
            </div>

            <div className="glass rounded-xl p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-gray-900 font-semibold">Book Service</h3>
              <p className="text-sm text-gray-600">
                Select your preferred date and time, provide details, and confirm your booking instantly
              </p>
            </div>

            <div className="glass rounded-xl p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-gray-900 font-semibold">Get It Done</h3>
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
            <h2 className="text-gray-900 text-3xl font-bold">Are you a service provider?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Join MH26 Services and connect with thousands of customers in Nanded.
              Grow your business with our platform.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/provider-onboarding">
                <Button className="bg-[#ff6b35] hover:bg-[#e85a2d] text-white shadow-lg shadow-orange-200/50 active:scale-95 transition-all h-12 px-8">
                  Become a Provider
                </Button>
              </Link>
              <Link to="/services">
                <Button variant="outline" className="border-white/30 hover:bg-white/20 h-12 px-8">
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