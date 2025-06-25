'use client';

import React from 'react';
import { Track } from '../../interfaces/Track';
import { FiPlay, FiHeart, FiClock } from 'react-icons/fi';
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
      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
      onClick={onClick}
    >
      {/* Track Image */}
      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
        {track.trackpicture ? (
          <Image 
            src={track.trackpicture} 
            alt={track.title}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <FiPlay className="w-5 h-5 text-white" />
          </div>
        )}
        
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all">
          <FiPlay className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">
          {track.title}
        </h3>
        <p className="text-sm text-gray-600 truncate">
          {getArtistNames()}
        </p>
        
        {/* Additional metadata */}
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          {track.genre && (
            <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
              {track.genre}
            </span>
          )}
          {track.bpm && (
            <span>{track.bpm} BPM</span>
          )}
          {track.duration && (
            <span className="flex items-center gap-1">
              <FiClock className="w-3 h-3" />
              {formatDuration(track.duration)}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col items-end text-xs text-gray-500 flex-shrink-0">
        {track.averagerating && track.averagerating > 0 && (
          <div className="flex items-center gap-1 text-yellow-600">
            <span>⭐</span>
            <span>{track.averagerating.toFixed(1)}</span>
          </div>
        )}
        
        <div className="flex items-center gap-3 mt-1">
          {track.likecount !== undefined && track.likecount > 0 && (
            <div className="flex items-center gap-1">
              <FiHeart className="w-3 h-3" />
              <span>{track.likecount}</span>
            </div>
          )}
          
          {track.playcount !== undefined && track.playcount > 0 && (
            <div className="flex items-center gap-1">
              <FiPlay className="w-3 h-3" />
              <span>{track.playcount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoveryTrackItem;
