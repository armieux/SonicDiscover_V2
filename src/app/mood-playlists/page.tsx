'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/app/components/PageLayout';
import MusicCard from '@/app/components/MusicCard/MusicCard';
import { ExtendedTrack } from '@/app/musicListPage/page';
import { FaSync } from 'react-icons/fa';

export default function MoodPlaylistsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playlistData, setPlaylistData] = useState<{
    dominantMood: string;
    playlistName: string;
    tracks: ExtendedTrack[];
    debug?: {
      recentListenings: Array<{
        trackName: string;
        mood: string;
        listeningDate: string;
      }>;
      moodCounts: Record<string, number>;
      totalUniqueListenings: number;
    };
  } | null>(null);
  const router = useRouter();

  const fetchMoodPlaylist = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch('/api/mood-playlists');

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else if (data.tracks && data.tracks.length > 0) {
        setPlaylistData({
          dominantMood: data.dominantMood,
          playlistName: data.playlistName,
          tracks: data.tracks,
          debug: data.debug
        });
      } else {
        setError('Aucune recommandation disponible pour le moment');
      }
    } catch (err) {
      setError('Erreur lors du chargement des recommandations');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMoodPlaylist();

    // Recharger la playlist quand on revient sur la page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchMoodPlaylist();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <PageLayout>
      <div className="p-8 my-16">
        <div className="flex flex-col items-start gap-6">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-4xl font-bold text-white mb-2">
              Playlist d'ambiance personnalisée
            </h1>
            <button
              onClick={() => fetchMoodPlaylist(true)}
              disabled={loading || refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-all duration-200 shadow-lg hover:shadow-xl"
              title="Actualiser la playlist"
            >
              <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualisation...' : 'Actualiser'}
            </button>
          </div>

          <div className="w-full">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : error ? (
              <div className="bg-red-800 bg-opacity-30 p-6 rounded-lg">
                <p className="text-white text-center">{error}</p>
              </div>
            ) : playlistData ? (
              <div>
                <div className="flex items-center gap-4 mb-8 bg-gradient-to-r from-purple-900 to-pink-900 p-6 rounded-lg">
                  <div className="w-40 h-40 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md flex items-center justify-center shadow-lg">
                    <span className="text-6xl">🎵</span>
                  </div>
                  <div>
                    <h2 className="text-4xl text-white font-semibold mb-2">
                      {playlistData.playlistName}
                    </h2>
                    <p className="text-gray-300">
                      Basée sur vos 3 dernières écoutes de genres différents ({playlistData.dominantMood})
                    </p>
                    <p className="text-gray-400 mt-2">
                      {playlistData.tracks.length} titres recommandés
                    </p>
                  </div>
                </div>

                <div className="mb-4 bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
                  <p className="text-blue-200 text-sm">
                    💡 <strong>Comment ça marche ?</strong> Cette playlist se met automatiquement à jour en analysant vos 3 dernières écoutes pour déterminer votre humeur dominante. Écoutez une musique d'un genre différent pour voir la playlist changer !
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {playlistData.tracks.map((track, idx) => (
                    <div key={`${track.id}-${idx}`} className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden backdrop-blur-sm">
                      <MusicCard 
                        track={track} 
                        index={idx}
                        playlist={playlistData.tracks}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 bg-opacity-30 p-6 rounded-lg">
                <p className="text-gray-300 text-center">Aucune recommandation disponible</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
