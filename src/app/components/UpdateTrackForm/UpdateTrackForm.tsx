"use client";

import { Track } from "@/app/interfaces/Track";
import { useState } from "react";

interface UpdateTrackFormProps {
  track: Track;
  onClose: () => void;
}

export default function UpdateTrackForm({
  track,
  onClose,
}: UpdateTrackFormProps) {
  const [title, setTitle] = useState(track.title);
  const [trackPicture, setTrackPicture] = useState(track.trackpicture);
  const [genre, setGenre] = useState(track.genre);
  const [bpm, setBpm] = useState(track.bpm);
  const [mood, setMood] = useState(track.mood);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tracks/${track.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, genre }),
      });
      if (!response.ok) {
        throw new Error("Failed to update track");
      }
      console.log("Track updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating track:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-white text-xl mb-4">Update Track</h2>
      <label className="text-white block mb-2">
        Title:
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded bg-[#3a3a4a] text-white focus:outline-none focus:ring-2 focus:ring-[#00B76C]"
        />
      </label>
      <label className="text-white block mb-2">
        Genre:
        <input
          type="text"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full p-2 rounded bg-[#3a3a4a] text-white focus:outline-none focus:ring-2 focus:ring-[#00B76C]"
        />
      </label>
      <div className="mb-4">
        <label className="block text-white mb-2" htmlFor="bpm">
          BPM:
        </label>
        <input
          type="number"
          id="bpm"
          value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value, 10))}
          required
          min={40}
          max={250}
          className="w-full p-2 rounded bg-[#3a3a4a] text-white focus:outline-none focus:ring-2 focus:ring-[#00B76C]"
        />
      </div>
      <div className="mb-4">
        <label className="block text-white mb-2" htmlFor="mood">
          Mood:
        </label>
        <input
          type="text"
          id="mood"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          required
          className="w-full p-2 rounded bg-[#3a3a4a] text-white focus:outline-none focus:ring-2 focus:ring-[#00B76C]"
        />
      </div>
      <div className="mb-4">
        <label className="block text-white mb-2" htmlFor="trackPicture">
          Track Picture URL:
        </label>
        <input
          type="url"
          id="trackPicture"
          value={trackPicture}
          onChange={(e) => setTrackPicture(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full p-2 rounded bg-[#3a3a4a] text-white focus:outline-none focus:ring-2 focus:ring-[#00B76C]"
        />
      </div>
      <div className="flex justify-end mt-4">
        <button type="button" onClick={onClose} className="mr-4 text-white">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded-lg text-white font-semibold ${
            isSubmitting
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-[#00B76C] hover:bg-[#00a35d]"
          }`}
        >
          {isSubmitting ? "Updating..." : "Update"}
        </button>
      </div>
    </form>
  );
}
