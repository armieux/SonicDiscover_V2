"use client";

import { useState } from 'react';
import './HeatRating.css';

interface HeatRatingProps {
    heat: number;
    trackId: string;
}

function HeatRating({ heat, trackId }: HeatRatingProps) {
    const [temperature, setTemperature] = useState(heat); // Température initiale

    const handleLike = async () => {
        try {
          const res = await fetch(`/api/tracks/${trackId}/ratings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ action: 'like' }),
          });
          if (!res.ok) throw new Error('Failed to like');
          // Optionally get the updated track from the response
          const updatedTrack = await res.json();
          setTemperature(updatedTrack.likecount - updatedTrack.dislikecount);
        } catch (error) {
          console.error(error);
        }
      };
    
      const handleDislike = async () => {
        try {
          const res = await fetch(`/api/tracks/${trackId}/ratings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ action: 'dislike' }),
          });
          if (!res.ok) throw new Error('Failed to dislike');
          const updatedTrack = await res.json();
          setTemperature(updatedTrack.likecount - updatedTrack.dislikecount);
        } catch (error) {
          console.error(error);
        }
      };

    // Définition de la couleur en fonction de la température
    let couleurTexte = 'text-black';

    if (temperature <= 0) {
        couleurTexte = 'text-blue-500';
    } else {
        couleurTexte = 'text-red-500';
    }

    return (
        <div className="heatRating flex items-center justify-center space-x-4 bg-[#121212] rounded-md">
            <button
                onClick={handleDislike}
                className="px-4 py-2 focus:outline-none rounded-full text-white"
            >
                -
            </button>
            <span className={`text-1xl font-bold ${couleurTexte}`}>
                {temperature}°
            </span>
            <button
                onClick={handleLike}
                className="px-4 py-2 focus:outline-none rounded-full text-white"
            >
                +
            </button>
        </div>
    );
}

export default HeatRating;
