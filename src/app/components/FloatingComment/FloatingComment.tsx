"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Comment } from '@/app/interfaces/Comment';
import { FaClock, FaUser } from 'react-icons/fa6';
import Image from 'next/image';

interface FloatingCommentProps {
  trackId: number;
  currentTime: number;
  isVisible: boolean;
}

const FloatingComment: React.FC<FloatingCommentProps> = ({
  trackId,
  currentTime,
  isVisible,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [showingComment, setShowingComment] = useState<Comment | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState(0);

  // Charger les commentaires
  const loadComments = useCallback(async () => {
    if (!trackId) return;
    
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
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
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

    // Vérifier seulement chaque seconde pour éviter trop de calculs
    const currentSecond = Math.floor(currentTime);
    if (currentSecond === Math.floor(lastCheckTime)) {
      return;
    }
    setLastCheckTime(currentTime);

    // Trouver les commentaires proches du timecode actuel (±3 secondes pour le mode minimisé)
    const nearbyComments = comments.filter(comment => 
      comment.timecode && 
      Math.abs(comment.timecode - currentTime) <= 3
    );

    if (nearbyComments.length > 0) {
      // Probabilité de 15% d'afficher un commentaire (un peu moins qu'en plein écran)
      if (Math.random() < 0.15) {
        const randomComment = nearbyComments[Math.floor(Math.random() * nearbyComments.length)];
        setShowingComment(randomComment);
        
        // Masquer le commentaire après 3 secondes (plus court qu'en plein écran)
        setTimeout(() => {
          setShowingComment(null);
        }, 3000);
      }
    }
  }, [currentTime, comments, isVisible, lastCheckTime]);

  const formatTime = (time: number): string => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  if (!isVisible || !showingComment) return null;

  return (
    <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none">
      <div className="bg-[#2A2A40] bg-opacity-95 backdrop-blur-xl rounded-2xl p-3 max-w-xs shadow-2xl border border-[#3E5C76] border-opacity-30 animate-fade-in-out">
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#F2A365] to-[#D9BF77] flex items-center justify-center flex-shrink-0">
            {showingComment.user?.profilepicture ? (
              <Image
                src={showingComment.user.profilepicture}
                alt={showingComment.user.username}
                width={24}
                height={24}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <FaUser size={10} className="text-[#1C1C2E]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#F2A365] text-xs font-medium truncate">
                {showingComment.user?.username}
              </span>
              <span className="text-[#B8B8B8] text-xs flex items-center gap-1 flex-shrink-0">
                <FaClock size={8} />
                {formatTime(showingComment.timecode || 0)}
              </span>
            </div>
            <p className="text-[#F1F1F1] text-xs leading-relaxed line-clamp-2">
              {showingComment.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingComment;
