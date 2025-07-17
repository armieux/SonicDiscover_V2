import React from 'react';
import Image from 'next/image';

/**
 * Vérifie si une URL d'image est valide
 */
function isValidImageUrl(url: string | null | undefined): boolean {
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
function SafeImage({
  src,
  alt, 
  className, 
  fallbackIcon, 
  onError,
  width = 100,
  height = 100
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackIcon: React.ReactNode;
  onError?: () => void;
  width?: number;
  height?: number;
}): React.ReactElement {
  if (!isValidImageUrl(src)) {
    return <>{fallbackIcon}</>;
  }

  return (
    <Image
      src={src!}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        if (onError) onError();
      }}
      unoptimized
    />
  );
}

// Composant de page Next.js
export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <h1>Page de l&apos;artiste {id}</h1>
      {/* Exemple d'utilisation de SafeImage */}
      <SafeImage
        src={null}
        alt="Photo de profil de l'artiste"
        fallbackIcon={<div>👤</div>}
        className="rounded-full"
      />
    </div>
  );
}
