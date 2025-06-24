'use client';

import React, { useState, useEffect } from 'react';
import { Track } from '../../interfaces/Track';
import { DiscoveryTrackItem } from '../DiscoveryTrackItem/DiscoveryTrackItem';
import { FiRefreshCw, FiSave, FiMusic, FiTrendingUp } from 'react-icons/fi';

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
      setSelectedTracks(data.tracks.slice(0, 10).map(track => track.id)); // Pre-select top 10 tracks
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
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Génération de votre playlist de découverte...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchDiscoveryPlaylist}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
        >
          <FiRefreshCw /> Réessayer
        </button>
      </div>
    );
  }

  if (!discoveryData || !discoveryData.tracks.length) {
    return (
      <div className="text-center p-8">
        <FiMusic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune découverte disponible</h3>
        <p className="text-gray-600 mb-4">
          Écoutez plus de musique et likez vos pistes préférées pour améliorer vos recommandations.
        </p>
        <button
          onClick={fetchDiscoveryPlaylist}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
        >
          <FiRefreshCw /> Actualiser
        </button>
      </div>
    );
  }

  const { tracks, preferences } = discoveryData;
  const topGenres = getTopPreferences(preferences.likedGenres);
  const topMoods = getTopPreferences(preferences.likedMoods);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <FiTrendingUp /> Playlist de Découverte
            </h2>
            <p className="opacity-90">
              {tracks.length} nouvelles pistes basées sur vos goûts
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchDiscoveryPlaylist}
              disabled={loading}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md transition-colors flex items-center gap-2"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              Actualiser
            </button>
            {selectedTracks.length > 0 && (
              <button
                onClick={saveDiscoveryPlaylist}
                disabled={savingPlaylist}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-md transition-colors flex items-center gap-2"
              >
                <FiSave />
                Sauvegarder ({selectedTracks.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preferences Insights */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Vos Préférences Musicales</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Genres Favoris</h4>
            <div className="flex flex-wrap gap-1">
              {topGenres.map(genre => (
                <span key={genre} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {genre}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Ambiances Préférées</h4>
            <div className="flex flex-wrap gap-1">
              {topMoods.map(mood => (
                <span key={mood} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  {mood}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">BPM Moyen</h4>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
              ~{preferences.averageBpm} BPM
            </span>
          </div>
        </div>
      </div>

      {/* Track Selection */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Pistes Recommandées
          </h3>
          <div className="text-sm text-gray-600">
            {selectedTracks.length} piste(s) sélectionnée(s)
          </div>
        </div>

        <div className="space-y-2">
          {tracks.map((track) => (
            <div
              key={track.id}
              className={`border rounded-lg p-3 transition-colors cursor-pointer ${
                selectedTracks.includes(track.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleTrackSelection(track.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <DiscoveryTrackItem 
                    track={track} 
                    onClick={onTrackSelect ? () => onTrackSelect(track) : undefined}
                  />
                </div>
                <div className="flex items-center gap-3 ml-4">
                  {track.discoveryScore && (
                    <div className="text-xs text-gray-500 text-center">
                      <div className="text-green-600 font-medium">
                        {Math.round(track.discoveryScore)}%
                      </div>
                      <div>match</div>
                    </div>
                  )}
                  <input
                    type="checkbox"
                    checked={selectedTracks.includes(track.id)}
                    onChange={() => toggleTrackSelection(track.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Track metadata */}
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                {track.genre && (
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {track.genre}
                  </span>
                )}
                {track.mood && (
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {track.mood}
                  </span>
                )}
                {track.bpm && (
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {track.bpm} BPM
                  </span>
                )}
                {track.averagerating && track.averagerating > 0 && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                    ⭐ {track.averagerating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      {selectedTracks.length > 0 && (
        <div className="bg-white border-t p-4 sticky bottom-0">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {selectedTracks.length} piste(s) sélectionnée(s)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTracks([])}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Tout désélectionner
              </button>
              <button
                onClick={() => setSelectedTracks(tracks.map(t => t.id))}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                Tout sélectionner
              </button>
              <button
                onClick={saveDiscoveryPlaylist}
                disabled={savingPlaylist}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FiSave />
                {savingPlaylist ? 'Sauvegarde...' : 'Sauvegarder la Playlist'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoveryPlaylist;
