"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useMusicContext } from "@/app/context/MusicContext";
import { SlArrowDown, SlArrowUp, SlControlEnd, SlControlStart } from "react-icons/sl";
import { FaPause, FaPlay, FaShuffle, FaRepeat } from "react-icons/fa6";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import Image from 'next/image';

const MusicPlayer: React.FC = () => {
  const { currentTrack, playNext, playPrev, audioRef, stopPlayback } = useMusicContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const previousTrackIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;
    
    const audio = audioRef.current;
    const isNewTrack = previousTrackIdRef.current !== currentTrack.id;
    
    if (isNewTrack) {
      console.log('Chargement d\'un nouveau track:', currentTrack.title);
      previousTrackIdRef.current = currentTrack.id;
      
      setCurrentTime(0);
      setDuration(0);
      audio.src = currentTrack.audiofile;
      audio.load();
      
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Auto-play was prevented:", error);
          setIsPlaying(false);
        });
    } else {
      console.log('Même track détecté, synchronisation des états');
      setIsPlaying(!audio.paused);
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handlePlay = () => {
      setIsPlaying(true);
    };
    const handlePause = () => {
      setIsPlaying(false);
    };
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };
    
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrack, audioRef, playNext, repeatMode]);

  // Gestion du volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, audioRef]);

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => console.error("Play error:", error));
    }
  }, [isPlaying, audioRef]);

  // Gestionnaire de clic sur la barre de progression
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [audioRef, duration]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [audioRef]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleShuffle = useCallback(() => {
    setIsShuffled(!isShuffled);
  }, [isShuffled]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(current => {
      switch (current) {
        case 'none': return 'all';
        case 'all': return 'one';
        case 'one': return 'none';
        default: return 'none';
      }
    });
  }, []);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(!isFullScreen);
  }, [isFullScreen]);

  if (!currentTrack) {
    return (
      <>
        <audio ref={audioRef} style={{ display: "none" }} />
      </>
    );
  }

  const defaultCover = "/default-cover.jpg";
  const trackImage = currentTrack.trackpicture || defaultCover;

  return (
    <>
      <audio ref={audioRef} style={{ display: "none" }} />
      
      <div
        className={`music-player fixed bottom-0 left-0 w-full transition-all duration-500 ease-in-out z-50 ${
          isFullScreen ? "h-screen bg-[#1C1C2E]" : "h-24"
        }`}
      >
        {!isFullScreen && (
          <div className="h-full flex items-center px-8 bg-[#2A2A40] bg-opacity-95 backdrop-blur-xl border-[#3E5C76] border-opacity-30 relative">
            {/* Barre de progression en haut - séparée du contenu et cliquable */}
            <div 
              className="absolute -top-2 left-0 right-0 h-1 bg-[#3E5C76] bg-opacity-20 overflow-hidden z-10 cursor-pointer group hover:h-2 transition-all duration-200"
              onClick={handleProgressClick}
              title="Cliquez pour naviguer dans la piste"
            >
              <div 
                className="h-full bg-gradient-to-r from-[#F2A365] to-[#D9BF77] transition-all duration-200 ease-out relative"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              >
                {/* Indicateur de position au survol */}
                <div className="absolute right-0 top-0 w-1 h-full bg-white opacity-0 group-hover:opacity-80 transition-opacity duration-200 shadow-lg" />
              </div>
              {/* Zone de survol pour améliorer l'UX */}
              <div className="absolute inset-0 bg-transparent group-hover:bg-[#F2A365] group-hover:bg-opacity-10 transition-colors duration-200" />
            </div>

            {/* Contenu principal avec espacement correct */}
            <div className="flex items-center justify-between w-full h-full py-4">
              {/* Informations du track */}
              <div className="flex items-center flex-1 min-w-0 max-w-[35%]">
                {/* Image du track */}
                <div className="relative group flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shadow-lg ring-1 ring-[#3E5C76] ring-opacity-30">
                    <Image
                      src={trackImage}
                      alt={currentTrack.title}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  
                  {/* Indicateur de lecture */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#F2A365] to-[#D9BF77] rounded-full flex items-center justify-center shadow-md z-20">
                    {isPlaying ? (
                      <div className="w-1.5 h-1.5 bg-[#1C1C2E] rounded-full animate-pulse" />
                    ) : (
                      <div className="w-1.5 h-1.5 bg-[#1C1C2E] rounded-full opacity-60" />
                    )}
                  </div>
                </div>
                
                {/* Informations textuelles */}
                <div className="ml-4 flex-1 min-w-0">
                  <h3 className="text-[#F1F1F1] text-sm font-semibold truncate leading-tight mb-1">
                    {currentTrack.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    <p className="text-[#B8B8B8] truncate">
                      {currentTrack.genre || "Genre inconnu"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contrôles centraux */}
              <div className="flex items-center justify-center space-x-4">
                <button 
                  onClick={playPrev} 
                  className="p-2 text-[#B8B8B8] hover:text-[#F2A365] hover:bg-[#F2A365] hover:bg-opacity-10 rounded-lg transition-all duration-300"
                  title="Précédent"
                >
                  <SlControlStart size={18}/>
                </button>
                
                <button 
                  onClick={handlePlayPause} 
                  className="w-12 h-12 bg-gradient-to-br from-[#F2A365] to-[#D9BF77] rounded-full flex items-center justify-center text-[#1C1C2E] hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-lg relative overflow-hidden group"
                  title={isPlaying ? "Pause" : "Lecture"}
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  {isPlaying ? <FaPause size={14}/> : <FaPlay size={14} className="ml-0.5"/>}
                </button>
                
                <button 
                  onClick={playNext} 
                  className="p-2 text-[#B8B8B8] hover:text-[#F2A365] hover:bg-[#F2A365] hover:bg-opacity-10 rounded-lg transition-all duration-300"
                  title="Suivant"
                >
                  <SlControlEnd size={18}/>
                </button>
              </div>

              {/* Contrôles de droite */}
              <div className="flex items-center justify-end space-x-3 flex-1 max-w-[35%]">
                {/* Temps de lecture */}
                <div className="bg-[#242438] bg-opacity-40 px-2 py-1 rounded-lg">
                  <span className="text-[#B8B8B8] text-xs font-mono leading-none whitespace-nowrap">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                
                {/* Contrôle du volume */}
                <div className="flex items-center space-x-2 bg-[#242438] bg-opacity-40 px-3 py-2 rounded-lg">
                  <button 
                    onClick={toggleMute} 
                    className="text-[#B8B8B8] hover:text-[#F2A365] transition-colors duration-300 flex-shrink-0"
                    title={isMuted ? "Activer le son" : "Couper le son"}
                  >
                    {isMuted ? <HiVolumeOff size={16}/> : <HiVolumeUp size={16}/>}
                  </button>
                  <div className="relative w-16">
                    <input
                      type="range"
                      className="w-full h-1 bg-[#3E5C76] bg-opacity-50 rounded-full appearance-none cursor-pointer volume-slider"
                      min={0}
                      max={1}
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                    />
                  </div>
                </div>
                
                {/* Bouton plein écran */}
                <button 
                  onClick={toggleFullScreen} 
                  className="p-2 text-[#B8B8B8] hover:text-[#F2A365] hover:bg-[#F2A365] hover:bg-opacity-10 rounded-lg transition-all duration-300 flex-shrink-0"
                  title="Mode plein écran"
                >
                  <SlArrowUp size={16}/>
                </button>
                
                {/* Bouton de fermeture */}
                <button 
                  onClick={stopPlayback} 
                  className="p-2 text-[#B8B8B8] hover:text-red-400 hover:bg-red-500 hover:bg-opacity-10 rounded-lg transition-all duration-300 flex-shrink-0"
                  title="Arrêter et fermer le lecteur"
                >
                  <IoClose size={18}/>
                </button>
              </div>
            </div>
          </div>
        )}

        {isFullScreen && (
          <div className="h-full flex flex-col items-center justify-center px-8 relative">
            {/* Boutons de contrôle en haut */}
            <div className="absolute top-8 right-8 flex items-center gap-4">
              {/* Bouton de réduction */}
              <button 
                onClick={toggleFullScreen} 
                className="p-2 text-[#B8B8B8] hover:text-[#F2A365] hover:bg-[#F2A365] hover:bg-opacity-10 rounded-lg transition-all duration-300"
                title="Réduire"
              >
                <SlArrowDown size={24}/>
              </button>
              
              {/* Bouton de fermeture */}
              <button 
                onClick={stopPlayback} 
                className="p-2 text-[#B8B8B8] hover:text-red-400 hover:bg-red-500 hover:bg-opacity-10 rounded-lg transition-all duration-300"
                title="Arrêter et fermer le lecteur"
              >
                <IoClose size={24}/>
              </button>
            </div>

            {/* Image de l'album */}
            <div className="relative mb-8 group">
              <div className="w-80 h-80 rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={trackImage}
                  alt={currentTrack.title}
                  width={320}
                  height={320}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-30 rounded-3xl transition-opacity duration-300" />
            </div>

            {/* Informations du track */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-[#F1F1F1] mb-2">{currentTrack.title}</h2>
              <h4 className="text-xl text-[#B8B8B8] mb-4">
                {currentTrack.genre || "Genre inconnu"}
              </h4>
            </div>

            {/* Barre de progression */}
            <div className="w-full max-w-2xl mb-8">
              <input
                type="range"
                className="w-full h-2 bg-[#3E5C76] bg-opacity-30 rounded-lg appearance-none cursor-pointer progress-slider"
                min={0}
                max={duration}
                step="0.01"
                value={currentTime}
                onChange={handleSeek}
              />
              <div className="flex justify-between text-[#B8B8B8] text-sm mt-2 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Contrôles */}
            <div className="flex items-center space-x-8 mb-8">
              <button 
                onClick={toggleShuffle}
                className={`transition-colors duration-300 ${isShuffled ? 'text-[#F2A365]' : 'text-[#B8B8B8] hover:text-[#F2A365]'}`}
              >
                <FaShuffle size={24}/>
              </button>
              
              <button 
                onClick={playPrev} 
                className="text-[#B8B8B8] hover:text-[#F2A365] transition-colors duration-300"
              >
                <SlControlStart size={32}/>
              </button>
              
              <button 
                onClick={handlePlayPause} 
                className="w-16 h-16 bg-gradient-to-br from-[#F2A365] to-[#D9BF77] rounded-full flex items-center justify-center text-[#1C1C2E] hover:scale-105 transition-transform duration-300 shadow-2xl"
              >
                {isPlaying ? <FaPause size={24}/> : <FaPlay size={24} className="ml-1"/>}
              </button>
              
              <button 
                onClick={playNext} 
                className="text-[#B8B8B8] hover:text-[#F2A365] transition-colors duration-300"
              >
                <SlControlEnd size={32}/>
              </button>
              
              <button 
                onClick={toggleRepeat}
                className={`transition-colors duration-300 ${
                  repeatMode !== 'none' ? 'text-[#F2A365]' : 'text-[#B8B8B8] hover:text-[#F2A365]'
                }`}
              >
                <FaRepeat size={24}/>
                {repeatMode === 'one' && (
                  <span className="absolute -mt-2 -mr-2 text-xs bg-[#F2A365] text-[#1C1C2E] rounded-full w-4 h-4 flex items-center justify-center font-bold">1</span>
                )}
              </button>
            </div>

            {/* Contrôle du volume */}
            <div className="flex items-center space-x-4">
              <button onClick={toggleMute} className="text-[#B8B8B8] hover:text-[#F2A365] transition-colors duration-300">
                {isMuted ? <HiVolumeOff size={24}/> : <HiVolumeUp size={24}/>}
              </button>
              <input
                type="range"
                className="w-32 h-2 bg-[#3E5C76] bg-opacity-30 rounded-lg appearance-none cursor-pointer slider"
                min={0}
                max={1}
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .volume-slider {
          background: transparent;
        }
        
        .volume-slider::-webkit-slider-track {
          width: 100%;
          height: 4px;
          background: rgba(62, 92, 118, 0.3);
          border-radius: 2px;
        }
        
        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F2A365, #D9BF77);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(242, 163, 101, 0.4);
          border: none;
          position: relative;
          top: -4px;
        }
        
        .volume-slider::-moz-range-track {
          width: 100%;
          height: 4px;
          background: rgba(62, 92, 118, 0.3);
          border-radius: 2px;
          border: none;
        }
        
        .volume-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F2A365, #D9BF77);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(242, 163, 101, 0.4);
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F2A365, #D9BF77);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(242, 163, 101, 0.3);
        }
        
        .progress-slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F2A365, #D9BF77);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(242, 163, 101, 0.4);
        }
      `}</style>
    </>
  );
};

function formatTime(time: number): string {
  if (!time || isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default MusicPlayer;
