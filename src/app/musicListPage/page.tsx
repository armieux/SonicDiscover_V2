import React from 'react';
import MusicCard from '../components/MusicCard/MusicCard';

interface Music {
  coverImage: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  listenUrl: string;
  heat: number
}

const musicList: Music[] = [
  {
    coverImage: 'https://via.placeholder.com/500',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: '3:20',
    listenUrl: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
    heat: -56
  },
  {
    coverImage: 'https://via.placeholder.com/500',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: '3:24',
    listenUrl: 'https://open.spotify.com/track/463CkQjx2J6PGiGA9KJP2z',
    heat: 632
  },
  {
    coverImage: 'https://via.placeholder.com/500',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: '3:36',
    listenUrl: 'https://open.spotify.com/track/5QO79kh1waicV47BqGRL3g',
    heat: 23
  },
  {
    coverImage: 'https://via.placeholder.com/500',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: '3:36',
    listenUrl: 'https://open.spotify.com/track/5QO79kh1waicV47BqGRL3g',
    heat: 23
  },
  {
    coverImage: 'https://via.placeholder.com/500',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: '3:36',
    listenUrl: 'https://open.spotify.com/track/5QO79kh1waicV47BqGRL3g',
    heat: 23
  },
  {
    coverImage: 'https://via.placeholder.com/500',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: '3:36',
    listenUrl: 'https://open.spotify.com/track/5QO79kh1waicV47BqGRL3g',
    heat: 23
  },
  {
    coverImage: 'https://via.placeholder.com/500',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: '3:36',
    listenUrl: 'https://open.spotify.com/track/5QO79kh1waicV47BqGRL3g',
    heat: 23
  },
  {
    coverImage: 'https://via.placeholder.com/500',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: '3:36',
    listenUrl: 'https://open.spotify.com/track/5QO79kh1waicV47BqGRL3g',
    heat: 23
  }
];

const MusicListPage: React.FC = () => {
  return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Liste de Musiques</h1>
        <div className="space-y-4 w-full max-w-4xl">
          {musicList.map((music, index) => (
              <MusicCard
                  key={index}
                  coverImage={music.coverImage}
                  title={music.title}
                  artist={music.artist}
                  album={music.album}
                  duration={music.duration}
                  listenUrl={music.listenUrl}
                  heat={music.heat}
              />
          ))}
        </div>
      </div>
  );
};

export default MusicListPage;
