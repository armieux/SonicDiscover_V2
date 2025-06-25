'use client';

import React, { useContext } from 'react';
import DiscoveryPlaylist from '../components/DiscoveryPlaylist/DiscoveryPlaylist';
import { MusicContext } from '../context/MusicContext';
import { Track } from '../interfaces/Track';
import PageLayout from '../components/PageLayout';
import { FiCompass, FiTrendingUp, FiShuffle } from 'react-icons/fi';
import { FaMagic, FaMusic } from 'react-icons/fa';

export default function DiscoverPage() {
  const { setCurrentTrack, setIsPlaying } = useContext(MusicContext);

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-night-blue px-6 py-8">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 fade-in-up">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                <FiCompass className="text-3xl text-night-blue" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Découverte Musicale
            </h1>
            
            <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed mb-8">
              Plongez dans un univers musical personnalisé et explorez des sons qui correspondent parfaitement à vos goûts. 
              Notre intelligence artificielle sélectionne les meilleures découvertes pour vous.
            </p>

            {/* Stats rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="glass-effect p-6 rounded-2xl text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-peach-soft to-gold-soft rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiTrendingUp className="text-xl text-night-blue" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">Tendances Personnalisées</h3>
                <p className="text-text-secondary text-sm">Basées sur vos écoutes récentes</p>
              </div>

              <div className="glass-effect p-6 rounded-2xl text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-gray-cold to-gold-soft rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaMagic className="text-xl text-text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">IA Musicale</h3>
                <p className="text-text-secondary text-sm">Algorithme intelligent de recommandation</p>
              </div>

              <div className="glass-effect p-6 rounded-2xl text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-gold-soft to-peach-soft rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiShuffle className="text-xl text-night-blue" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">Découverte Infinie</h3>
                <p className="text-text-secondary text-sm">Toujours de nouveaux horizons musicaux</p>
              </div>
            </div>
          </div>

          {/* Section principale de découverte */}
          <div className="glass-effect p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <FaMusic className="text-night-blue" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary">Votre Playlist de Découverte</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-peach-soft to-transparent"></div>
            </div>

            <DiscoveryPlaylist onTrackSelect={handleTrackSelect} />
          </div>

          {/* Section des conseils de découverte */}
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="glass-effect p-6 rounded-2xl">
              <h3 className="text-xl font-semibold text-peach-soft mb-4">💡 Conseils de Découverte</h3>
              <ul className="space-y-3 text-text-secondary">
                <li className="flex items-start gap-3">
                  <span className="text-gold-soft">•</span>
                  <span>Explorez différents genres pour enrichir vos recommandations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold-soft">•</span>
                  <span>Notez vos morceaux favoris pour améliorer l&apos;algorithme</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold-soft">•</span>
                  <span>Partagez vos découvertes avec la communauté</span>
                </li>
              </ul>
            </div>

            <div className="glass-effect p-6 rounded-2xl">
              <h3 className="text-xl font-semibold text-blue-gray-cold mb-4">🎯 Comment ça marche ?</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-night-blue font-bold text-sm">1</div>
                  <span className="text-text-secondary">Analyse de vos goûts musicaux</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-night-blue font-bold text-sm">2</div>
                  <span className="text-text-secondary">Sélection personnalisée de morceaux</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-night-blue font-bold text-sm">3</div>
                  <span className="text-text-secondary">Mise à jour continue des recommandations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
