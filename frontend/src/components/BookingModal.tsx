import { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useCreateBooking } from '../api/bookings';
import { toast } from 'sonner';
import { useUser } from '../context/UserContext';
import { format } from 'date-fns';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  serviceId: string;
  serviceName: string;
  price: number;
  providerName: string;
}

interface BookingFormData {
  date: string;
  time: string;
  address: string;
  city: string;
  pincode: string;
  requirements: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  providerId,
  serviceId,
  serviceName,
  price,
  providerName,
}: BookingModalProps) {
  const { user } = useUser();
  const createBookingMutation = useCreateBooking();

  const [formData, setFormData] = useState<BookingFormData>({
    date: '',
    time: '',
    address: '',
    city: user?.city || 'Nanded', // Pre-fill city if available or default
    pincode: '',
    requirements: '',
  });

  const [errors, setErrors] = useState<Partial<BookingFormData>>({});

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setFormData({
        date: '',
        time: '',
        address: user?.address || '',
        city: user?.city || 'Nanded',
        pincode: '',
        requirements: '',
      });
      setErrors({});
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Partial<BookingFormData> = {};

    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';

    // Validate date is today or tomorrow only
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);
      
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      } else if (selectedDate > tomorrow) {
        newErrors.date = 'Booking available only for today or tomorrow';
      }
    }

    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Invalid pincode format (6 digits)';
    }

    // Sanitize requirements (basic)
    if (formData.requirements.length > 500) {
      newErrors.requirements = 'Requirements too long (max 500 chars)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // Combine date and time to ISO string
    const scheduledAt = new Date(`${formData.date}T${formData.time}`).toISOString();

    try {
      await createBookingMutation.mutateAsync({
        providerId,
        serviceId,
        scheduledAt,
        totalAmount: price, // Initial implementation: base price. Could be dynamic later.
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        requirements: formData.requirements,
      });

      toast.success('Booking request sent successfully!');
      onClose();
    } catch (error: any) {
      console.error('Booking failed:', error);
      toast.error(error?.response?.data?.message || 'Failed to create booking');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof BookingFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#ff6b35] to-[#ff8f6b] p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">Book Service</h2>
            <p className="text-white/90 text-sm mt-1">with {providerName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Service Summary */}
        <div className="bg-orange-50 px-6 py-3 border-b border-orange-100 flex justify-between items-center text-sm">
          <span className="font-medium text-gray-700">{serviceName}</span>
          <span className="font-bold text-[#ff6b35]">₹{price}</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none transition-all ${errors.date ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  min={new Date().toISOString().split('T')[0]} // Min today
                  max={new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Max tomorrow
                />
              </div>
              {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preferred Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  min={formData.date === format(new Date(), 'yyyy-MM-dd') 
                    ? format(new Date(Date.now() + 30 * 60 * 1000), 'HH:mm') 
                    : '08:00'}
                  max="21:00"
                  className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none transition-all bg-white ${errors.time ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                />
              </div>
              {errors.time && <p className="text-xs text-red-500">{errors.time}</p>}
              <p className="text-xs text-gray-500">Service hours: 8:00 AM - 9:00 PM</p>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Service Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House no., Street, Area"
                className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none transition-all ${errors.address ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              />
            </div>
            {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none transition-all ${errors.city ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              />
              {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                maxLength={6}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none transition-all ${errors.pincode ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              />
              {errors.pincode && <p className="text-xs text-red-500">{errors.pincode}</p>}
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Special Requirements (Optional)</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows={3}
              placeholder="Describe specific needs or issues..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none transition-all resize-none ${errors.requirements ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            {errors.requirements && <p className="text-xs text-red-500">{errors.requirements}</p>}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#ff6b35] hover:bg-[#ff5722]"
              disabled={createBookingMutation.isPending}
            >
              {createBookingMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
