
import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useProviders, useUpdateProvider } from '../api/providers';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Building2, MapPin, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from './ui/skeleton';

export default function ProviderProfilePage() {
  const { user } = useUser();
  // Fetch my provider profile
  // Again, relying on list filtering or ideally a direct fetch.
  // Using list filter for now as consistent with Services page quick fix.
  const { data: providersData, isLoading } = useProviders({ limit: 100 });
  const myProvider = providersData?.data.find(p => p.userId === user?.id);

  const updateMutation = useUpdateProvider();

  const [formData, setFormData] = useState({
     businessName: '',
     description: '',
     address: '',
     city: '',
     state: 'Maharashtra',
     pincode: '',
     primaryCategory: ''
  });

  useEffect(() => {
      if (myProvider) {
          setFormData({
              businessName: myProvider.businessName,
              description: myProvider.description || '',
              address: myProvider.address,
              city: myProvider.city,
              state: myProvider.state,
              pincode: myProvider.pincode,
              primaryCategory: myProvider.primaryCategory
          });
      }
  }, [myProvider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myProvider) return;

    try {
        await updateMutation.mutateAsync({
            id: myProvider.id,
            data: formData
        });
        toast.success('Profile updated successfully');
    } catch (error) {
        toast.error('Failed to update profile');
    }
  };

  if(!user) return <div>Please login</div>;
  if (isLoading) {
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="border rounded-xl p-6 space-y-6 bg-white">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
      );
  }
  if (!myProvider) return <div className="p-8 text-center">Provider profile not found. Please complete onboarding.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
      
      <div className="grid gap-6">
        {/* Basic Info */}
        <Card>
            <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Update your public business details.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Business Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input 
                                    value={formData.businessName}
                                    onChange={e => setFormData({...formData, businessName: e.target.value})}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Input 
                                value={formData.primaryCategory}
                                onChange={e => setFormData({...formData, primaryCategory: e.target.value})}
                                placeholder="e.g. Plumbing"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="Tell customers about your services..."
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input 
                                value={formData.address}
                                onChange={e => setFormData({...formData, address: e.target.value})}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">City</label>
                            <Input 
                                value={formData.city}
                                onChange={e => setFormData({...formData, city: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">State</label>
                            <Input 
                                value={formData.state}
                                onChange={e => setFormData({...formData, state: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Pincode</label>
                            <Input 
                                value={formData.pincode}
                                onChange={e => setFormData({...formData, pincode: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" className="bg-[#ff6b35] hover:bg-[#ff5722]">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>

        {/* Contact Info (Read Only for now mostly) */}
        <Card>
            <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Managed via your account settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-4 h-4" />
                    <span>{myProvider.user.email}</span>
                 </div>
                 <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-4 h-4" />
                    <span>{myProvider.user.phone || 'No phone linked'}</span>
                 </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
