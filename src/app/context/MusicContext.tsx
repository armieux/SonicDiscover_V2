"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { Track } from "@/app/interfaces/Track";

interface MusicContextType {
  currentTrack: Track | null;
  playlist: Track[];
  currentIndex: number;
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  setCurrentTrack: (track: Track, playlist?: Track[], index?: number) => void;
  setIsPlaying: (playing: boolean) => void;
  playNext: () => void;
  playPrev: () => void;
  stopPlayback: () => void;
  checkAndRecordListen: (trackId: number, currentTime: number, duration: number) => void;
}

const MusicContext = createContext<MusicContextType>({
  currentTrack: null,
  playlist: [],
  currentIndex: 0,
  isPlaying: false,
  audioRef: { current: null },
  setCurrentTrack: () => {},
  setIsPlaying: () => {},
  playNext: () => {},
  playPrev: () => {},
  stopPlayback: () => {},
  checkAndRecordListen: () => {},
});

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrackState] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [listenRecorded, setListenRecorded] = useState<Set<number>>(new Set());

  const recordListen = async (trackId: number) => {
    try {
      await fetch(`/api/tracks/${trackId}/listen`, {
        method: "POST",
      });
      console.log(`✅ Écoute enregistrée pour le track ${trackId}`);
    } catch (error) {
      console.error("Failed to record listen:", error);
    }
  };

  // Fonction pour vérifier si l'écoute doit être enregistrée
  const checkAndRecordListen = useCallback((trackId: number, currentTime: number, duration: number) => {
    // Enregistrer l'écoute si plus de 30% de la piste a été écoutée
    // ou si plus de 30 secondes ont été écoutées
    const thirtyPercent = duration * 0.3;
    const thirtySeconds = 30;
    const threshold = Math.min(thirtyPercent, thirtySeconds);
    
    if (currentTime >= threshold && !listenRecorded.has(trackId)) {
      setListenRecorded(prev => new Set(prev).add(trackId));
      recordListen(trackId);
    }
  }, [listenRecorded]);

  const setCurrentTrack = useCallback((track: Track, playlistParam?: Track[], index?: number) => {
    const isNewTrack = track.id !== currentTrack?.id;
    
    setCurrentTrackState(track);
    if (playlistParam && typeof index === "number") {
      setPlaylist(playlistParam);
      setCurrentIndex(index);
    }
    
    // Ne pas enregistrer l'écoute immédiatement, attendre le seuil
    if (isNewTrack) {
      console.log(`🎵 Nouveau track sélectionné: ${track.title} (ID: ${track.id})`);
    }
  }, [currentTrack]);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentTrackState(null);
    setPlaylist([]);
    setCurrentIndex(0);
    setIsPlaying(false);
    setListenRecorded(new Set()); // Réinitialiser le set des écoutes enregistrées
  }, [audioRef]);

  const playNext = useCallback(() => {
    if (playlist.length === 0) return;
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    setCurrentTrackState(playlist[nextIndex]);
    
    console.log(`⏭️ Passage au track suivant: ${playlist[nextIndex].title} (ID: ${playlist[nextIndex].id})`);
  }, [playlist, currentIndex]);

  const playPrev = useCallback(() => {
    if (playlist.length === 0) return;
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prevIndex);
    setCurrentTrackState(playlist[prevIndex]);
    
    console.log(`⏮️ Passage au track précédent: ${playlist[prevIndex].title} (ID: ${playlist[prevIndex].id})`);
  }, [playlist, currentIndex]);

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        playlist,
        currentIndex,
        isPlaying,
        audioRef,
        setCurrentTrack,
        setIsPlaying,
        playNext,
        playPrev,
        stopPlayback,
        checkAndRecordListen,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusicContext = () => useContext(MusicContext);
export { MusicContext };
