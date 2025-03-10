"use client";

import { TrackArtist } from "@/app/interfaces/TrackArtist";

interface TrackItemProps {
  item: TrackArtist; // Adjust type as needed
  index: number;
}

export default function TrackItem({ item }: TrackItemProps) {
  const tracks = item;
  return (
    <div className="flex justify-between items-center text-white">
      <div className="flex items-center">
        <img
          src={tracks.tracks.trackpicture || "https://placehold.co/50"}
          alt={tracks.tracks.title}
          className="w-8 h-8 inline-block m-1"
        />
        <p>{tracks.tracks.title} - {tracks.tracks.genre}</p>
      </div>
      <p>{tracks.tracks.playcount} écoutes</p>
    </div>
  );
}
