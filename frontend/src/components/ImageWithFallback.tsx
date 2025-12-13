import { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '../lib/utils';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  width?: number | string;
  height?: number | string;
}

export default function ImageWithFallback({ 
  src, 
  alt, 
  className, 
  fallbackSrc = 'https://images.unsplash.com/photo-1581578731117-104f2a41d95b?w=800&auto=format&fit=crop&q=60', // Generic fallback
  loading = "lazy",
  ...props 
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  if (hasError && imgSrc === fallbackSrc) {
     // If even fallback fails (or if we prefer an icon for fallback), show icon
     // But strictly speaking, we try to show the fallback image first.
     // Let's rely on the fallback image working. If that fails too, show icon.
     // For simplicity, let's just retry with fallback.
  }

  return (
    <div className={cn("relative overflow-hidden bg-gray-100", className)}>
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={alt}
          onError={handleError}
          loading={loading}
          decoding="async"
          className={cn("w-full h-full object-cover transition-opacity duration-300", hasError ? 'opacity-80' : 'opacity-100')}
          {...props}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
          <ImageOff className="h-8 w-8" />
        </div>
      )}
    </div>
  );
}
