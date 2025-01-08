// app/music-list/page.tsx
import React from 'react';
import MusicCard from '../components/MusicCard/MusicCard';
import { Track } from '../interfaces/Track';
import Layout from '../components/Layout';

// We can define a Music interface here if you want strongly-typed data
interface Music {
  coverImage: string;
  title: string;
  artist: string;
  duration: string;
  listenUrl: string;
  heat: number;
}

export default async function MusicListPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/tracks`, {
    method: 'GET'
    // Optional: Turn off caching/revalidation if you want fresh data every request:
    // next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch tracks.');
  }

  const data = await res.json();

  const musicList: Music[] = data.map((track: Track) => ({
    coverImage: track.trackPicture || 'https://via.placeholder.com/500',
    title: track.title,
    artist: 'Unknown Artist',      // Not in DB, so set a default
    duration: '0:00',              // Not in DB, so set a default
    listenUrl: track.audioFile,    
    heat: track.playCount || 0,    
  }));

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Liste de Musiques</h1>
        <div className="space-y-4 w-full max-w-4xl">
          {musicList.map((music, index) => (
            <MusicCard
              key={index}
              coverImage={music.coverImage}
              title={music.title}
              artist={music.artist}
              duration={music.duration}
              listenUrl={music.listenUrl}
              heat={music.heat}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
