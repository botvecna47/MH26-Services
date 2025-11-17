/**
 * Profile Picture Upload Component
 */
import { useState, useRef } from 'react';
import { Upload, X, Loader2, User } from 'lucide-react';
import { Button } from './ui/button';
import { useUploadAvatar } from '../api/users';
import { useUser } from '../context/UserContext';
import { useAuth } from '../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

interface ProfilePictureUploadProps {
  onUploadComplete?: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProfilePictureUpload({ 
  onUploadComplete, 
  size = 'md',
  className = '' 
}: ProfilePictureUploadProps) {
  const { user } = useUser();
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const uploadMutation = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadMutation.mutate(file, {
      onSuccess: async (data) => {
        toast.success('Profile picture updated successfully');
        setPreview(null);
        
        // Refresh user data from both contexts
        try {
          await refreshUser();
        } catch (error) {
          // Ignore errors - user might not be authenticated
        }
        
        // Also invalidate React Query cache
        queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
        
        // Trigger UserContext sync
        window.dispatchEvent(new Event('userUpdated'));
        
        onUploadComplete?.(data.url);
      },
      onError: (error: any) => {
        // Handle CORS and other upload errors
        const errorMessage = error?.message || error?.response?.data?.error || 'Failed to upload profile picture';
        toast.error(errorMessage, {
          duration: errorMessage.includes('CORS') ? 8000 : 4000, // Show CORS errors longer
        });
        setPreview(null);
      },
    });
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentAvatar = preview || user?.avatarUrl;

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        {currentAvatar ? (
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-200">
            <ImageWithFallback
              src={currentAvatar}
              alt={user?.name || 'Profile'}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
            <User className={`${size === 'lg' ? 'w-16 h-16' : size === 'md' ? 'w-12 h-12' : 'w-8 h-8'} text-gray-400`} />
          </div>
        )}
        
        {uploadMutation.isPending && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploadMutation.isPending}
        />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {uploadMutation.isPending ? 'Uploading...' : 'Upload Photo'}
        </Button>

        {preview && !uploadMutation.isPending && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center max-w-xs">
        JPG, PNG or GIF. Max size 5MB
      </p>
    </div>
  );
}

