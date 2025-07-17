import React from 'react';

/**
 * Vérifie si une URL d'image est valide
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || url.trim() === '') {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    const validProtocols = ['http:', 'https:', 'data:'];
    
    if (!validProtocols.includes(parsedUrl.protocol)) {
      return false;
    }

    // Vérifier les extensions d'image courantes
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg)(\?.*)?$/i;
    const isDataUrl = parsedUrl.protocol === 'data:' && parsedUrl.pathname.startsWith('image/');
    
    return imageExtensions.test(parsedUrl.pathname) || isDataUrl;
  } catch {
    return false;
  }
}

/**
 * Composant d'image sécurisé pour l'administration
 */
interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackIcon: React.ReactNode;
  onError?: () => void;
}

export function SafeImage({ src, alt, className, fallbackIcon, onError }: SafeImageProps) {
  if (!isValidImageUrl(src)) {
    return fallbackIcon;
  }

  // Créer l'élément img avec React.createElement au lieu de JSX
  return React.createElement('img', {
    src: src || '',
    alt: alt,
    className: className,
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      e.currentTarget.style.display = 'none';
      if (onError) onError();
    }
  });
}
