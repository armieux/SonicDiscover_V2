"use client";

import React, { createContext, useContext, useState, useRef, useCallback, useMemo } from "react";
import { Track } from "@/app/interfaces/Track";

interface MusicContextType {
  currentTrack: Track | null;
  playlist: Track[];
  currentIndex: number;
  setCurrentTrack: (track: Track, playlist?: Track[], index?: number) => void;
  playNext: () => void;
  playPrev: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const MusicContext = createContext<MusicContextType>({
  currentTrack: null,
  playlist: [],
  currentIndex: 0,
  setCurrentTrack: () => {},
  playNext: () => {},
  playPrev: () => {},
  audioRef: { current: null },
});

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrackState] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Ref global pour l'élément audio - persistera entre les navigations
  const audioRef = useRef<HTMLAudioElement>(null);

  const setCurrentTrack = useCallback(async (track: Track, playlistParam?: Track[], index?: number) => {
    // Ne mettre à jour que si c'est vraiment un nouveau track
    if (currentTrack?.id !== track.id) {
      console.log('Nouveau track sélectionné dans le contexte:', track.title);
      setCurrentTrackState(track);
      
      // Incrémenter le compteur de lecture
      try {
        await fetch(`/api/tracks/${track.id}/addplay`, {
          method: "POST",
        });
      } catch (err) {
        console.error('Erreur lors de l\'incrémentation des lectures:', err);
      }
    } else {
      console.log('Même track, pas de changement nécessaire');
    }
    
    // Mettre à jour la playlist et l'index si fournis
    if (playlistParam && typeof index === "number") {
      setPlaylist(playlistParam);
      setCurrentIndex(index);
    }
  }, [currentTrack]);

  const playNext = useCallback(() => {
    if (playlist.length === 0) return;
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    setCurrentTrackState(playlist[nextIndex]);
  }, [playlist, currentIndex]);

  const playPrev = useCallback(() => {
    if (playlist.length === 0) return;
    // Use modulo arithmetic to wrap to the end of the list
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prevIndex);
    setCurrentTrackState(playlist[prevIndex]);
  }, [playlist, currentIndex]);

  const contextValue = useMemo(() => ({
    currentTrack,
    playlist,
    currentIndex,
    setCurrentTrack,
    playNext,
    playPrev,
    audioRef
  }), [currentTrack, playlist, currentIndex, setCurrentTrack, playNext, playPrev]);

  return (
    <MusicContext.Provider value={contextValue}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusicContext = () => useContext(MusicContext);
