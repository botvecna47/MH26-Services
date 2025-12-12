import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { axiosClient } from '../api/axiosClient';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verifyEmail = async () => {
            try {
                await axiosClient.get(`/auth/verify-email?token=${token}`);
                setStatus('success');
        setMessage('Your email has been successfully verified! You can now close this tab or return to the dashboard.');

            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Failed to verify email. The link may be expired or invalid.');
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                {status === 'loading' && (
                    <div className="space-y-4">
                        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
                        <h2 className="text-xl font-bold text-gray-900">Verifying your email...</h2>
                        <p className="text-gray-500">Please wait while we verify your secure link.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
                        <p className="text-gray-600">{message}</p>
                        <div className="pt-6">
                            <Link to="/dashboard">
                                <Button className="w-full bg-green-600 hover:bg-green-700">Go to Dashboard</Button>
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
                        <p className="text-gray-600">{message}</p>
                        <div className="pt-6">
                            <Link to="/contact">
                                <Button variant="outline" className="w-full">Contact Support</Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
