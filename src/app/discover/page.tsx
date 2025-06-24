'use client';

import React, { useContext } from 'react';
import DiscoveryPlaylist from '../components/DiscoveryPlaylist/DiscoveryPlaylist';
import { MusicContext } from '../context/MusicContext';
import { Track } from '../interfaces/Track';
import Layout from '../components/Layout';

export default function DiscoverPage() {
  const { setCurrentTrack, setIsPlaying } = useContext(MusicContext);

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Découverte Musicale
          </h1>
          <p className="text-gray-600">
            Explorez de nouvelles pistes adaptées à vos goûts musicaux
          </p>
        </div>

        <DiscoveryPlaylist onTrackSelect={handleTrackSelect} />
      </div>
    </Layout>
  );
}
