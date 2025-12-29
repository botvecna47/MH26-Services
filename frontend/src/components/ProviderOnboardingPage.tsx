import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { axiosClient } from '../api/axiosClient';
import { authApi } from '../api/auth';
import { 
  Briefcase, MapPin, Mail, Phone, Lock, User, 
  Upload, CheckCircle, ArrowRight, ArrowLeft, Loader2,
  Link, FileText, AlertCircle, X
} from 'lucide-react';
import { useCategories } from '../api/categories';

type Step = 1 | 2 | 3;

interface FormData {
  // Step 1: Contact Info
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  // Step 3: Business Details
  businessName: string;
  primaryCategory: string;
  description: string;
  experienceYears: string;
  address: string;
  city: string;
  pincode: string;
  serviceRadius: string;
  // Document URLs (Google Drive links)
  businessCardUrl: string;
  workSampleUrl: string;
  certificateUrl: string;
  aadharPanUrl: string;
  // Optional fields
  portfolioUrl1: string;
  portfolioUrl2: string;
  portfolioUrl3: string;
  instagramUrl: string;
  facebookUrl: string;
  websiteUrl: string;
  insuranceInfo: string;
  // Terms
  termsAccepted: boolean;
}

export default function ProviderOnboardingPage() {
  const { user, setUser, refreshProfile } = useUser();
  const navigate = useNavigate();
  const { data: categoriesData } = useCategories();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [showOtherCategory, setShowOtherCategory] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState<'terms' | 'privacy' | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    primaryCategory: '',
    description: '',
    experienceYears: '',
    address: '',
    city: 'Nanded',
    pincode: '',
    serviceRadius: '6',
    businessCardUrl: '',
    workSampleUrl: '',
    certificateUrl: '',
    aadharPanUrl: '',
    portfolioUrl1: '',
    portfolioUrl2: '',
    portfolioUrl3: '',
    instagramUrl: '',
    facebookUrl: '',
    websiteUrl: '',
    insuranceInfo: '',
    termsAccepted: false,
  });

  // Check for step=3 URL param (for REJECTED/PENDING providers re-applying)
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam === '3' && user?.role === 'PROVIDER') {
      setStep(3);
      // Pre-fill name and email from user context
      setFormData(prev => ({ ...prev, name: user.name || '', email: user.email || '' }));
    }
  }, [searchParams, user]);

  // If user is already authenticated as a CUSTOMER, skip directly to step 3
  // They don't need to register again - just submit business details
  useEffect(() => {
    if (user?.role === 'CUSTOMER') {
      setStep(3);
      // Pre-fill their existing info
      setFormData(prev => ({ 
        ...prev, 
        name: user.name || '', 
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  // If user is already logged in and is an APPROVED provider, redirect
  useEffect(() => {
    // Skip if we're on step 3 - user is completing their profile
    if (step === 3) return;
    
    // Only redirect if provider is APPROVED (not PENDING/REJECTED)
    if (user?.role === 'PROVIDER' && !user?.requiresOnboarding) {
      navigate('/dashboard');
    }
  }, [user, navigate, step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    if (value === '__OTHER__') {
      setShowOtherCategory(true);
      setFormData(prev => ({ ...prev, primaryCategory: '' }));
    } else {
      setShowOtherCategory(false);
      setFormData(prev => ({ ...prev, primaryCategory: value }));
    }
  };

  // URL validation helper
  const isValidUrl = (url: string) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Step 1: Send OTP
  const handleSendOTP = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      // Register with PROVIDER role - this will send OTP
      await authApi.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'PROVIDER'
      });
      
      setOtpSent(true);
      setPendingEmail(formData.email);
      toast.success('OTP sent to your email! Please check your inbox.');
      setStep(2);
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response?.status === 409) {
        toast.error('An account with this email or phone already exists');
      } else {
        toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.verifyRegistrationOTP(pendingEmail, otp);
      
      // Store tokens
      if (response.tokens) {
        localStorage.setItem('accessToken', response.tokens.accessToken);
        localStorage.setItem('refreshToken', response.tokens.refreshToken);
      }
      
      // IMPORTANT: Set step to 3 BEFORE setting user to prevent redirect
      // The useEffect skips redirect when step === 3
      setStep(3);
      
      // Now safely set the user - step is already 3 so redirect won't happen
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
      }
      
      toast.success('Email verified! Now complete your business profile.');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.error || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    try {
      setLoading(true);
      await authApi.resendRegistrationOTP(pendingEmail);
      toast.success('OTP resent! Please check your email.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Submit Provider Application
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.businessName || !formData.primaryCategory || !formData.description) {
      toast.error('Please fill all required business details');
      return;
    }
    if (!formData.businessCardUrl || !isValidUrl(formData.businessCardUrl)) {
      toast.error('Please provide a valid Google Drive URL for your business card image');
      return;
    }
    if (!formData.workSampleUrl || !isValidUrl(formData.workSampleUrl)) {
      toast.error('Please provide a valid Google Drive URL for your work sample image');
      return;
    }
    if (!formData.aadharPanUrl || !isValidUrl(formData.aadharPanUrl)) {
      toast.error('Please provide a valid Google Drive URL for your Aadhaar/PAN card');
      return;
    }
    if (!formData.termsAccepted) {
      toast.error('You must accept the Terms & Conditions to proceed');
      return;
    }
    // Validate optional URLs if provided
    const optionalUrls = [formData.certificateUrl, formData.portfolioUrl1, formData.portfolioUrl2, formData.portfolioUrl3];
    for (const url of optionalUrls) {
      if (url && !isValidUrl(url)) {
        toast.error('Please provide valid URLs for optional documents or leave them empty');
        return;
      }
    }

    try {
      setLoading(true);
      
      // Build portfolio URLs array
      const portfolioUrls = [formData.portfolioUrl1, formData.portfolioUrl2, formData.portfolioUrl3].filter(Boolean);
      
      // Build social media links object
      const socialMediaLinks = {
        instagram: formData.instagramUrl || '',
        facebook: formData.facebookUrl || '',
        website: formData.websiteUrl || '',
      };
      
      // Create provider profile with all fields
      await axiosClient.post('/providers', {
        businessName: formData.businessName,
        primaryCategory: formData.primaryCategory,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        serviceRadius: parseInt(formData.serviceRadius) || 6,
        status: 'PENDING',
        gallery: [formData.businessCardUrl, formData.workSampleUrl, formData.certificateUrl].filter(Boolean),
        aadharPanUrl: formData.aadharPanUrl,
        portfolioUrls,
        socialMediaLinks,
        insuranceInfo: formData.insuranceInfo || null,
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
      });

      toast.success('Application submitted! Please wait for admin approval. You will receive an email once verified.');
      
      // For authenticated customers applying to become providers:
      // Keep them logged in as customer so they can continue using the app
      // and reapply if rejected
      if (isAuthenticatedCustomer) {
        toast.info('You can continue using the app as a customer while your provider application is being reviewed.');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        // For new registrations, clear session - they need to wait for approval
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        
        // Navigate to pending page
        setTimeout(() => {
          navigate('/provider-pending');
        }, 1500);
      }

    } catch (error: any) {
      console.error('Application error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = categoriesData?.map((c: any) => ({ id: c.slug || c.name.toLowerCase(), name: c.name })) || [
    { id: 'plumbing', name: 'Plumbing' },
    { id: 'electrical', name: 'Electrical' },
    { id: 'cleaning', name: 'Cleaning' },
    { id: 'catering', name: 'Catering' },
    { id: 'salon', name: 'Salon' },
    { id: 'carpentry', name: 'Carpentry' },
  ];

  // Check if user is an authenticated customer (skip steps 1-2)
  const isAuthenticatedCustomer = user?.role === 'CUSTOMER';

  // Step Indicator Component
  const StepIndicator = () => {
    // For authenticated customers, show simpler single-step indicator
    if (isAuthenticatedCustomer) {
      return (
        <div className="flex items-center justify-center mb-8">
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Already registered - Just fill business details!</span>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
              ${step >= s 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-200 text-gray-500'
              }
            `}>
              {step > s ? <CheckCircle className="h-5 w-5" /> : s}
            </div>
            {s < 3 && (
              <div className={`w-16 h-1 mx-2 transition-all ${step > s ? 'bg-orange-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Become a Service Provider</h1>
          <p className="mt-2 text-gray-600">Join MH26 Services and grow your business today.</p>
        </div>

        <StepIndicator />

        {/* Step 1: Contact Information */}
        {step === 1 && (
          <Card className="shadow-xl border border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Step 1: Contact Information
              </CardTitle>
              <CardDescription className="text-white/90">
                Enter your personal details to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    id="name" 
                    name="name" 
                    className="pl-9"
                    placeholder="Your full name" 
                    required 
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input 
                      id="email" 
                      name="email" 
                      type="email"
                      className="pl-9"
                      placeholder="you@example.com" 
                      required 
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel"
                      className="pl-9"
                      placeholder="+91 9876543210" 
                      required 
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input 
                      id="password" 
                      name="password" 
                      type="password"
                      className="pl-9"
                      placeholder="Min. 8 characters" 
                      required 
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      type="password"
                      className="pl-9"
                      placeholder="Re-enter password" 
                      required 
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSendOTP} 
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <Card className="shadow-xl border border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Step 2: Verify Your Email
              </CardTitle>
              <CardDescription className="text-orange-100">
                Enter the 6-digit code sent to {pendingEmail}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  <Mail className="h-8 w-8 text-orange-500" />
                </div>
                <p className="text-gray-600 mb-6">
                  We've sent a verification code to your email. Please enter it below.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input 
                  id="otp"
                  type="text"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>

              <Button 
                onClick={handleVerifyOTP} 
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center">
                <button 
                  onClick={handleResendOTP}
                  className="text-sm text-orange-600 hover:underline"
                  disabled={loading}
                >
                  Didn't receive the code? Resend OTP
                </button>
              </div>

              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Contact Info
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Business Details */}
        {step === 3 && (
          <form onSubmit={handleSubmitApplication}>
            <Card className="shadow-xl border border-orange-200 mb-6">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Step 3: Business Details
                </CardTitle>
                <CardDescription className="text-orange-100">
                  Tell us about your business and services
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Business Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input 
                        id="businessName" 
                        name="businessName" 
                        className="pl-9"
                        placeholder="e.g. Sai Plumbing Services" 
                        required 
                        value={formData.businessName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Service Category *</Label>
                    <Select onValueChange={handleSelectChange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                        <SelectItem value="__OTHER__" className="text-[#ff6b35] font-medium">Other (Enter Custom)</SelectItem>
                      </SelectContent>
                    </Select>
                    {showOtherCategory && (
                      <div className="mt-2">
                        <Input
                          name="primaryCategory"
                          placeholder="Enter your category (e.g., Tiffins, Yoga, Tailoring)"
                          value={formData.primaryCategory}
                          onChange={handleInputChange}
                          className="border-[#ff6b35]"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter a custom category that best describes your service</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Business Description *</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    placeholder="Describe your services, experience, and what makes you unique..." 
                    className="min-h-[100px]"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceRadius">Service Radius (km)</Label>
                  <Input 
                    id="serviceRadius" 
                    name="serviceRadius" 
                    type="number" 
                    min="1"
                    placeholder="e.g. 10" 
                    value={formData.serviceRadius}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-gray-500">How far you can travel to provide services</p>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <Label>Business Address *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input 
                        name="address" 
                        className="pl-9"
                        placeholder="Street / Area" 
                        required 
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                    <Input 
                      name="city" 
                      placeholder="City" 
                      value="Nanded"
                      readOnly
                      className="bg-gray-50"
                    />
                    <Input 
                      name="pincode" 
                      placeholder="Pincode" 
                      required 
                      value={formData.pincode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Links (Google Drive) */}
            <Card className="shadow-xl border border-orange-200 mb-6">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Document Links
                </CardTitle>
                <CardDescription className="text-orange-100">
                  Provide Google Drive links to your documents for verification
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Instructions Box */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    How to share from Google Drive
                  </h4>
                  <ol className="text-sm text-orange-700 space-y-1 list-decimal list-inside">
                    <li>Upload your image/document to Google Drive</li>
                    <li>Right-click the file → <strong>"Share"</strong></li>
                    <li>Under "General access", select <strong>"Anyone with the link"</strong></li>
                    <li>Set permission to <strong>"Viewer"</strong></li>
                    <li>Click <strong>"Copy link"</strong> and paste below</li>
                  </ol>
                </div>

                {/* Business Card URL */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Business Card Image URL *
                  </Label>
                  <Input 
                    name="businessCardUrl"
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    value={formData.businessCardUrl}
                    onChange={handleInputChange}
                    className={`${!formData.businessCardUrl ? '' : isValidUrl(formData.businessCardUrl) ? 'border-green-500' : 'border-red-500'}`}
                    required
                  />
                  <p className="text-xs text-gray-500">Photo of your business card or ID</p>
                </div>

                {/* Work Sample URL */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Work/Service Sample Image URL *
                  </Label>
                  <Input 
                    name="workSampleUrl"
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    value={formData.workSampleUrl}
                    onChange={handleInputChange}
                    className={`${!formData.workSampleUrl ? '' : isValidUrl(formData.workSampleUrl) ? 'border-green-500' : 'border-red-500'}`}
                    required
                  />
                  <p className="text-xs text-gray-500">Photo of your recent work or service</p>
                </div>

                {/* Certificate URL (Optional) */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Certificate URL (Optional)
                  </Label>
                  <Input 
                    name="certificateUrl"
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    value={formData.certificateUrl}
                    onChange={handleInputChange}
                    className={`${!formData.certificateUrl ? '' : isValidUrl(formData.certificateUrl) ? 'border-green-500' : 'border-red-500'}`}
                  />
                  <p className="text-xs text-gray-500">Any relevant certification or license (optional)</p>
                </div>

                {/* Aadhaar/PAN URL (Required) */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Aadhaar or PAN Card URL *
                  </Label>
                  <Input 
                    name="aadharPanUrl"
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    value={formData.aadharPanUrl}
                    onChange={handleInputChange}
                    className={`${!formData.aadharPanUrl ? '' : isValidUrl(formData.aadharPanUrl) ? 'border-green-500' : 'border-red-500'}`}
                    required
                  />
                  <p className="text-xs text-gray-500">Required for identity verification</p>
                </div>
              </CardContent>
            </Card>

            {/* Optional Information */}
            <Card className="shadow-xl border border-orange-200 mb-6">
              <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Information (Optional)
                </CardTitle>
                <CardDescription className="text-gray-200">
                  Add more details to strengthen your profile
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Portfolio URLs */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Portfolio / Work Samples (Up to 3)
                  </Label>
                  <Input 
                    name="portfolioUrl1"
                    type="url"
                    placeholder="Portfolio image URL 1"
                    value={formData.portfolioUrl1}
                    onChange={handleInputChange}
                    className={`${!formData.portfolioUrl1 ? '' : isValidUrl(formData.portfolioUrl1) ? 'border-green-500' : 'border-red-500'}`}
                  />
                  <Input 
                    name="portfolioUrl2"
                    type="url"
                    placeholder="Portfolio image URL 2"
                    value={formData.portfolioUrl2}
                    onChange={handleInputChange}
                    className={`${!formData.portfolioUrl2 ? '' : isValidUrl(formData.portfolioUrl2) ? 'border-green-500' : 'border-red-500'}`}
                  />
                  <Input 
                    name="portfolioUrl3"
                    type="url"
                    placeholder="Portfolio image URL 3"
                    value={formData.portfolioUrl3}
                    onChange={handleInputChange}
                    className={`${!formData.portfolioUrl3 ? '' : isValidUrl(formData.portfolioUrl3) ? 'border-green-500' : 'border-red-500'}`}
                  />
                </div>

                {/* Social Media Links */}
                <div className="space-y-3">
                  <Label>Social Media Links</Label>
                  <Input 
                    name="instagramUrl"
                    type="url"
                    placeholder="Instagram profile URL"
                    value={formData.instagramUrl}
                    onChange={handleInputChange}
                  />
                  <Input 
                    name="facebookUrl"
                    type="url"
                    placeholder="Facebook page URL"
                    value={formData.facebookUrl}
                    onChange={handleInputChange}
                  />
                  <Input 
                    name="websiteUrl"
                    type="url"
                    placeholder="Website URL"
                    value={formData.websiteUrl}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Insurance Info */}
                <div className="space-y-2">
                  <Label>Insurance / Bond Information</Label>
                  <Input 
                    name="insuranceInfo"
                    type="text"
                    placeholder="e.g., Licensed & Insured, Bond Number: XYZ123"
                    value={formData.insuranceInfo}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-[#ff6b35] focus:ring-[#ff6b35]"
                />
                <label htmlFor="termsAccepted" className="text-sm text-gray-700">
                  I have read and agree to the{' '}
                  <button 
                    type="button" 
                    onClick={() => setShowTermsModal('terms')} 
                    className="text-[#ff6b35] hover:underline font-medium"
                  >
                    Terms & Conditions
                  </button>{' '}
                  and{' '}
                  <button 
                    type="button" 
                    onClick={() => setShowTermsModal('privacy')} 
                    className="text-[#ff6b35] hover:underline font-medium"
                  >
                    Privacy Policy
                  </button>. I confirm that all information provided is accurate and I consent to verification of my documents. *
                </label>
              </div>
            </div>

            {/* Terms/Privacy Modal */}
            {showTermsModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                  <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">
                      {showTermsModal === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
                    </h3>
                    <button 
                      onClick={() => setShowTermsModal(null)} 
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[60vh] text-sm text-gray-600 space-y-4">
                    {showTermsModal === 'terms' ? (
                      <>
                        <h4 className="font-semibold text-gray-800">1. Service Provider Agreement</h4>
                        <p>By registering as a service provider on MH26 Services, you agree to provide accurate information about your services, qualifications, and business details.</p>
                        <h4 className="font-semibold text-gray-800">2. Service Standards</h4>
                        <p>You agree to maintain professional standards, respond to customer inquiries promptly, and complete booked services as agreed.</p>
                        <h4 className="font-semibold text-gray-800">3. Fees and Payments</h4>
                        <p>Platform fees (7%) and applicable taxes (8% GST) will be deducted from each completed booking. Payments are processed after service completion.</p>
                        <h4 className="font-semibold text-gray-800">4. Cancellation Policy</h4>
                        <p>Providers must honor confirmed bookings. Repeated cancellations may result in account suspension.</p>
                        <h4 className="font-semibold text-gray-800">5. Verification</h4>
                        <p>Your submitted documents will be verified by our admin team. False information may result in account termination.</p>
                      </>
                    ) : (
                      <>
                        <h4 className="font-semibold text-gray-800">Information We Collect</h4>
                        <p>We collect your name, contact details, business information, and uploaded documents for verification purposes.</p>
                        <h4 className="font-semibold text-gray-800">How We Use Your Information</h4>
                        <p>Your information is used to verify your identity, list your services, process payments, and facilitate customer bookings.</p>
                        <h4 className="font-semibold text-gray-800">Data Security</h4>
                        <p>We implement security measures to protect your personal information. Your documents are stored securely.</p>
                        <h4 className="font-semibold text-gray-800">Third-Party Sharing</h4>
                        <p>We do not sell your personal information. Limited data may be shared with payment processors and verification services.</p>
                      </>
                    )}
                  </div>
                  <div className="p-4 border-t bg-gray-50">
                    <Button 
                      onClick={() => setShowTermsModal(null)} 
                      className="w-full bg-[#ff6b35] hover:bg-[#ff5722]"
                    >
                      I Understand
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Submit Application
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
