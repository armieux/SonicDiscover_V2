"use client";

/**
 * TimecodeComments - Composant de commentaires avec timecode
 * 
 * Fonctionnalités implémentées :
 * 1. Affichage d'un panel de commentaires en mode plein écran
 * 2. Possibilité d'écrire un commentaire avec le timecode actuel
 * 3. Affichage aléatoire des commentaires au timecode correspondant
 * 4. Interface optimisée avec style cohérent à l'application
 * 5. Limitation à 280 caractères par commentaire
 * 6. Gestion des états de chargement et d'envoi
 * 7. Animation d'apparition/disparition des commentaires flottants
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Comment } from '@/app/interfaces/Comment';
import { FaComment, FaPaperPlane, FaClock, FaUser } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';
import Image from 'next/image';
import styles from './TimecodeComments.module.css';

interface TimecodeCommentsProps {
  trackId: number;
  currentTime: number;
  isVisible: boolean;
  onClose: () => void;
}

const TimecodeComments: React.FC<TimecodeCommentsProps> = ({
  trackId,
  currentTime,
  isVisible,
  onClose,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showingComment, setShowingComment] = useState<Comment | null>(null);

  // Charger les commentaires
  const loadComments = useCallback(async () => {
    if (!trackId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tracks/${trackId}/comments`);
      if (response.ok) {
        const text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          setComments(data);
        } else {
          setComments([]);
        }
      } else {
        console.error('Erreur API:', response.status, response.statusText);
        setComments([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [trackId]);

  // Charger les commentaires au montage
  useEffect(() => {
    if (isVisible) {
      loadComments();
    }
  }, [isVisible, loadComments]);

  // Afficher aléatoirement un commentaire proche du timecode actuel
  useEffect(() => {
    if (!isVisible || comments.length === 0) {
      setShowingComment(null);
      return;
    }

    // Trouver les commentaires proches du timecode actuel (±5 secondes)
    const nearbyComments = comments.filter(comment => 
      comment.timecode && 
      Math.abs(comment.timecode - currentTime) <= 5
    );

    if (nearbyComments.length > 0) {
      // Probabilité de 20% d'afficher un commentaire
      if (Math.random() < 0.2) {
        const randomComment = nearbyComments[Math.floor(Math.random() * nearbyComments.length)];
        setShowingComment(randomComment);
        
        // Masquer le commentaire après 4 secondes
        setTimeout(() => {
          setShowingComment(null);
        }, 4000);
      }
    }
  }, [currentTime, comments, isVisible]);

  // Soumettre un nouveau commentaire
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tracks/${trackId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
          timecode: currentTime,
        }),
      });

      if (response.ok) {
        const text = await response.text();
        if (text) {
          const newCommentData = JSON.parse(text);
          setComments(prev => [newCommentData, ...prev]);
          setNewComment('');
        }
      } else {
        const text = await response.text();
        let errorMessage = 'Erreur lors de la création du commentaire';
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        console.error('Erreur API:', errorMessage);
        // Optionnel: afficher un toast ou message d'erreur à l'utilisateur
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du commentaire:', error);
      // Optionnel: afficher un toast ou message d'erreur à l'utilisateur
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (time: number): string => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "À l'instant";
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `Il y a ${diffInDays}j`;
    
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Commentaire flottant */}
      {showingComment && (
        <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none ${styles.floatingComment}`}>
          <div className="bg-[#2A2A40] bg-opacity-95 backdrop-blur-xl rounded-2xl p-4 max-w-sm shadow-2xl border border-[#3E5C76] border-opacity-30">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F2A365] to-[#D9BF77] flex items-center justify-center flex-shrink-0">
                {showingComment.user?.profilepicture ? (
                  <Image
                    src={showingComment.user.profilepicture}
                    alt={showingComment.user.username}
                    width={32}
                    height={32}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <FaUser size={12} className="text-[#1C1C2E]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#F2A365] text-sm font-medium">
                    {showingComment.user?.username}
                  </span>
                  <span className="text-[#B8B8B8] text-xs flex items-center gap-1">
                    <FaClock size={10} />
                    {formatTime(showingComment.timecode || 0)}
                  </span>
                </div>
                <p className="text-[#F1F1F1] text-sm leading-relaxed">
                  {showingComment.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel des commentaires */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-[#1C1C2E] bg-opacity-95 border-l border-[#3E5C76] border-opacity-30 z-40 flex flex-col ${styles.commentsPanel}`}>
        {/* Header */}
        <div className="p-6 border-b border-[#3E5C76] border-opacity-30">
          <div className="flex items-center justify-between">
            <h3 className="text-[#F1F1F1] text-lg font-semibold flex items-center gap-2">
              <FaComment className="text-[#F2A365]" />
              Commentaires
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-[#B8B8B8] hover:text-[#F2A365] hover:bg-[#F2A365] hover:bg-opacity-10 rounded-lg transition-all duration-300"
            >
              <IoClose size={20} />
            </button>
          </div>
        </div>

        {/* Formulaire d'ajout de commentaire */}
        <div className="p-6 border-b border-[#3E5C76] border-opacity-30">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <div className="flex items-center gap-2 text-[#B8B8B8] text-xs mb-2">
              <FaClock size={12} />
              <span>À {formatTime(currentTime)}</span>
            </div>
            <div className="relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Écrivez un commentaire..."
                className={`w-full bg-[#2A2A40] border border-[#3E5C76] border-opacity-30 rounded-lg p-3 text-[#F1F1F1] placeholder-[#B8B8B8] text-sm resize-none focus:outline-none focus:border-[#F2A365] transition-colors duration-300 ${styles.commentInput}`}
                rows={3}
                maxLength={280}
                disabled={isSubmitting}
              />
              <div className="absolute bottom-2 right-2 text-xs text-[#B8B8B8]">
                {newComment.length}/280
              </div>
            </div>
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className={`w-full bg-gradient-to-r from-[#F2A365] to-[#D9BF77] text-[#1C1C2E] py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${styles.submitButton}`}
            >
              <FaPaperPlane size={12} />
              {isSubmitting ? 'Envoi...' : 'Commenter'}
            </button>
          </form>
        </div>

        {/* Liste des commentaires */}
        <div className={`flex-1 overflow-y-auto p-6 ${styles.commentsList}`}>
          {isLoading ? (
            <div className="text-center text-[#B8B8B8] py-8">
              Chargement des commentaires...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-[#B8B8B8] py-8">
              <FaComment size={32} className="mx-auto mb-3 opacity-50" />
              <p>Aucun commentaire pour le moment.</p>
              <p className="text-xs mt-1">Soyez le premier à commenter !</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`bg-[#2A2A40] bg-opacity-50 rounded-lg p-4 border border-[#3E5C76] border-opacity-20 ${styles.commentCard}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F2A365] to-[#D9BF77] flex items-center justify-center flex-shrink-0">
                      {comment.user?.profilepicture ? (
                        <Image
                          src={comment.user.profilepicture}
                          alt={comment.user.username}
                          width={32}
                          height={32}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <FaUser size={12} className="text-[#1C1C2E]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#F2A365] text-sm font-medium">
                          {comment.user?.username}
                        </span>
                        {comment.timecode !== null && comment.timecode !== undefined && (
                          <span className="text-[#B8B8B8] text-xs flex items-center gap-1">
                            <FaClock size={10} />
                            {formatTime(comment.timecode)}
                          </span>
                        )}
                        <span className="text-[#B8B8B8] text-xs">
                          {formatTimeAgo(comment.commentDate)}
                        </span>
                      </div>
                      <p className="text-[#F1F1F1] text-sm leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TimecodeComments;
