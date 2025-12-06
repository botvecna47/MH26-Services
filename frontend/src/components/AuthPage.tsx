import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Building2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { axiosClient } from '../api/axiosClient';

type AuthMode = 'signin' | 'signup' | 'join' | 'forgot-password';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, isLoading: authLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    businessName: '',
    otp: '',
    newPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requiresOTP, setRequiresOTP] = useState(false); // For Registration
  const [otpSent, setOtpSent] = useState(false); // For Registration

  // Specific state for Forgot Password flow
  const [resetStep, setResetStep] = useState<1 | 2>(1); // 1: Email, 2: OTP & New Password

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (mode === 'signin') {
        if (!formData.password) {
        newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
        }
    }

    if (mode === 'signup' || mode === 'join') {
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
        newErrors.phone = 'Phone number must be 10 digits starting with 6-9';
      } else if (formData.phone.length !== 10) {
        newErrors.phone = 'Phone number must be exactly 10 digits';
      }
      if (requiresOTP && !formData.otp) {
        newErrors.otp = 'OTP is required';
      } else if (requiresOTP && formData.otp.length !== 6) {
        newErrors.otp = 'OTP must be 6 digits';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (mode === 'join') {
      if (!formData.businessName) {
        newErrors.businessName = 'Business name is required';
      }
    }

    if (mode === 'forgot-password' && resetStep === 2) {
        if (!formData.otp) {
            newErrors.otp = 'OTP is required';
        } else if (formData.otp.length !== 6) {
            newErrors.otp = 'OTP must be 6 digits';
        }
        if (!formData.newPassword) {
            newErrors.newPassword = 'New Password is required';
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
        }
        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signin') {
        // Sign In
        await login(formData.email, formData.password);
      } else if (mode === 'signup' || mode === 'join') {
        // Sign Up
        try {
          if (requiresOTP && otpSent) {
            // Verify OTP
            try {
              const response = await axiosClient.post('/auth/verify-registration-otp', {
                email: formData.email,
                otp: formData.otp,
              });

              const { user: userData, tokens } = response.data;

              localStorage.setItem('accessToken', tokens.accessToken);
              localStorage.setItem('refreshToken', tokens.refreshToken);
              localStorage.setItem('user', JSON.stringify(userData));
              window.dispatchEvent(new Event('userUpdated'));

              toast.success('Account created successfully!');
              
              if (userData.role === 'PROVIDER') {
                navigate('/provider-onboarding');
              } else {
                navigate('/dashboard');
              }
            } catch (error: any) {
              toast.error(error.response?.data?.error || 'Invalid OTP. Please try again.');
              throw error;
            }
          } else {
            // Send OTP
            const result = await register({
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              password: formData.password,
              role: mode === 'join' ? 'PROVIDER' : 'CUSTOMER',
            });
            
            if (result?.requiresOTP) {
              setRequiresOTP(true);
              setOtpSent(true);
              toast.success('OTP sent to your email address. Please check your inbox.');
              return;
            }
          }
        } catch (error: any) {
          if (error.response?.data?.requiresOTP) {
            setRequiresOTP(true);
            setOtpSent(true);
            toast.success('OTP sent to your email address. Please check your inbox.');
            return;
          }
          throw error;
        }
      } else if (mode === 'forgot-password') {
          // Forgot Password Flow
          if (resetStep === 1) {
              // Send OTP
              try {
                  await axiosClient.post('/auth/forgot-password', { email: formData.email });
                  setResetStep(2);
                  toast.success('OTP sent to your email address.');
              } catch (error: any) {
                  toast.error(error.response?.data?.error || 'Failed to send OTP.');
              }
          } else {
              // Verify OTP and Reset
              try {
                  await axiosClient.post('/auth/reset-password', {
                      email: formData.email,
                      otp: formData.otp,
                      newPassword: formData.newPassword
                  });
                  toast.success('Password reset successful! Please login.');
                  setMode('signin');
                  setResetStep(1);
                  setFormData(prev => ({ ...prev, password: '', otp: '', newPassword: '', confirmPassword: '' }));
              } catch (error: any) {
                  toast.error(error.response?.data?.error || 'Failed to reset password.');
              }
          }
      }
    } catch (error: any) {
      if (!error.response && mode !== 'forgot-password') {
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Removed blurred blobs for cleaner solid UI */}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <motion.div
            className="space-y-6 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="w-16 h-16 bg-[#ff6b35] rounded-2xl flex items-center justify-center">
                <span className="text-white">MH</span>
              </div>
              <div>
                <h1 className="text-gray-900">MH26 Services</h1>
                <p className="text-gray-600 text-sm">Nanded, Maharashtra</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-gray-900">
                {mode === 'signin' && 'Welcome Back'}
                {mode === 'signup' && 'Join Our Community'}
                {mode === 'join' && 'Become a Provider'}
                {mode === 'forgot-password' && 'Reset Password'}
              </h2>
              <p className="text-gray-600">
                {mode === 'signin' && 'Sign in to access your bookings, messages, and more.'}
                {mode === 'signup' && 'Create an account to book services and connect with local providers.'}
                {mode === 'join' && 'Start your journey as a service provider and grow your business with us.'}
                {mode === 'forgot-password' && 'Recover access to your account securely.'}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              {(mode === 'signin' || mode === 'forgot-password') && (
                <>
                  <FeatureItem icon={CheckCircle} text="Track Bookings" />
                  <FeatureItem icon={CheckCircle} text="Message Providers" />
                  <FeatureItem icon={CheckCircle} text="View Invoices" />
                  <FeatureItem icon={CheckCircle} text="Leave Reviews" />
                </>
              )}
              {mode === 'signup' && (
                <>
                  <FeatureItem icon={CheckCircle} text="Easy Booking" />
                  <FeatureItem icon={CheckCircle} text="Verified Providers" />
                  <FeatureItem icon={CheckCircle} text="Secure Payments" />
                  <FeatureItem icon={CheckCircle} text="24/7 Support" />
                </>
              )}
              {mode === 'join' && (
                <>
                  <FeatureItem icon={CheckCircle} text="Reach Customers" />
                  <FeatureItem icon={CheckCircle} text="Manage Bookings" />
                  <FeatureItem icon={CheckCircle} text="Track Earnings" />
                  <FeatureItem icon={CheckCircle} text="Build Reputation" />
                </>
              )}
            </div>

            {/* Hero Image */}
            <motion.div
              className="hidden lg:block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <ImageWithFallback
                  src={
                    mode === 'join'
                      ? 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800'
                      : 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800'
                  }
                  alt="Service platform"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="border-0 shadow-2xl bg-white">
              <CardHeader className="space-y-4 pb-6">
                {mode !== 'forgot-password' ? (
                    <Tabs value={mode} onValueChange={(value) => setMode(value as AuthMode)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                        <TabsTrigger value="signin" className="data-[state=active]:bg-white">
                        Sign In
                        </TabsTrigger>
                        <TabsTrigger value="signup" className="data-[state=active]:bg-white">
                        Sign Up
                        </TabsTrigger>
                        <TabsTrigger value="join" className="data-[state=active]:bg-white">
                        Become a Provider
                        </TabsTrigger>
                    </TabsList>
                    </Tabs>
                ) : (
                    <div className="flex items-center">
                        <button 
                            type="button" 
                            onClick={() => { setMode('signin'); setResetStep(1); }}
                            className="mr-2 text-gray-500 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h3 className="font-semibold text-lg">Back to Sign In</h3>
                    </div>
                )}

                <div className="text-center">
                  <CardTitle className="text-gray-900">
                    {mode === 'signin' && 'Sign in to your account'}
                    {mode === 'signup' && 'Create your account'}
                    {mode === 'join' && 'Start as a Provider'}
                    {mode === 'forgot-password' && (resetStep === 1 ? 'Reset Password' : 'Verify & Set Password')}
                  </CardTitle>
                  <CardDescription>
                    {mode === 'signin' && 'Enter your credentials to access your account'}
                    {mode === 'signup' && 'Fill in your details to get started'}
                    {mode === 'join' && 'Complete the form to begin onboarding'}
                    {mode === 'forgot-password' && (resetStep === 1 ? 'Enter your email to receive an OTP' : 'Enter the OTP sent to your email')}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!otpSent && mode !== 'forgot-password' && (
                    <>
                        <div className="space-y-2">
                        <label className="text-sm text-gray-700">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            type="email"
                            name="email"
                            autoComplete="username"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`pl-10 h-11 ${errors.email ? 'border-red-500' : ''}`}
                            disabled={isLoading}
                          />
                        </div>
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                      </div>

                      {/* Name (for signup and join) */}
                      {mode !== 'signin' && (
                        <div className="space-y-2">
                          <label className="text-sm text-gray-700">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                              type="text"
                              placeholder="John Doe"
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className={`pl-10 h-11 ${errors.name ? 'border-red-500' : ''}`}
                              disabled={isLoading}
                            />
                          </div>
                          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                      )}

                      {/* Phone (for signup and join) */}
                      {mode !== 'signin' && (
                        <div className="space-y-2">
                          <label className="text-sm text-gray-700">Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                              type="tel"
                              autoComplete="tel"
                              inputMode="numeric"
                              placeholder="9876543210"
                              value={formData.phone}
                              onChange={(e) => {
                                // Only allow digits
                                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                handleInputChange('phone', value);
                              }}
                              className={`pl-10 h-11 ${errors.phone ? 'border-red-500' : ''}`}
                              disabled={isLoading}
                              maxLength={10}
                            />
                          </div>
                          {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                        </div>
                      )}

                      {/* Business Name (for join only) */}
                      {mode === 'join' && (
                        <div className="space-y-2">
                          <label className="text-sm text-gray-700">Business Name</label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                              type="text"
                              placeholder="Your Business Name"
                              value={formData.businessName}
                              onChange={(e) => handleInputChange('businessName', e.target.value)}
                              className={`pl-10 h-11 ${errors.businessName ? 'border-red-500' : ''}`}
                              disabled={isLoading}
                            />
                          </div>
                          {errors.businessName && <p className="text-sm text-red-500">{errors.businessName}</p>}
                        </div>
                      )}
                    </>
                  )}

                  {/* Forgot Password Flow Inputs */}
                  {mode === 'forgot-password' && (
                      <>
                        {resetStep === 1 && (
                            <div className="space-y-2">
                            <label className="text-sm text-gray-700">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                type="email"
                                name="email"
                                autoComplete="username"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className={`pl-10 h-11 ${errors.email ? 'border-red-500' : ''}`}
                                disabled={isLoading}
                                />
                            </div>
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            </div>
                        )}
                        {resetStep === 2 && (
                            <>
                                <div className="space-y-2">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                                    <div className="flex items-start gap-2">
                                    <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium text-blue-900">Check your email</p>
                                        <p className="text-xs text-blue-700 mt-0.5">
                                        We've sent a 6-digit code to <strong>{formData.email}</strong>
                                        </p>
                                    </div>
                                    </div>
                                </div>
                                <label className="text-sm text-gray-700">Enter Verification Code</label>
                                <div className="relative">
                                    <Input
                                    type="text"
                                    placeholder="000000"
                                    value={formData.otp}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                        handleInputChange('otp', value);
                                    }}
                                    maxLength={6}
                                    className={`text-center text-2xl tracking-widest font-mono h-12 ${errors.otp ? 'border-red-500' : ''}`}
                                    />
                                </div>
                                {errors.otp && <p className="text-sm text-red-500">{errors.otp}</p>}
                                </div>

                                <div className="space-y-2">
                                <label className="text-sm text-gray-700">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <Input
                                    type="password"
                                    placeholder="New Password"
                                    value={formData.newPassword}
                                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                    className={`pl-10 h-11 ${errors.newPassword ? 'border-red-500' : ''}`}
                                    disabled={isLoading}
                                    />
                                </div>
                                {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword}</p>}
                                </div>

                                <div className="space-y-2">
                                <label className="text-sm text-gray-700">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <Input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    className={`pl-10 h-11 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                    disabled={isLoading}
                                    />
                                </div>
                                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                                </div>
                            </>
                        )}
                      </>
                  )}

                  {/* OTP Input (shown when OTP is required for REGISTRATION) */}
                  {requiresOTP && otpSent && mode !== 'forgot-password' && (
                    <div className="space-y-2">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                        <div className="flex items-start gap-2">
                          <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-blue-900">Check your email</p>
                            <p className="text-xs text-blue-700 mt-0.5">
                              We've sent a 6-digit code to <strong>{formData.email}</strong>
                            </p>
                          </div>
                        </div>
                      </div>
                      <label className="text-sm text-gray-700">Enter Verification Code</label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="000000"
                          value={formData.otp}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                            handleInputChange('otp', value);
                          }}
                          maxLength={6}
                          className={`text-center text-2xl tracking-widest font-mono h-12 ${errors.otp ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.otp && <p className="text-sm text-red-500">{errors.otp}</p>}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            try {
                              await axiosClient.post('/auth/resend-registration-otp', {
                                email: formData.email,
                              });
                              toast.success('OTP resent to your email');
                            } catch (error: any) {
                              toast.error(error.response?.data?.error || 'Failed to resend OTP');
                            }
                          }}
                          disabled={isLoading}
                          className="flex-1"
                        >
                          Resend OTP
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setOtpSent(false);
                            setRequiresOTP(false);
                            setFormData(prev => ({ ...prev, otp: '' }));
                          }}
                          disabled={isLoading}
                          className="flex-1"
                        >
                          Change Email
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Password (for Signin/Signup/Join) */}
                  {!otpSent && mode !== 'forgot-password' && (
                    <div className="space-y-2">
                      <label className="text-sm text-gray-700">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className={`pl-10 pr-10 h-11 ${errors.password ? 'border-red-500' : ''}`}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                    </div>
                  )}

                  {/* Confirm Password (for signup and join) */}
                  {mode !== 'signin' && mode !== 'forgot-password' && !otpSent && (
                    <div className="space-y-2">
                      <label className="text-sm text-gray-700">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className={`pl-10 h-11 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-[#ff6b35] hover:bg-[#ff5722] shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Please wait...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>
                          {mode === 'signin' && 'Sign In'}
                          {mode === 'signup' && 'Create Account'}
                          {mode === 'join' && 'Continue to Onboarding'}
                          {mode === 'forgot-password' && (resetStep === 1 ? 'Send OTP' : 'Reset Password')}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>

                  {/* Forgot Password (only for signin) */}
                  {mode === 'signin' && (
                    <div className="text-center">
                      <button
                        type="button"
                        className="text-sm text-[#ff6b35] hover:text-[#ff5722] transition-colors"
                        onClick={() => {
                            setMode('forgot-password');
                            setResetStep(1);
                        }}
                      >
                        Forgot your password?
                      </button>
                    </div>
                  )}

                  {/* Terms & Conditions (for signup and join) */}
                  {mode !== 'signin' && mode !== 'forgot-password' && (
                    <p className="text-xs text-gray-500 text-center">
                      By continuing, you agree to our{' '}
                      <button type="button" className="text-[#ff6b35] hover:underline">
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button type="button" className="text-[#ff6b35] hover:underline">
                        Privacy Policy
                      </button>
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon: Icon, text }: { icon: typeof CheckCircle; text: string }) {
  return (
    <motion.div
      className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-md"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Icon className="w-4 h-4 text-green-600 flex-shrink-0" />
      <span className="text-sm text-gray-700">{text}</span>
    </motion.div>
  );
}
