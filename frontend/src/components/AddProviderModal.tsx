import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useCreateProvider } from '../api/admin';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

interface AddProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddProviderModal({ isOpen, onClose }: AddProviderModalProps) {
  const createProviderMutation = useCreateProvider();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    primaryCategory: '',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, primaryCategory: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.businessName || !formData.primaryCategory) {
      toast.error('Please fill in all required fields');
      return;
    }

    createProviderMutation.mutate(formData, {
      onSuccess: () => {
        toast.success(`Provider "${formData.businessName}" created successfully!`);
        toast.info(`Credentials sent to ${formData.email}`);
        onClose();
        // Reset form
        setFormData({
            name: '',
            email: '',
            phone: '',
            businessName: '',
            primaryCategory: '',
            address: '',
            city: 'Nanded',
            pincode: '',
            serviceRadius: '10'
        });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to create provider');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
            <div>
                 <h2 className="text-xl font-bold text-gray-900">Add New Provider</h2>
                 <p className="text-sm text-gray-500">Create a provider account manually.</p>
            </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* User Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">User Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                <Input id="name" name="name" placeholder="John Doe" required value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                <Input id="phone" name="phone" placeholder="9876543210" required value={formData.phone} onChange={handleInputChange} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input id="email" name="email" type="email" placeholder="john@example.com" required value={formData.email} onChange={handleInputChange} />
                <p className="text-xs text-gray-500">Credentials will be emailed to this address.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 my-4"></div>

          {/* Business Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Business Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name <span className="text-red-500">*</span></Label>
                <Input id="businessName" name="businessName" placeholder="Sai Plumbing" required value={formData.businessName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                <Select onValueChange={handleSelectChange} value={formData.primaryCategory}>
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
              <div className="space-y-2">
                 <Label htmlFor="serviceRadius">Service Radius (km)</Label>
                 <Input id="serviceRadius" name="serviceRadius" type="number" placeholder="10" value={formData.serviceRadius} onChange={handleInputChange} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" placeholder="Shop No. 1, Main Road" value={formData.address} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" value={formData.city} readOnly className="bg-gray-50" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" name="pincode" placeholder="431601" value={formData.pincode} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={createProviderMutation.isPending}>Cancel</Button>
            <Button type="submit" className="bg-[#ff6b35] hover:bg-[#e65a25]" disabled={createProviderMutation.isPending}>
              {createProviderMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Provider'
              )}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
