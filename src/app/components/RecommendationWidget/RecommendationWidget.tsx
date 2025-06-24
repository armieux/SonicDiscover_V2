'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FiCompass, FiRefreshCw, FiTrendingUp } from 'react-icons/fi';
import { Track } from '../../interfaces/Track';

interface RecommendationWidgetProps {
  onTrackSelect?: (track: Track) => void;
  compact?: boolean;
}

export const RecommendationWidget: React.FC<RecommendationWidgetProps> = ({ 
  onTrackSelect, 
  compact = false 
}) => {
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/playlists/discover');
      
      if (!response.ok) {
        if (response.status === 401) {
          setRecommendations([]);
          return;
        }
        throw new Error('Impossible de charger les recommandations');
      }
      
      const data = await response.json();
      setRecommendations(data.tracks.slice(0, compact ? 3 : 5));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [compact]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  if (error && error.includes('Unauthorized')) {
    return null;
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1">
            <FiCompass className="w-4 h-4 text-blue-600" />
            Recommandations
          </h3>
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <FiRefreshCw className={`w-3 h-3 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-2 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-2">
            {recommendations.map((track) => (
              <div
                key={track.id}
                onClick={() => onTrackSelect && onTrackSelect(track)}
                className="text-sm cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
              >
                <div className="font-medium text-gray-900 truncate">
                  {track.title}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {track.trackartists?.map(ta => ta.users?.username).join(', ') || 'Artiste inconnu'}
                </div>
              </div>
            ))}
            <Link
              href="/discover"
              className="text-xs text-blue-600 hover:text-blue-800 block mt-2"
            >
              Voir plus →
            </Link>
          </div>
        ) : (
          <div className="text-xs text-gray-500 text-center py-2">
            Aucune recommandation disponible
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FiTrendingUp className="text-blue-600" />
          Recommandations Personnalisées
        </h3>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FiRefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={fetchRecommendations}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="space-y-3">
          {recommendations.map((track, index) => (
            <div
              key={track.id}
              onClick={() => onTrackSelect && onTrackSelect(track)}
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                index === 0 ? 'bg-blue-500' :
                index === 1 ? 'bg-green-500' :
                index === 2 ? 'bg-purple-500' :
                index === 3 ? 'bg-orange-500' :
                'bg-gray-500'
              }`}>
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {track.title}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {track.trackartists?.map(ta => ta.users?.username).join(', ') || 'Artiste inconnu'}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {track.genre && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {track.genre}
                    </span>
                  )}
                  {track.averagerating && track.averagerating > 0 && (
                    <span className="text-xs text-yellow-600">
                      ⭐ {track.averagerating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t border-gray-200">
            <Link
              href="/discover"
              className="w-full flex items-center justify-center px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              <FiCompass className="w-4 h-4 mr-2" />
              Découvrir plus de musique
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <FiCompass className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Aucune recommandation disponible
          </h4>
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
      )}
    </div>
  );
};
