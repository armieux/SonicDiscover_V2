"use client";

import React from 'react';
import { FaPlay } from 'react-icons/fa';
import { useMusicContext } from '@/app/context/MusicContext';
import { ExtendedTrack } from '@/app/musicListPage/page';

interface PlayAllButtonProps {
  tracks: ExtendedTrack[];
  className?: string;
  children?: React.ReactNode;
}

const PlayAllButton: React.FC<PlayAllButtonProps> = ({ tracks, className, children }) => {
  const { setCurrentTrack } = useMusicContext();

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      // Commencer par le premier morceau
      setCurrentTrack(tracks[0], tracks, 0);
    }
  };

  if (tracks.length === 0) {
    return null;
  }

  return (
    <button
      onClick={handlePlayAll}
      className={className || "flex items-center gap-3 bg-green-500 hover:bg-green-400 text-black font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105"}
    >
      <FaPlay size={16} />
      {children || 'Lecture'}
    </button>
  );
};

export default PlayAllButton;
