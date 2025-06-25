"use client"
import PageLayout from './components/PageLayout';
import Head from 'next/head';
import ChatWidget from "@/app/components/ChatWidget/ChatWidget";
import HypeTrain from "@/app/components/HypeTrain/HypeTrain";
import DiscoveryPreview from './components/DiscoveryPreview/DiscoveryPreview';
import { useContext } from 'react';
import { MusicContext } from './context/MusicContext';
import { Track } from './interfaces/Track';

import UserMusicStats from './components/UserMusicStats/UserMusicStats';

const HomePage: React.FC = () => {
  const { setCurrentTrack, setIsPlaying } = useContext(MusicContext);

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  return (
      <><Head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon"/>
      </Head><PageLayout>{<>
          <div className="flex w-100 bg-[#121212] items-center justify-start flex-col min-h-screen">
              <h1 className="text-5xl text-white p-5">Bienvenue sur Sonic Discover!</h1>
              <HypeTrain />
              <DiscoveryPreview onTrackSelect={handleTrackSelect} />
          </div>
          <ChatWidget />
      </>}</PageLayout>
      </>
  );
};

export default HomePage;
