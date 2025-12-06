import React, { useState } from 'react'
import { normalizeImageUrl } from '../../utils/imageUrl'



export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, ...rest } = props
  
  // Normalize the image URL (handles local uploads)
  const normalizedSrc = src ? normalizeImageUrl(src) : undefined

  return didError ? (
    <div
      className={`inline-block bg-gray-200 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 p-2">
         <span className="text-xs">Image Error</span>
      </div>
    </div>
  ) : (
    <img 
      src={normalizedSrc} 
      alt={alt} 
      className={className} 
      style={style} 
      {...rest} 
      onError={handleError}
      crossOrigin="anonymous"
    />
  )
}
