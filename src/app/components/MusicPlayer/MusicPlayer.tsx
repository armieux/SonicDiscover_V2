"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMusicContext } from "@/app/context/MusicContext";
import { FaPause, FaPlay } from "react-icons/fa";
import { SlArrowDown, SlArrowUp, SlControlEnd, SlControlStart } from "react-icons/sl";

const MusicPlayer: React.FC = () => {
  const { currentTrack } = useMusicContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Reference to the hidden audio element
  const audioRef = useRef<HTMLAudioElement>(null);

  // When the current track changes, load and start playing it
  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;

    const audio = audioRef.current;
    // Reset progress states
    setCurrentTime(0);
    setDuration(0);

    // Set the new audio source
    audio.src = currentTrack.audiofile;
    audio.load();

    // Auto-play the track and update state accordingly
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((error) => {
        console.error("Auto-play was prevented:", error);
        setIsPlaying(false);
      });

    // Attach event listeners for metadata and progress
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

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    // Cleanup on unmount or track change
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [currentTrack]);

  // Immediately toggle local state for play/pause, then command the audio element.
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => console.error("Play error:", error));
    }
  };

  // Allow the user to seek by updating the audio element’s currentTime
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Toggle between collapsed and full-screen views
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Placeholders for previous/next track functions
  const handlePrev = () => {
    console.log("Previous track (not implemented)");
  };

  const handleNext = () => {
    console.log("Next track (not implemented)");
  };

  if (!currentTrack) {
    return null;
  }

  // Use a default cover image if the track doesn't have one.
  // Place your default image at: /public/default-cover.jpg
  const defaultCover = "/default-cover.jpg";
  const trackImage = currentTrack.trackpicture || defaultCover;

  return (
    <div
      className={`fixed bottom-0 left-0 w-full bg-[#282733] p-4 transition-all duration-300 ${
        isFullScreen ? "h-screen" : "h-28"
      } flex flex-col justify-between`}
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} style={{ display: "none" }} />

      {/* Collapsed Mode */}
      {!isFullScreen && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={trackImage}
                alt={currentTrack.title}
                className="w-12 h-12 rounded"
              />
              <div className="ml-4">
                <h3 className="text-white text-lg">{currentTrack.title}</h3>
                <p className="text-gray-400">
                  {currentTrack.genre || "Unknown Genre"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlayPause}
                className="text-white hover:text-[#FF6A92]"
              >
                {isPlaying ? <FaPause size={20}/> : <FaPlay size={20}/>}
              </button>
              <button
                onClick={toggleFullScreen}
                className="text-white hover:text-[#FF6A92]"
              >
                <SlArrowUp size={20}/>
              </button>
            </div>
          </div>
          {/* Progress Bar (included in collapsed mode) */}
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

      {/* Expanded Mode */}
      {isFullScreen && (
        <div className="flex flex-col items-center justify-center h-full">
          {/* Big cover image (centered like Spotify) */}
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
            <button onClick={handlePrev} className="text-white">
              <SlControlStart size={30}/>
            </button>
            <button onClick={handlePlayPause} className="text-white">
              {isPlaying ? <FaPause size={30}/> : <FaPlay size={30}/>}
            </button>
            <button onClick={handleNext} className="text-white">
              <SlControlEnd size={30}/>
            </button>
          </div>
          {/* Seekbar with time indicators */}
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
          <button
            onClick={toggleFullScreen}
            className="mt-4 text-white hover:text-[#FF6A92]"
          >
            <SlArrowDown size={30}/>
          </button>
        </div>
      )}
    </div>
  );
};

// Helper function to format time (seconds) into mm:ss
function formatTime(time: number): string {
  if (!time || isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default MusicPlayer;
