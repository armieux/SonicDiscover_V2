"use client";

import { useState } from "react";

const CreatePlaylistForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/playlists/create", {
        method: "POST",
        body: JSON.stringify({ name, description }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreatePlaylist} className="mb-6">
      <input
        type="text"
        placeholder="Nom de la Playlist"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full p-2 mb-2 rounded bg-[#3a3a4a] text-white"
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 mb-2 rounded bg-[#3a3a4a] text-white"
      />
      <button type="submit" disabled={loading} className="bg-green-500 px-4 py-2 rounded text-white">
        {loading ? "Création..." : "Créer la Playlist"}
      </button>
    </form>
  );
};

export default CreatePlaylistForm;
