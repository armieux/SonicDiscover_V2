'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackComponent?: React.ReactNode;
  onError?: () => void;
  onLoad?: () => void;
  unoptimized?: boolean;
}

export default function SafeImage({ 
  src, 
  alt, 
  width, 
  height, 
  className, 
  fallbackComponent,
  onError,
  onLoad,
  unoptimized = true
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier si l'URL est valide
  const isValidUrl = (url: string | null | undefined): boolean => {
    if (!url || url.trim() === '') return false;
    
    try {
      new URL(url);
      return true;
    } catch {
      // Vérifier si c'est un chemin relatif valide
      return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
    }
  };

  // Fallback par défaut si aucun n'est fourni
  const defaultFallback = (
    <div className={`${className} bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center`}>
      <svg className="w-1/2 h-1/2 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    </div>
  );

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (onError) onError();
  };

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  // Si l'URL n'est pas valide ou qu'il y a eu une erreur, afficher le fallback
  if (!isValidUrl(src) || hasError) {
    return fallbackComponent || defaultFallback;
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`absolute inset-0 ${className} bg-gray-300 animate-pulse flex items-center justify-center`}>
          <svg className="w-1/3 h-1/3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      <Image
        src={src!}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        unoptimized={unoptimized}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
