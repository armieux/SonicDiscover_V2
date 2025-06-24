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
});

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrackState] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const recordListen = async (trackId: number) => {
    try {
      await fetch(`/api/tracks/${trackId}/listen`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to record listen:", error);
    }
  };

  const setCurrentTrack = useCallback(async (track: Track, playlistParam?: Track[], index?: number) => {
    const isNewTrack = track.id !== currentTrack?.id;
    
    setCurrentTrackState(track);
    if (playlistParam && typeof index === "number") {
      setPlaylist(playlistParam);
      setCurrentIndex(index);
    }
    
    // Record listen if it's a new track
    if (isNewTrack) {
      await recordListen(track.id);
    }
  }, [currentTrack]);

  const playNext = useCallback(async () => {
    if (playlist.length === 0) return;
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    setCurrentTrackState(playlist[nextIndex]);
    
    // Record listen for the new track
    await recordListen(playlist[nextIndex].id);
  }, [playlist, currentIndex]);

  const playPrev = useCallback(async () => {
    if (playlist.length === 0) return;
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prevIndex);
    setCurrentTrackState(playlist[prevIndex]);
    
    // Record listen for the new track
    await recordListen(playlist[prevIndex].id);
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
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusicContext = () => useContext(MusicContext);
export { MusicContext };
