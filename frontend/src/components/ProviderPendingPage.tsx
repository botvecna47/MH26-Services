import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { 
  Clock, Mail, CheckCircle2, Phone, ArrowLeft,
  FileCheck, Shield, XCircle, RefreshCw, AlertTriangle, Loader2, Send, LogOut
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { toast } from 'sonner';
import { useMyAppeals } from '../api/appeals';

interface ApplicationStatus {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rejectionReason?: string;
  businessName?: string;
  providerId?: string;
}

export default function ProviderPendingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);
  const [checked, setChecked] = useState(false);
  
  // Appeal form state
  const [appealReason, setAppealReason] = useState('');
  const [appealDetails, setAppealDetails] = useState('');
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  const [existingAppeal, setExistingAppeal] = useState<any>(null);
  
  // Fetch user's appeals
  const { data: myAppeals, isLoading: isLoadingAppeals } = useMyAppeals();
  
  useEffect(() => {
    if (myAppeals && myAppeals.length > 0) {
      const pending = myAppeals.find((a: any) => 
        (a.type === 'SUSPENSION_APPEAL' || a.type === 'REJECTION_APPEAL') && 
        (a.status === 'PENDING' || a.status === 'UNDER_REVIEW')
      );
      if (pending) {
        setExistingAppeal(pending);
      }
    }
  }, [myAppeals]);

  const handleCheckStatus = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axiosClient.get(`/providers/status/${encodeURIComponent(email)}`);
      setApplicationStatus(response.data);
      setChecked(true);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('No application found for this email');
      } else {
        toast.error(error.response?.data?.message || 'Failed to check status');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReapply = () => {
    // Navigate back to onboarding to re-apply
    navigate('/provider/onboarding');
  };
  
  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealReason) {
      toast.error('Please select a reason for your appeal');
      return;
    }
    
    setIsSubmittingAppeal(true);
    try {
      await axiosClient.post('/appeals', {
        type: 'SUSPENSION_APPEAL',
        reason: appealReason,
        details: appealDetails,
        providerId: applicationStatus?.providerId
      });
      setExistingAppeal({ status: 'PENDING' });
      toast.success('Appeal submitted successfully');
    } catch (error: any) {
      if (error?.response?.data?.error === 'You already have a pending appeal') {
        setExistingAppeal({ status: 'PENDING' });
        toast.info('You already have a pending appeal under review.');
      } else {
        toast.error('Failed to submit appeal');
      }
    } finally {
      setIsSubmittingAppeal(false);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/auth';
  };

  const getStatusDisplay = () => {
    if (!applicationStatus) return null;

    switch (applicationStatus.status) {
      case 'APPROVED':
        return (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <h3 className="text-xl font-bold text-green-800">Application Approved!</h3>
            </div>
            <p className="text-green-700 mb-4">
              Congratulations! Your provider application for <strong>{applicationStatus.businessName}</strong> has been approved.
            </p>
            <Button 
              onClick={() => navigate('/auth')} 
              className="bg-green-600 hover:bg-green-700"
            >
              Login to Your Dashboard
            </Button>
          </div>
        );

      case 'REJECTED':
        return (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <h3 className="text-xl font-bold text-red-800">Application Rejected</h3>
            </div>
            <p className="text-red-700 mb-2">
              Unfortunately, your application for <strong>{applicationStatus.businessName}</strong> was not approved.
            </p>
            {applicationStatus.rejectionReason && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-4 mt-4 mb-4">
                <p className="text-sm font-semibold text-red-800 mb-1">Reason for Rejection:</p>
                <p className="text-red-700">{applicationStatus.rejectionReason}</p>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <Button 
                onClick={handleReapply} 
                className="bg-orange-500 hover:bg-orange-600"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Apply Again
              </Button>
              <Button 
                onClick={() => navigate('/auth')} 
                variant="outline"
              >
                Back to Login
              </Button>
            </div>
          </div>
        );

      case 'SUSPENDED':
        // If there's an existing appeal, show "under review" message
        if (existingAppeal) {
          return (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-8 w-8 text-blue-600" />
                <h3 className="text-xl font-bold text-blue-800">Appeal Under Review</h3>
              </div>
              <p className="text-blue-700 mb-4">
                We have received your appeal. Our team is reviewing your case and you will be notified via email once a decision has been made.
              </p>
              <Button variant="outline" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          );
        }
        
        // Show suspension message with appeal form
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <h3 className="text-xl font-bold text-yellow-800">Account Suspended</h3>
            </div>
            <p className="text-yellow-700 mb-4">
              Your provider account for <strong>{applicationStatus.businessName}</strong> has been suspended due to a policy violation.
            </p>
            
            {/* Appeal Form */}
            <div className="bg-white border border-yellow-300 rounded-xl p-6 mt-4">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Send className="h-5 w-5 text-yellow-600" />
                Submit an Appeal
              </h4>
              <form onSubmit={handleAppealSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Appeal</label>
                  <select 
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none bg-white"
                    required
                  >
                    <option value="">Select a reason...</option>
                    <option value="Mistake">I believe this is a mistake</option>
                    <option value="Misunderstanding">There was a misunderstanding</option>
                    <option value="Apology">I apologize and will follow platform rules</option>
                    <option value="Compromised">My account was compromised</option>
                    <option value="Other">Other reason</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
                  <textarea 
                    value={appealDetails}
                    onChange={(e) => setAppealDetails(e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-none"
                    placeholder="Please explain why your account should be reinstated..."
                    required
                  ></textarea>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmittingAppeal} 
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-6"
                >
                  {isSubmittingAppeal ? 'Submitting...' : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Appeal
                    </>
                  )}
                </Button>
              </form>
            </div>
            
            <div className="text-center mt-4">
              <Button variant="ghost" onClick={logout} className="text-gray-500 hover:text-gray-700">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        );

      case 'PENDING':
      default:
        return null; // Show default pending UI
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Check Status Card */}
        {!checked && (
          <Card className="shadow-xl border border-orange-200 mb-6">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg text-center py-6">
              <CardTitle className="text-xl">Check Your Application Status</CardTitle>
              <CardDescription className="text-orange-100 mt-1">
                Enter your email to see your current application status
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckStatus()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleCheckStatus}
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check Status'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Display */}
        {checked && applicationStatus && getStatusDisplay()}
        
        {/* Main Card - Show for PENDING status or default */}
        {(!checked || applicationStatus?.status === 'PENDING') && (
          <Card className="shadow-xl border border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mx-auto mb-4">
                <Clock className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Application Under Review</CardTitle>
              <CardDescription className="text-orange-100 text-base mt-2">
                Your provider application is being reviewed by our team
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8">
              {/* Status Timeline */}
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 border-b border-gray-100 pb-4">
                    <h3 className="font-semibold text-gray-900">Application Received</h3>
                    <p className="text-sm text-gray-500">Your details have been submitted successfully</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center animate-pulse">
                    <FileCheck className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1 border-b border-gray-100 pb-4">
                    <h3 className="font-semibold text-gray-900">Under Review</h3>
                    <p className="text-sm text-gray-500">Our admin team is verifying your documents</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-400">Approval Pending</h3>
                    <p className="text-sm text-gray-400">You'll be notified once approved</p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  What happens next?
                </h4>
                <ul className="space-y-2 text-sm text-orange-700">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span>Our team will review your application within <strong>24-48 hours</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span>You'll receive an <strong>email notification</strong> once verified</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span>After approval, you can <strong>log in and start accepting bookings</strong></span>
                  </li>
                </ul>
              </div>

              {/* Contact Support */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Need Help?
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  If you have any questions about your application, feel free to contact our support team.
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <a href="mailto:support@mh26services.com" className="text-orange-600 hover:underline flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    support@mh26services.com
                  </a>
                </div>
              </div>

              {/* Back to Login Button */}
              <Button 
                onClick={() => navigate('/auth')} 
                variant="outline"
                className="w-full border-2 border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer Text */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Thank you for choosing MH26 Services! 🙏
        </p>
      </div>
    </div>
  );
}
