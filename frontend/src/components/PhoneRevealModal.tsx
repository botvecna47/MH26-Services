import { X, LogIn, Star, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

interface PhoneRevealModalProps {
  providerName: string;
  onClose: () => void;
}

export default function PhoneRevealModal({ providerName, onClose }: PhoneRevealModalProps) {
  const navigate = useNavigate();

  const handleSignIn = () => {
    onClose();
    navigate('/auth');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative animate-in fade-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-8 w-8 text-[#ff6b35]" />
          </div>
          <h2 className="text-gray-900 text-xl font-semibold mb-2">Sign In Required</h2>
          <p className="text-gray-600">
            Please sign in to view contact details for <span className="font-medium">{providerName}</span>
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Verified Providers</p>
              <p className="text-xs text-gray-600">All providers are verified and rated</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Star className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Trusted Reviews</p>
              <p className="text-xs text-gray-600">Read authentic reviews from real customers</p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSignIn}
          className="w-full bg-[#ff6b35] hover:bg-[#ff5722] mb-3"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Sign In to Continue
        </Button>

        <p className="text-xs text-center text-gray-500">
          Don't have an account? You can create one on the sign in page.
        </p>
      </div>
    </div>
  );
}
