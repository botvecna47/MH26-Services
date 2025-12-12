import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Loader2 } from 'lucide-react';
import { useInitiateCompletion, useVerifyCompletion } from '../api/bookings';
import { toast } from 'sonner';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  customerName: string;
  hasCompletionOtp: boolean; // If true, OTP already sent, just ask for code
}

export default function CompletionModal({ isOpen, onClose, bookingId, customerName, hasCompletionOtp }: CompletionModalProps) {
  const [step, setStep] = useState<'INIT' | 'VERIFY'>(hasCompletionOtp ? 'VERIFY' : 'INIT');
  const [otp, setOtp] = useState('');

  const initiateMutation = useInitiateCompletion();
  const verifyMutation = useVerifyCompletion();

  const handleInitiate = () => {
    initiateMutation.mutate(bookingId, {
        onSuccess: () => {
            toast.success('Verification code sent to customer');
            setStep('VERIFY');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to initiate completion');
        }
    });
  };

  const handleVerify = () => {
    if (!otp || otp.length !== 6) {
        toast.error('Please enter a valid 6-digit code');
        return;
    }

    verifyMutation.mutate({ id: bookingId, otp }, {
        onSuccess: () => {
            toast.success('Service marked as completed!');
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Verification failed');
        }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Service</DialogTitle>
          <DialogDescription>
             Verify service completion with the customer.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
            {step === 'INIT' ? (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        To mark this service as completed, we need to verify it with the customer. 
                        Click below to send a verification code to <strong>{customerName}</strong>.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Ask <strong>{customerName}</strong> for the 6-digit verification code sent to their app.
                    </p>
                    <div className="flex justify-center">
                        <Input 
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                            placeholder="123456"
                            className="text-center text-2xl tracking-widest w-48 h-12"
                            maxLength={6}
                        />
                    </div>
                </div>
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={initiateMutation.isPending || verifyMutation.isPending}>
            Cancel
          </Button>
          
          {step === 'INIT' ? (
              <Button onClick={handleInitiate} disabled={initiateMutation.isPending}>
                {initiateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Code
              </Button>
          ) : (
              <Button onClick={handleVerify} disabled={verifyMutation.isPending || otp.length !== 6}>
                {verifyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Complete
              </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
