import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { useUser } from '../context/UserContext';
import { authApi } from '../api/auth';

type AuthMode = 'signin' | 'signup' | 'join';

export default function AuthPage() {
  const navigate = useNavigate();
  const { setUser, user, isAuthenticated } = useUser();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    businessName: '',
  });

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(forgotEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsSendingOtp(true);
    try {
      await authApi.forgotPassword(forgotEmail);
      toast.success('OTP sent to your email');
      setShowForgotPassword(false);
      navigate(`/reset-password?email=${encodeURIComponent(forgotEmail)}`);
    } catch (error: any) {
       console.error(error);
       toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (mode !== 'signin') {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
        newErrors.phone = 'Invalid phone format (10 digits starting with 6-9)';
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
        const response = await authApi.login({ email: formData.email, password: formData.password });
        
        // Save tokens
        localStorage.setItem('accessToken', response.tokens.accessToken);
        localStorage.setItem('refreshToken', response.tokens.refreshToken);
        
        // Update User Context
        setUser(response.user);
        
        toast.success('Welcome back!');
        // Check if admin
        if (response.user.role === 'ADMIN') {
            navigate('/admin');
        } else {
            navigate('/');
        }
      } else if (mode === 'signup') {
        // Sign Up
        const response = await authApi.register({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            role: 'CUSTOMER'
        });
        
        // Save tokens
        localStorage.setItem('accessToken', response.tokens.accessToken);
        localStorage.setItem('refreshToken', response.tokens.refreshToken);
        
        // Update User Context
        setUser(response.user);
        
        toast.success('Account created successfully!');
        navigate('/');
      } else if (mode === 'join') {
        // Check if user exists or login/register first? 
        // For 'join' used as provider onboarding trigger, we might want to register first as provider
        // Or redirect to onboarding if logged in.
        // Assuming 'join' creates a PROVIDER account or redirects to onboarding flow
        
         const response = await authApi.register({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            role: 'PROVIDER'
        });
        
        // Save tokens
         localStorage.setItem('accessToken', response.tokens.accessToken);
        localStorage.setItem('refreshToken', response.tokens.refreshToken);
        
        // Update User Context
        setUser(response.user);

        toast.success('Account created! Redirecting to provider onboarding...');
        navigate('/provider-onboarding', {
          state: {
            businessName: formData.businessName,
          },
        });
      }
    } catch (error: any) {
      console.error('Auth Error:', error);
      const errorMessage = error.response?.data?.message || 'Authentication failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-[#ff6b35]/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#ff6b35]/5 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
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
              </h2>
              <p className="text-gray-600">
                {mode === 'signin' && 'Sign in to access your bookings, messages, and more.'}
                {mode === 'signup' && 'Create an account to book services and connect with local providers.'}
                {mode === 'join' && 'Start your journey as a service provider and grow your business with us.'}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              {mode === 'signin' && (
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-md">
              <CardHeader className="space-y-4 pb-6">
                <Tabs value={mode} onValueChange={(value) => setMode(value as AuthMode)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                    <TabsTrigger value="signin" className="data-[state=active]:bg-white">
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-white">
                      Sign Up
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="text-center">
                  <CardTitle className="text-gray-900">
                    {mode === 'signin' && 'Sign in to your account'}
                    {mode === 'signup' && 'Create your account'}
                    {mode === 'join' && 'Start as a Provider'}
                  </CardTitle>
                  <CardDescription>
                    {mode === 'signin' && 'Enter your credentials to access your account'}
                    {mode === 'signup' && 'Fill in your details to get started'}
                    {mode === 'join' && 'Complete the form to begin onboarding'}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`pl-10 h-11 ${errors.email ? 'border-red-500' : ''}`}
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
                          placeholder="9876543210"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`pl-10 h-11 ${errors.phone ? 'border-red-500' : ''}`}
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
                        />
                      </div>
                      {errors.businessName && <p className="text-sm text-red-500">{errors.businessName}</p>}
                    </div>
                  )}

                  {/* Password */}
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

                  {/* Confirm Password (for signup and join) */}
                  {mode !== 'signin' && (
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
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot your password?
                      </button>
                    </div>
                  )}

                  {/* Terms & Conditions (for signup and join) */}
                  {mode !== 'signin' && (
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

                {/* Demo Notice */}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you an OTP to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForgotPassword(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSendingOtp} className="bg-[#ff6b35] hover:bg-[#ff5722]">
                {isSendingOtp ? 'Sending...' : 'Send OTP'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FeatureItem({ icon: Icon, text }: { icon: typeof CheckCircle; text: string }) {
  return (
    <motion.div
      className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg p-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Icon className="w-4 h-4 text-green-600 flex-shrink-0" />
      <span className="text-sm text-gray-700">{text}</span>
    </motion.div>
  );
}
