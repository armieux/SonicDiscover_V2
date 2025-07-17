'use client';

import { useState, useEffect } from 'react';
import { FiMusic, FiTrash2, FiPlay, FiPause, FiSearch } from 'react-icons/fi';

interface Track {
  id: number;
  title: string;
  genre?: string;
  mood?: string;
  uploaddate: string;
  audiofile: string;
  trackpicture?: string;
  playcount: number;
  likecount: number;
  dislikecount: number;
  duration?: number;
  trackartists: Array<{
    users: {
      username: string;
    };
  }>;
}

export default function TrackManagement() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [moodFilter, setMoodFilter] = useState('all');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchTracks();
  }, []);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  const fetchTracks = async () => {
    try {
      const response = await fetch('/api/admin/tracks');
      if (response.ok) {
        const data = await response.json();
        setTracks(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des musiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrack = async (trackId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette musique ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tracks/${trackId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTracks(tracks.filter(track => track.id !== trackId));
        if (currentlyPlaying === trackId) {
          handleStopPlay();
        }
      } else {
        alert('Erreur lors de la suppression de la musique');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la musique');
    }
  };

  const handlePlayPause = (track: Track) => {
    if (currentlyPlaying === track.id) {
      handleStopPlay();
    } else {
      handlePlay(track);
    }
  };

  const handlePlay = (track: Track) => {
    if (audio) {
      audio.pause();
    }

    const newAudio = new Audio(track.audiofile);
    newAudio.onended = () => setCurrentlyPlaying(null);
    newAudio.onerror = () => {
      alert('Erreur lors de la lecture du fichier audio');
      setCurrentlyPlaying(null);
    };

    newAudio.play().then(() => {
      setCurrentlyPlaying(track.id);
      setAudio(newAudio);
    }).catch((error) => {
      console.error('Erreur lors de la lecture:', error);
      alert('Impossible de lire ce fichier audio');
    });
  };

  const handleStopPlay = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setCurrentlyPlaying(null);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getUniqueGenres = () => {
    const genres = tracks.map(track => track.genre).filter(Boolean);
    return [...new Set(genres)];
  };

  const getUniqueMoods = () => {
    const moods = tracks.map(track => track.mood).filter(Boolean);
    return [...new Set(moods)];
  };

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         track.trackartists.some(ta => ta.users.username.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGenre = genreFilter === 'all' || track.genre === genreFilter;
    const matchesMood = moodFilter === 'all' || track.mood === moodFilter;
    return matchesSearch && matchesGenre && matchesMood;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-lg">Chargement des musiques...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold text-white">Gestion des Musiques</h2>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une musique ou un artiste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Tous les genres</option>
            {getUniqueGenres().map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>

          <select
            value={moodFilter}
            onChange={(e) => setMoodFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Toutes les ambiances</option>
            {getUniqueMoods().map(mood => (
              <option key={mood} value={mood}>{mood}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-2">Total Musiques</h3>
          <p className="text-3xl font-bold text-purple-400">{tracks.length}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-2">Total Écoutes</h3>
          <p className="text-3xl font-bold text-blue-400">
            {tracks.reduce((sum, track) => sum + (track.playcount || 0), 0)}
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-2">Total Likes</h3>
          <p className="text-3xl font-bold text-green-400">
            {tracks.reduce((sum, track) => sum + (track.likecount || 0), 0)}
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-2">Genres Uniques</h3>
          <p className="text-3xl font-bold text-orange-400">
            {getUniqueGenres().length}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left py-3 px-4 text-white font-medium">Musique</th>
              <th className="text-left py-3 px-4 text-white font-medium">Artiste</th>
              <th className="text-left py-3 px-4 text-white font-medium">Genre</th>
              <th className="text-left py-3 px-4 text-white font-medium">Durée</th>
              <th className="text-left py-3 px-4 text-white font-medium">Écoutes</th>
              <th className="text-left py-3 px-4 text-white font-medium">Likes</th>
              <th className="text-left py-3 px-4 text-white font-medium">Date</th>
              <th className="text-left py-3 px-4 text-white font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTracks.map((track) => (
              <tr key={track.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden">
                      <FiMusic className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{track.title}</p>
                      <p className="text-gray-400 text-sm">{track.mood}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-300">
                  {track.trackartists.length > 0 
                    ? track.trackartists.map(ta => ta.users.username).join(', ')
                    : 'Inconnu'
                  }
                </td>
                <td className="py-4 px-4">
                  <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm">
                    {track.genre || 'N/A'}
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-300">
                  {formatDuration(track.duration)}
                </td>
                <td className="py-4 px-4 text-gray-300">{track.playcount}</td>
                <td className="py-4 px-4 text-green-400">{track.likecount}</td>
                <td className="py-4 px-4 text-gray-300">
                  {new Date(track.uploaddate).toLocaleDateString('fr-FR')}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePlayPause(track)}
                      className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                      title={currentlyPlaying === track.id ? "Pause" : "Lecture"}
                    >
                      {currentlyPlaying === track.id ? <FiPause /> : <FiPlay />}
                    </button>
                    <button
                      onClick={() => handleDeleteTrack(track.id)}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                      title="Supprimer musique"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTracks.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            Aucune musique trouvée
          </div>
        )}
      </div>
    </div>
  );
}
