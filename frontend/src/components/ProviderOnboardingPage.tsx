import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Camera, FileText, Image as ImageIcon
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
  // Documents
  businessCardImage: File | null;
  workImage: File | null;
  certificatePdf: File | null;
}

export default function ProviderOnboardingPage() {
  const { user, setUser, refreshProfile } = useUser();
  const navigate = useNavigate();
  const { data: categoriesData } = useCategories();
  
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  
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
    serviceRadius: '10',
    businessCardImage: null,
    workImage: null,
    certificatePdf: null,
  });

  // Preview URLs for uploaded images
  const [previews, setPreviews] = useState({
    businessCard: '',
    workImage: '',
    certificate: '',
  });

  // If user is already logged in and is a provider, redirect
  useEffect(() => {
    if (user?.role === 'PROVIDER') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, primaryCategory: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'businessCardImage' | 'workImage' | 'certificatePdf') => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));
      
      // Create preview for images
      if (field !== 'certificatePdf') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => ({
            ...prev,
            [field === 'businessCardImage' ? 'businessCard' : 'workImage']: reader.result as string
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setPreviews(prev => ({ ...prev, certificate: file.name }));
      }
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
      
      // Store tokens and user
      if (response.tokens) {
        localStorage.setItem('accessToken', response.tokens.accessToken);
        localStorage.setItem('refreshToken', response.tokens.refreshToken);
      }
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
      }
      
      toast.success('Email verified! Now complete your business profile.');
      setStep(3);
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
    if (!formData.businessCardImage || !formData.workImage) {
      toast.error('Please upload business card and work sample images');
      return;
    }

    try {
      setLoading(true);
      
      // For now, we'll use placeholder URLs for the images
      // In production, you'd upload to cloud storage first
      const businessCardUrl = previews.businessCard || '';
      const workImageUrl = previews.workImage || '';
      
      // Create provider profile
      await axiosClient.post('/providers', {
        businessName: formData.businessName,
        primaryCategory: formData.primaryCategory,
        description: formData.description,
        experienceYears: parseInt(formData.experienceYears) || 0,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        serviceRadius: parseInt(formData.serviceRadius) || 10,
        status: 'PENDING',
        gallery: [businessCardUrl, workImageUrl].filter(Boolean),
      });

      toast.success('Application submitted successfully! Awaiting admin approval.');
      
      // Refresh user profile
      if (refreshProfile) await refreshProfile();

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

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

  // Step Indicator Component
  const StepIndicator = () => (
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
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Step 1: Contact Information
              </CardTitle>
              <CardDescription className="text-orange-100">
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
          <Card className="shadow-xl border-0">
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
            <Card className="shadow-xl border-0 mb-6">
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
                      </SelectContent>
                    </Select>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experienceYears">Years of Experience</Label>
                    <Input 
                      id="experienceYears" 
                      name="experienceYears" 
                      type="number" 
                      min="0"
                      placeholder="e.g. 5" 
                      value={formData.experienceYears}
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
                  </div>
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

            {/* Document Uploads */}
            <Card className="shadow-xl border-0 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Documents
                </CardTitle>
                <CardDescription>
                  Upload images of your business card, work samples, and optional certificate
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Business Card Image */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Business Card Image *
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                    {previews.businessCard ? (
                      <div className="relative">
                        <img src={previews.businessCard} alt="Business Card" className="max-h-32 mx-auto rounded" />
                        <button 
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, businessCardImage: null }));
                            setPreviews(prev => ({ ...prev, businessCard: '' }));
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Click to upload business card image</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'businessCardImage')}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Work Sample Image */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Work/Service Sample Image *
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                    {previews.workImage ? (
                      <div className="relative">
                        <img src={previews.workImage} alt="Work Sample" className="max-h-32 mx-auto rounded" />
                        <button 
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, workImage: null }));
                            setPreviews(prev => ({ ...prev, workImage: '' }));
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Click to upload a sample of your work</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'workImage')}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Certificate (Optional) */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Certificate (Optional - PDF)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                    {previews.certificate ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="h-6 w-6 text-orange-500" />
                        <span className="text-sm">{previews.certificate}</span>
                        <button 
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, certificatePdf: null }));
                            setPreviews(prev => ({ ...prev, certificate: '' }));
                          }}
                          className="bg-red-500 text-white rounded-full p-1 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Click to upload certificate (PDF)</span>
                        <input 
                          type="file" 
                          accept=".pdf" 
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'certificatePdf')}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

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
