import { useState } from 'react';
import { X, Calendar, Clock, MapPin, DollarSign, User, Phone, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
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

    setIsSubmitting(true);
    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`);
      
      await createBooking.mutateAsync({
        providerId: provider.id,
        serviceId: selectedServiceId,
        scheduledAt: scheduledAt.toISOString(),
        totalAmount,
        address,
        requirements: requirements || undefined,
      });

      toast.success('Booking created successfully!');
      onClose();
      // Reset form
      setSelectedServiceId('');
      setSelectedDate('');
      setSelectedTime('');
      setAddress('');
      setRequirements('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Book Service with {provider.businessName}</DialogTitle>
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
                      ? 'border-[#ff6b35] bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{service.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{service.description || 'Professional service'}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {service.durationMin} min
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">₹{Number(service.price).toFixed(2)}</p>
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
              className="w-full"
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
                  className={`p-2 border rounded-lg text-sm transition-colors ${
                    selectedTime === time
                      ? 'border-[#ff6b35] bg-orange-50 text-[#ff6b35]'
                      : 'border-gray-200 hover:border-gray-300'
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
            />
          </div>

          {/* Customer Info Display */}
          {user && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Your Contact Information</h3>
              <div className="space-y-1 text-sm text-gray-600">
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

