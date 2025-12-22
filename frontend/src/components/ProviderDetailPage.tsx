import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Shield,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Flag,
  ArrowLeft,
  Eye,
  Lock,
  Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';
import PhoneRevealModal from './PhoneRevealModal';
import ReviewsList from './ReviewsList';
import { useProvider, providersApi } from '../api/providers';
import { useProviderReviews } from '../api/reviews';
import BookingModal from './BookingModal';
import { useBookings } from '../api/bookings';

export default function ProviderDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useUser();
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [revealedEmail, setRevealedEmail] = useState<string | null>(null);

  // Fetch Provider Data
  const { data: provider, isLoading: isLoadingProvider, error: providerError } = useProvider(id || '');
  
  // Fetch Reviews Data
  const { data: reviewsData, isLoading: isLoadingReviews } = useProviderReviews(id || '');
  
  // Fetch user's bookings to check for duplicates
  const { data: userBookings } = useBookings({ limit: 100 });
  
  // Check if viewing own profile (must be after provider is fetched)
  const isOwnProfile = user?.id === provider?.userId;

  if (isLoadingProvider) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-[#ff6b35]" />
          </div>
      );
  }

  if (providerError || !provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-gray-900 mb-2">Provider not found</h2>
          <Link to="/services">
            <Button variant="outline">Back to Services</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleRevealPhone = async () => {
    if (!isAuthenticated) {
      setShowPhoneModal(true);
      return;
    }
    
    try {
        const data = await providersApi.revealPhone(provider.id);
        setRevealedPhone(data.phone);
        setRevealedEmail(data.email);
        setPhoneRevealed(true);
        toast.success('Contact details revealed');
    } catch (error) {
        toast.error('Failed to reveal contact details');
    }
  };

  const handleBookService = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to book a service');
      return;
    }
    
    // Check if user already has an active booking for this service
    const activeBookingStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS'];
    const existingActiveBooking = userBookings?.data?.find(
      (booking: any) => 
        booking.serviceId === primaryService.id && 
        activeBookingStatuses.includes(booking.status)
    );
    
    if (existingActiveBooking) {
      toast.error(`You already have an active booking for this service (Status: ${existingActiveBooking.status})`);
      return;
    }
    
    setShowBookingModal(true);
  };

  const primaryService = provider.services?.[0] || { id: 'default', title: 'Standard Service', price: 999 };

  return (
    <div className="bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/services" className="flex items-center gap-2 text-gray-600 hover:text-[#ff6b35]">
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Gallery */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="aspect-video bg-gray-200 relative">
                {provider.gallery && provider.gallery.length > 0 ? (
                  <ImageWithFallback
                    src={provider.gallery[0]}
                    alt={provider.businessName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image Available
                  </div>
                )}
              </div>
              {provider.gallery && provider.gallery.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-4">
                  {provider.gallery.slice(1, 5).map((img, idx) => (
                    <div key={idx} className="aspect-square bg-gray-100 rounded overflow-hidden">
                      <ImageWithFallback
                        src={img}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Provider Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-gray-900 text-2xl font-bold">{provider.businessName}</h1>
                    {provider.status === 'APPROVED' && (
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        Verified
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{provider.averageRating?.toFixed(1) || 'New'}</span>
                      <span className="text-gray-400">({provider.totalRatings} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{provider.city}, {provider.state}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-orange-100 text-[#ff6b35] px-3 py-1 rounded-full text-sm font-medium">
                    {provider.primaryCategory}
                  </span>
                  {provider.secondaryCategory && (
                    <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm">
                        {provider.secondaryCategory}
                    </span>
                  )}
              </div>

              {/* Bio */}
              {provider.description && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-gray-900 mb-2 font-semibold">About</h3>
                  <p className="text-gray-600">{provider.description}</p>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-gray-900 mb-4 font-semibold text-xl">Reviews & Ratings</h2>
               {isLoadingReviews ? (
                   <div className="py-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400"/></div>
               ) : (
                   <ReviewsList reviews={reviewsData?.data || []} providerId={provider.id} />
               )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 space-y-4">
            {/* Contact Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-gray-900 mb-4 font-semibold">Contact & Book</h3>

              {/* Phone Number */}
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-2 block">Phone Number</label>
                {isAuthenticated && phoneRevealed ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Phone className="h-4 w-4 text-green-700" />
                    <span className="font-medium text-green-900">{revealedPhone || provider.user.phone || 'Contact for details'}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleRevealPhone}
                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-gray-700"
                  >
                    {isAuthenticated ? (
                      <>
                        <Eye className="h-4 w-4" />
                        <span>Reveal Phone Number</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        <span>Available for registered members</span>
                      </>
                    )}
                  </button>
                )}
                {!isAuthenticated && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Sign in to view contact details
                  </p>
                )}
              </div>

              {/* Email - Only show if revealed or specific logic */}
              {isAuthenticated && phoneRevealed && (
                  <div className="mb-4">
                    <label className="text-sm text-gray-600 mb-2 block">Email</label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{revealedEmail || provider.user.email}</span>
                    </div>
                  </div>
              )}

              {/* Book Service Button - Hide for own profile */}
              {!isOwnProfile && (
                <Button
                  onClick={handleBookService}
                  className="w-full bg-[#ff6b35] hover:bg-[#ff5722] mb-2 shadow-lg"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Service
                </Button>
              )}

              {/* Send Message - Hide for own profile */}
              {isAuthenticated && !isOwnProfile && (
                <Link to={`/messages?userId=${provider.userId}`} className="block w-full">
                  <Button variant="outline" className="w-full">
                    Send Message
                  </Button>
                </Link>
              )}
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-gray-900 mb-4 font-semibold">Quick Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${
                    provider.status === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {provider.status === 'APPROVED' ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="text-gray-900">
                    {new Date(provider.createdAt).toLocaleDateString('en-IN', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="text-gray-900">{provider.city}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPhoneModal && (
        <PhoneRevealModal
          providerName={provider.businessName}
          onClose={() => setShowPhoneModal(false)}
        />
      )}

      {showBookingModal && (
        <BookingModal
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            providerId={provider.id}
            serviceId={primaryService.id}
            serviceName={primaryService.title}
            price={primaryService.price}
            providerName={provider.businessName}
        />
      )}
    </div>
  );
}
