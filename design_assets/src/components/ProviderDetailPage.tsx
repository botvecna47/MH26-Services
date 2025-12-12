import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Check,
  Calendar,
  Clock,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { ProviderAPI, ReviewAPI, BookingAPI } from '../services/api';
import { Provider, Review } from '../types/database';
import { GlassLoadingSkeleton } from './ui/GlassLoadingSkeleton';
import { GlassEmptyState } from './ui/GlassEmptyState';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner@2.0.3';
import { format } from 'date-fns';

export default function ProviderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    address: '',
    requirements: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadProviderData();
    }
  }, [id]);

  const loadProviderData = async () => {
    setLoading(true);
    try {
      const [providerRes, reviewsRes] = await Promise.all([
        ProviderAPI.getProvider(id!),
        ReviewAPI.getByProvider(id!),
      ]);

      if (providerRes.success) {
        setProvider(providerRes.data!);
      } else {
        toast.error(providerRes.error || 'Provider not found');
        navigate('/services');
      }

      if (reviewsRes.success) {
        setReviews(reviewsRes.data || []);
      }
    } catch (error) {
      console.error('Error loading provider:', error);
      toast.error('Failed to load provider details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please sign in to book a service');
      navigate('/auth');
      return;
    }

    setSubmitting(true);
    try {
      // Get token from storage or context
      const token = localStorage.getItem('authToken') || '';

      const response = await BookingAPI.createBooking(token, {
        providerId: provider!.id,
        serviceId: 'service-1', // This should come from a service selection
        scheduledDate: bookingForm.date,
        scheduledTime: bookingForm.time,
        address: {
          id: '',
          userId: user?.id || '',
          type: 'home',
          street: bookingForm.address,
          area: '',
          city: 'Nanded',
          state: 'Maharashtra',
          pincode: '',
          isDefault: false,
          createdAt: new Date().toISOString(),
        },
        requirements: bookingForm.requirements,
        estimatedDuration: 60,
        estimatedPrice: 500,
      });

      if (response.success) {
        toast.success('Booking created successfully!');
        setBookingModalOpen(false);
        setBookingForm({ date: '', time: '', address: '', requirements: '' });
        navigate('/dashboard');
      } else {
        toast.error(response.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassLoadingSkeleton height={400} className="mb-6" />
          <div className="grid md:grid-cols-3 gap-6">
            <GlassLoadingSkeleton height={300} className="md:col-span-2" />
            <GlassLoadingSkeleton height={300} />
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassEmptyState
            icon={<MapPin className="h-12 w-12" />}
            message="Provider not found"
            action={
              <Button onClick={() => navigate('/services')}>
                Browse Providers
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/services')}
          className="mb-6 gap-2 hover:bg-white/40"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Providers
        </Button>

        {/* Hero Section */}
        <div className="glass-strong rounded-2xl overflow-hidden shadow-xl mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Image Gallery */}
            <div className="relative h-80 md:h-96">
              <img
                src={provider.businessImages?.[0] || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'}
                alt={provider.businessName}
                className="w-full h-full object-cover"
              />
              {provider.isApproved && (
                <div className="absolute top-4 right-4 glass-strong rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-900">Verified Provider</span>
                </div>
              )}
            </div>

            {/* Right: Provider Info */}
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <h1 className="text-gray-900 mb-2">{provider.businessName}</h1>
                <p className="text-gray-600">{provider.businessDescription}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[#ff6b35]">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="text-xl">{provider.ratings.average.toFixed(1)}</span>
                </div>
                <span className="text-sm text-gray-600">
                  Based on {provider.ratings.totalReviews} reviews
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                {provider.businessAddress && (
                  <div className="flex items-start gap-3 text-sm text-gray-700">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div>{provider.businessAddress.street}</div>
                      <div>
                        {provider.businessAddress.area}, {provider.businessAddress.city}
                      </div>
                      <div>
                        {provider.businessAddress.state} - {provider.businessAddress.pincode}
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <span>{provider.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <span>{provider.email}</span>
                </div>
              </div>

              {/* Book Now Button */}
              <Button
                onClick={() => setBookingModalOpen(true)}
                className="w-full md:w-auto bg-[#ff6b35] hover:bg-[#e85a2d] text-white shadow-lg shadow-orange-200/50 active:scale-95 transition-all"
                size="lg"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Book Service
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="glass w-full md:w-auto mb-6">
            <TabsTrigger value="services" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              Services
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              Reviews ({reviews.length})
            </TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              About
            </TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services">
            <div className="glass rounded-xl p-6 space-y-4">
              <h2 className="text-gray-900">Available Services</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-strong rounded-lg p-4 space-y-2">
                  <h3 className="text-gray-900">Monthly Tiffin Service</h3>
                  <p className="text-sm text-gray-600">
                    Fresh, home-cooked vegetarian meals delivered daily
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#ff6b35]">₹3,500/month</span>
                    <Button size="sm" variant="outline" className="border-white/30 hover:bg-white/20">
                      Select
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="glass rounded-xl p-6">
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="glass-strong rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-gray-900">
                            {review.customer.firstName} {review.customer.lastName}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-[#ff6b35]">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating ? 'fill-current' : ''
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <GlassEmptyState
                  icon={<Star className="h-12 w-12" />}
                  message="No reviews yet"
                />
              )}
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <div className="glass rounded-xl p-6 space-y-4">
              <h2 className="text-gray-900">About {provider.businessName}</h2>
              <p className="text-gray-600">{provider.businessDescription}</p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="glass-strong rounded-lg p-4">
                  <h4 className="text-gray-900 mb-2">Member Since</h4>
                  <p className="text-sm text-gray-600">
                    {format(new Date(provider.createdAt), 'MMMM yyyy')}
                  </p>
                </div>
                {provider.approvedAt && (
                  <div className="glass-strong rounded-lg p-4">
                    <h4 className="text-gray-900 mb-2">Verified Since</h4>
                    <p className="text-sm text-gray-600">
                      {format(new Date(provider.approvedAt), 'MMMM yyyy')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Modal */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="glass-strong sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Service with {provider.businessName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBookingSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="date">Preferred Date</Label>
              <Input
                id="date"
                type="date"
                value={bookingForm.date}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, date: e.target.value })
                }
                min={new Date().toISOString().split('T')[0]}
                required
                className="glass-strong mt-1"
              />
            </div>

            <div>
              <Label htmlFor="time">Preferred Time</Label>
              <Input
                id="time"
                type="time"
                value={bookingForm.time}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, time: e.target.value })
                }
                required
                className="glass-strong mt-1"
              />
            </div>

            <div>
              <Label htmlFor="address">Service Address</Label>
              <Textarea
                id="address"
                value={bookingForm.address}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, address: e.target.value })
                }
                placeholder="Enter complete address..."
                required
                className="glass-strong mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="requirements">Special Requirements (Optional)</Label>
              <Textarea
                id="requirements"
                value={bookingForm.requirements}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, requirements: e.target.value })
                }
                placeholder="Any special instructions..."
                className="glass-strong mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBookingModalOpen(false)}
                className="flex-1 border-white/30 hover:bg-white/20"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#ff6b35] hover:bg-[#e85a2d] text-white shadow-lg shadow-orange-200/50 active:scale-95 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
