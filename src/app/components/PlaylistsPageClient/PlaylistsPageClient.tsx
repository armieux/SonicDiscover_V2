'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiSettings, FiMusic } from 'react-icons/fi';
import CreatePlaylistForm from '../CreatePlaylistForm/CreatePlaylistForm';
import { SmartPlaylistCreator } from '../SmartPlaylistCreator/SmartPlaylistCreator';

interface Playlist {
  id: number;
  name: string;
  playlistpicture: string | null;
  description: string | null;
  playlisttracks: any[];
}

export const PlaylistsPageClient: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSmartCreator, setShowSmartCreator] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists/user');
      if (response.ok) {
        const data = await response.json();
        setPlaylists(data);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistCreated = () => {
    fetchPlaylists();
    setShowCreateForm(false);
    setShowSmartCreator(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#353445] p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p className="text-white mt-4">Chargement de vos playlists...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#353445] p-4">
      <div className="w-full max-w-4xl bg-[#282733] p-8 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-4xl text-white flex items-center gap-3">
            <FiMusic className="text-blue-400" />
            Vos Playlists
          </h2>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FiPlus />
              Nouvelle Playlist
            </button>
            
            <button
              onClick={() => setShowSmartCreator(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <FiSettings />
              Playlist Intelligente
            </button>
          </div>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#282733] p-6 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Créer une nouvelle playlist</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
              <CreatePlaylistForm onPlaylistCreated={handlePlaylistCreated} />
            </div>
          </div>
        )}

        <SmartPlaylistCreator
          isOpen={showSmartCreator}
          onClose={() => setShowSmartCreator(false)}
          onPlaylistCreated={handlePlaylistCreated}
        />

        {playlists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
              <Link 
                key={playlist.id} 
                href={`/playlistsPage/${playlist.id}`}
                className="group"
              >
                <div className="bg-[#3a3a4a] rounded-lg p-4 hover:bg-[#4a4a5a] transition-colors cursor-pointer">
                  <div className="aspect-square mb-4 overflow-hidden rounded-md">
                    <img 
                      src={playlist.playlistpicture || "https://placehold.co/200x200/666/fff?text=Playlist"} 
                      alt={playlist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1 truncate">
                      {playlist.name}
                    </h3>
                    <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                      {playlist.description || 'Aucune description'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {playlist.playlisttracks?.length || 0} piste(s)
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiMusic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucune playlist pour le moment
            </h3>
            <p className="text-gray-300 mb-6">
              Créez votre première playlist pour commencer à organiser votre musique
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FiPlus />
                Créer une playlist
              </button>
              <button
                onClick={() => setShowSmartCreator(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <FiSettings />
                Playlist intelligente
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Découverte Musicale
              </h3>
              <p className="text-blue-100 text-sm">
                Explorez de nouvelles pistes adaptées à vos goûts
              </p>
            </div>
            <Link
              href="/discover"
              className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors font-medium"
            >
              Découvrir
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
