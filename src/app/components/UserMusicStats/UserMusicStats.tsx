'use client';

import React, { useState, useEffect } from 'react';
import { FiMusic, FiHeart, FiUsers, FiTrendingUp, FiCalendar } from 'react-icons/fi';

interface UserStats {
  listening: {
    totalListens: number;
    uniqueTracks: number;
    likedTracks: number;
    currentStreak: number;
    diversityScore: number;
  };
  social: {
    createdPlaylists: number;
    following: number;
    followers: number;
  };
  preferences: {
    topGenres: { genre: string; count: number; total_listens: number }[];
    favoriteArtists: { id: number; username: string; profilepicture: string; total_listens: number }[];
  };
  activity: {
    recent: Record<string, unknown>[];
  };
}

export const UserMusicStats: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/users/stats');
        
        if (!response.ok) {
          if (response.status === 401) {
            setStats(null);
            return;
          }
          throw new Error('Impossible de charger les statistiques');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return null;
  }

  const getStreakText = (streak: number) => {
    if (streak === 0) return "Commencez votre série !";
    if (streak === 1) return "1 jour";
    return `${streak} jours`;
  };

  const getDiversityLevel = (score: number) => {
    if (score >= 80) return { text: "Très éclectique", color: "text-green-600" };
    if (score >= 60) return { text: "Éclectique", color: "text-blue-600" };
    if (score >= 40) return { text: "Moyennement varié", color: "text-yellow-600" };
    return { text: "Spécialisé", color: "text-orange-600" };
  };

  const diversity = getDiversityLevel(stats.listening.diversityScore);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FiTrendingUp className="text-blue-600" />
        Vos Statistiques Musicales
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <FiMusic className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">{stats.listening.totalListens}</div>
          <div className="text-sm text-gray-600">Écoutes totales</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 text-center">
          <FiHeart className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">{stats.listening.likedTracks}</div>
          <div className="text-sm text-gray-600">Morceaux aimés</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <FiUsers className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">{stats.social.createdPlaylists}</div>
          <div className="text-sm text-gray-600">Playlists créées</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <FiCalendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-orange-600">{stats.listening.currentStreak}</div>
          <div className="text-sm text-gray-600">Série d&apos;écoute</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Habitudes d&apos;écoute</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Morceaux uniques écoutés</span>
              <span className="font-medium">{stats.listening.uniqueTracks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Série d&apos;écoute</span>
              <span className="font-medium">{getStreakText(stats.listening.currentStreak)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Diversité musicale</span>
              <span className={`font-medium ${diversity.color}`}>{diversity.text}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Activité sociale</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Abonnements</span>
              <span className="font-medium">{stats.social.following}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Abonnés</span>
              <span className="font-medium">{stats.social.followers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Playlists créées</span>
              <span className="font-medium">{stats.social.createdPlaylists}</span>
            </div>
          </div>
        </div>
      </div>

      {stats.preferences.topGenres.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Genres préférés</h3>
          <div className="flex flex-wrap gap-2">
            {stats.preferences.topGenres.slice(0, 5).map((genre, index) => (
              <span
                key={genre.genre}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  index === 0 ? 'bg-blue-100 text-blue-800' :
                  index === 1 ? 'bg-green-100 text-green-800' :
                  index === 2 ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                {genre.genre} ({Number(genre.total_listens)} écoutes)
              </span>
            ))}
          </div>
        </div>
      )}

      {stats.preferences.favoriteArtists.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Artistes favoris</h3>
          <div className="space-y-2">
            {stats.preferences.favoriteArtists.slice(0, 3).map((artist, index) => (
              <div key={artist.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    'bg-orange-400'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium">{artist.username}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {Number(artist.total_listens)} écoutes
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMusicStats;
