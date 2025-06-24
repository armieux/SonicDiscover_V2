'use client';

import React, { useState, useEffect } from 'react';
import { FiSettings, FiFilter, FiSave, FiX } from 'react-icons/fi';

interface SmartPlaylistCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaylistCreated?: (playlist: Record<string, unknown>) => void;
}

interface PlaylistCriteria {
  genres: string[];
  moods: string[];
  bpmRange: { min: number; max: number };
  minRating: number;
  excludeHeard: boolean;
  includeFollowedArtists: boolean;
  maxTracks: number;
}

const AVAILABLE_GENRES = [
  'Rock', 'Pop', 'Hip Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 
  'R&B', 'Reggae', 'Blues', 'Folk', 'Metal', 'Punk', 'Alternative', 'Indie'
];

const AVAILABLE_MOODS = [
  'Energetic', 'Relaxed', 'Happy', 'Sad', 'Aggressive', 'Romantic', 
  'Peaceful', 'Dark', 'Uplifting', 'Nostalgic', 'Mysterious', 'Dreamy'
];

export const SmartPlaylistCreator: React.FC<SmartPlaylistCreatorProps> = ({
  isOpen,
  onClose,
  onPlaylistCreated
}) => {
  const [playlistName, setPlaylistName] = useState('');
  const [criteria, setCriteria] = useState<PlaylistCriteria>({
    genres: [],
    moods: [],
    bpmRange: { min: 60, max: 180 },
    minRating: 0,
    excludeHeard: false,
    includeFollowedArtists: false,
    maxTracks: 25
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setPlaylistName('');
      setCriteria({
        genres: [],
        moods: [],
        bpmRange: { min: 60, max: 180 },
        minRating: 0,
        excludeHeard: false,
        includeFollowedArtists: false,
        maxTracks: 25
      });
    }
  }, [isOpen]);

  const handleGenreToggle = (genre: string) => {
    setCriteria(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleMoodToggle = (mood: string) => {
    setCriteria(prev => ({
      ...prev,
      moods: prev.moods.includes(mood)
        ? prev.moods.filter(m => m !== mood)
        : [...prev.moods, mood]
    }));
  };

  const generatePreview = async () => {
    try {
      // This would be a separate endpoint for preview
      // For now, we'll simulate it
      console.log('Preview generated');
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };

  const createSmartPlaylist = async () => {
    if (!playlistName.trim()) {
      alert('Veuillez saisir un nom pour la playlist');
      return;
    }

    setIsCreating(true);
    
    try {
      const response = await fetch('/api/playlists/smart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playlistName,
          criteria
        }),
      });

      if (!response.ok) {
        throw new Error('Échec de la création de la playlist');
      }

      const result = await response.json();
      
      if (onPlaylistCreated) {
        onPlaylistCreated(result);
      }
      
      alert(`Playlist "${playlistName}" créée avec ${result.tracks.length} pistes !`);
      onClose();

    } catch (error) {
      console.error('Error creating smart playlist:', error);
      alert('Erreur lors de la création de la playlist');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiSettings className="text-blue-600" />
            Créer une Playlist Intelligente
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Playlist Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la playlist
              </label>
              <input
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="Ma playlist intelligente"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Genres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Genres (sélectionnez un ou plusieurs)
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_GENRES.map(genre => (
                  <button
                    key={genre}
                    onClick={() => handleGenreToggle(genre)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      criteria.genres.includes(genre)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Moods */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ambiances (sélectionnez un ou plusieurs)
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_MOODS.map(mood => (
                  <button
                    key={mood}
                    onClick={() => handleMoodToggle(mood)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      criteria.moods.includes(mood)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            {/* BPM Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Plage de BPM: {criteria.bpmRange.min} - {criteria.bpmRange.max}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                  <input
                    type="range"
                    min="60"
                    max="200"
                    value={criteria.bpmRange.min}
                    onChange={(e) => setCriteria(prev => ({
                      ...prev,
                      bpmRange: { ...prev.bpmRange, min: parseInt(e.target.value) }
                    }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                  <input
                    type="range"
                    min="60"
                    max="200"
                    value={criteria.bpmRange.max}
                    onChange={(e) => setCriteria(prev => ({
                      ...prev,
                      bpmRange: { ...prev.bpmRange, max: parseInt(e.target.value) }
                    }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note minimum: {criteria.minRating}/5
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={criteria.minRating}
                onChange={(e) => setCriteria(prev => ({
                  ...prev,
                  minRating: parseFloat(e.target.value)
                }))}
                className="w-full"
              />
            </div>

            {/* Max Tracks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre maximum de pistes: {criteria.maxTracks}
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={criteria.maxTracks}
                onChange={(e) => setCriteria(prev => ({
                  ...prev,
                  maxTracks: parseInt(e.target.value)
                }))}
                className="w-full"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={criteria.excludeHeard}
                  onChange={(e) => setCriteria(prev => ({
                    ...prev,
                    excludeHeard: e.target.checked
                  }))}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">
                  Exclure les pistes déjà écoutées plusieurs fois
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={criteria.includeFollowedArtists}
                  onChange={(e) => setCriteria(prev => ({
                    ...prev,
                    includeFollowedArtists: e.target.checked
                  }))}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">
                  Inclure les pistes d&apos;artistes suivis
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex justify-between">
          <button
            onClick={generatePreview}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <FiFilter />
            Aperçu
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={createSmartPlaylist}
              disabled={isCreating || !playlistName.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave />
              {isCreating ? 'Création...' : 'Créer la Playlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
