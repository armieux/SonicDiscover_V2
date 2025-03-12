"use client";

import { Playlist } from "@/app/interfaces/Playlist";
import { useEffect, useState } from "react";

export const AddToPlaylistButton = ({ trackId }: { trackId: number }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<number | null>(null);

  // Fetch user's playlists only when dropdown is opened for the first time
  useEffect(() => {
    if (dropdownOpen && playlists.length === 0) {
      fetchPlaylists();
    }
  }, [dropdownOpen, playlists.length]);

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
      alert("Track added to playlist!");
    } catch (error) {
      console.error("Error adding to playlist:", error);
    } finally {
      setLoading(false);
      setDropdownOpen(false); // Close dropdown after adding
    }
  };

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        disabled={loading}
        className="bg-blue-500 px-4 py-2 rounded text-white relative"
      >
        {loading ? "Ajout..." : "Ajouter à la Playlist"}
      </button>

      {/* Dropdown List */}
      {dropdownOpen && 
        ( playlists.length > 0 ? (
          <div className="absolute right-0 mt-2 bg-gray-800 shadow-lg rounded-md w-48 z-10">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => handleAddToPlaylist(playlist.id)}
                disabled={loading && selectedPlaylist === playlist.id}
                className={`block w-full text-left px-4 py-2 text-white hover:bg-gray-700 ${
                  loading && selectedPlaylist === playlist.id ? "opacity-50" : ""
                }`}
              >
                {loading && selectedPlaylist === playlist.id ? "Adding..." : playlist.name}
              </button>
            ))}
          </div>
      ) : (
        <p className="absolute right-0 mt-2 bg-gray-800 text-white shadow-lg rounded-md w-48 z-10 p-2">
          Aucune playlist trouvée
        </p>
      ))
    }
    </div>
  );
};
