"use client";

interface PlaylistItemProps {
  item: {
    id: number;
    name: string;
    playlistpicture?: string;
  };
  index: number;
}

export default function PlaylistItem({ item }: PlaylistItemProps) {
  return (
    <div className="flex items-center text-white">
      <img
        src={item.playlistpicture || "https://placehold.co/50"}
        alt={item.name}
        className="w-8 h-8 inline-block m-1"
      />
      <span>{item.name}</span>
    </div>
  );
}
