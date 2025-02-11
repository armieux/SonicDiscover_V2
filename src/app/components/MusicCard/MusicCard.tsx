"use client";

import React from "react";
import HeatRating from "@/app/components/HeatRating/HeatRating";
import { FaPlay } from "react-icons/fa";
import { useMusicContext } from "@/app/context/MusicContext";
import { ExtendedTrack } from "@/app/musicListPage/page";

// Extend the Track interface to include additional fields.


interface MusicCardProps {
  track: ExtendedTrack;
  index: number;
  playlist: ExtendedTrack[];
}

const MusicCard: React.FC<MusicCardProps> = ({ track, index, playlist }) => {
  const { setCurrentTrack } = useMusicContext();

  const handlePlay = () => {
    // Set the current track along with the entire playlist and its index.
    setCurrentTrack(track, playlist, index);
  };

  return (
    <div className="flex items-center space-x-4 border-2 rounded-md p-4 shadow-md bg-white">
      {/* Cover image */}
      <img
        src={track.trackpicture}
        alt={track.title}
        className="w-20 md:w-30 lg:w-40 h-20 md:h-30 lg:h-40 rounded-md"
      />

      {/* Song information */}
      <div className="flex-1">
        <HeatRating heat={track.likecount - track.dislikecount} trackId={track.id.toString()} />
        <h2 className="text-lg font-bold text-gray-800">{track.title}</h2>
        <p className="text-sm text-gray-600">{track.artist}</p>
        <p className="text-xs text-gray-400">{track.parsedduration}</p>
      </div>

      {/* Play button */}
      <button
        onClick={handlePlay}
        className="p-4 text-white bg-blue-500 hover:bg-blue-600 rounded-full"
      >
        <FaPlay size={15} />
      </button>
    </div>
  );
};

export default MusicCard;
