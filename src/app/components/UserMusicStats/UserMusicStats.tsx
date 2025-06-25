'use client';

import React, { useState, useEffect } from 'react';
import { FiMusic, FiHeart, FiUsers, FiTrendingUp, FiCalendar, FiBarChart, FiActivity } from 'react-icons/fi';
import { FaRobot, FaFire, FaCrown, FaMedal, FaChartLine, FaTrophy } from 'react-icons/fa';

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

const UserMusicStats: React.FC = () => {
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
      <div className="bg-[#2A2A40] bg-opacity-70 backdrop-blur-lg border border-[#3E5C76] border-opacity-30 p-8 rounded-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#242438] rounded-xl animate-pulse"></div>
          <div className="h-6 bg-[#242438] rounded-lg w-48 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-[#242438] rounded-2xl animate-pulse"></div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 bg-[#242438] rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return null;
  }

  const getStreakText = (streak: number) => {
    if (streak === 0) return "Commencez votre série !";
    if (streak === 1) return "1 jour de suite";
    return `${streak} jours de suite`;
  };

  const getDiversityLevel = (score: number) => {
    if (score >= 80) return { 
      text: "Très éclectique", 
      color: "text-green-400", 
      bg: "bg-green-400 bg-opacity-20 border-green-400",
      icon: "🌈"
    };
    if (score >= 60) return { 
      text: "Éclectique", 
      color: "text-blue-400", 
      bg: "bg-blue-400 bg-opacity-20 border-blue-400",
      icon: "🎭"
    };
    if (score >= 40) return { 
      text: "Moyennement varié", 
      color: "text-[#D9BF77]", 
      bg: "bg-[#D9BF77] bg-opacity-20 border-[#D9BF77]",
      icon: "🎵"
    };
    return { 
      text: "Spécialisé", 
      color: "text-[#F2A365]", 
      bg: "bg-[#F2A365] bg-opacity-20 border-[#F2A365]",
      icon: "🎯"
    };
  };

  const diversity = getDiversityLevel(stats.listening.diversityScore);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="bg-[#2A2A40] bg-opacity-70 backdrop-blur-lg border border-[#3E5C76] border-opacity-30 p-8 rounded-3xl space-y-8">
      {/* Header moderne */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-[#F2A365] to-[#D9BF77] rounded-2xl flex items-center justify-center">
            <FaChartLine className="text-2xl text-[#1C1C2E]" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#F1F1F1]">Vos Statistiques Musicales</h2>
            <p className="text-[#B8B8B8]">Découvrez vos habitudes d&apos;écoute</p>
          </div>
        </div>
        <div className="w-16 h-16 bg-gradient-to-br from-[#F2A365] to-[#D9BF77] rounded-full flex items-center justify-center">
          <FaRobot className="text-2xl text-[#1C1C2E]" />
        </div>
      </div>

      {/* Statistiques principales - Grid moderne */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="group bg-[#2A2A40] bg-opacity-50 border border-[#242438] hover:border-[#F2A365] hover:border-opacity-50 transition-all duration-300 hover:scale-105 text-center p-6 border-l-4 border-[#F2A365] rounded-2xl">
          <div className="w-12 h-12 bg-gradient-to-br from-[#F2A365] to-[#D9BF77] rounded-xl flex items-center justify-center mx-auto mb-3">
            <FiMusic className="text-xl text-[#1C1C2E]" />
          </div>
          <div className="text-3xl font-bold text-[#F2A365] mb-1">{formatNumber(stats.listening.totalListens)}</div>
          <div className="text-[#B8B8B8] text-sm font-medium">Écoutes totales</div>
          <div className="mt-2 text-xs text-[#8A8A8A]">🎧 Votre passion musicale</div>
        </div>

        <div className="group bg-[#2A2A40] bg-opacity-50 border border-[#242438] hover:border-red-400 hover:border-opacity-50 transition-all duration-300 hover:scale-105 text-center p-6 border-l-4 border-red-400 rounded-2xl">
          <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-400 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FiHeart className="text-xl text-white" />
          </div>
          <div className="text-3xl font-bold text-red-400 mb-1">{formatNumber(stats.listening.likedTracks)}</div>
          <div className="text-[#B8B8B8] text-sm font-medium">Morceaux aimés</div>
          <div className="mt-2 text-xs text-[#8A8A8A]">❤️ Vos coups de cœur</div>
        </div>

        <div className="group bg-[#2A2A40] bg-opacity-50 border border-[#242438] hover:border-[#3E5C76] hover:border-opacity-50 transition-all duration-300 hover:scale-105 text-center p-6 border-l-4 border-[#3E5C76] rounded-2xl">
          <div className="w-12 h-12 bg-gradient-to-br from-[#3E5C76] to-blue-400 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FiUsers className="text-xl text-white" />
          </div>
          <div className="text-3xl font-bold text-[#3E5C76] mb-1">{stats.social.createdPlaylists}</div>
          <div className="text-[#B8B8B8] text-sm font-medium">Playlists créées</div>
          <div className="mt-2 text-xs text-[#8A8A8A]">📝 Votre créativité</div>
        </div>

        <div className="group bg-[#2A2A40] bg-opacity-50 border border-[#242438] hover:border-[#D9BF77] hover:border-opacity-50 transition-all duration-300 hover:scale-105 text-center p-6 border-l-4 border-[#D9BF77] rounded-2xl">
          <div className="w-12 h-12 bg-gradient-to-br from-[#D9BF77] to-yellow-400 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FaFire className="text-xl text-[#1C1C2E]" />
          </div>
          <div className="text-3xl font-bold text-[#D9BF77] mb-1">{stats.listening.currentStreak}</div>
          <div className="text-[#B8B8B8] text-sm font-medium">Série d&apos;écoute</div>
          <div className="mt-2 text-xs text-[#8A8A8A]">🔥 Votre régularité</div>
        </div>
      </div>

      {/* Sections détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Habitudes d'écoute */}
        <div className="bg-[#2A2A40] bg-opacity-50 p-6 rounded-2xl border border-[#242438]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-[#F2A365] to-[#D9BF77] rounded-lg flex items-center justify-center">
              <FiActivity className="text-[#1C1C2E]" />
            </div>
            <h3 className="text-xl font-semibold text-[#F1F1F1]">Habitudes d&apos;écoute</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-[#242438] bg-opacity-30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#F2A365] bg-opacity-20 rounded-lg flex items-center justify-center">
                  <FiMusic className="text-[#F2A365] text-sm" />
                </div>
                <span className="text-[#B8B8B8]">Morceaux uniques</span>
              </div>
              <span className="font-semibold text-[#F1F1F1]">{formatNumber(stats.listening.uniqueTracks)}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-[#242438] bg-opacity-30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#D9BF77] bg-opacity-20 rounded-lg flex items-center justify-center">
                  <FiCalendar className="text-[#D9BF77] text-sm" />
                </div>
                <span className="text-[#B8B8B8]">Série d&apos;écoute</span>
              </div>
              <span className="font-semibold text-[#F1F1F1]">{getStreakText(stats.listening.currentStreak)}</span>
            </div>
            
            <div className="p-3 bg-[#242438] bg-opacity-30 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#3E5C76] bg-opacity-20 rounded-lg flex items-center justify-center">
                    <FiBarChart className="text-[#3E5C76] text-sm" />
                  </div>
                  <span className="text-[#B8B8B8]">Diversité musicale</span>
                </div>
                <div className={`px-3 py-1 border border-opacity-30 rounded-lg text-sm font-medium ${diversity.bg}`}>
                  <span className={diversity.color}>{diversity.icon} {diversity.text}</span>
                </div>
              </div>
              <div className="w-full bg-[#242438] rounded-full h-2 mt-3">
                <div 
                  className="bg-gradient-to-r from-[#F2A365] to-[#D9BF77] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.listening.diversityScore}%` }}
                ></div>
              </div>
              <div className="text-xs text-[#8A8A8A] mt-1">{stats.listening.diversityScore}% de diversité</div>
            </div>
          </div>
        </div>

        {/* Activité sociale */}
        <div className="bg-[#2A2A40] bg-opacity-50 p-6 rounded-2xl border border-[#242438]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-[#F2A365] to-[#D9BF77] rounded-lg flex items-center justify-center">
              <FiUsers className="text-[#1C1C2E]" />
            </div>
            <h3 className="text-xl font-semibold text-[#F1F1F1]">Activité sociale</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-[#242438] bg-opacity-30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-400 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="text-blue-400 text-sm" />
                </div>
                <span className="text-[#B8B8B8]">Abonnements</span>
              </div>
              <span className="font-semibold text-[#F1F1F1]">{stats.social.following}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-[#242438] bg-opacity-30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-400 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <FiHeart className="text-green-400 text-sm" />
                </div>
                <span className="text-[#B8B8B8]">Abonnés</span>
              </div>
              <span className="font-semibold text-[#F1F1F1]">{stats.social.followers}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-[#242438] bg-opacity-30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-400 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <FiMusic className="text-purple-400 text-sm" />
                </div>
                <span className="text-[#B8B8B8]">Playlists créées</span>
              </div>
              <span className="font-semibold text-[#F1F1F1]">{stats.social.createdPlaylists}</span>
            </div>

            {/* Ratio d'engagement */}
            <div className="mt-4 p-3 bg-gradient-to-r from-[#F2A365] to-[#D9BF77] bg-opacity-10 rounded-xl border border-[#F2A365] border-opacity-20">
              <div className="text-center">
                <div className="text-lg font-bold text-night-blue">
                  {stats.social.followers > 0 ? ((stats.social.followers / Math.max(stats.social.following, 1)) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-xs text-[#8A8A8A]">Ratio d&apos;engagement social</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Genres préférés */}
      {stats.preferences.topGenres.length > 0 && (
        <div className="bg-[#2A2A40] bg-opacity-50 p-6 rounded-2xl border border-[#242438]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-[#F2A365] to-[#D9BF77] rounded-lg flex items-center justify-center">
              <FiMusic className="text-[#1C1C2E]" />
            </div>
            <h3 className="text-xl font-semibold text-[#F1F1F1]">Genres musicaux préférés</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {stats.preferences.topGenres.slice(0, 6).map((genre, index) => {
              const colors = [
                'bg-[#F2A365] bg-opacity-20 text-[#F2A365] border-[#F2A365]',
                'bg-[#D9BF77] bg-opacity-20 text-[#D9BF77] border-[#D9BF77]',
                'bg-[#3E5C76] bg-opacity-20 text-[#3E5C76] border-[#3E5C76]',
                'bg-green-400 bg-opacity-20 text-green-400 border-green-400',
                'bg-purple-400 bg-opacity-20 text-purple-400 border-purple-400',
                'bg-pink-400 bg-opacity-20 text-pink-400 border-pink-400'
              ];
              
              return (
                <div
                  key={genre.genre}
                  className={`p-4 rounded-xl border border-opacity-30 text-center transition-all duration-300 hover:scale-105 ${colors[index % colors.length]}`}
                >
                  <div className="font-semibold text-sm mb-1">{genre.genre}</div>
                  <div className="text-xs opacity-80">{formatNumber(Number(genre.total_listens))} écoutes</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Artistes favoris */}
      {stats.preferences.favoriteArtists.length > 0 && (
        <div className="bg-[#2A2A40] bg-opacity-50 p-6 rounded-2xl border border-[#242438]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-[#F2A365] to-[#D9BF77] rounded-lg flex items-center justify-center">
              <FaTrophy className="text-[#1C1C2E]" />
            </div>
            <h3 className="text-xl font-semibold text-[#F1F1F1]">Podium des artistes</h3>
          </div>
          
          <div className="space-y-3">
            {stats.preferences.favoriteArtists.slice(0, 5).map((artist, index) => {
              const podiumIcons = [
                { icon: <FaCrown className="text-yellow-400" />, bg: 'bg-yellow-400 bg-opacity-20 border-yellow-400' },
                { icon: <FaMedal className="text-gray-400" />, bg: 'bg-gray-400 bg-opacity-20 border-gray-400' },
                { icon: <FaMedal className="text-orange-400" />, bg: 'bg-orange-400 bg-opacity-20 border-orange-400' },
                { icon: <FaTrophy className="text-blue-400" />, bg: 'bg-blue-400 bg-opacity-20 border-blue-400' },
                { icon: <FaTrophy className="text-purple-400" />, bg: 'bg-purple-400 bg-opacity-20 border-purple-400' }
              ];
              
              const podium = podiumIcons[index] || podiumIcons[4];
              
              return (
                <div key={artist.id} className={`flex items-center justify-between p-4 rounded-xl border border-opacity-30 transition-all duration-300 hover:scale-105 ${podium.bg}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#242438] flex items-center justify-center">
                      {podium.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-[#F1F1F1]">{artist.username}</div>
                      <div className="text-sm text-[#B8B8B8]">Position #{index + 1}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#F1F1F1]">{formatNumber(Number(artist.total_listens))}</div>
                    <div className="text-xs text-[#8A8A8A]">écoutes</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMusicStats;
