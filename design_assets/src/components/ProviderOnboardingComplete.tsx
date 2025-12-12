import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ProviderAPI } from '../services/api';
import { toast } from 'sonner@2.0.3';
import { useUser } from '../context/UserContext';

export default function ProviderOnboardingComplete() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    serviceCategory: 'tiffin-services',
    street: '',
    area: '',
    city: 'Nanded',
    state: 'Maharashtra',
    pincode: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please sign in first');
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken') || '';
      const response = await ProviderAPI.applyAsProvider(token, formData);

      if (response.success) {
        toast.success(response.message || 'Application submitted successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        toast.error(response.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#ff6b35] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl">🏪</span>
          </div>
          <h1 className="text-gray-900 mb-2">Become a Service Provider</h1>
          <p className="text-gray-600">
            Join our platform and connect with thousands of customers in Nanded
          </p>
        </div>

        {/* Progress Steps */}
        <div className="glass rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div
                className={`h-2 rounded-full ${
                  step >= 1 ? 'bg-[#ff6b35]' : 'bg-gray-300'
                }`}
              />
            </div>
            <div className="px-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 1
                    ? 'bg-[#ff6b35] text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                1
              </div>
            </div>
            <div className="flex-1">
              <div
                className={`h-2 rounded-full ${
                  step >= 2 ? 'bg-[#ff6b35]' : 'bg-gray-300'
                }`}
              />
            </div>
            <div className="px-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 2
                    ? 'bg-[#ff6b35] text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                2
              </div>
            </div>
            <div className="flex-1">
              <div
                className={`h-2 rounded-full ${
                  step >= 3 ? 'bg-[#ff6b35]' : 'bg-gray-300'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="glass-strong rounded-xl p-8 shadow-xl space-y-6">
            {step === 1 && (
              <>
                <div>
                  <h2 className="text-gray-900 mb-4">Business Information</h2>
                </div>

                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                    placeholder="e.g., Rajesh Home Tiffin Service"
                    className="glass-strong mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="businessDescription">Business Description *</Label>
                  <Textarea
                    id="businessDescription"
                    value={formData.businessDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessDescription: e.target.value,
                      })
                    }
                    placeholder="Describe your services..."
                    className="glass-strong mt-1"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="serviceCategory">Service Category *</Label>
                  <select
                    id="serviceCategory"
                    value={formData.serviceCategory}
                    onChange={(e) =>
                      setFormData({ ...formData, serviceCategory: e.target.value })
                    }
                    className="glass-strong w-full px-3 py-2 rounded-lg mt-1 border border-white/30 focus:ring-2 focus:ring-[#ff6b35]/30 focus:outline-none"
                    required
                  >
                    <option value="tiffin-services">Tiffin Services</option>
                    <option value="electrical-services">Electrical Services</option>
                    <option value="plumbing-services">Plumbing Services</option>
                    <option value="tourism-guide">Tourism Guide</option>
                  </select>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <h2 className="text-gray-900 mb-4">Business Address</h2>
                </div>

                <div>
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) =>
                      setFormData({ ...formData, street: e.target.value })
                    }
                    placeholder="Shop No., Building Name, Street"
                    className="glass-strong mt-1"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="area">Area *</Label>
                    <Input
                      id="area"
                      value={formData.area}
                      onChange={(e) =>
                        setFormData({ ...formData, area: e.target.value })
                      }
                      placeholder="Shivaji Nagar"
                      className="glass-strong mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData({ ...formData, pincode: e.target.value })
                      }
                      placeholder="431601"
                      className="glass-strong mt-1"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      className="glass-strong mt-1 bg-gray-50"
                      disabled
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      className="glass-strong mt-1 bg-gray-50"
                      disabled
                    />
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-gray-900 mb-2">Ready to Submit!</h2>
                <p className="text-gray-600 mb-6">
                  Review your information and submit your application. We'll review it
                  within 2-3 business days.
                </p>

                <div className="glass rounded-lg p-4 text-left space-y-2 max-w-md mx-auto">
                  <p>
                    <strong>Business:</strong> {formData.businessName}
                  </p>
                  <p>
                    <strong>Category:</strong> {formData.serviceCategory}
                  </p>
                  <p>
                    <strong>Address:</strong> {formData.street}, {formData.area}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="border-white/30 hover:bg-white/20"
              >
                Back
              </Button>
            )}

            <div className="ml-auto">
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="bg-[#ff6b35] hover:bg-[#e85a2d] text-white shadow-lg shadow-orange-200/50 active:scale-95 transition-all"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#ff6b35] hover:bg-[#e85a2d] text-white shadow-lg shadow-orange-200/50 active:scale-95 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
