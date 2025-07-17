'use client';

import { useState, useEffect } from 'react';
import { FiUsers, FiMusic, FiMessageSquare, FiTrendingUp, FiCalendar, FiHeart } from 'react-icons/fi';

interface Stats {
  users: {
    total: number;
    new_this_month: number;
    artists: number;
    verified: number;
  };
  tracks: {
    total: number;
    total_plays: number;
    total_likes: number;
    new_this_month: number;
  };
  comments: {
    total: number;
    new_this_month: number;
    with_timecode: number;
  };
  top_tracks: Array<{
    id: number;
    title: string;
    playcount: number;
    likecount: number;
    trackartists: Array<{
      users: {
        username: string;
      };
    }>;
  }>;
  top_users: Array<{
    id: number;
    username: string;
    followerscount: number;
    role: string;
  }>;
  recent_activity: Array<{
    type: string;
    description: string;
    date: string;
  }>;
}

export default function StatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-lg">Chargement des statistiques...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-400">
        Impossible de charger les statistiques
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Tableau de Bord</h2>
        <p className="text-gray-300">Vue d&apos;ensemble de la plateforme SonicDiscover</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <FiUsers className="text-2xl text-blue-400" />
            </div>
            <span className="text-sm text-blue-300 bg-blue-500/20 px-2 py-1 rounded-full">
              +{stats.users.new_this_month} ce mois
            </span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Utilisateurs</h3>
          <p className="text-3xl font-bold text-blue-400">{stats.users.total}</p>
          <p className="text-sm text-gray-300 mt-2">
            {stats.users.artists} artistes • {stats.users.verified} vérifiés
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <FiMusic className="text-2xl text-purple-400" />
            </div>
            <span className="text-sm text-purple-300 bg-purple-500/20 px-2 py-1 rounded-full">
              +{stats.tracks.new_this_month} ce mois
            </span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Musiques</h3>
          <p className="text-3xl font-bold text-purple-400">{stats.tracks.total}</p>
          <p className="text-sm text-gray-300 mt-2">
            {stats.tracks.total_plays.toLocaleString()} écoutes totales
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <FiMessageSquare className="text-2xl text-green-400" />
            </div>
            <span className="text-sm text-green-300 bg-green-500/20 px-2 py-1 rounded-full">
              +{stats.comments.new_this_month} ce mois
            </span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Commentaires</h3>
          <p className="text-3xl font-bold text-green-400">{stats.comments.total}</p>
          <p className="text-sm text-gray-300 mt-2">
            {stats.comments.with_timecode} avec timecode
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl p-6 border border-red-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <FiHeart className="text-2xl text-red-400" />
            </div>
            <span className="text-sm text-red-300 bg-red-500/20 px-2 py-1 rounded-full">
              <FiTrendingUp className="inline mr-1" />
              Populaire
            </span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Likes Totaux</h3>
          <p className="text-3xl font-bold text-red-400">{stats.tracks.total_likes}</p>
          <p className="text-sm text-gray-300 mt-2">
            Sur toutes les musiques
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <FiTrendingUp className="mr-2 text-purple-400" />
            Top Musiques
          </h3>
          <div className="space-y-4">
            {stats.top_tracks.slice(0, 5).map((track, index) => (
              <div key={track.id} className="flex items-center space-x-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{track.title}</p>
                  <p className="text-gray-400 text-sm">
                    {track.trackartists.length > 0 
                      ? track.trackartists.map(ta => ta.users.username).join(', ')
                      : 'Artiste inconnu'
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-purple-400 font-bold">{track.playcount}</p>
                  <p className="text-gray-400 text-sm">écoutes</p>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-bold">{track.likecount}</p>
                  <p className="text-gray-400 text-sm">likes</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <FiUsers className="mr-2 text-blue-400" />
            Top Utilisateurs
          </h3>
          <div className="space-y-4">
            {stats.top_users.slice(0, 5).map((user, index) => (
              <div key={user.id} className="flex items-center space-x-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{user.username}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    user.role === 'admin' 
                      ? 'bg-red-500/20 text-red-300'
                      : user.role === 'artist' 
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    {user.role === 'admin' ? 'Admin' : user.role === 'artist' ? 'Artiste' : 'Utilisateur'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-blue-400 font-bold">{user.followerscount}</p>
                  <p className="text-gray-400 text-sm">followers</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <FiCalendar className="mr-2 text-green-400" />
          Activité Récente
        </h3>
        <div className="space-y-3">
          {stats.recent_activity.slice(0, 8).map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <div className="flex-1">
                <p className="text-gray-200">{activity.description}</p>
              </div>
              <p className="text-gray-400 text-sm">
                {new Date(activity.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h4 className="text-lg font-medium text-white mb-4">Croissance Utilisateurs</h4>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">+{stats.users.new_this_month}</p>
            <p className="text-sm text-gray-400">Nouveaux ce mois</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h4 className="text-lg font-medium text-white mb-4">Nouvelles Musiques</h4>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">+{stats.tracks.new_this_month}</p>
            <p className="text-sm text-gray-400">Uploadées ce mois</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h4 className="text-lg font-medium text-white mb-4">Engagement</h4>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">+{stats.comments.new_this_month}</p>
            <p className="text-sm text-gray-400">Commentaires ce mois</p>
          </div>
        </div>
      </div>
    </div>
  );
}
