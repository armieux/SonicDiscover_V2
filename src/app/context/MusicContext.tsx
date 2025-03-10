"use client";

import React, { createContext, useContext, useState } from "react";
import { Track } from "@/app/interfaces/Track";

interface MusicContextType {
  currentTrack: Track | null;
  playlist: Track[];
  currentIndex: number;
  setCurrentTrack: (track: Track, playlist?: Track[], index?: number) => void;
  playNext: () => void;
  playPrev: () => void;
}

const MusicContext = createContext<MusicContextType>({
  currentTrack: null,
  playlist: [],
  currentIndex: 0,
  setCurrentTrack: () => {},
  playNext: () => {},
  playPrev: () => {},
});

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrackState] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const setCurrentTrack = async (track: Track, playlistParam?: Track[], index?: number) => {
    setCurrentTrackState(track);
    if (playlistParam && typeof index === "number") {
      setPlaylist(playlistParam);
      setCurrentIndex(index);
    }
    if (track.id !== currentTrack?.id) {
      await fetch(`/api/tracks/${track.id}/addplay`, {
        method: "POST",
      });
    }
  };

  const playNext = () => {
    if (playlist.length === 0) return;
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    setCurrentTrackState(playlist[nextIndex]);
  };

  const playPrev = () => {
    if (playlist.length === 0) return;
    // Use modulo arithmetic to wrap to the end of the list
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prevIndex);
    setCurrentTrackState(playlist[prevIndex]);
  };

  return (
    <MusicContext.Provider
      value={{ currentTrack, playlist, currentIndex, setCurrentTrack, playNext, playPrev }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusicContext = () => useContext(MusicContext);
