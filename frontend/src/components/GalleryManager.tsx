import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useRemoveGalleryImage, useProvider, useUpdateProvider } from '../api/providers';
import ImageWithFallback from './ImageWithFallback';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { Loader2, Plus, X, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

export default function GalleryManager() {
  const { user } = useUser();
  const providerId = user?.provider?.id;
  const { data: provider, isLoading: isLoadingProvider, refetch } = useProvider(providerId || '');
  
  const removeMutation = useRemoveGalleryImage();
  const updateProvider = useUpdateProvider();
  
  const [newUrl, setNewUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!providerId) {
    return (
      <div className="p-8 text-center glass rounded-xl">
        <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Only providers can manage a gallery.</p>
      </div>
    );
  }

  if (isLoadingProvider) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#ff6b35]" />
      </div>
    );
  }

  const handleAddUrl = async () => {
    if (!newUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(newUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    const currentGallery = provider?.gallery || [];
    if (currentGallery.length >= 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    try {
      setIsAdding(true);
      await updateProvider.mutateAsync({
        id: providerId,
        data: { gallery: [...currentGallery, newUrl.trim()] }
      });
      setNewUrl('');
      refetch();
      toast.success('Image URL added to gallery');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add image');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    if (!confirm('Remove this image from your gallery?')) return;

    try {
      await removeMutation.mutateAsync({ id: providerId, imageUrl });
      toast.success('Image removed');
    } catch (error) {
      toast.error('Failed to remove image');
    }
  };

  const gallery = provider?.gallery || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Manage Gallery</h2>
        <p className="text-sm text-gray-500">Add up to 5 image URLs to showcase your work.</p>
      </div>

      {/* URL Input Section */}
      {gallery.length < 5 && (
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Image URL</label>
            <Input
              placeholder="https://example.com/image.jpg"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
            />
          </div>
          <Button 
            onClick={handleAddUrl} 
            className="bg-[#ff6b35] hover:bg-[#ff5722] text-white"
            disabled={isAdding || !newUrl.trim()}
          >
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Add
          </Button>
        </div>
      )}

      {/* Gallery Grid */}
      {gallery.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <LinkIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Your gallery is empty</h3>
          <p className="text-gray-500 mb-4 text-sm max-w-xs mx-auto">
            Paste image URLs above to add photos of your work.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((img, idx) => (
            <div key={idx} className="group relative aspect-video glass rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <ImageWithFallback 
                src={img} 
                alt={`Gallery image ${idx + 1}`} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleRemoveImage(img)}
                  disabled={removeMutation.isPending}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur rounded text-[10px] font-bold text-gray-700 shadow-sm uppercase tracking-wider">
                Image {idx + 1}
              </div>
            </div>
          ))}

          {gallery.length < 5 && (
            <div className="aspect-video border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 bg-gray-50/50">
              <span className="text-sm text-gray-400 font-medium">{5 - gallery.length} slots remaining</span>
            </div>
          )}
        </div>
      )}

      {gallery.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3 items-start">
          <ImageIcon className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold mb-1">Pro Tip</p>
            <p>The first image will be your profile cover. Use high-quality image URLs from reliable sources.</p>
          </div>
        </div>
      )}
    </div>
  );
}
