import React, { useEffect, useState } from 'react';
import { CgSpinnerTwo } from "react-icons/cg";
import {FaPlay} from "react-icons/fa";
import {useMusicContext} from "@/app/context/MusicContext";
import { Track } from "../../interfaces/Track";
import { WiTrain } from "react-icons/wi";


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

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-3xl font-extrabold text-center mb-8 text-white flex flex-row content-between w-100"
                style={{color:"gold", textShadow:"0px 0px 15px gold"}}>
                <WiTrain style={{fontSize:"2.5rem", transform:"scaleX(-1)", color:"gold"}} />
                Train de la Hype
                <WiTrain style={{fontSize:"2.5rem", color:"gold"}} />
            </h2>

            <div className="mb-8 relative">
                <div
                    className="flex overflow-x-auto space-x-6 pb-4 ">
                    {tracks.slice(0, 10).map((track, index) => {
                        let medalTextColor = '';
                        if (index === 0) {
                            medalTextColor = 'gold';
                        }
                        else if (index === 1) {
                            medalTextColor = 'silver';
                        }
                        else if (index === 2) {
                            medalTextColor = '#CD7F32\n';
                        }
                        else {
                            medalTextColor = 'transparent';
                        }

                        return (
                            <div
                                key={track.id}
                                className="w-40 bg-[#1f1f1f] rounded-lg shadow-2xl p-4 flex-shrink-0 relative"
                            >
                                <div className="relative">
                                    {index < 3 && (
                                        <span
                                            className={`absolute top-0 right-0 font-bold text-lg text-white rounded-full px-2 py-1`}
                                            style={{color:medalTextColor, textShadow:"1px 1px 5px " + medalTextColor}}

                                        >
                                          {index + 1}er
                                        </span>
                                    )}
                                    {track.trackpicture ? (
                                        <img
                                            src={track.trackpicture}
                                            alt={track.title}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-full h-32 flex items-center justify-center bg-[#1f1f1f]">
                                            <span className="text-gray-500 text-white">Pas d'image</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-white mt-2">{track.title}</h3>

                                <button
                                    onClick={() => setCurrentTrack(track, tracks, index)}
                                    className="p-3 text-white bg-blue-500 hover:bg-blue-600 rounded-full absolute bottom-4 right-4"
                                >
                                    <FaPlay size={10}/>
                                </button>
                            </div>
                        );
                    })}

                </div>
                <div
                    className="absolute top-0 right-0 w-12 h-full pointer-events-none bg-gradient-to-l from-[#121212] to-transparent"></div>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {tracks.slice(10).map((track) => (
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
                        <div className="p-4">
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
