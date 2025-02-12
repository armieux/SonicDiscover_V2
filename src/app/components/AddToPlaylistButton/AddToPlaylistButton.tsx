"use client";

import { Playlist } from "@/app/interfaces/Playlist";
import { useState } from "react";

export const AddToPlaylistButton = ({ trackId }: { trackId: number }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's playlists
  const fetchPlaylists = async () => {
    const response = await fetch("/api/playlists");
    const data = await response.json();
    setPlaylists(data);
  };

  const handleAddToPlaylist = async (playlistId: number) => {
    setLoading(true);
    try {
      await fetch(`/api/playlists/${playlistId}/addTrack`, {
        method: "POST",
        body: JSON.stringify({ trackId }),
        headers: { "Content-Type": "application/json" },
      });
      alert("Track added!");
    } catch (error) {
      console.error("Error adding to playlist:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={fetchPlaylists} 
        disabled={loading}
        className="bg-blue-500 px-4 py-2 rounded text-white">
        Add to Playlist
      </button>
      {playlists.length > 0 && (
        <div>
          {playlists.map((playlist) => (
            <button key={playlist.id} onClick={() => handleAddToPlaylist(playlist.id)} className="block text-white">
              {loading ? "Adding..." : playlist.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
