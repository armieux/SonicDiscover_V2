"use client"; // if you're using app router and need client-side contexts

import React, { createContext, useState, useContext } from 'react';
import { Track } from '@/app/interfaces/Track';

interface MusicContextType {
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
}

const MusicContext = createContext<MusicContextType>({
  currentTrack: null,
  setCurrentTrack: () => {},
});

// This is the provider that will wrap your app or layout
export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  return (
    <MusicContext.Provider value={{ currentTrack, setCurrentTrack }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusicContext = () => useContext(MusicContext);
