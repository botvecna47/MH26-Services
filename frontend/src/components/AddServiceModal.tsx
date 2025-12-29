import { useState, useEffect, useRef } from 'react';
import { useCreateService, useUpdateService, useUploadServiceImage, Service } from '../api/services';
import { useCategories } from '../api/categories';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import ImageWithFallback from './ImageWithFallback';
import { X, Loader2, Upload, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface AddServiceModalProps {
  onClose: () => void;
  canClose?: boolean;
  service?: Service; // Optional service for editing
}

export default function AddServiceModal({ onClose, canClose = true, service }: AddServiceModalProps) {
  const { data: categoriesData } = useCategories();
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    imageUrl: ''
  });

  const uploadImageMutation = useUploadServiceImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setSelectedFile(file);
    // Preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Populate form if editing
  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || '',
        description: service.description || '',
        category: service.category || '',
        price: service.price?.toString() || '',
        imageUrl: service.imageUrl || ''
      });
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        imageUrl: selectedFile ? undefined : formData.imageUrl,
      };

      let finalService: Service;

      if (service) {
        // Update mode
        finalService = await updateServiceMutation.mutateAsync({
           id: service.id,
           data: payload
        });
        
        // If there's a new file to upload
        if (selectedFile) {
          setUploading(true);
          await uploadImageMutation.mutateAsync({ id: service.id, file: selectedFile });
          setUploading(false);
        }
        
        toast.success("Service updated successfully!");
      } else {
        // Create mode
        finalService = await createServiceMutation.mutateAsync(payload as any);
        
        // Handle image upload after creation
        if (selectedFile) {
          setUploading(true);
          try {
            await uploadImageMutation.mutateAsync({ id: finalService.id, file: selectedFile });
          } catch (uploadErr) {
            console.error('Initial upload failed:', uploadErr);
            toast.error('Service created, but image upload failed. You can update it from My Services.');
          } finally {
            setUploading(false);
          }
        }
        
        toast.success("Service added successfully! It's now live on your profile.");
      }
      
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${service ? 'update' : 'add'} service`);
    }
  };

  const isPending = createServiceMutation.isPending || updateServiceMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <div>
              <h2 className="text-xl font-bold text-gray-900">{service ? 'Edit Service' : 'Add New Service'}</h2>
              {!canClose && !service && <p className="text-sm text-orange-600 font-medium mt-1">Please add your first service to continue.</p>}
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
          </div>

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
            <Label>Service Image</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                onChange={(e) => {
                    setFormData(prev => ({ ...prev, imageUrl: e.target.value }));
                    setSelectedFile(null); // Clear selected file if manually typing URL
                }}
                placeholder="Image URL or upload a file"
                className="focus:border-[#ff6b35] flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Upload image"
                className="shrink-0"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </Button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
            />
            {formData.imageUrl && (
              <div className="mt-2 relative aspect-video rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                <ImageWithFallback src={formData.imageUrl} alt="Service preview" className="w-full h-full object-cover" />
                {selectedFile && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-[#ff6b35] text-white text-[10px] rounded-md font-bold shadow-sm">
                        New File Selected
                    </div>
                )}
              </div>
            )}
            <p className="text-[10px] text-gray-500">Provide a direct link or upload a photo. If left empty, your business cover image will be used.</p>
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
              disabled={isPending}
            >
              {isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{service ? 'Updating...' : 'Adding...'}</>
              ) : (
                service ? 'Save Changes' : (canClose ? 'Add Service' : 'Add First Service')
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
