"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SlOptionsVertical } from "react-icons/sl";
import { TrackArtist } from "@/app/interfaces/TrackArtist";

interface TrackItemProps {
  item: TrackArtist;
  index: number;
  onDelete?: (deletedTrackId: number) => void;
}

export default function TrackItem({ item, onDelete }: TrackItemProps) {
  const tracks = item;
  const router = useRouter();
  const [showOptions, setShowOptions] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/tracks/${tracks.tracks.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete track");
      }
      console.log("Track deleted successfully");
      if (onDelete) onDelete(tracks.tracks.id);
      router.refresh();
    } catch (error) {
      console.error("Error deleting track:", error);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center text-white">
        <div className="flex items-center">
          <img
            src={tracks.tracks.trackpicture || "https://placehold.co/50"}
            alt={tracks.tracks.title}
            className="w-8 h-8 inline-block m-1"
          />
          <p>
            {tracks.tracks.title} - {tracks.tracks.genre}
          </p>
        </div>
        <p>{tracks.tracks.playcount} écoutes</p>
        <button onClick={() => setShowOptions(true)} className="p-1">
          <SlOptionsVertical />
        </button>
      </div>

      {/* Options Modal */}
      {showOptions && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setShowOptions(false)}
        >
          <div
            className="bg-gray-800 p-4 rounded shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowOptions(false);
                setShowConfirm(true);
              }}
              className="text-red-500 block w-full text-left mb-2"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-4 rounded shadow-md">
            <p className="text-white mb-4">
              Are you sure you want to delete this track?
            </p>
            <button
              onClick={handleDelete}
              className="text-red-500 block w-full text-left mb-2"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Confirm"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="text-white block w-full text-left"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}