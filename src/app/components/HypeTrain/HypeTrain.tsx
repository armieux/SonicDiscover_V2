import React, { useEffect, useState } from 'react';
import { CgSpinnerTwo } from "react-icons/cg";
import { FaPlay, FaFire } from "react-icons/fa";
import { useMusicContext } from "@/app/context/MusicContext";
import { Track } from "../../interfaces/Track";
import { TbBus } from "react-icons/tb";
import Image from 'next/image';

const HypeTrain: React.FC = () => {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const { setCurrentTrack } = useMusicContext();

    useEffect(() => {
        async function fetchTracks() {
            try {
                const response = await fetch('/api/tracks/hype-train');
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des morceaux");
                }
                const data = await response.json();
                setTracks(data.tracks || []);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Erreur inconnue');
            } finally {
                setLoading(false);
            }
        }
        fetchTracks();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="flex items-center space-x-3">
                    <CgSpinnerTwo className="animate-spin text-[#F2A365] text-4xl" />
                    <p className="text-xl font-semibold text-[#F1F1F1]">
                        Chargement des tendances...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <p className="text-xl font-semibold text-red-400 mb-2">Erreur : {error}</p>
                    <p className="text-[#B8B8B8]">Impossible de charger les tendances</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header du Hype Train */}
            <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-4">
                    <TbBus 
                        className="text-4xl text-[#F2A365] transform scale-x-[-1] filter drop-shadow-lg" 
                        style={{ filter: "drop-shadow(0 0 15px #F2A365)" }}
                    />
                    <div className="text-center">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-[#F2A365] to-[#D9BF77] bg-clip-text text-transparent mb-1">
                            Bus de la Hype
                        </h2>
                        <div className="flex items-center justify-center space-x-2">
                            <FaFire className="text-[#F2A365]" />
                            <span className="text-[#B8B8B8] text-sm">Les morceaux les plus populaires</span>
                            <FaFire className="text-[#F2A365]" />
                        </div>
                    </div>
                    <TbBus 
                        className="text-4xl text-[#F2A365] filter drop-shadow-lg" 
                        style={{ filter: "drop-shadow(0 0 15px #F2A365)" }}
                    />
                </div>
            </div>

            {/* Top 3 avec medals */}
            <div className="mb-12">
                <div className="flex overflow-x-auto space-x-6 py-4 custom-scroll">
                    {tracks.slice(0, 10).map((track, index) => {
                        const getMedalInfo = (position: number) => {
                            switch (position) {
                                case 0:
                                    return { emoji: '🥇', color: '#FFD700', glow: 'drop-shadow(0 0 3px #FFD700)' };
                                case 1:
                                    return { emoji: '🥈', color: '#C0C0C0', glow: 'drop-shadow(0 0 3px #C0C0C0)' };
                                case 2:
                                    return { emoji: '🥉', color: '#CD7F32', glow: 'drop-shadow(0 0 3px #CD7F32)' };
                                default:
                                    return { emoji: `#${position + 1}`, color: '#F2A365', glow: 'none' };
                            }
                        };

                        const medalInfo = getMedalInfo(index);

                        return (
                            <div
                                key={track.id}
                                className={`group relative flex-shrink-0 w-48 music-card interactive-hover ${
                                    index < 3 ? 'border-2' : ''
                                }`}
                                style={{
                                    borderColor: index < 3 ? medalInfo.color : 'transparent'
                                }}
                            >
                                {/* Badge de position */}
                                <div 
                                    className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                    style={{
                                        background: index < 3 ? `linear-gradient(135deg, ${medalInfo.color}, ${medalInfo.color}dd)` : 'linear-gradient(135deg, #F2A365, #D9BF77)',
                                        color: '#1C1C2E',
                                        filter: medalInfo.glow
                                    }}
                                >
                                    {index < 3 ? medalInfo.emoji : `#${index + 1}`}
                                </div>

                                {/* Image du track */}
                                <div className="relative overflow-hidden rounded-xl mb-4">
                                    {track.trackpicture ? (
                                        <Image
                                            src={track.trackpicture}
                                            alt={track.title}
                                            width={192}
                                            height={192}
                                            className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-40 flex items-center justify-center bg-[#3E5C76] bg-opacity-30">
                                            <span className="text-[#B8B8B8] text-sm">Pas d&apos;image</span>
                                        </div>
                                    )}
                                    
                                    {/* Overlay avec bouton play */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                                        <button
                                            onClick={() => setCurrentTrack(track, tracks, index)}
                                            className="w-12 h-12 bg-gradient-to-br from-[#F2A365] to-[#D9BF77] rounded-full flex items-center justify-center text-[#1C1C2E] opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 shadow-lg"
                                        >
                                            <FaPlay size={16} className="ml-0.5"/>
                                        </button>
                                    </div>
                                </div>

                                {/* Informations du track */}
                                <div>
                                    <h3 className="text-[#F1F1F1] font-semibold text-lg mb-1 line-clamp-2">
                                        {track.title}
                                    </h3>
                                    <p className="text-[#B8B8B8] text-sm">
                                        {track.genre || "Genre inconnu"}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Grille des autres tracks */}
            {tracks.length > 10 && (
                <div>
                    <h3 className="text-2xl font-bold text-[#F1F1F1] mb-6">Autres tendances</h3>
                    <div className="grid-modern">
                        {tracks.slice(10).map((track, index) => (
                            <div
                                key={track.id}
                                className="group music-card interactive-hover cursor-pointer"
                                onClick={() => setCurrentTrack(track, tracks, index + 10)}
                            >
                                <div className="relative overflow-hidden rounded-xl mb-4">
                                    {track.trackpicture ? (
                                        <Image
                                            src={track.trackpicture}
                                            alt={track.title}
                                            width={300}
                                            height={200}
                                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-48 flex items-center justify-center bg-[#3E5C76] bg-opacity-30">
                                            <span className="text-[#B8B8B8]">Pas d&apos;image</span>
                                        </div>
                                    )}
                                    
                                    {/* Overlay avec informations */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-white text-sm font-medium">
                                                    #{index + 11} Tendance
                                                </span>
                                                <FaPlay className="text-[#F2A365] text-lg" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[#F1F1F1] font-semibold text-xl mb-2">
                                        {track.title}
                                    </h3>
                                    {track.genre && (
                                        <p className="text-[#B8B8B8] text-sm">
                                            Genre : <span className="text-[#F2A365]">{track.genre}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tracks.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎵</div>
                    <h3 className="text-2xl font-semibold text-[#F1F1F1] mb-2">Aucune tendance pour le moment</h3>
                    <p className="text-[#B8B8B8]">Soyez le premier à faire le buzz !</p>
                </div>
            )}
        </div>
    );
};

export default HypeTrain;
