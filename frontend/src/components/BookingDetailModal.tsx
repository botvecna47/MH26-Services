import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Booking, useCancelBooking } from '../api/bookings';
import { formatDistanceToNow, format } from 'date-fns';
import { Button } from './ui/button';
import { MapPin, Phone, Mail, Calendar, Clock, DollarSign, CheckCircle, User, X, XCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useState } from 'react';
import CompletionModal from './CompletionModal';
import ReviewModal from './ReviewModal';
import { toast } from 'sonner';


interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export default function BookingDetailModal({ isOpen, onClose, booking }: BookingDetailModalProps) {
  const { user, isProvider } = useUser();
  const isCustomer = user?.role === 'CUSTOMER';
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const cancelBookingMutation = useCancelBooking();

  if (!booking) return null;

  const handleCancelBooking = async () => {
    const reason = prompt('Please provide a reason for cancellation (optional):');
    try {
      await cancelBookingMutation.mutateAsync({ id: booking.id, reason: reason || undefined });
      toast.success('Booking cancelled successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'CONFIRMED': return 'text-blue-600 bg-blue-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const completionOtp = (booking as any).completionOtp;
  const canCancel = (booking.status === 'PENDING' || booking.status === 'CONFIRMED');

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-white border-0 shadow-2xl p-0 gap-0 overflow-hidden [&>button]:hidden">
          <DialogHeader className="p-6 bg-gradient-to-r from-[#ff6b35] to-[#ff8f6b] text-white">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-8">
                <DialogTitle className="text-xl font-bold text-white tracking-tight">Booking Details</DialogTitle>
                <p className="text-white/80 text-xs mt-1 font-mono">ID: {booking.id.slice(0, 8)}</p>
              </div>
              
              {/* Custom Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </button>

              <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-white/20 mt-1 ${
                booking.status === 'COMPLETED' ? 'bg-green-500 text-white' :
                booking.status === 'CONFIRMED' ? 'bg-blue-500 text-white' :
                booking.status === 'PENDING' ? 'bg-yellow-400 text-yellow-900' :
                'bg-red-500 text-white'
              }`}>
                {booking.status}
              </span>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6 bg-white overflow-y-auto max-h-[80vh]">
            
            {/* Service Title */}
            <div>
                 <h3 className="font-bold text-xl text-gray-900 leading-tight">{booking.service?.title}</h3>
                 <p className="text-sm text-gray-500 mt-1">Service Request</p>
            </div>

            {/* OTP Section (Prominent - Customer Only) */}
            {isCustomer && booking.status === 'CONFIRMED' && completionOtp && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-5 text-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <CheckCircle className="w-24 h-24 text-green-600" />
                </div>
                <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-1">Completion Code</p>
                <p className="text-3xl font-black tracking-[0.2em] text-green-800 font-mono my-2 drop-shadow-sm">{completionOtp}</p>
                <p className="text-xs text-green-600 bg-white/60 inline-block px-3 py-1 rounded-full">Share with provider after job is done</p>
              </div>
            )}

            {/* Provider Info Card */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-4">
              <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm shrink-0">
                <User className="h-6 w-6 text-[#ff6b35]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase font-semibold">Provider</p>
                <p className="font-bold text-gray-900 truncate">{booking.provider?.businessName}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-0.5">
                    <MapPin className="h-3 w-3 text-[#ff6b35]" />
                    <span className="truncate">{booking.provider?.city}</span>
                </div>
              </div>
            </div>

            {/* Schedule & Cost Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50/50 border border-orange-100 p-3 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Schedule</p>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-[#ff6b35]" />
                        <span className="text-sm font-semibold text-gray-900">
                            {booking.scheduledAt ? format(new Date(booking.scheduledAt), 'MMM d, yyyy') : 'Pending'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-[#ff6b35]" />
                        <span className="text-sm text-gray-700">
                            {booking.scheduledAt ? format(new Date(booking.scheduledAt), 'h:mm a') : '--:--'}
                        </span>
                    </div>
                </div>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex flex-col justify-center">
                 <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Amount</p>
                 <div className="flex items-baseline gap-1">
                    <span className="text-xs text-gray-500 font-medium">₹</span>
                    <span className="text-2xl font-bold text-gray-900">{booking.totalAmount}</span>
                 </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              {/* Action Buttons */}
              {(isProvider || user?.role === 'ADMIN') && booking.status === 'CONFIRMED' && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 shadow-md text-md py-6 rounded-xl transition-all hover:scale-[1.02]"
                  onClick={() => setShowCompletionModal(true)}
                >
                  {completionOtp ? 'Verify Completion Code' : 'Mark Job Complete'}
                </Button>
              )}

              {isCustomer && booking.status === 'COMPLETED' && !booking.review && (
                <Button
                  className="w-full bg-amber-400 hover:bg-amber-500 text-black shadow-md text-md py-6 rounded-xl transition-all hover:scale-[1.02]"
                  onClick={() => setShowReviewModal(true)}
                >
                  Leave a Review
                </Button>
              )}

              {/* Cancel Button for Customers */}
              {isCustomer && canCancel && (
                <Button
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 py-5 rounded-xl"
                  onClick={handleCancelBooking}
                  disabled={cancelBookingMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {cancelBookingMutation.isPending ? 'Cancelling...' : 'Cancel Booking'}
                </Button>
              )}

              <div className="flex gap-3 mt-2">
                <Button variant="outline" className="flex-1 rounded-xl border-gray-200" onClick={onClose}>Close</Button>
                {booking.status === 'COMPLETED' && (
                  <Button className="flex-1 bg-gray-900 hover:bg-black rounded-xl text-white">Download Invoice</Button>
                )}
              </div>
            </div>

          </div>
        </DialogContent>
      </Dialog>

      {showCompletionModal && (
        <CompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          bookingId={booking.id}
          customerName={booking.user?.name || 'Customer'}
          hasCompletionOtp={!!completionOtp}
        />
      )}

      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          bookingId={booking.id}
          providerId={booking.providerId}
          providerName={booking.provider?.businessName || 'Provider'}
        />
      )}
    </>
  );
}
