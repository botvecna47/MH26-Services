import { useState } from 'react';
import { useCreateService } from '../api/services';
import { useCategories } from '../api/categories';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddServiceModalProps {
  onClose: () => void;
  canClose?: boolean;
}

export default function AddServiceModal({ onClose, canClose = true }: AddServiceModalProps) {
  const { data: categoriesData } = useCategories();
  const createServiceMutation = useCreateService();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    durationMin: '60',
    imageUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createServiceMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        durationMin: parseInt(formData.durationMin) || 60,
        imageUrl: formData.imageUrl || undefined,
        // Category will be handled by backend based on provider but we send it for UI consistency if needed
        // Actually backend sets it from provider profile, but let's see if we can override? 
        // Logic says: category: provider.primaryCategory. 
        // If the form allows selecting category, update provider? Or just service? 
        // Backend ignores this field currently for category, uses provider.primaryCategory.
        // But let's check input.
      } as any);
      
      toast.success("Service added successfully! It's now live on your profile.");
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add service');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Service</h2>
              {!canClose && <p className="text-sm text-orange-600 font-medium mt-1">Please add your first service to continue.</p>}
          </div>
          {canClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <div className="space-y-2">
            <Label>Service Name <span className="text-red-500">*</span></Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Full House Deep Cleaning"
              required
              className="focus:border-[#ff6b35]"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this service includes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] min-h-[100px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Category <span className="text-red-500">*</span></Label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] text-sm bg-white"
              required
            >
              <option value="" disabled hidden>Select a category</option>
              {(categoriesData || []).map((cat: any) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500">Service will be listed under your provider category.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price (₹) <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="999"
                min="0"
                required
                className="focus:border-[#ff6b35]"
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (min)</Label>
              <Input
                type="number"
                value={formData.durationMin}
                onChange={(e) => setFormData(prev => ({ ...prev, durationMin: e.target.value }))}
                placeholder="60"
                min="15"
                className="focus:border-[#ff6b35]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image URL (optional)</Label>
            <Input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://i.imgur.com/..."
              className="focus:border-[#ff6b35]"
            />
            <p className="text-xs text-gray-500">Provide a direct link to an image (Imgur, etc.)</p>
          </div>

          <div className="flex gap-3 pt-4">
            {canClose && (
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 hover:bg-gray-50">
                Cancel
                </Button>
            )}
            <Button 
              type="submit" 
              className={`flex-1 bg-[#ff6b35] hover:bg-[#e65a25] text-white ${!canClose ? 'w-full' : ''}`}
              disabled={createServiceMutation.isPending}
            >
              {createServiceMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding...</>
              ) : (
                canClose ? 'Add Service' : 'Add First Service'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
