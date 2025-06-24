'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Track } from '../../interfaces/Track';
import { DiscoveryTrackItem } from '../DiscoveryTrackItem/DiscoveryTrackItem';
import { FiCompass, FiArrowRight, FiRefreshCw } from 'react-icons/fi';

interface DiscoveryPreviewProps {
  onTrackSelect?: (track: Track) => void;
}

export const DiscoveryPreview: React.FC<DiscoveryPreviewProps> = ({ onTrackSelect }) => {
  const [previewTracks, setPreviewTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/playlists/discover');
      
      if (!response.ok) {
        if (response.status === 401) {
          // User not logged in, show nothing
          setPreviewTracks([]);
          return;
        }
        throw new Error('Impossible de charger les recommandations');
      }
      
      const data = await response.json();
      // Show only top 3 tracks for preview
      setPreviewTracks(data.tracks.slice(0, 3));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, []);

  // Don't show anything if user is not logged in
  if (error && error.includes('Unauthorized')) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FiCompass className="text-blue-600" />
            Découvertes pour vous
          </h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FiCompass className="text-blue-600" />
            Découvertes pour vous
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={fetchPreview}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <FiRefreshCw /> Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!previewTracks.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FiCompass className="text-blue-600" />
            Découvertes pour vous
          </h2>
        </div>
        <div className="text-center py-8">
          <FiCompass className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Pas encore de recommandations</h3>
          <p className="text-gray-600 mb-4">
            Écoutez plus de musique et likez vos pistes préférées pour recevoir des recommandations personnalisées.
          </p>
          <Link
            href="/musicListPage"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Explorer la musique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FiCompass className="text-blue-600" />
          Découvertes pour vous
        </h2>
        <Link
          href="/discover"
          className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 text-sm font-medium"
        >
          Voir tout <FiArrowRight />
        </Link>
      </div>

      <div className="space-y-3">
        {previewTracks.map((track) => (
          <div
            key={track.id}
            className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors cursor-pointer"
            onClick={() => onTrackSelect && onTrackSelect(track)}
          >
            <DiscoveryTrackItem track={track} />
            
            {/* Additional discovery info */}
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {track.genre && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {track.genre}
                </span>
              )}
              {track.mood && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  {track.mood}
                </span>
              )}
              {track.averagerating && track.averagerating > 0 && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                  ⭐ {track.averagerating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          href="/discover"
          className="w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors gap-2"
        >
          <FiCompass />
          Découvrir plus de musique
        </Link>
      </div>
    </div>
  );
};

export default DiscoveryPreview;
