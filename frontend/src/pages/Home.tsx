/**
 * Home Page
 */
import { Link } from 'react-router-dom';
import { useProviders } from '../api/providers';
import ProviderCard from '../components/ProviderCard';
import { Button } from '../components/ui/button';

export default function Home() {
  const { data, isLoading, error } = useProviders({ city: 'Nanded', limit: 6 });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#ff6b35] to-[#ff5722] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Trusted Local Services in Nanded
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Connect with verified service providers for plumbing, electrical, cleaning, and more
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/services">
                <Button variant="secondary" size="lg">
                  Browse Services
                </Button>
              </Link>
              <Link to="/auth/signup">
                <Button variant="outline" size="lg" className="bg-white/10 border-white text-white hover:bg-white/20">
                  Join as Provider
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Providers</h2>
          
          {error ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Unable to load providers. The backend may not be running.</p>
              <p className="text-sm text-gray-500">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse h-64 rounded-lg" />
              ))}
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.data.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
              <div className="text-center mt-8">
                <Link to="/services">
                  <Button variant="outline" size="lg">
                    View All Providers
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No providers found.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

