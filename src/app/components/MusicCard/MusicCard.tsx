"use client";

import React from 'react';
import HeatRating from "@/app/components/HeatRating/HeatRating";
import { FaPlay, FaPause } from 'react-icons/fa';

interface MusicCardProps {
    coverImage: string; // URL de l'image
    title: string;      // Titre de la musique
    artist: string;     // Nom de l'artiste
    album: string;      // Nom de l'album
    duration: string;   // Durée de la chanson
    listenUrl: string;  // URL pour écouter la chanson
    heat: number
}

const MusicCard: React.FC<MusicCardProps> = ({
     coverImage,
     title,
     artist,
     album,
     duration,
     listenUrl,
     heat
 }) => {
    return (
        <div className="flex items-center space-x-4 border-2 rounded-md p-4 shadow-md bg-white">
            {/* Image de la couverture */}
            <img src={coverImage} alt={title} className="w-20 md:w-30 lg:w-40 h-20 md:h-30 lg:h-40 rounded-md" />

            {/* Informations sur la musique */}
            <div className="flex-1">
                <HeatRating heat={heat} /> <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                <p className="text-sm text-gray-600">{artist}</p>
                <p className="text-sm text-gray-500">{album}</p>
                <p className="text-xs text-gray-400">{duration}</p>
            </div>

            {/* Bouton pour écouter */}
            <a
                href={listenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 text-white bg-blue-500 hover:bg-blue-600 rounded-full"
            >
                <FaPlay size={15} />
            </a>

        </div>
    );
};

export default MusicCard;
