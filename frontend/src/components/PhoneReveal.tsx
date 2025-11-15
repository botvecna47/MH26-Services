import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, Eye, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface PhoneRevealProps {
  phone: string;
  providerName: string;
  providerId: string;
  phoneVisible?: boolean;
}

export default function PhoneReveal({ phone, providerName, providerId, phoneVisible = false }: PhoneRevealProps) {
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // If provider has hidden their phone number
  if (!phoneVisible && isAuthenticated) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Shield className="w-4 h-4" />
        <span>Provider phone number hidden</span>
      </div>
    );
  }

  // If user is not logged in
  if (!isAuthenticated) {
    return (
      <>
        <Button
          variant="outline"
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto"
        >
          <Lock className="w-4 h-4 mr-2" />
          Sign in to view phone number
        </Button>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Phone number access</DialogTitle>
              <DialogDescription>
                Sign in to view {providerName}'s contact information
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="text-sm text-orange-800">
                    <p className="mb-2"><strong>Why sign in?</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>We protect provider privacy and prevent spam</li>
                      <li>Verified users get better response rates</li>
                      <li>Track your inquiries and bookings</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => {
                    setShowModal(false);
                    navigate('/auth');
                  }}
                  className="w-full bg-[#ff6b35] hover:bg-[#ff5722]"
                >
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    navigate('/auth');
                  }}
                  className="w-full"
                >
                  Create Account
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500">
                Don't worry, it only takes a minute
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // User is logged in - show phone with reveal animation
  return (
    <div className="space-y-3">
      {!revealed ? (
        <Button
          onClick={() => {
            setRevealed(true);
            toast.success('Phone number revealed');
          }}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <Eye className="w-4 h-4 mr-2" />
          Click to reveal phone number
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-2"
        >
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span className="font-medium">{phone}</span>
          </a>
          
          <p className="text-xs text-gray-500">
            Tap to call directly from your device
          </p>
        </motion.div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>💡 Important:</strong> MH26 Services does not mediate calls or payments. All transactions are directly between you and the provider.
        </p>
      </div>
    </div>
  );
}
