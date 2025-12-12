import { X, UserPlus, Star, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { useUser } from '../context/UserContext';

interface PhoneRevealModalProps {
  providerName: string;
  onClose: () => void;
}

export default function PhoneRevealModal({ providerName, onClose }: PhoneRevealModalProps) {
  const { setUser } = useUser();

  const handleQuickJoin = () => {
    // Mock quick sign up
    setUser({
      id: '1',
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '+91-9876543210',
      role: 'CUSTOMER'
    });
    onClose();
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
            <UserPlus className="h-8 w-8 text-[#ff6b35]" />
          </div>
          <h2 className="text-gray-900 mb-2">Join MH26 Services</h2>
          <p className="text-gray-600">
            Sign up to view contact details for <span className="font-medium">{providerName}</span> and book services instantly
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

        {/* Quick Join Form */}
        <div className="space-y-3 mb-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
          />
          <input
            type="tel"
            placeholder="Enter your phone number"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
          />
        </div>

        <Button
          onClick={handleQuickJoin}
          className="w-full bg-[#ff6b35] hover:bg-[#ff5722] mb-3"
        >
          Join & View Contact Details
        </Button>

        <p className="text-xs text-center text-gray-500">
          By joining, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
