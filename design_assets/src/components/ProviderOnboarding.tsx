import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  CheckCircle2,
  Upload,
  MapPin,
  Briefcase,
  FileText,
  User,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface OnboardingData {
  // Step 1: Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  
  // Step 2: Business Details
  businessName: string;
  category: string;
  description: string;
  pricing: string;
  
  // Step 3: Documents
  idProof?: File;
  businessLicense?: File;
  gstCertificate?: File;
  
  // Step 4: Profile
  profilePhoto?: File;
  yearsOfExperience: string;
  certifications: string;
}

interface ProviderOnboardingProps {
  onComplete: (data: OnboardingData) => void;
  onCancel: () => void;
}

const STEPS = [
  { id: 1, title: 'Basic Info', icon: User, description: 'Personal details' },
  { id: 2, title: 'Business Details', icon: Briefcase, description: 'Service information' },
  { id: 3, title: 'Documents', icon: FileText, description: 'Verification documents' },
  { id: 4, title: 'Profile Setup', icon: CheckCircle2, description: 'Complete your profile' },
];

const SERVICE_CATEGORIES = [
  'Tiffin Service',
  'Plumbing',
  'Electrical',
  'Tourism',
  'Fitness Training',
  'Cleaning',
  'Salon & Beauty',
  'Carpentry',
  'Painting',
  'AC Repair',
  'Pest Control',
  'Tailoring',
];

export function ProviderOnboarding({ onComplete, onCancel }: ProviderOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Nanded',
    businessName: '',
    category: '',
    description: '',
    pricing: '',
    yearsOfExperience: '',
    certifications: '',
  });

  const updateFormData = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: keyof OnboardingData, file: File | null) => {
    if (file) {
      updateFormData(field, file);
      toast.success(`${file.name} uploaded successfully`);
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone && formData.address;
      case 2:
        return formData.businessName && formData.category && formData.description && formData.pricing;
      case 3:
        return formData.idProof && formData.businessLicense;
      case 4:
        return formData.profilePhoto && formData.yearsOfExperience;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < 4) {
        setCurrentStep(prev => prev + 1);
      } else {
        onComplete(formData);
        toast.success('Application submitted! Please wait for admin approval.');
      }
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Progress Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2>Become a Provider</h2>
              <p className="text-muted-foreground mt-1">
                Complete these steps to start offering your services
              </p>
            </div>
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="grid grid-cols-4 gap-3">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center text-center p-4 rounded-lg border transition-all ${
                  step.id === currentStep
                    ? 'border-primary bg-primary/5'
                    : step.id < currentStep
                    ? 'border-success bg-success/5'
                    : 'border-border bg-surface'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    step.id === currentStep
                      ? 'bg-primary text-white'
                      : step.id < currentStep
                      ? 'bg-success text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.id < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
                <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => updateFormData('firstName', e.target.value)}
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => updateFormData('lastName', e.target.value)}
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => updateFormData('address', e.target.value)}
                        placeholder="Enter your complete address"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateFormData('city', e.target.value)}
                        disabled
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Business Details */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        value={formData.businessName}
                        onChange={(e) => updateFormData('businessName', e.target.value)}
                        placeholder="Your business or service name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Service Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => updateFormData('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Business Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                        placeholder="Describe your services, specializations, and what makes you unique"
                        rows={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pricing">Pricing Range *</Label>
                      <Input
                        id="pricing"
                        value={formData.pricing}
                        onChange={(e) => updateFormData('pricing', e.target.value)}
                        placeholder="e.g., ₹500 - ₹2000"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Documents */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label>Government ID Proof * (Aadhaar/PAN/Driving License)</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <input
                          type="file"
                          id="idProof"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('idProof', e.target.files?.[0] || null)}
                        />
                        <label htmlFor="idProof" className="cursor-pointer block">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {formData.idProof ? formData.idProof.name : 'Click to upload ID proof'}
                          </p>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Business License/Registration * (if applicable)</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <input
                          type="file"
                          id="businessLicense"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('businessLicense', e.target.files?.[0] || null)}
                        />
                        <label htmlFor="businessLicense" className="cursor-pointer block">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {formData.businessLicense ? formData.businessLicense.name : 'Click to upload license'}
                          </p>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>GST Certificate (Optional)</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <input
                          type="file"
                          id="gstCertificate"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('gstCertificate', e.target.files?.[0] || null)}
                        />
                        <label htmlFor="gstCertificate" className="cursor-pointer block">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {formData.gstCertificate ? formData.gstCertificate.name : 'Click to upload GST certificate'}
                          </p>
                        </label>
                      </div>
                    </div>

                    <div className="bg-info/5 border border-info/20 rounded-lg p-4">
                      <p className="text-sm text-info-foreground">
                        All documents will be verified by our admin team. This typically takes 24-48 hours.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 4: Profile Setup */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label>Profile Photo *</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <input
                          type="file"
                          id="profilePhoto"
                          className="hidden"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('profilePhoto', e.target.files?.[0] || null)}
                        />
                        <label htmlFor="profilePhoto" className="cursor-pointer block">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {formData.profilePhoto ? formData.profilePhoto.name : 'Click to upload profile photo'}
                          </p>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience *</Label>
                      <Input
                        id="experience"
                        type="number"
                        value={formData.yearsOfExperience}
                        onChange={(e) => updateFormData('yearsOfExperience', e.target.value)}
                        placeholder="e.g., 5"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certifications">Certifications (Optional)</Label>
                      <Textarea
                        id="certifications"
                        value={formData.certifications}
                        onChange={(e) => updateFormData('certifications', e.target.value)}
                        placeholder="List any relevant certifications or qualifications"
                        rows={4}
                      />
                    </div>

                    <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                        <div>
                          <p className="font-medium text-success-foreground">Almost there!</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Click Submit to send your application for review. You'll be notified once approved.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {STEPS.length}
            </span>
            <Button onClick={handleNext}>
              {currentStep === 4 ? 'Submit Application' : 'Next'}
              {currentStep < 4 && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
