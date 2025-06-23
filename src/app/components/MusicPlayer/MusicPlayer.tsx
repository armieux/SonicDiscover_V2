"use client";

import React, { useState, useEffect } from "react";
import { useMusicContext } from "@/app/context/MusicContext";
import { SlArrowDown, SlArrowUp, SlControlEnd, SlControlStart } from "react-icons/sl";
import { FaPause, FaPlay } from "react-icons/fa";

const MusicPlayer: React.FC = () => {
  const { currentTrack, playNext, playPrev, audioRef } = useMusicContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;
    const audio = audioRef.current;
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
      playNext(); // Passer au titre suivant automatiquement
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
  }, [currentTrack, audioRef, playNext]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => console.error("Play error:", error));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  if (!currentTrack) {
    return (
      <>
        {/* Élément audio caché mais toujours présent */}
        <audio ref={audioRef} style={{ display: "none" }} />
      </>
    );
  }

  const defaultCover = "/default-cover.jpg"; // Place your default cover image in /public
  const trackImage = currentTrack.trackpicture || defaultCover;

  return (
    <>
      {/* Élément audio global */}
      <audio ref={audioRef} style={{ display: "none" }} />
      
      <div
        className={`fixed bottom-0 left-0 w-full bg-[#282733] p-4 transition-all duration-300 z-50 ${
          isFullScreen ? "h-screen" : "h-28"
        } flex flex-col justify-between`}
      >
        {!isFullScreen && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={trackImage}
                  alt={currentTrack.title}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="ml-4">
                  <h3 className="text-white text-lg">{currentTrack.title}</h3>
                  <p className="text-gray-400">
                    {currentTrack.genre || "Unknown Genre"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button onClick={handlePlayPause} className="text-white hover:text-[#FF6A92]">
                  {isPlaying ? <FaPause size={20}/> : <FaPlay size={20}/>}
                </button>
                <button onClick={toggleFullScreen} className="text-white hover:text-[#FF6A92]">
                  <SlArrowUp size={20}/>
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <input
                type="range"
                className="flex-grow mr-2"
                min={0}
                max={duration}
                step="0.01"
                value={currentTime}
                onChange={handleSeek}
              />
              <span className="text-white text-sm">{formatTime(duration)}</span>
            </div>
          </>
        )}

        {isFullScreen && (
          <div className="flex flex-col items-center justify-center h-full">
            <img
              src={trackImage}
              alt={currentTrack.title}
              className="w-80 h-80 rounded mb-4 object-cover"
            />
            <h2 className="text-white text-2xl">{currentTrack.title}</h2>
            <h4 className="text-gray-400 mb-4">
              {currentTrack.genre || "Unknown Genre"}
            </h4>
            <div className="flex items-center space-x-10 mb-4">
              <button onClick={playPrev} className="text-white hover:text-[#FF6A92]">
                <SlControlStart size={30}/>
              </button>
              <button onClick={handlePlayPause} className="text-white hover:text-[#FF6A92]">
                {isPlaying ? <FaPause size={30}/> : <FaPlay size={30}/>}
              </button>
              <button onClick={playNext} className="text-white hover:text-[#FF6A92]">
                <SlControlEnd size={30}/>
              </button>
            </div>
            <div className="flex items-center space-x-2 w-full max-w-md">
              <span className="text-white text-sm">{formatTime(currentTime)}</span>
              <input
                type="range"
                className="w-full"
                min={0}
                max={duration}
                step="0.01"
                value={currentTime}
                onChange={handleSeek}
              />
              <span className="text-white text-sm">{formatTime(duration)}</span>
            </div>
            <button onClick={toggleFullScreen} className="mt-4 text-white hover:text-[#FF6A92]">
              <SlArrowDown size={30}/>
            </button>
          </div>
        )}
      </div>
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
