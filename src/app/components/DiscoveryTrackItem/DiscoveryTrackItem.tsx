'use client';

import React from 'react';
import { Track } from '../../interfaces/Track';
import { FiPlay, FiHeart, FiClock, FiHeadphones } from 'react-icons/fi';
import { FaWaveSquare, FaStar } from 'react-icons/fa';
import Image from 'next/image';

interface DiscoveryTrackItemProps {
  track: Track;
  onClick?: () => void;
}

export const DiscoveryTrackItem: React.FC<DiscoveryTrackItemProps> = ({ track, onClick }) => {
  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getArtistNames = () => {
    if (track.trackartists && track.trackartists.length > 0) {
      return track.trackartists
        .map(ta => ta.users?.username || 'Artiste inconnu')
        .join(', ');
    }
    return 'Artiste inconnu';
  };

  return (
    <div 
      className="group flex items-center gap-4 p-4 rounded-2xl bg-surface-elevated bg-opacity-30 hover:bg-opacity-50 border border-surface-elevated hover:border-peach-soft hover:border-opacity-30 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Track Image avec overlay moderne */}
      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-card flex-shrink-0">
        {track.trackpicture ? (
          <Image 
            src={track.trackpicture} 
            alt={track.title}
            width={64}
            height={64}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-gray-cold to-peach-soft flex items-center justify-center">
            <FaWaveSquare className="w-6 h-6 text-text-primary opacity-60" />
          </div>
        )}
        
        {/* Play button overlay avec glassmorphisme */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center transition-all duration-300 ">
          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 shadow-lg">
            <FiPlay className="w-4 h-4 text-night-blue ml-0.5" />
          </div>
        </div>
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-text-primary truncate text-lg group-hover:text-peach-soft transition-colors duration-300">
          {track.title}
        </h3>
        <p className="text-text-secondary truncate mb-2">
          {getArtistNames()}
        </p>
        
        {/* Métadonnées avec style moderne */}
        <div className="flex items-center gap-2 flex-wrap">
          {track.genre && (
            <span className="px-2 py-1 bg-blue-gray-cold bg-opacity-20 text-blue-gray-cold border border-blue-gray-cold border-opacity-30 rounded-lg text-xs font-medium">
              {track.genre}
            </span>
          )}
          {track.bpm && (
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <FaWaveSquare className="w-3 h-3" />
              {track.bpm} BPM
            </span>
          )}
          {track.duration && (
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <FiClock className="w-3 h-3" />
              {formatDuration(track.duration)}
            </span>
          )}
        </div>
      </div>

      {/* Stats avec design moderne */}
      <div className="flex flex-col items-end gap-2 text-xs flex-shrink-0">
        {track.averagerating && track.averagerating > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-gold-soft bg-opacity-20 text-gold-soft border border-gold-soft border-opacity-30 rounded-lg">
            <FaStar className="w-3 h-3" />
            <span className="font-medium">{track.averagerating.toFixed(1)}</span>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          {track.likecount !== undefined && track.likecount > 0 && (
            <div className="flex items-center gap-1 text-text-muted hover:text-peach-soft transition-colors duration-300">
              <FiHeart className="w-3 h-3" />
              <span className="font-medium">{track.likecount}</span>
            </div>
          )}
          
          {track.playcount !== undefined && track.playcount > 0 && (
            <div className="flex items-center gap-1 text-text-muted hover:text-peach-soft transition-colors duration-300">
              <FiHeadphones className="w-3 h-3" />
              <span className="font-medium">{track.playcount}</span>
            </div>
          )}
        </div>
        
        {/* Indicateur de recommandation */}
        <div className="flex items-center gap-1 text-peach-soft opacity-60 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-2 h-2 bg-peach-soft rounded-full animate-pulse"></div>
          <span className="text-xs font-medium">Recommandé</span>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryTrackItem;
