"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export const RemoveFromPlaylistButton = ({ playlistId, trackId }: { playlistId: number; trackId: number }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRemoveTrack = async () => {
    setLoading(true);
    try {
      await fetch(`/api/playlists/${playlistId}/removeTrack`, {
        method: "POST",
        body: JSON.stringify({ trackId }),
        headers: { "Content-Type": "application/json" },
      });

      // Refresh the page after removal
      router.refresh();
    } catch (error) {
      console.error("Error removing track:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="text-red-500 hover:text-red-700"
      onClick={handleRemoveTrack}
      disabled={loading}
    >
      {loading ? "Removing..." : "❌ Remove"}
    </button>
  );
};
