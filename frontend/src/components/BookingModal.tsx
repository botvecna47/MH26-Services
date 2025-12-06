import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useUser } from '../context/UserContext';
import { useCreateBooking } from '../api/bookings';
import { authApi } from '../api/auth';
import { validateAddress } from '../utils/addressValidation';
import { toast } from 'sonner';

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
  const [addressFields, setAddressFields] = useState({
    houseNo: '',
    area: '',
    pincode: ''
  });
  const [requirements, setRequirements] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneOTP, setPhoneOTP] = useState('');
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper validation
  const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Derived state
  const selectedService = provider.services.find(s => s.id === selectedServiceId);
  const totalAmount = selectedService?.price || 0;

  // Mock time slots
  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  // Construct full address for submission
  const fullAddress = `${addressFields.houseNo}, ${addressFields.area}, Nanded - ${addressFields.pincode}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to book a service');
      return;
    }

    if (!selectedServiceId || !selectedDate || !selectedTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!addressFields.houseNo || !addressFields.area || !addressFields.pincode) {
      toast.error('Please fill in all address fields');
      return;
    }

    if (addressFields.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    // Validate serviceId is a valid UUID
    if (!isValidUUID(selectedServiceId)) {
      console.error('Invalid serviceId format:', selectedServiceId);
      toast.error('Invalid service selected. Please select a service again.');
      return;
    }

    // Validate providerId is a valid UUID
    if (!isValidUUID(provider.id)) {
      console.error('Invalid providerId format:', provider.id);
      toast.error('Invalid provider information. Please refresh the page.');
      return;
    }

    // Check if phone is verified
    if (user?.phone && !phoneVerified && !showOTPInput) {
      setShowOTPInput(true);
      toast.info('Please verify your phone number to continue');
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
        totalAmount: totalAmount,
        address: fullAddress,
        city: 'Nanded',
        pincode: addressFields.pincode,
        ...(requirements?.trim() && { requirements: requirements.trim() }),
      };
      
      await createBooking.mutateAsync(bookingData);

      toast.success('Booking created successfully!');
      onClose();
      // Reset form
      setSelectedServiceId('');
      setSelectedDate('');
      setSelectedTime('');
      setAddressFields({ houseNo: '', area: '', pincode: '' });
      setRequirements('');
    } catch (error: any) {
      console.error('Booking creation error:', error);
      toast.error(error.response?.data?.error || 'Failed to create booking');
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
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Service Address
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Flat / House No / Building <span className="text-red-500">*</span></label>
                <Input
                  value={addressFields.houseNo}
                  onChange={(e) => setAddressFields(prev => ({ ...prev, houseNo: e.target.value }))}
                  placeholder="e.g., Flat 101, Sai Residency"
                  className="bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Area / Colony <span className="text-red-500">*</span></label>
                <Input
                  value={addressFields.area}
                  onChange={(e) => setAddressFields(prev => ({ ...prev, area: e.target.value }))}
                  placeholder="e.g., Shivaji Nagar"
                  className="bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">City</label>
                  <Input
                    value="Nanded"
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Pincode <span className="text-red-500">*</span></label>
                  <Input
                    value={addressFields.pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setAddressFields(prev => ({ ...prev, pincode: val }));
                    }}
                    placeholder="43160_"
                    className="bg-white"
                  />
                </div>
              </div>
            </div>
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

          {/* Total Amount */}
          {selectedService && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Total Amount:</span>
                <span className="text-2xl font-bold text-[#ff6b35]">₹{Number(totalAmount).toFixed(2)}</span>
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
              disabled={isSubmitting || !selectedServiceId || !selectedDate || !selectedTime || !addressFields.houseNo || !addressFields.area || !addressFields.pincode}
            >
              {isSubmitting ? 'Creating Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
