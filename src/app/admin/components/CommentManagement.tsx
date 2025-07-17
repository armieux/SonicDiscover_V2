'use client';

import { useState, useEffect } from 'react';
import { FiTrash2, FiSearch, FiMessageSquare, FiClock } from 'react-icons/fi';

interface Comment {
  id: number;
  content: string;
  commentdate: string;
  timecode?: number;
  users: {
    username: string;
    profilepicture?: string;
  };
  tracks: {
    title: string;
    trackpicture?: string;
  };
}

export default function CommentManagement() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/admin/comments');
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComments(comments.filter(comment => comment.id !== commentId));
      } else {
        alert('Erreur lors de la suppression du commentaire');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du commentaire');
    }
  };

  const formatTimecode = (seconds?: number) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const filteredComments = comments.filter(comment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      comment.content.toLowerCase().includes(searchLower) ||
      comment.users.username.toLowerCase().includes(searchLower) ||
      comment.tracks.title.toLowerCase().includes(searchLower)
    );
  });

  const sortedComments = [...filteredComments].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.commentdate).getTime() - new Date(a.commentdate).getTime();
      case 'user':
        return a.users.username.localeCompare(b.users.username);
      case 'track':
        return a.tracks.title.localeCompare(b.tracks.title);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-lg">Chargement des commentaires...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header et filtres */}
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold text-white">Gestion des Commentaires</h2>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Recherche */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans les commentaires..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Tri */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="date">Trier par date</option>
            <option value="user">Trier par utilisateur</option>
            <option value="track">Trier par musique</option>
          </select>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-2">Total Commentaires</h3>
          <p className="text-3xl font-bold text-purple-400">{comments.length}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-2">Avec Timecode</h3>
          <p className="text-3xl font-bold text-blue-400">
            {comments.filter(c => c.timecode).length}
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-2">Utilisateurs Actifs</h3>
          <p className="text-3xl font-bold text-green-400">
            {new Set(comments.map(c => c.users.username)).size}
          </p>
        </div>
      </div>

      {/* Liste des commentaires */}
      <div className="space-y-4">
        {sortedComments.map((comment) => (
          <div
            key={comment.id}
            className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header du commentaire */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden">
                    <FiMessageSquare className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-white font-medium">{comment.users.username}</p>
                      {comment.timecode && (
                        <span className="flex items-center space-x-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs">
                          <FiClock className="text-xs" />
                          <span>{formatTimecode(comment.timecode)}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      Sur &quot;{comment.tracks.title}&quot; • {new Date(comment.commentdate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Contenu du commentaire */}
                <div className="bg-white/5 rounded-lg p-3 mb-3">
                  <p className="text-gray-200 leading-relaxed">{comment.content}</p>
                </div>

                {/* Info de la musique */}
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <div className="w-6 h-6 rounded bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden">
                    <FiMessageSquare className="text-white text-xs" />
                  </div>
                  <span>Commentaire sur : {comment.tracks.title}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                  title="Supprimer commentaire"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}

        {sortedComments.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            Aucun commentaire trouvé
          </div>
        )}
      </div>
    </div>
  );
}
