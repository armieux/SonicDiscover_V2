"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SlOptionsVertical } from "react-icons/sl";
import { FaMusic } from "react-icons/fa";
import { TrackArtist } from "@/app/interfaces/TrackArtist";
import dynamic from "next/dynamic";
import Image from 'next/image';


// Dynamically import the UpdateTrackForm (client-side only)
const UpdateTrackForm = dynamic(() => import('@/app/components/UpdateTrackForm/UpdateTrackForm'), { ssr: false });

interface TrackItemProps {
  item: TrackArtist;
  index: number;
  onDelete?: (deletedTrackId: number) => void;
  isOwnProfile: boolean;
}

export default function TrackItem({ item, onDelete, isOwnProfile }: TrackItemProps) {
  const tracks = item;
  const router = useRouter();
  const [showOptions, setShowOptions] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center text-white">
        <div className="flex items-center">
          {!imageError && tracks.tracks.trackpicture ? (
            <Image
              src={tracks.tracks.trackpicture}
              alt={tracks.tracks.title}
              width={32}
              height={32}
              className="w-8 h-8 inline-block m-1 object-cover rounded"
              onError={handleImageError}
              unoptimized
            />
          ) : (
            <div className="w-8 h-8 inline-block m-1 bg-gradient-to-br from-purple-600 to-purple-800 rounded flex items-center justify-center">
              <FaMusic className="text-white text-xs" />
            </div>
          )}
          <p>
            {tracks.tracks.title} - {tracks.tracks.genre}
          </p>
        </div>
        <div className="flex items-center">
          <p>{tracks.tracks.playcount} écoutes</p>
          {isOwnProfile && (<button onClick={() => setShowOptions(true)} className="p-1">
            <SlOptionsVertical />
          </button>)}
        </div>
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
                setShowUpdate(true);
              }}
              className="text-blue-400 block w-full text-left mb-2"
            >
              Modifier
            </button>
            <button
              onClick={() => {
                setShowOptions(false);
                setShowConfirm(true);
              }}
              className="text-red-500 block w-full text-left mb-2"
            >
              Supprimer
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-4 rounded shadow-md">
            <p className="text-white mb-4">
              Etes vous sûr de vouloir supprimer ce titre ?
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
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Update Track Form Modal */}
      {showUpdate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-4 rounded shadow-md">
            <UpdateTrackForm
              track={tracks.tracks}
              onClose={() => {
                setShowUpdate(false);
                router.refresh();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
