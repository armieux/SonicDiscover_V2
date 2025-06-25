'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Track } from '../../interfaces/Track';
import { DiscoveryTrackItem } from '../DiscoveryTrackItem/DiscoveryTrackItem';
import { FiCompass, FiArrowRight, FiRefreshCw, FiShuffle, FiTrendingUp } from 'react-icons/fi';
import { FaRobot, FaMusic } from 'react-icons/fa';

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
          setPreviewTracks([]);
          return;
        }
        throw new Error('Impossible de charger les recommandations');
      }
      
      const data = await response.json();
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

  if (error && error.includes('Unauthorized')) {
    return null;
  }

  if (loading) {
    return (
      <div className="glass-effect p-8 rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <FiCompass className="text-xl text-night-blue" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Découvertes pour vous</h2>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-peach-soft border-t-transparent"></div>
            <span className="text-text-secondary text-lg">Génération de vos recommandations...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-effect p-8 rounded-3xl border border-red-400 border-opacity-30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 bg-opacity-20 rounded-xl flex items-center justify-center">
              <FiCompass className="text-xl text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Découvertes pour vous</h2>
          </div>
        </div>
        
        <div className="text-center py-8">
          <div className="text-red-400 mb-6 text-lg">{error}</div>
          <button
            onClick={fetchPreview}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <FiRefreshCw className="animate-spin" /> Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!previewTracks.length) {
    return (
      <div className="glass-effect p-8 rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <FiCompass className="text-xl text-night-blue" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Découvertes pour vous</h2>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-gray-cold to-peach-soft rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
            <FaRobot className="text-3xl text-text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-3">Intelligence en apprentissage</h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto leading-relaxed">
            Écoutez plus de musique et interagissez avec vos pistes préférées pour que notre IA apprenne vos goûts et vous propose des découvertes personnalisées.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/musicListPage"
              className="btn-primary flex items-center gap-2"
            >
              <FaMusic /> Explorer la bibliothèque
            </Link>
            <Link
              href="/discover"
              className="btn-secondary flex items-center gap-2"
            >
              <FiShuffle /> Découverte aléatoire
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect p-8 rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
            <FiCompass className="text-xl text-night-blue" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Découvertes pour vous</h2>
            <p className="text-text-secondary text-sm">Sélectionnées par notre IA musicale</p>
          </div>
        </div>
        <Link
          href="/discover"
          className="flex items-center gap-2 text-peach-soft hover:text-gold-soft transition-colors font-medium"
        >
          Voir tout <FiArrowRight />
        </Link>
      </div>

      <div className="space-y-4 mb-6">
        {previewTracks.map((track, index) => (
          <div
            key={track.id}
            className="group p-4 rounded-2xl bg-surface-card bg-opacity-50 border border-surface-elevated hover:border-peach-soft hover:border-opacity-50 transition-all duration-300 cursor-pointer interactive-hover"
            onClick={() => onTrackSelect && onTrackSelect(track)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 bg-gradient-primary rounded-lg flex items-center justify-center text-night-blue font-bold text-sm">
                {index + 1}
              </div>
              <span className="text-peach-soft text-sm font-medium">Recommandation IA</span>
            </div>
            
            <DiscoveryTrackItem track={track} />
            
            {/* Tags de découverte */}
            <div className="mt-4 flex flex-wrap gap-2">
              {track.genre && (
                <span className="px-3 py-1 bg-blue-gray-cold bg-opacity-30 text-blue-gray-cold border border-blue-gray-cold border-opacity-30 rounded-full text-xs font-medium">
                  🎵 {track.genre}
                </span>
              )}
              {track.mood && (
                <span className="px-3 py-1 bg-gold-soft bg-opacity-20 text-gold-soft border border-gold-soft border-opacity-30 rounded-full text-xs font-medium">
                  😊 {track.mood}
                </span>
              )}
              {track.averagerating && track.averagerating > 0 && (
                <span className="px-3 py-1 bg-peach-soft bg-opacity-20 text-peach-soft border border-peach-soft border-opacity-30 rounded-full text-xs font-medium">
                  ⭐ {track.averagerating.toFixed(1)}
                </span>
              )}
              <span className="px-3 py-1 bg-gradient-primary bg-opacity-20 text-night-blue border border-peach-soft border-opacity-30 rounded-full text-xs font-medium">
                <FiTrendingUp className="inline mr-1" /> Nouveauté
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-surface-elevated">
        <Link
          href="/discover"
          className="w-full btn-secondary flex items-center justify-center gap-3 text-center"
        >
          <FiCompass className="text-lg" />
          <span>Plonger dans l&apos;exploration musicale</span>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-peach-soft rounded-full animate-ping"></div>
            <div className="w-1 h-1 bg-gold-soft rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-blue-gray-cold rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DiscoveryPreview;
