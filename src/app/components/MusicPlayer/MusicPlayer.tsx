// src/components/MusicPlayer.tsx

import React, { useState } from 'react';

const MusicPlayer: React.FC = () => {
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Dummy song data for demonstration
    const currentSong = {
        title: "Song Title",
        artist: "Artist Name",
        album: "Album Name",
        cover: "https://via.placeholder.com/100", // Placeholder for album cover
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    return (
        <div className={`fixed bottom-0 left-0 w-full bg-[#282733] p-4 transition-all duration-300 ${isFullScreen ? 'h-screen' : 'h-16'} flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <img src={currentSong.cover} alt={currentSong.title} className="w-12 h-12 rounded" />
                    <div className="ml-4">
                        <h3 className="text-white text-lg">{currentSong.title}</h3>
                        <p className="text-gray-400">{currentSong.artist}</p>
                    </div>
                </div>
                <button
                    onClick={toggleFullScreen}
                    className="text-white hover:text-[#FF6A92]"
                >
                    {isFullScreen ? 'Minimize' : 'Expand'}
                </button>
            </div>

            <div className={`flex justify-between items-center ${isFullScreen ? 'mt-6' : ''}`}>
                <button className="text-white">Prev</button>
                <button className="text-white">Play</button>
                <button className="text-white">Next</button>
            </div>

            {isFullScreen && (
                <div className="mt-6">
                    <p className="text-gray-400">Now Playing</p>
                    <h2 className="text-white text-2xl">{currentSong.title}</h2>
                    <h4 className="text-gray-400">{currentSong.artist}</h4>
                    <div className="mt-4">
                        <input type="range" className="w-full" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MusicPlayer;