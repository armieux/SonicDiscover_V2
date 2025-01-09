"use client";

import React from 'react';
import HeatRating from "@/app/components/HeatRating/HeatRating";
import { FaPlay } from 'react-icons/fa';
import { useMusicContext } from '@/app/context/MusicContext';
import { Track } from '@/app/interfaces/Track';

// Re-declare ExtendedTrack if needed or import from the same file:
interface ExtendedTrack extends Track {
  artist: string;
  duration: string;
}

interface MusicCardProps {
  track: ExtendedTrack;
}

const MusicCard: React.FC<MusicCardProps> = ({ track }) => {
  // Optional: If you're using a global music context
  const { setCurrentTrack } = useMusicContext();

  // Optional: Handle playing via your global context
  const handlePlay = () => {
    // If your context expects just `Track`, this is already correct:
    setCurrentTrack(track);
  };

  return (
    <div className="flex items-center space-x-4 border-2 rounded-md p-4 shadow-md bg-white">
      {/* Image de la couverture */}
      <img
        src={track.trackpicture}
        alt={track.title}
        className="w-20 md:w-30 lg:w-40 h-20 md:h-30 lg:h-40 rounded-md"
      />

      {/* Informations sur la musique */}
      <div className="flex-1">
        {/* HeatRating can display track.playcount */}
        <HeatRating heat={track.playcount} />
        <h2 className="text-lg font-bold text-gray-800">{track.title}</h2>
        <p className="text-sm text-gray-600">{track.artist}</p>
        <p className="text-xs text-gray-400">{track.duration}</p>
      </div>

      {/* Bouton pour écouter */}
      <button
        onClick={handlePlay} // triggers global music player
        className="p-4 text-white bg-blue-500 hover:bg-blue-600 rounded-full"
      >
        <FaPlay size={15} />
      </button>
    </div>
  );
};

export default MusicCard;
