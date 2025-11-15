import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import {
  Building2,
  MapPin,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Phone,
  Mail,
  Globe,
  Clock,
  DollarSign,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { SERVICE_CATEGORIES } from '../data/mockData';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface OnboardingData {
  // Step 1: Business Information
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  bio: string;
  
  // Step 2: Service Categories
  primaryCategory: string;
  categories: string[];
  
  // Step 3: Business Details
  yearsExperience: string;
  businessType: string;
  website: string;
  
  // Step 4: Location & Service Area
  address: string;
  city: string;
  pincode: string;
  serviceRadius: string;
  
  // Step 5: Availability & Pricing
  availability: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  pricing: {
    baseRate: string;
    currency: string;
  };
  
  // Step 6: Documents
  documents: {
    aadhar: File | null;
    license: File | null;
    gst: File | null;
    photos: File[];
  };
}

const STEPS = [
  { id: 1, name: 'Business Info', icon: Building2 },
  { id: 2, name: 'Services', icon: Sparkles },
  { id: 3, name: 'Details', icon: FileText },
  { id: 4, name: 'Location', icon: MapPin },
  { id: 5, name: 'Availability', icon: Clock },
  { id: 6, name: 'Documents', icon: Upload },
  { id: 7, name: 'Review', icon: CheckCircle2 },
];

const BUSINESS_TYPES = [
  'Individual/Freelancer',
  'Partnership',
  'Private Limited Company',
  'Sole Proprietorship',
  'Other',
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ProviderOnboardingComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location.state || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    businessName: initialData.businessName || '',
    ownerName: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    bio: '',
    primaryCategory: '',
    categories: [],
    yearsExperience: '',
    businessType: '',
    website: '',
    address: '',
    city: 'Nanded',
    pincode: '',
    serviceRadius: '10',
    availability: {
      days: [],
      startTime: '09:00',
      endTime: '18:00',
    },
    pricing: {
      baseRate: '',
      currency: 'INR',
    },
    documents: {
      aadhar: null,
      license: null,
      gst: null,
      photos: [],
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [documentPreviews, setDocumentPreviews] = useState<Record<string, string>>({});

  const progress = (currentStep / STEPS.length) * 100;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories };
    });
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        days: prev.availability.days.includes(day)
          ? prev.availability.days.filter(d => d !== day)
          : [...prev.availability.days, day],
      },
    }));
  };

  const handleFileUpload = (field: string, file: File) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file,
      },
    }));

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentPreviews(prev => ({
          ...prev,
          [field]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultiplePhotos = (files: FileList) => {
    const fileArray = Array.from(files);
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        photos: [...prev.documents.photos, ...fileArray].slice(0, 5), // Max 5 photos
      },
    }));

    // Create previews
    fileArray.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentPreviews(prev => ({
          ...prev,
          [`photo_${formData.documents.photos.length + index}`]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        photos: prev.documents.photos.filter((_, i) => i !== index),
      },
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.businessName) newErrors.businessName = 'Business name is required';
        if (!formData.ownerName) newErrors.ownerName = 'Owner name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phone) newErrors.phone = 'Phone is required';
        if (!formData.bio) newErrors.bio = 'Business description is required';
        if (formData.bio.length < 50) newErrors.bio = 'Description must be at least 50 characters';
        break;

      case 2:
        if (!formData.primaryCategory) newErrors.primaryCategory = 'Select a primary category';
        if (formData.categories.length === 0) newErrors.categories = 'Select at least one category';
        break;

      case 3:
        if (!formData.yearsExperience) newErrors.yearsExperience = 'Years of experience is required';
        if (!formData.businessType) newErrors.businessType = 'Business type is required';
        break;

      case 4:
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.pincode) newErrors.pincode = 'Pincode is required';
        if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid pincode format';
        break;

      case 5:
        if (formData.availability.days.length === 0) newErrors.availability = 'Select at least one day';
        if (!formData.pricing.baseRate) newErrors.pricing = 'Base rate is required';
        break;

      case 6:
        if (!formData.documents.aadhar) newErrors.aadhar = 'Aadhar card is required';
        if (formData.documents.photos.length === 0) newErrors.photos = 'Upload at least one business photo';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) {
      toast.error('Please complete all required steps');
      return;
    }

    // In production: Upload files to S3, then submit form data
    toast.loading('Submitting your application...');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast.success('Application submitted successfully!', {
      description: 'Our team will review your application within 24-48 hours.',
    });

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </button>
          <h1 className="text-gray-900 mb-2">Provider Onboarding</h1>
          <p className="text-gray-600">
            Complete all steps to join MH26 Services as a verified provider
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-[#ff6b35] text-white ring-4 ring-orange-100'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`text-xs text-center ${
                        isActive ? 'text-[#ff6b35]' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mb-6 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
                <CardDescription>
                  {currentStep === 1 && 'Tell us about your business'}
                  {currentStep === 2 && 'Select the services you offer'}
                  {currentStep === 3 && 'Additional business information'}
                  {currentStep === 4 && 'Where do you operate?'}
                  {currentStep === 5 && 'Set your availability and pricing'}
                  {currentStep === 6 && 'Upload required documents'}
                  {currentStep === 7 && 'Review your application before submitting'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Step 1: Business Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-700 mb-2 block">
                        Business Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        placeholder="e.g., QuickFix Plumbing Services"
                        className={errors.businessName ? 'border-red-500' : ''}
                      />
                      {errors.businessName && (
                        <p className="text-sm text-red-500 mt-1">{errors.businessName}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm text-gray-700 mb-2 block">
                        Owner Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.ownerName}
                        onChange={(e) => handleInputChange('ownerName', e.target.value)}
                        placeholder="Your full name"
                        className={errors.ownerName ? 'border-red-500' : ''}
                      />
                      {errors.ownerName && (
                        <p className="text-sm text-red-500 mt-1">{errors.ownerName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-700 mb-2 block">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="business@example.com"
                            className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm text-gray-700 mb-2 block">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="+91-9876543210"
                            className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-700 mb-2 block">
                        Business Description <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Describe your services, experience, and what makes you unique... (minimum 50 characters)"
                        rows={5}
                        className={errors.bio ? 'border-red-500' : ''}
                      />
                      <div className="flex justify-between items-center mt-1">
                        {errors.bio && (
                          <p className="text-sm text-red-500">{errors.bio}</p>
                        )}
                        <p className="text-sm text-gray-500 ml-auto">
                          {formData.bio.length} / 50 characters
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Service Categories */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm text-gray-700 mb-3 block">
                        Primary Category <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {SERVICE_CATEGORIES.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => handleInputChange('primaryCategory', category.id)}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                              formData.primaryCategory === category.id
                                ? 'border-[#ff6b35] bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-2xl mb-2">{category.icon}</div>
                            <div className="text-sm">{category.name}</div>
                          </button>
                        ))}
                      </div>
                      {errors.primaryCategory && (
                        <p className="text-sm text-red-500 mt-2">{errors.primaryCategory}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm text-gray-700 mb-3 block">
                        Additional Categories (select all that apply)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {SERVICE_CATEGORIES.map((category) => (
                          <label
                            key={category.id}
                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                          >
                            <Checkbox
                              checked={formData.categories.includes(category.name)}
                              onCheckedChange={() => handleCategoryToggle(category.name)}
                            />
                            <span className="text-2xl">{category.icon}</span>
                            <span className="text-sm">{category.name}</span>
                          </label>
                        ))}
                      </div>
                      {errors.categories && (
                        <p className="text-sm text-red-500 mt-2">{errors.categories}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Business Details */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-700 mb-2 block">
                          Years of Experience <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          value={formData.yearsExperience}
                          onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                          placeholder="e.g., 5"
                          min="0"
                          className={errors.yearsExperience ? 'border-red-500' : ''}
                        />
                        {errors.yearsExperience && (
                          <p className="text-sm text-red-500 mt-1">{errors.yearsExperience}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm text-gray-700 mb-2 block">
                          Business Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.businessType}
                          onChange={(e) => handleInputChange('businessType', e.target.value)}
                          className={`w-full h-11 px-3 rounded-md border ${
                            errors.businessType ? 'border-red-500' : 'border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-[#ff6b35]`}
                        >
                          <option value="">Select type</option>
                          {BUSINESS_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        {errors.businessType && (
                          <p className="text-sm text-red-500 mt-1">{errors.businessType}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-700 mb-2 block">
                        Website (optional)
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="url"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="https://yourbusiness.com"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Location */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-700 mb-2 block">
                        Business Address <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Enter your complete business address"
                        rows={3}
                        className={errors.address ? 'border-red-500' : ''}
                      />
                      {errors.address && (
                        <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-700 mb-2 block">
                          City <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="Nanded"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-700 mb-2 block">
                          Pincode <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={formData.pincode}
                          onChange={(e) => handleInputChange('pincode', e.target.value)}
                          placeholder="431601"
                          maxLength={6}
                          className={errors.pincode ? 'border-red-500' : ''}
                        />
                        {errors.pincode && (
                          <p className="text-sm text-red-500 mt-1">{errors.pincode}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-700 mb-2 block">
                        Service Radius (km)
                      </label>
                      <Input
                        type="number"
                        value={formData.serviceRadius}
                        onChange={(e) => handleInputChange('serviceRadius', e.target.value)}
                        placeholder="10"
                        min="1"
                        max="50"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        How far from your location will you provide services?
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        📍 In production, we'll use Google Maps to verify your exact location
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 5: Availability & Pricing */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm text-gray-700 mb-3 block">
                        Working Days <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {DAYS_OF_WEEK.map((day) => (
                          <label
                            key={day}
                            className="flex items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                          >
                            <Checkbox
                              checked={formData.availability.days.includes(day)}
                              onCheckedChange={() => handleDayToggle(day)}
                            />
                            <span className="text-sm">{day}</span>
                          </label>
                        ))}
                      </div>
                      {errors.availability && (
                        <p className="text-sm text-red-500 mt-2">{errors.availability}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-700 mb-2 block">
                          Start Time
                        </label>
                        <Input
                          type="time"
                          value={formData.availability.startTime}
                          onChange={(e) =>
                            handleInputChange('availability', {
                              ...formData.availability,
                              startTime: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-700 mb-2 block">
                          End Time
                        </label>
                        <Input
                          type="time"
                          value={formData.availability.endTime}
                          onChange={(e) =>
                            handleInputChange('availability', {
                              ...formData.availability,
                              endTime: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-700 mb-2 block">
                        Base Rate <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="number"
                          value={formData.pricing.baseRate}
                          onChange={(e) =>
                            handleInputChange('pricing', {
                              ...formData.pricing,
                              baseRate: e.target.value,
                            })
                          }
                          placeholder="Enter your starting rate"
                          className={`pl-10 ${errors.pricing ? 'border-red-500' : ''}`}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        This is your minimum service charge. You can adjust pricing for specific services later.
                      </p>
                      {errors.pricing && (
                        <p className="text-sm text-red-500 mt-1">{errors.pricing}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 6: Documents */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm text-gray-700 mb-2 block">
                        Aadhar Card <span className="text-red-500">*</span>
                      </label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center ${
                          errors.aadhar ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => e.target.files && handleFileUpload('aadhar', e.target.files[0])}
                          className="hidden"
                          id="aadhar-upload"
                        />
                        {formData.documents.aadhar ? (
                          <div className="space-y-3">
                            {documentPreviews.aadhar && (
                              <img
                                src={documentPreviews.aadhar}
                                alt="Aadhar preview"
                                className="max-h-32 mx-auto rounded"
                              />
                            )}
                            <p className="text-sm text-gray-600">{formData.documents.aadhar.name}</p>
                            <label htmlFor="aadhar-upload">
                              <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('aadhar-upload')?.click()}>
                                Change File
                              </Button>
                            </label>
                          </div>
                        ) : (
                          <label htmlFor="aadhar-upload" className="cursor-pointer">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Click to upload Aadhar card</p>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG, or PDF (max 5MB)</p>
                          </label>
                        )}
                      </div>
                      {errors.aadhar && (
                        <p className="text-sm text-red-500 mt-1">{errors.aadhar}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm text-gray-700 mb-2 block">
                        Business License (optional)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => e.target.files && handleFileUpload('license', e.target.files[0])}
                          className="hidden"
                          id="license-upload"
                        />
                        {formData.documents.license ? (
                          <div className="space-y-3">
                            {documentPreviews.license && (
                              <img
                                src={documentPreviews.license}
                                alt="License preview"
                                className="max-h-32 mx-auto rounded"
                              />
                            )}
                            <p className="text-sm text-gray-600">{formData.documents.license.name}</p>
                            <label htmlFor="license-upload">
                              <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('license-upload')?.click()}>
                                Change File
                              </Button>
                            </label>
                          </div>
                        ) : (
                          <label htmlFor="license-upload" className="cursor-pointer">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Click to upload license</p>
                          </label>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-700 mb-2 block">
                        Business Photos <span className="text-red-500">*</span> (Max 5)
                      </label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 ${
                          errors.photos ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => e.target.files && handleMultiplePhotos(e.target.files)}
                          className="hidden"
                          id="photos-upload"
                        />
                        {formData.documents.photos.length > 0 ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                              {formData.documents.photos.map((photo, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={documentPreviews[`photo_${index}`] || URL.createObjectURL(photo)}
                                    alt={`Photo ${index + 1}`}
                                    className="w-full h-24 object-cover rounded"
                                  />
                                  <button
                                    onClick={() => removePhoto(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            {formData.documents.photos.length < 5 && (
                              <label htmlFor="photos-upload">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => document.getElementById('photos-upload')?.click()}
                                >
                                  <ImageIcon className="w-4 h-4 mr-2" />
                                  Add More Photos
                                </Button>
                              </label>
                            )}
                          </div>
                        ) : (
                          <label htmlFor="photos-upload" className="cursor-pointer text-center block">
                            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Click to upload business photos</p>
                            <p className="text-xs text-gray-500 mt-1">Show your workspace, equipment, or completed projects</p>
                          </label>
                        )}
                      </div>
                      {errors.photos && (
                        <p className="text-sm text-red-500 mt-1">{errors.photos}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 7: Review */}
                {currentStep === 7 && (
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm text-green-800">
                            <strong>Almost there!</strong> Review your information before submitting.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <ReviewSection title="Business Information">
                        <ReviewItem label="Business Name" value={formData.businessName} />
                        <ReviewItem label="Owner" value={formData.ownerName} />
                        <ReviewItem label="Email" value={formData.email} />
                        <ReviewItem label="Phone" value={formData.phone} />
                        <ReviewItem label="Description" value={formData.bio} />
                      </ReviewSection>

                      <ReviewSection title="Services">
                        <ReviewItem
                          label="Primary Category"
                          value={SERVICE_CATEGORIES.find(c => c.id === formData.primaryCategory)?.name || ''}
                        />
                        <ReviewItem label="Categories" value={formData.categories.join(', ')} />
                      </ReviewSection>

                      <ReviewSection title="Business Details">
                        <ReviewItem label="Experience" value={`${formData.yearsExperience} years`} />
                        <ReviewItem label="Business Type" value={formData.businessType} />
                        {formData.website && <ReviewItem label="Website" value={formData.website} />}
                      </ReviewSection>

                      <ReviewSection title="Location">
                        <ReviewItem label="Address" value={formData.address} />
                        <ReviewItem label="City" value={formData.city} />
                        <ReviewItem label="Pincode" value={formData.pincode} />
                        <ReviewItem label="Service Radius" value={`${formData.serviceRadius} km`} />
                      </ReviewSection>

                      <ReviewSection title="Availability & Pricing">
                        <ReviewItem label="Working Days" value={formData.availability.days.join(', ')} />
                        <ReviewItem
                          label="Working Hours"
                          value={`${formData.availability.startTime} - ${formData.availability.endTime}`}
                        />
                        <ReviewItem label="Base Rate" value={`₹${formData.pricing.baseRate}`} />
                      </ReviewSection>

                      <ReviewSection title="Documents">
                        <ReviewItem label="Aadhar Card" value={formData.documents.aadhar?.name || 'Not uploaded'} />
                        <ReviewItem label="Business License" value={formData.documents.license?.name || 'Not uploaded'} />
                        <ReviewItem label="Business Photos" value={`${formData.documents.photos.length} photo(s)`} />
                      </ReviewSection>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <p className="mb-2"><strong>What happens next?</strong></p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Our team will review your application within 24-48 hours</li>
                            <li>You'll receive an email notification about the decision</li>
                            <li>Once approved, you can start receiving booking requests</li>
                            <li>Make sure to keep your phone accessible for verification calls</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="w-32"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-32 bg-[#ff6b35] hover:bg-[#ff5722]"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="w-48 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Application
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="text-sm text-gray-900 text-right max-w-xs">{value}</span>
    </div>
  );
}
