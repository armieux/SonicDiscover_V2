"use client";

import { useState } from 'react';
import { FaMusic } from 'react-icons/fa';
import Image from 'next/image';


interface PlaylistItemProps {
  item: {
    id: number;
    name: string;
    playlistpicture?: string;
  };
  index: number;
  isOwnProfile: boolean;
}

export default function PlaylistItem({ item }: PlaylistItemProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="flex items-center text-white">
      {!imageError && item.playlistpicture ? (
        <Image
          src={item.playlistpicture}
          alt={item.name}
          width={32}
          height={32}
          className="w-8 h-8 inline-block m-1 object-cover rounded"
          onError={handleImageError}
          unoptimized
        />
      ) : (
        <div className="w-8 h-8 inline-block m-1 bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center">
          <FaMusic className="text-white text-xs" />
        </div>
      )}
      <span>{item.name}</span>
    </div>
  );
}
