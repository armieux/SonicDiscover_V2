'use client';

import React, { useState, useEffect } from 'react';
import { Track } from '../../interfaces/Track';
import { DiscoveryTrackItem } from '../DiscoveryTrackItem/DiscoveryTrackItem';
import { FiRefreshCw, FiSave, FiMusic, FiTrendingUp, FiCheckCircle, FiCircle, FiStar } from 'react-icons/fi';
import { FaRobot, FaBrain, FaHeart } from 'react-icons/fa';

interface DiscoveryData {
  tracks: (Track & { discoveryScore?: number })[];
  preferences: {
    likedGenres: { [genre: string]: number };
    likedMoods: { [mood: string]: number };
    averageBpm: number;
    followedArtists: number[];
  };
  totalTracks: number;
}

interface DiscoveryPlaylistProps {
  onTrackSelect?: (track: Track) => void;
}

export const DiscoveryPlaylist: React.FC<DiscoveryPlaylistProps> = ({ onTrackSelect }) => {
  const [discoveryData, setDiscoveryData] = useState<DiscoveryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTracks, setSelectedTracks] = useState<number[]>([]);
  const [savingPlaylist, setSavingPlaylist] = useState(false);

  const fetchDiscoveryPlaylist = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/playlists/discover');
      
      if (!response.ok) {
        throw new Error('Impossible de générer la playlist de découverte');
      }
      
      const data: DiscoveryData = await response.json();
      setDiscoveryData(data);
      setSelectedTracks(data.tracks.slice(0, 10).map(track => track.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const saveDiscoveryPlaylist = async () => {
    if (!selectedTracks.length) {
      alert('Veuillez sélectionner au moins une piste');
      return;
    }

    setSavingPlaylist(true);
    
    try {
      const response = await fetch('/api/playlists/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Découverte ${new Date().toLocaleDateString('fr-FR')}`,
          trackIds: selectedTracks
        }),
      });

      if (!response.ok) {
        throw new Error('Impossible de sauvegarder la playlist');
      }

      const result = await response.json();
      alert(`Playlist sauvegardée avec succès ! ${result.tracks.length} pistes ajoutées.`);
      setSelectedTracks([]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSavingPlaylist(false);
    }
  };

  const toggleTrackSelection = (trackId: number) => {
    setSelectedTracks(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  useEffect(() => {
    fetchDiscoveryPlaylist();
  }, []);

  const getTopPreferences = (preferences: { [key: string]: number }, limit = 3) => {
    return Object.entries(preferences)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([key]) => key);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FaRobot className="text-2xl text-night-blue" />
          </div>
          <div className="flex items-center gap-3 justify-center mb-2">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-peach-soft border-t-transparent"></div>
            <span className="text-text-secondary text-lg">Génération de votre playlist de découverte...</span>
          </div>
          <p className="text-text-muted text-sm">L'IA analyse vos goûts musicaux</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12">
        <div className="w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiMusic className="text-2xl text-red-400" />
        </div>
        <div className="text-red-400 mb-6 text-lg font-medium">{error}</div>
        <button
          onClick={fetchDiscoveryPlaylist}
          className="btn-primary flex items-center gap-2 mx-auto"
        >
          <FiRefreshCw /> Réessayer
        </button>
      </div>
    );
  }

  if (!discoveryData || !discoveryData.tracks.length) {
    return (
      <div className="text-center p-12">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-gray-cold to-peach-soft rounded-full flex items-center justify-center mx-auto mb-6 opacity-60">
          <FaBrain className="text-3xl text-text-primary" />
        </div>
        <h3 className="text-2xl font-semibold text-text-primary mb-3">Intelligence en apprentissage</h3>
        <p className="text-text-secondary mb-6 max-w-md mx-auto leading-relaxed">
          Notre IA a besoin de plus de données sur vos préférences musicales pour créer des recommandations personnalisées.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={fetchDiscoveryPlaylist}
            className="btn-primary flex items-center gap-2"
          >
            <FiRefreshCw /> Actualiser
          </button>
          <a href="/musicListPage" className="btn-secondary flex items-center gap-2">
            <FiMusic /> Explorer la bibliothèque
          </a>
        </div>
      </div>
    );
  }

  const { tracks, preferences } = discoveryData;
  const topGenres = getTopPreferences(preferences.likedGenres);
  const topMoods = getTopPreferences(preferences.likedMoods);

  return (
    <div className="space-y-8">
      {/* Header avec style moderne */}
      <div className="bg-gradient-primary p-8 rounded-3xl text-night-blue relative overflow-hidden">
        {/* Effet de background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-y-1"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-night-blue bg-opacity-20 rounded-2xl flex items-center justify-center">
              <FaRobot className="text-3xl text-night-blue" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <FiTrendingUp /> Playlist IA Personnalisée
              </h2>
              <p className="opacity-80 text-lg">
                {tracks.length} nouvelles découvertes basées sur vos goûts
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={fetchDiscoveryPlaylist}
              disabled={loading}
              className="px-6 py-3 bg-night-blue bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              Actualiser
            </button>
            {selectedTracks.length > 0 && (
              <button
                onClick={saveDiscoveryPlaylist}
                disabled={savingPlaylist}
                className="px-6 py-3 bg-night-blue hover:bg-opacity-90 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium text-text-primary shadow-lg"
              >
                <FiSave />
                Sauvegarder ({selectedTracks.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Insights des préférences avec design moderne */}
      <div className="glass-effect p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <FaBrain className="text-night-blue" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary">Analyse de vos Préférences</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-elevated bg-opacity-50 p-4 rounded-xl">
            <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <FiMusic className="text-peach-soft" />
              Genres Favoris
            </h4>
            <div className="flex flex-wrap gap-2">
              {topGenres.map(genre => (
                <span key={genre} className="px-3 py-1 bg-blue-gray-cold bg-opacity-30 text-blue-gray-cold border border-blue-gray-cold border-opacity-30 rounded-lg text-sm font-medium">
                  {genre}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-surface-elevated bg-opacity-50 p-4 rounded-xl">
            <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <FaHeart className="text-gold-soft" />
              Ambiances Préférées
            </h4>
            <div className="flex flex-wrap gap-2">
              {topMoods.map(mood => (
                <span key={mood} className="px-3 py-1 bg-gold-soft bg-opacity-20 text-gold-soft border border-gold-soft border-opacity-30 rounded-lg text-sm font-medium">
                  {mood}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-surface-elevated bg-opacity-50 p-4 rounded-xl">
            <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <FiTrendingUp className="text-peach-soft" />
              Rythme Préféré
            </h4>
            <div className="flex items-center gap-2">
              <span className="px-4 py-2 bg-peach-soft bg-opacity-20 text-peach-soft border border-peach-soft border-opacity-30 rounded-xl font-bold">
                ~{preferences.averageBpm} BPM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sélection des pistes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-text-primary">Pistes Recommandées</h3>
            <div className="px-3 py-1 bg-peach-soft bg-opacity-20 text-peach-soft border border-peach-soft border-opacity-30 rounded-full text-sm font-medium">
              {selectedTracks.length} sélectionnée(s)
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTracks([])}
              className="text-text-muted hover:text-text-secondary transition-colors text-sm"
            >
              Tout désélectionner
            </button>
            <span className="text-text-muted">|</span>
            <button
              onClick={() => setSelectedTracks(tracks.map(t => t.id))}
              className="text-peach-soft hover:text-gold-soft transition-colors text-sm font-medium"
            >
              Tout sélectionner
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className={`group relative rounded-2xl transition-all duration-300 ${
                selectedTracks.includes(track.id)
                  ? 'ring-2 ring-peach-soft ring-opacity-50 bg-peach-soft bg-opacity-5'
                  : 'hover:bg-surface-elevated hover:bg-opacity-30'
              }`}
            >
              <div className="p-5">
                <div className="flex items-center gap-4">
                  {/* Checkbox de sélection */}
                  <button
                    onClick={() => toggleTrackSelection(track.id)}
                    className="flex-shrink-0 w-6 h-6 rounded-lg border-2 border-surface-elevated hover:border-peach-soft transition-all duration-300 flex items-center justify-center"
                  >
                    {selectedTracks.includes(track.id) ? (
                      <FiCheckCircle className="w-6 h-6 text-peach-soft" />
                    ) : (
                      <FiCircle className="w-6 h-6 text-text-muted group-hover:text-peach-soft" />
                    )}
                  </button>

                  {/* Numéro et score de découverte */}
                  <div className="flex-shrink-0 text-center">
                    <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-night-blue font-bold text-sm mb-1">
                      {index + 1}
                    </div>
                    {track.discoveryScore && (
                      <div className="text-xs text-peach-soft font-medium">
                        {Math.round(track.discoveryScore)}%
                      </div>
                    )}
                  </div>

                  {/* Contenu de la piste */}
                  <div className="flex-1" onClick={onTrackSelect ? () => onTrackSelect(track) : undefined}>
                    <DiscoveryTrackItem track={track} />
                  </div>
                </div>

                {/* Métadonnées étendues */}
                <div className="mt-4 ml-16 flex flex-wrap gap-2">
                  {track.genre && (
                    <span className="px-3 py-1 bg-blue-gray-cold bg-opacity-20 text-blue-gray-cold border border-blue-gray-cold border-opacity-30 rounded-lg text-xs font-medium">
                      🎵 {track.genre}
                    </span>
                  )}
                  {track.mood && (
                    <span className="px-3 py-1 bg-gold-soft bg-opacity-20 text-gold-soft border border-gold-soft border-opacity-30 rounded-lg text-xs font-medium">
                      😊 {track.mood}
                    </span>
                  )}
                  {track.bpm && (
                    <span className="px-3 py-1 bg-surface-elevated bg-opacity-50 text-text-muted rounded-lg text-xs font-medium">
                      ⚡ {track.bpm} BPM
                    </span>
                  )}
                  {track.averagerating && track.averagerating > 0 && (
                    <span className="px-3 py-1 bg-peach-soft bg-opacity-20 text-peach-soft border border-peach-soft border-opacity-30 rounded-lg text-xs font-medium flex items-center gap-1">
                      <FiStar className="w-3 h-3" />
                      {track.averagerating.toFixed(1)}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-gradient-primary bg-opacity-20 text-peach-soft border border-peach-soft border-opacity-30 rounded-lg text-xs font-medium">
                    🤖 Recommandé par IA
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Barre d'actions flottante */}
      {selectedTracks.length > 0 && (
        <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-40">
          <div className="glass-effect p-4 rounded-2xl border border-peach-soft border-opacity-30 shadow-accent-strong">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-text-primary">
                <FiCheckCircle className="text-peach-soft" />
                <span className="font-medium">{selectedTracks.length} piste(s) sélectionnée(s)</span>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedTracks([])}
                  className="px-4 py-2 text-text-muted hover:text-text-secondary transition-colors text-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={saveDiscoveryPlaylist}
                  disabled={savingPlaylist}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <FiSave />
                  {savingPlaylist ? 'Sauvegarde...' : 'Créer la Playlist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoveryPlaylist;
