import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Button } from './ui/button';
import { AlertTriangle, Send, LogOut, CheckCircle, Clock, Home } from 'lucide-react';
import { axiosClient } from '../api/axiosClient';
import { toast } from 'sonner';
import { useMyAppeals } from '../api/appeals';
import { useNavigate } from 'react-router-dom';

/**
 * Provider Suspended Page
 * 
 * This page is shown when a Provider's account is SUSPENDED (provider-level).
 * Unlike the Ban page (user-level), suspension:
 * - Only affects provider functionality
 * - No automatic account deletion countdown
 * - Provider can still use customer features if applicable
 * - Uses SUSPENSION_APPEAL type for appeals
 */
export default function ProviderSuspendedPage() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingAppeal, setExistingAppeal] = useState<any>(null);
  
  // Fetch existing appeals
  const { data: myAppeals, isLoading: isLoadingAppeals } = useMyAppeals();

  // Check for existing suspension appeal
  useEffect(() => {
    if (myAppeals?.data) {
      const suspensionAppeal = myAppeals.data.find(
        (appeal: any) => appeal.type === 'SUSPENSION_APPEAL' && appeal.status === 'PENDING'
      );
      if (suspensionAppeal) {
        setExistingAppeal(suspensionAppeal);
      }
    }
  }, [myAppeals]);

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      toast.error('Please select a reason for your appeal');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await axiosClient.post('/appeals', {
        type: 'SUSPENSION_APPEAL',
        reason,
        details,
        providerId: user?.provider?.id,
      });
      
      setExistingAppeal({ status: 'PENDING' });
      toast.success('Appeal submitted successfully! We will review your case shortly.');
    } catch (error: any) {
      if (error?.response?.data?.error === 'You already have a pending appeal') {
        setExistingAppeal({ status: 'PENDING' });
        toast.info('You already have a pending appeal under review.');
      } else {
        toast.error(error?.response?.data?.error || 'Failed to submit appeal');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    window.location.href = '/auth';
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white border border-orange-200 rounded-2xl shadow-xl p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-10 h-10 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Provider Account Suspended</h1>
            <p className="text-gray-500 mt-2 text-lg">
              Your provider account has been temporarily suspended.
            </p>
          </div>
        </div>

        {/* Difference Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-semibold text-blue-800">What does this mean?</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Your services are hidden from the marketplace</li>
            <li>• You cannot receive new bookings</li>
            <li>• Existing bookings may be affected</li>
            <li>• You can still browse the platform as a visitor</li>
          </ul>
        </div>

        {/* Appeal Status or Form */}
        {isLoadingAppeals ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Checking appeal status...</p>
          </div>
        ) : existingAppeal ? (
          // Existing Appeal Status
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center space-y-3">
            <Clock className="w-12 h-12 text-yellow-600 mx-auto" />
            <h3 className="text-lg font-semibold text-yellow-800">Appeal Under Review</h3>
            <p className="text-yellow-700">
              Your appeal has been submitted and is being reviewed by our team.
              We will notify you once a decision has been made.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-yellow-600">
              <CheckCircle className="w-4 h-4" />
              <span>Status: {existingAppeal.status}</span>
            </div>
          </div>
        ) : (
          // Appeal Form
          <form onSubmit={handleAppealSubmit} className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <h3 className="font-semibold text-orange-800 mb-3">Submit an Appeal</h3>
              <p className="text-sm text-orange-700 mb-4">
                If you believe this suspension was made in error, please submit an appeal below.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Appeal *
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value="">Select a reason...</option>
                    <option value="Mistake">I believe this is a mistake</option>
                    <option value="Misunderstanding">There was a misunderstanding</option>
                    <option value="Issue Resolved">The issue has been resolved</option>
                    <option value="Compliance">I will comply with platform policies</option>
                    <option value="Other">Other reason</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Details
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Please provide any additional context that may help us review your appeal..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    rows={4}
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={isSubmitting || !reason}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Submit Appeal
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleGoHome}
            className="flex-1 border-gray-300"
          >
            <Home className="w-4 h-4 mr-2" />
            Browse Services
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>

        {/* Contact Info */}
        <p className="text-center text-sm text-gray-500">
          Need help? Contact us at{' '}
          <a href="mailto:support@mh26services.com" className="text-orange-600 hover:underline">
            support@mh26services.com
          </a>
        </p>
      </div>
    </div>
  );
}
