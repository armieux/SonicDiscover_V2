"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useMusicContext } from '@/app/context/MusicContext';

const MusicPlayer: React.FC = () => {
  const { currentTrack } = useMusicContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // For tracking progress
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Create a ref to the <audio> element
  const audioRef = useRef<HTMLAudioElement>(null);

  // Whenever currentTrack changes, load the new source and start playing automatically
  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;

    // Assign the new track to the audio element
    audioRef.current.src = currentTrack.audiofile;
    audioRef.current.load();

    // Auto-play
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((error) => {
        console.error("Auto-play was prevented:", error);
        setIsPlaying(false);
      });
  }, [currentTrack]);

  // When metadata is loaded, we can get the track duration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  // If no track is selected, don’t render anything
  if (!currentTrack) {
    return null;
  }

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Toggle play/pause
  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Jump to a new time in the track
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Placeholders for Next/Prev
  // You will need a queue/playlist to implement actual logic
  const handlePrev = () => {
    console.log("Go to previous track (not implemented yet).");
  };

  const handleNext = () => {
    console.log("Go to next track (not implemented yet).");
  };

  return (
    <div
      className={`fixed bottom-0 left-0 w-full bg-[#282733] p-4 transition-all duration-300 ${
        isFullScreen ? 'h-screen' : 'h-16'
      } flex flex-col justify-between`}
    >
      {/* Hidden audio element (or you can style it if you want) */}
      <audio ref={audioRef} />

      {/* Top Row: Artwork + Title + Expand/Minimize */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={currentTrack.trackpicture || 'https://via.placeholder.com/100'}
            alt={currentTrack.title}
            className="w-12 h-12 rounded"
          />
          <div className="ml-4">
            <h3 className="text-white text-lg">{currentTrack.title}</h3>
            <p className="text-gray-400">
              {currentTrack.genre || 'Unknown Genre'}
            </p>
          </div>
        </div>
        <button
          onClick={toggleFullScreen}
          className="text-white hover:text-[#FF6A92]"
        >
          {isFullScreen ? 'Minimize' : 'Expand'}
        </button>
      </div>

      {/* Middle Row: Prev, Play/Pause, Next */}
      <div
        className={`flex justify-between items-center ${
          isFullScreen ? 'mt-6' : ''
        }`}
      >
        <button className="text-white" onClick={handlePrev}>
          Prev
        </button>
        <button className="text-white" onClick={handlePlayPause}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button className="text-white" onClick={handleNext}>
          Next
        </button>
      </div>

      {/* Full-Screen Info + Seekbar */}
      {isFullScreen && (
        <div className="mt-6">
          <p className="text-gray-400">Now Playing</p>
          <h2 className="text-white text-2xl">{currentTrack.title}</h2>
          <h4 className="text-gray-400">
            {currentTrack.genre || 'Unknown Genre'}
          </h4>

          {/* Seekbar */}
          <div className="mt-4 flex items-center space-x-2">
            {/* Current Time */}
            <span className="text-white text-sm">
              {formatTime(currentTime)}
            </span>

            <input
              type="range"
              className="w-full"
              min={0}
              max={duration}
              step={0.01}
              value={currentTime}
              onChange={handleSeek}
            />

            {/* Duration */}
            <span className="text-white text-sm">{formatTime(duration)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper to convert seconds -> mm:ss
function formatTime(time: number): string {
  if (!time || isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default MusicPlayer;
