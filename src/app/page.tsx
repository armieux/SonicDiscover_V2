"use client"
import Layout from './components/Layout';import Head from 'next/head';
import MusicPlayer from './components/MusicPlayer/MusicPlayer';
import Upload from './components/Upload/Upload';

const HomePage: React.FC = () => {
  return (
      <><Head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon"/>
      </Head><Layout>{<>
          <div className="flex h-screen w-screen bg-[#353445] items-center justify-center">
              <h1 className="text-5xl text-white">Welcome to Sonic Discover!</h1>
          </div>
      </>}</Layout>
      </>
  );
};

export default HomePage;