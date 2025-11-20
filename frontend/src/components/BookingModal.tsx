import { useState } from 'react';
import { X, Calendar, Clock, MapPin, DollarSign, User, Phone, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useUser } from '../context/UserContext';
import { useCreateBooking } from '../api/bookings';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: {
    id: string;
    businessName: string;
    services: Array<{
      id: string;
      title: string;
      price: number;
      durationMin: number;
      imageUrl?: string;
      description?: string;
    }>;
  };
}

export default function BookingModal({ isOpen, onClose, provider }: BookingModalProps) {
  const { user } = useUser();
  const createBooking = useCreateBooking();
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [address, setAddress] = useState('');
  const [requirements, setRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedService = provider.services.find(s => s.id === selectedServiceId);
  const totalAmount = selectedService ? Number(selectedService.price) : 0;

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00',
    '17:00', '18:00', '19:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedServiceId || !selectedDate || !selectedTime || !address) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate address length
    if (address.trim().length < 10) {
      toast.error('Address must be at least 10 characters long');
      return;
    }

    // Validate total amount
    if (!totalAmount || totalAmount <= 0) {
      toast.error('Invalid service price');
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`);
      
      // Validate date is in the future
      if (scheduledAt < new Date()) {
        toast.error('Please select a future date and time');
        setIsSubmitting(false);
        return;
      }
      
      const bookingData = {
        providerId: provider.id,
        serviceId: selectedServiceId,
        scheduledAt: scheduledAt.toISOString(),
        totalAmount: Number(totalAmount),
        address: address.trim(),
        ...(requirements?.trim() && { requirements: requirements.trim() }),
      };
      
      console.log('Creating booking with data:', bookingData);
      
      await createBooking.mutateAsync(bookingData);

      toast.success('Booking created successfully!');
      onClose();
      // Reset form
      setSelectedServiceId('');
      setSelectedDate('');
      setSelectedTime('');
      setAddress('');
      setRequirements('');
    } catch (error: any) {
      console.error('Booking creation error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to create booking';
      
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        // Show all validation errors
        const errors = error.response.data.details.map((d: any) => {
          const field = d.path?.replace('body.', '') || 'field';
          return `${field}: ${d.message}`;
        });
        errorMessage = errors.join('\n');
        toast.error(errorMessage, { duration: 5000 });
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Book Service with {provider.businessName}</DialogTitle>
          <DialogDescription className="text-gray-600">
            Select a service and schedule your appointment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Service <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {provider.services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedServiceId === service.id
                      ? 'border-[#ff6b35] bg-orange-50 text-gray-900'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-900'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Service Image */}
                    {service.imageUrl && (
                      <div className="flex-shrink-0">
                        <ImageWithFallback
                          src={service.imageUrl}
                          alt={service.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-base">{service.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{service.description || 'Professional service'}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {service.durationMin} min
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-gray-900">₹{Number(service.price).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Select Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today}
              required
              className="w-full bg-white text-gray-900 border-gray-300"
            />
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Select Time <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`p-2 border rounded-lg text-sm transition-colors font-medium ${
                    selectedTime === time
                      ? 'border-[#ff6b35] bg-orange-50 text-[#ff6b35]'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Service Address <span className="text-red-500">*</span>
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={3}
              placeholder="Enter complete address where service is needed"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35]"
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Requirements (Optional)
            </label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={3}
              placeholder="Any special instructions or requirements"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35]"
            />
          </div>

          {/* Customer Info Display */}
          {user && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Your Contact Information</h3>
              <div className="space-y-1 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                </div>
                {user.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Total Amount */}
          {selectedService && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Total Amount:</span>
                <span className="text-2xl font-bold text-[#ff6b35]">₹{totalAmount.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Payment will be processed after service completion</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#ff6b35] hover:bg-[#ff5722]"
              disabled={isSubmitting || !selectedServiceId || !selectedDate || !selectedTime || !address}
            >
              {isSubmitting ? 'Creating Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

