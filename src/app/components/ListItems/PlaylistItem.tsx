"use client";

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
  return (
    <div className="flex items-center text-white">
      <Image
        src={item.playlistpicture || "https://placehold.co/50"}
        alt={item.name}
        width={32}
        height={32}
        className="w-8 h-8 inline-block m-1 object-cover"
      />
      <span>{item.name}</span>
    </div>
  );
}
