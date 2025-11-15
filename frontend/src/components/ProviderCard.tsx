/**
 * Provider Card Component
 * Standardized card layout with image, verified badge, rating, price range
 */
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Provider } from '../api/providers';
import { formatCurrency } from '../lib/utils';

interface ProviderCardProps {
  provider: Provider;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Link
      to={`/provider/${provider.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
    >
      {/* Image */}
      <div className="aspect-video bg-gray-200 relative">
        {provider.user.avatarUrl ? (
          <img
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
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs">
            <CheckCircle className="w-3 h-3" />
            Verified
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-1">{provider.businessName}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{provider.description}</p>

        {/* Rating */}
        {provider.averageRating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{provider.averageRating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({provider.totalRatings})</span>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4" />
          <span>{provider.city}, {provider.state}</span>
        </div>

        {/* Price Range */}
        {provider.services && provider.services.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-700">
            <span className="font-medium">
              {formatCurrency(Math.min(...provider.services.map((s) => Number(s.price))))}
            </span>
            {provider.services.length > 1 && (
              <>
                <span>-</span>
                <span className="font-medium">
                  {formatCurrency(Math.max(...provider.services.map((s) => Number(s.price))))}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

