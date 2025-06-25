"use client"
import PageLayout from './components/PageLayout';
import Head from 'next/head';
import ChatWidget from "@/app/components/ChatWidget/ChatWidget";
import HypeTrain from "@/app/components/HypeTrain/HypeTrain";
import DiscoveryPreview from './components/DiscoveryPreview/DiscoveryPreview';
import { useContext } from 'react';
import { MusicContext } from './context/MusicContext';
import { Track } from './interfaces/Track';

const HomePage: React.FC = () => {
  const { setCurrentTrack, setIsPlaying } = useContext(MusicContext);

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon"/>
      </Head>
      <PageLayout>
        <div className="min-h-screen bg-[#1C1C2E] px-6 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12 fade-in-up">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-[#F2A365] to-[#D9BF77] bg-clip-text text-transparent mb-4">
              Bienvenue sur Sonic Discover
            </h1>
            <p className="text-xl text-[#B8B8B8] max-w-2xl mx-auto leading-relaxed">
              Découvrez, partagez et explorez un univers musical sans limites. 
              Connectez-vous avec des artistes et des mélomanes du monde entier.
            </p>
          </div>

          {/* Sections principales */}
          <div className="max-w-7xl mx-auto space-y-12">
            {/* HypeTrain Section */}
            <section className="glass-effect p-8 rounded-2xl">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[#F2A365] mb-2">🔥 Tendances Actuelles</h2>
                <p className="text-[#B8B8B8]">Les morceaux qui font vibrer la communauté en ce moment</p>
              </div>
              <HypeTrain />
            </section>

            {/* Discovery Section */}
            <section className="glass-effect p-8 rounded-2xl">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[#F2A365] mb-2">🎵 Découvertes Personnalisées</h2>
                <p className="text-[#B8B8B8]">Des recommandations spécialement sélectionnées pour vous</p>
              </div>
              <DiscoveryPreview onTrackSelect={handleTrackSelect} />
            </section>

            {/* Stats Section */}
            <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="glass-effect p-6 rounded-2xl text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F2A365] to-[#D9BF77] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-[#1C1C2E]">🎧</span>
                </div>
                <h3 className="text-xl font-semibold text-[#F1F1F1] mb-2">Écoutes Personnalisées</h3>
                <p className="text-[#B8B8B8]">Algorithme intelligent d'adaptation musicale</p>
              </div>

              <div className="glass-effect p-6 rounded-2xl text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#3E5C76] to-[#D9BF77] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-[#F1F1F1]">🌍</span>
                </div>
                <h3 className="text-xl font-semibold text-[#F1F1F1] mb-2">Communauté Globale</h3>
                <p className="text-[#B8B8B8]">Connectez-vous avec des passionnés du monde entier</p>
              </div>

              <div className="glass-effect p-6 rounded-2xl text-center md:col-span-2 lg:col-span-1">
                <div className="w-16 h-16 bg-gradient-to-br from-[#D9BF77] to-[#F2A365] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-[#1C1C2E]">⚡</span>
                </div>
                <h3 className="text-xl font-semibold text-[#F1F1F1] mb-2">Découverte Instantanée</h3>
                <p className="text-[#B8B8B8]">Explorez de nouveaux horizons musicaux en temps réel</p>
              </div>
            </section>

            {/* Call to Action */}
            <section className="text-center py-12">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold text-[#F1F1F1] mb-6">
                  Prêt à explorer votre prochain coup de cœur musical ?
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="btn-primary text-lg px-8 py-4 rounded-2xl font-semibold">
                    Commencer l'exploration
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
        
        <ChatWidget />
      </PageLayout>
    </>
  );
};

export default HomePage;
