import { useState } from 'react';
import { Check, ArrowRight, ArrowLeft, Upload, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { mockCategories } from '../data/mockData';

const STEPS = [
  { id: 1, name: 'Basic Info', description: 'Tell us about yourself' },
  { id: 2, name: 'Services', description: 'What services do you offer?' },
  { id: 3, name: 'Location', description: 'Where do you operate?' },
  { id: 4, name: 'Gallery', description: 'Showcase your work' },
  { id: 5, name: 'Documents', description: 'Verification documents' },
  { id: 6, name: 'Review', description: 'Review and submit' }
];

export default function ProviderOnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    email: '',
    phone: '',
    bio: '',
    // Step 2: Services
    categories: [] as string[],
    customCategory: '',
    // Step 3: Location
    location: '',
    lat: '',
    lng: '',
    // Step 4: Gallery
    gallery: [] as File[],
    // Step 5: Documents
    idProof: null as File | null,
    businessLicense: null as File | null,
    gstCertificate: null as File | null,
    // Step 6: Agreement
    agreeToTerms: false
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1) {
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error('Please fill all required fields');
        return;
      }
    } else if (currentStep === 2) {
      if (formData.categories.length === 0) {
        toast.error('Please select at least one service category');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.location) {
        toast.error('Please enter your service location');
        return;
      }
    } else if (currentStep === 5) {
      if (!formData.idProof) {
        toast.error('ID proof is required for verification');
        return;
      }
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    // In real app: POST /api/providers/onboard (multipart form data)
    // This would upload files and create a pending provider record
    
    toast.success('Application submitted successfully! Our team will review your documents.');
    
    // Redirect to dashboard or success page
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const toggleCategory = (category: string) => {
    if (formData.categories.includes(category)) {
      updateFormData('categories', formData.categories.filter(c => c !== category));
    } else {
      updateFormData('categories', [...formData.categories, category]);
    }
  };

  const handleFileChange = (field: string, files: FileList | null) => {
    if (files && files.length > 0) {
      if (field === 'gallery') {
        updateFormData(field, Array.from(files));
      } else {
        updateFormData(field, files[0]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-gray-900 mb-2">Become a Service Provider</h1>
          <p className="text-gray-600">Join MH26 Services and grow your business in Nanded</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      currentStep > step.id
                        ? 'bg-green-500 border-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-[#ff6b35] border-[#ff6b35] text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <div className="text-center mt-2 hidden md:block">
                    <p className={`text-xs font-medium ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.name}
                    </p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-gray-900 mb-1">{STEPS[currentStep - 1].name}</h2>
            <p className="text-gray-600">{STEPS[currentStep - 1].description}</p>
          </div>

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name / Business Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="Enter your name or business name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="+91-XXXXXXXXXX"
                />
              </div>
              <div>
                <Label htmlFor="bio">About Your Business</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => updateFormData('bio', e.target.value)}
                  placeholder="Tell customers about your experience, expertise, and what makes you unique..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Service Categories *</Label>
                <p className="text-sm text-gray-500 mb-3">Select all services you offer</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {mockCategories.map((category) => (
                    <div
                      key={category}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.categories.includes(category)
                          ? 'border-[#ff6b35] bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleCategory(category)}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={formData.categories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <span className="text-sm">{category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="customCategory">Other Services (Optional)</Label>
                <Input
                  id="customCategory"
                  value={formData.customCategory}
                  onChange={(e) => updateFormData('customCategory', e.target.value)}
                  placeholder="e.g., Custom Carpentry, Event Planning"
                />
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="location">Service Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                    placeholder="e.g., Shivaji Nagar, Nanded"
                    className="pl-10"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Enter the area where you provide services
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lat">Latitude (Optional)</Label>
                  <Input
                    id="lat"
                    value={formData.lat}
                    onChange={(e) => updateFormData('lat', e.target.value)}
                    placeholder="19.1383"
                  />
                </div>
                <div>
                  <Label htmlFor="lng">Longitude (Optional)</Label>
                  <Input
                    id="lng"
                    value={formData.lng}
                    onChange={(e) => updateFormData('lng', e.target.value)}
                    placeholder="77.3210"
                  />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  💡 Tip: Providing accurate location helps customers find you easily
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Gallery */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="gallery">Work Gallery (Optional)</Label>
                <p className="text-sm text-gray-500 mb-3">
                  Upload photos showcasing your work and services
                </p>
                <label
                  htmlFor="gallery"
                  className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#ff6b35] hover:bg-orange-50 transition-colors"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {formData.gallery.length > 0
                      ? `${formData.gallery.length} image(s) selected`
                      : 'Click to upload images'}
                  </span>
                  <span className="text-xs text-gray-500">
                    JPG, PNG up to 10MB each
                  </span>
                  <input
                    id="gallery"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileChange('gallery', e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>
              {formData.gallery.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {formData.gallery.map((file, idx) => (
                    <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Documents */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-900">
                  ⚠️ All documents will be verified by our team. Please upload clear, readable copies.
                </p>
              </div>

              <div>
                <Label htmlFor="idProof">Government ID Proof *</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Aadhaar Card, PAN Card, Driving License, or Passport
                </p>
                <Input
                  id="idProof"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('idProof', e.target.files)}
                />
                {formData.idProof && (
                  <p className="text-sm text-green-600 mt-1">✓ {formData.idProof.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="businessLicense">Business License (Optional)</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Trade license, Shop Act registration, or similar
                </p>
                <Input
                  id="businessLicense"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('businessLicense', e.target.files)}
                />
                {formData.businessLicense && (
                  <p className="text-sm text-green-600 mt-1">✓ {formData.businessLicense.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="gstCertificate">GST Certificate (If applicable)</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Required if you're registered under GST
                </p>
                <Input
                  id="gstCertificate"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('gstCertificate', e.target.files)}
                />
                {formData.gstCertificate && (
                  <p className="text-sm text-green-600 mt-1">✓ {formData.gstCertificate.name}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="text-gray-900">Application Summary</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{formData.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{formData.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium">{formData.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <p className="font-medium">{formData.location}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-600">Services:</span>
                    <p className="font-medium">{formData.categories.join(', ')}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Documents Uploaded:</span>
                    <p className="font-medium">
                      {[
                        formData.idProof && 'ID Proof',
                        formData.businessLicense && 'Business License',
                        formData.gstCertificate && 'GST Certificate'
                      ].filter(Boolean).join(', ') || 'None'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => updateFormData('agreeToTerms', checked)}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                    I agree to the MH26 Services <a href="#" className="text-[#ff6b35] hover:underline">Terms of Service</a> and <a href="#" className="text-[#ff6b35] hover:underline">Privacy Policy</a>. I confirm that all information provided is accurate and I have the right to provide the services listed.
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  📋 After submission, our team will review your application within 2-3 business days. You'll receive an email once your account is verified.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {currentStep < STEPS.length ? (
              <Button onClick={handleNext} className="bg-[#ff6b35] hover:bg-[#ff5722] gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 gap-2"
              >
                <Check className="h-4 w-4" />
                Submit Application
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
