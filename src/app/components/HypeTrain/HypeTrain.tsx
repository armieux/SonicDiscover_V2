// components/HypeTrain.tsx
import React, { useEffect, useState } from 'react';
import { CgSpinnerTwo } from "react-icons/cg";



interface Track {
    id: number;
    title: string;
    trackpicture: string | null;
    genre: string | null;
    bpm: number | null;
    mood: string | null;
    uploaddate: string;
    audio_file: string;
    playcount: number;
    likecount: number;
    dislikecount: number;
    averagerating: number;
}

const HypeTrain: React.FC = () => {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTracks() {
            try {
                const response = await fetch('/api/tracks/hype-train');
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des morceaux");
                }
                const data = await response.json();
                // On extrait le tableau contenu dans data.tracks
                setTracks(data.tracks || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchTracks();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-xl font-semibold text-white">
                    <CgSpinnerTwo className="animate-spin mr-2 size-10" />
                </p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-xl font-semibold text-red-600">Erreur : {error}</p>
            </div>
        );
    }

    console.log(tracks[0].trackpicture);

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-3xl font-extrabold text-center mb-8 text-white">Train de la Hype</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {tracks.map((track) => (
                    <li
                        key={track.id}
                        className="bg-[#1f1f1f] rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                    >
                        {track.trackpicture ? (
                            <img
                                src={track.trackpicture}
                                alt={track.title}
                                className="w-full h-48 object-cover"
                            />
                        ) : (
                            <div className="w-full h-48 flex items-center justify-center bg-[#1f1f1f]">
                                <span className="text-gray-500 text-white">Pas d'image</span>
                            </div>
                        )}
                        <div className="p-4 ">
                            <h3 className="text-xl font-bold text-white mb-2">{track.title}</h3>
                            {track.genre && (
                                <p className="text-white text-sm mb-1">
                                    Genre : <span className="font-medium">{track.genre}</span>
                                </p>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default HypeTrain;
