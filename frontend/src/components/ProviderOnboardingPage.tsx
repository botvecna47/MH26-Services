import { useState } from 'react';
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
import { Briefcase, MapPin, Phone, Upload } from 'lucide-react';

export default function ProviderOnboardingPage() {
  const { user, refreshProfile } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: '',
    primaryCategory: '',
    description: '',
    experienceYears: '',
    address: '',
    city: 'Nanded',
    pincode: '',
    serviceRadius: '10'
  });

  const categories = [
    { id: 'plumbing', name: 'Plumbing' },
    { id: 'electrical', name: 'Electrical' },
    { id: 'cleaning', name: 'Cleaning' },
    { id: 'tiffin', name: 'Tiffin Service' },
    { id: 'salon', name: 'Salon' },
    { id: 'fitness', name: 'Fitness & Yoga' },
    { id: 'tourism', name: 'Tourism' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, primaryCategory: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to apply.');
      navigate('/auth');
      return;
    }

    try {
      setLoading(true);
      // Construct the payload expected by the backend
      // Assuming POST /providers creates a provider profile for the current user
      await axiosClient.post('/providers', {
        userId: user.id, // Depending on backend, might be inferred from token
        businessName: formData.businessName,
        primaryCategory: formData.primaryCategory,
        bio: formData.description,
        experienceYears: parseInt(formData.experienceYears) || 0,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        phone: user.phone || '', // User phone as default contact,
        serviceRadius: parseInt(formData.serviceRadius) || 5,
        status: 'PENDING'
      });

      toast.success('Application submitted successfully! Redirecting...');
      
      // Refresh user profile to update role/status if immediate
      if (refreshProfile) await refreshProfile(); 

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Become a Service Provider</h1>
          <p className="mt-2 text-gray-600">Join MH26 Services and grow your business today.</p>
        </div>

        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="px-0">
            <CardTitle>Business Details</CardTitle>
            <CardDescription>Tell us about the services you offer.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Business Details Section */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-4 mb-2">Business Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
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
                    <Label htmlFor="category">Primary Service Category</Label>
                    <Select onValueChange={handleSelectChange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
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
              </div>

              {/* Service & Experience Section */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-4 mb-2">Service Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <Label htmlFor="experienceYears">Years of Experience</Label>
                    <Input 
                      id="experienceYears" 
                      name="experienceYears" 
                      type="number" 
                      min="0"
                      placeholder="e.g. 5" 
                      required 
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
                      required 
                      value={formData.serviceRadius}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-4 mb-2">Location</h3>
                
                <div className="space-y-2">
                  <Label>Business Address</Label>
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
                      defaultValue="Nanded"
                      readOnly
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
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full bg-[#ff6b35] hover:bg-[#e65a25]" disabled={loading}>
                  {loading ? 'Submitting Application...' : 'Submit Application'}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
