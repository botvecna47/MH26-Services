import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Button } from './ui/button';
import { AlertTriangle, Send, LogOut, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { axiosClient } from '../api/axiosClient';
import { toast } from 'sonner';
import { useMyAppeals } from '../api/appeals';

// 30 days in milliseconds
const BAN_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calculateTimeLeft(bannedAt: string | undefined): CountdownTime {
  if (!bannedAt) {
    return { days: 30, hours: 0, minutes: 0, seconds: 0, expired: false };
  }
  
  const banDate = new Date(bannedAt).getTime();
  const expiryDate = banDate + BAN_DURATION_MS;
  const now = Date.now();
  const remaining = expiryDate - now;
  
  if (remaining <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds, expired: false };
}

export default function BannedPage() {
  const { user, setUser } = useUser();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingAppeal, setExistingAppeal] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<CountdownTime>(() => calculateTimeLeft(user?.bannedAt));
  
  // Fetch existing appeals
  const { data: myAppeals, isLoading: isLoadingAppeals } = useMyAppeals();

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(user?.bannedAt));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [user?.bannedAt]);

  useEffect(() => {
    if (myAppeals && myAppeals.length > 0) {
      const pending = myAppeals.find((a: any) => a.status === 'PENDING' || a.status === 'UNDER_REVIEW');
      if (pending) {
        setExistingAppeal(pending);
      }
    }
  }, [myAppeals]);

  if (isLoadingAppeals) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    setIsSubmitting(true);
    try {
      await axiosClient.post('/appeals', {
        type: 'UNBAN_REQUEST',
        reason,
        details
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
      setIsSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    window.location.href = '/auth';
  };

  // Format countdown display
  const formatNumber = (n: number) => n.toString().padStart(2, '0');

  if (existingAppeal) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appeal Under Review</h1>
            <p className="text-gray-500 mt-2">
              We have received your appeal. Our team is reviewing your case. 
              You will be notified via email once a decision has been made.
            </p>
          </div>
          
          {/* Countdown Timer for Appeal Under Review */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center justify-center gap-2 text-amber-700 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Time remaining before data deletion</span>
            </div>
            <div className="flex justify-center gap-2 text-2xl font-mono font-bold text-amber-800">
              <span>{formatNumber(timeLeft.days)}d</span>
              <span>:</span>
              <span>{formatNumber(timeLeft.hours)}h</span>
              <span>:</span>
              <span>{formatNumber(timeLeft.minutes)}m</span>
              <span>:</span>
              <span>{formatNumber(timeLeft.seconds)}s</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Account Suspended</h1>
            <p className="text-gray-500 mt-2 text-lg">
              Your account has been suspended due to a violation of our Terms of Service.
            </p>
          </div>
        </div>

        {/* Critical: Countdown Timer */}
        <div className="bg-red-600 text-white rounded-xl p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trash2 className="w-5 h-5 animate-pulse" />
            <span className="font-semibold">Account Deletion Countdown</span>
          </div>
          {timeLeft.expired ? (
            <div className="text-xl font-bold">Account scheduled for deletion</div>
          ) : (
            <>
              <div className="flex justify-center gap-1 text-3xl font-mono font-bold">
                <div className="bg-red-700 px-3 py-2 rounded">
                  <div>{formatNumber(timeLeft.days)}</div>
                  <div className="text-xs font-normal mt-1">DAYS</div>
                </div>
                <span className="self-center">:</span>
                <div className="bg-red-700 px-3 py-2 rounded">
                  <div>{formatNumber(timeLeft.hours)}</div>
                  <div className="text-xs font-normal mt-1">HRS</div>
                </div>
                <span className="self-center">:</span>
                <div className="bg-red-700 px-3 py-2 rounded">
                  <div>{formatNumber(timeLeft.minutes)}</div>
                  <div className="text-xs font-normal mt-1">MIN</div>
                </div>
                <span className="self-center">:</span>
                <div className="bg-red-700 px-3 py-2 rounded">
                  <div>{formatNumber(timeLeft.seconds)}</div>
                  <div className="text-xs font-normal mt-1">SEC</div>
                </div>
              </div>
              <p className="text-red-100 text-sm mt-3">
                Your account and all data will be permanently deleted after 30 days
              </p>
            </>
          )}
        </div>

        {/* Ban Reason Display */}
        {user?.banReason && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Reason for Suspension
            </h3>
            <p className="text-red-700">{user.banReason}</p>
          </div>
        )}

        {/* Appeal Form */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Submit an Appeal (Act Now!)</h2>
          <form onSubmit={handleAppealSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Appeal</label>
              <select 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white"
                required
              >
                <option value="">Select a reason...</option>
                <option value="Mistake">I believe this is a mistake</option>
                <option value="Compromised">My account was compromised</option>
                <option value="Apology">I apologize and will follow rules</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
              <textarea 
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                placeholder="Please explain why your account should be reinstated..."
                required
              ></textarea>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
            >
              {isSubmitting ? 'Submitting...' : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Appeal Before Time Runs Out
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="text-center">
          <Button variant="ghost" onClick={logout} className="text-gray-500 hover:text-gray-700">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
