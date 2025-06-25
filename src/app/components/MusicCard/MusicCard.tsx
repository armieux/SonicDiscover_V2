"use client";

import React from "react";
import HeatRating from "@/app/components/HeatRating/HeatRating";
import { FaPlay, FaUser } from "react-icons/fa";
import { useMusicContext } from "@/app/context/MusicContext";
import { ExtendedTrack } from "@/app/musicListPage/page";
import { AddToPlaylistButton } from "../AddToPlaylistButton/AddToPlaylistButton";
import { RemoveFromPlaylistButton } from "../RemoveFromPlaylistButton/RemoveFromPlaylistButton";
import Image from 'next/image';

interface MusicCardProps {
  track: ExtendedTrack;
  index: number;
  playlist: ExtendedTrack[];
  inPlaylist?: boolean;
  playlistId?: number;
}

const MusicCard: React.FC<MusicCardProps> = ({ track, index, playlist, inPlaylist = false, playlistId }) => {
  const { setCurrentTrack } = useMusicContext();

  const handlePlay = () => {
    setCurrentTrack(track, playlist, index);
  };

  return (
    <div className="group music-card interactive-hover flex items-center gap-4 p-5">
      {/* Cover image avec overlay */}
      <div className="relative overflow-hidden rounded-xl flex-shrink-0">
        <Image
          src={track.trackpicture}
          alt={track.title}
          width={80}
          height={80}
          className="w-16 h-16 md:w-20 md:h-20 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={handlePlay}
            className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-night-blue opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300"
          >
            <FaPlay size={10} className="ml-0.5" />
          </button>
        </div>
      </div>

      {/* Informations du morceau */}
      <div className="flex-1 min-w-0 pr-4">
        {/* Rating en haut */}
        <div className="mb-2">
          <HeatRating heat={track.likecount - track.dislikecount} trackId={track.id.toString()} />
        </div>
        
        {/* Titre */}
        <h2 className="text-lg font-semibold text-text-primary mb-1 truncate group-hover:text-peach-soft transition-colors duration-300">
          {track.title}
        </h2>
        
        {/* Artiste */}
        <a 
          href={`/profilePage/${track.artistid}`} 
          className="flex items-center gap-2 text-text-secondary hover:text-peach-soft transition-colors duration-300 mb-1"
        >
          <FaUser size={12} />
          <span className="text-sm">{track.artistname}</span>
        </a>
        
        {/* Durée */}
        <p className="text-xs text-text-muted font-mono">{track.parsedduration}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Bouton playlist */}
        {inPlaylist && playlistId ? (
          <RemoveFromPlaylistButton playlistId={playlistId} trackId={track.id} />
        ) : (
          <AddToPlaylistButton trackId={track.id} />
        )}

        {/* Bouton play principal */}
        <button
          onClick={handlePlay}
          className="w-12 h-12 bg-gradient-primary hover:scale-105 transition-transform duration-300 rounded-full flex items-center justify-center text-night-blue shadow-accent group-hover:shadow-accent-strong"
        >
          <FaPlay size={14} className="ml-0.5" />
        </button>
      </div>
    </div>
  );
};

export default MusicCard;
