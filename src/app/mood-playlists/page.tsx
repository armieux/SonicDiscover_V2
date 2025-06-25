'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/app/components/PageLayout';
import MusicCard from '@/app/components/MusicCard/MusicCard';
import { ExtendedTrack } from '@/app/musicListPage/page';

export default function MoodPlaylistsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playlistData, setPlaylistData] = useState<{
    dominantMood: string;
    playlistName: string;
    tracks: ExtendedTrack[];
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMoodPlaylist = async () => {
      try {
        setLoading(true);
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
            tracks: data.tracks
          });
        } else {
          setError('Aucune recommandation disponible pour le moment');
        }
      } catch (err) {
        setError('Erreur lors du chargement des recommandations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMoodPlaylist();
  }, []);

  return (
    <PageLayout>
      <div className="p-8 my-16">
        <div className="flex flex-col items-start gap-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            Playlist d'ambiance personnalisée
          </h1>

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
                      Basée sur votre ambiance {playlistData.dominantMood} récente
                    </p>
                    <p className="text-gray-400 mt-2">
                      {playlistData.tracks.length} titres recommandés
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {playlistData.tracks.map((track, idx) => (
                    <MusicCard key={`${track.id}-${idx}`} track={track} />
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
