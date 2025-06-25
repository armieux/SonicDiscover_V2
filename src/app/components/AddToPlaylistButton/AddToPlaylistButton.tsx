"use client";

import { Playlist } from "@/app/interfaces/Playlist";
import { useEffect, useState, useRef } from "react";

export const AddToPlaylistButton = ({ trackId }: { trackId: number }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user's playlists only when dropdown is opened for the first time
  useEffect(() => {
    if (dropdownOpen && playlists.length === 0) {
      fetchPlaylists();
    }
  }, [dropdownOpen, playlists.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Fetch the user's playlists
  const fetchPlaylists = async () => {
    try {
      const response = await fetch(`/api/playlists/user`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setPlaylists(data);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  // Handle adding a track to a playlist
  const handleAddToPlaylist = async (playlistId: number) => {
    setLoading(true);
    setSelectedPlaylist(playlistId); // Store selected playlist for loading indicator
    try {
      await fetch(`/api/playlists/${playlistId}/add`, {
        method: "POST",
        body: JSON.stringify({ trackId }),
        headers: { "Content-Type": "application/json" },
      });
      // Success feedback - could be replaced with a toast notification
      const playlistName = playlists.find(p => p.id === playlistId)?.name || 'playlist';
      console.log(`Track added to ${playlistName}!`);
    } catch (error) {
      console.error("Error adding to playlist:", error);
    } finally {
      setLoading(false);
      setDropdownOpen(false); // Close dropdown after adding
      setSelectedPlaylist(null);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Button */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        disabled={loading}
        className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-105 shadow-lg"
        title="Ajouter à une playlist"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        )}
      </button>

      {/* Dropdown List */}
      {dropdownOpen && 
        ( playlists.length > 0 ? (
          <div className="absolute right-0 mt-2 bg-gray-900 shadow-xl rounded-lg w-48 z-50 border border-gray-700 overflow-hidden">
            <div className="py-1">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  disabled={loading && selectedPlaylist === playlist.id}
                  className={`block w-full text-left px-4 py-3 text-white hover:bg-gray-700 transition-colors duration-200 ${
                    loading && selectedPlaylist === playlist.id ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{playlist.name}</span>
                    {loading && selectedPlaylist === playlist.id && (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white ml-2"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
      ) : (
        <div className="absolute right-0 mt-2 bg-gray-900 text-white shadow-xl rounded-lg w-48 z-50 border border-gray-700 p-3">
          <p className="text-sm text-gray-400">Aucune playlist trouvée</p>
        </div>
      ))
    }
    </div>
  );
};
