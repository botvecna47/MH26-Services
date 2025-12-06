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
  Clock,
  User,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useProvider } from '../api/providers';
import { useProviderReviews } from '../api/reviews';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';
import PhoneRevealModal from './PhoneRevealModal';
import ReportProviderModal from './ReportProviderModal';
import ReviewsList from './ReviewsList';
// Import BookingModal with explicit default import
import BookingModal from './BookingModal';
import { Loader2 } from 'lucide-react';
import { providersApi } from '../api/providers';

export default function ProviderDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useUser();
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: provider, isLoading: providerLoading, error: providerError } = useProvider(id || '');
  const { data: reviewsData } = useProviderReviews(id || '', 1, 10);
  const reviews = reviewsData?.data || [];

  if (providerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
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
      // Redirect to login/signup with return URL
      window.location.href = '/auth?mode=signup&returnUrl=' + encodeURIComponent(window.location.pathname);
      return;
    }
    
    if (!id) return;
    
    try {
      const data = await providersApi.revealPhone(id);
      setPhoneRevealed(true);
      setRevealedPhone(data.phone);
      toast.success('Contact details revealed');
    } catch (error: any) {
      // If 401, user was logged out
      if (error.response?.status === 401) {
        toast.error('Session expired. Please sign in again.');
        return;
      }
      toast.error(error.response?.data?.error || 'Failed to reveal phone number');
    }
  };

  const handleBookService = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to book a service');
      return;
    }
    // Navigate to booking flow or open booking modal
    // For now, show a message
    toast.success('Opening booking flow...');
    // TODO: Implement actual booking flow
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/services" className="flex items-center gap-2 text-gray-600 hover:text-[#ff6b35]">
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="aspect-video bg-gray-200 relative">
                {provider.user?.avatarUrl ? (
                  <ImageWithFallback
                    src={provider.user.avatarUrl}
                    alt={provider.businessName}
                    className="w-full h-full object-cover"
                  />
                ) : provider.gallery && provider.gallery.length > 0 ? (
                  <ImageWithFallback
                    src={provider.gallery[0]}
                    alt={provider.businessName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <User className="w-20 h-20 text-gray-400" />
                  </div>
                )}
              </div>

            </div>

            {/* Provider Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-gray-900">{provider.businessName}</h1>
                    {provider.status === 'APPROVED' && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                           <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs flex items-center gap-1 font-medium border border-green-200">
                             <Shield className="h-3 w-3" />
                             Verified
                           </span>
                           <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs flex items-center gap-1 font-medium border border-blue-200">
                             <FileText className="h-3 w-3" />
                             Documents Reviewed
                           </span>
                           <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-xs flex items-center gap-1 font-medium border border-orange-200">
                             <Star className="h-3 w-3" />
                             Rating History Visible
                           </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          Approved by MH26 Admin on {new Date(provider.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{provider.averageRating?.toFixed(1) || '0.0'}</span>
                      <span className="text-gray-400">({provider.totalRatings || 0} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{provider.address}, {provider.city}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReportModal(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </Button>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-orange-100 text-primary-500 px-3 py-1 rounded-full text-sm">
                  {provider.primaryCategory}
                </span>
                {provider.secondaryCategory && (
                  <span className="bg-orange-100 text-primary-500 px-3 py-1 rounded-full text-sm">
                    {provider.secondaryCategory}
                  </span>
                )}
              </div>

              {/* Description */}
              {provider.description && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-gray-900 mb-2">About</h3>
                  <p className="text-gray-600">{provider.description}</p>
                </div>
              )}
            </div>

            {/* Services */}
            {provider.services && provider.services.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-gray-900 mb-4">Services Offered</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {provider.services.map((service) => (
                    <div
                      key={service.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-[#ff6b35] transition-colors"
                    >
                      <div className="flex gap-4">
                        {service.imageUrl && (
                          <div className="flex-shrink-0">
                            <ImageWithFallback
                              src={service.imageUrl}
                              alt={service.title}
                              className="w-24 h-24 rounded-lg object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{service.title}</h3>
                          {service.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{service.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {service.durationMin} min
                              </span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">₹{Number(service.price).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photo Gallery */}
            {provider.gallery && provider.gallery.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-gray-900 mb-4">Photo Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {provider.gallery.map((image, index) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-gray-900 mb-4">Reviews & Ratings</h2>
              <ReviewsList reviews={reviews} providerId={provider.id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24 self-start">
              <h3 className="text-gray-900 mb-4">Contact Provider</h3>

                {/* Phone Number */}
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-2 block">Verified Contact</label>
                {isAuthenticated && phoneRevealed && revealedPhone ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Phone className="h-4 w-4 text-green-700" />
                    <a href={`tel:${revealedPhone}`} className="font-medium text-green-900">
                      {revealedPhone}
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={handleRevealPhone}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-gray-700 font-medium"
                  >
                    {isAuthenticated ? (
                      <>
                        <Eye className="h-4 w-4" />
                        <span>View Verified Details</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        <span>View Verified Details</span>
                      </>
                    )}
                  </button>
                )}
                {!isAuthenticated && (
                  <p className="text-xs text-gray-500 mt-2">
                    Official registry access requires authentication
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-2 block">Official Email</label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <a href={`mailto:${provider.user?.email}`} className="text-sm text-gray-700">
                    {provider.user?.email}
                  </a>
                </div>
              </div>

              {/* Book Service Button */}
              <Button
                onClick={() => setShowBookingModal(true)}
                className="w-full bg-[#ff6b35] hover:bg-[#ff5722] mb-2 font-medium"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Request Booking
              </Button>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-gray-900 mb-4">Quick Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${
                    provider.status === 'APPROVED' ? 'text-green-600' : 
                    provider.status === 'PENDING' ? 'text-yellow-600' :
                    provider.status === 'REJECTED' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {provider.status}
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
                  <span className="text-gray-900">{provider.city}, {provider.state}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}


      {showReportModal && (
        <ReportProviderModal
          providerId={provider.id}
          providerName={provider.businessName || provider.user?.name || 'Provider'}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {showBookingModal && provider && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          provider={{
            id: provider.id,
            businessName: provider.businessName,
            services: provider.services || [],
          }}
        />
      )}
    </div>
  );
}
