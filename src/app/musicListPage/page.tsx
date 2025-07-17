// app/music-list/page.tsx

import React from "react";
import MusicCard from "../components/MusicCard/MusicCard";
import { Track } from "../interfaces/Track";
import PageLayout from "../components/PageLayout";
import { PrismaClient } from '@prisma/client';

// Extend your Track interface to add fields not stored in DB (artist, duration)
export interface ExtendedTrack extends Omit<Track, 'genre'> {
  genre: string | null;
  artistname: string;
  artistid: number;
  parsedduration: string;
  trackpicture: string;
}

export default async function MusicListPage() {
  const prisma = new PrismaClient();
  let tracks;
  try {
    tracks = await prisma.tracks.findMany({
      orderBy: { id: 'desc' },
      include: {
        trackartists: {
          include: { users: true }
        }
      }
    });
  } finally {
    await prisma.$disconnect();
  }

  // Build an array of ExtendedTrack objects from the DB data
  function parseDuration(seconds: number | null | undefined): string {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes}:${remaining.toString().padStart(2, "0")}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trackList: ExtendedTrack[] = tracks.map((track: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mainArtist = track.trackartists?.find((a: any) => a.role === "ARTIST");
    return {
      ...track,
      genre: track.genre ?? '',
      bpm: track.bpm ?? 0,
      mood: track.mood ?? '',
      trackpicture: track.trackpicture || "https://placehold.co/400",
      artistname: mainArtist?.users?.username || "Unknown Artist",
      artistid: mainArtist?.users?.id || 0,
      parsedduration: parseDuration(track.duration),
    };
  });

  return (
    <PageLayout>
      <div className="min-h-screen flex flex-col items-center py-16 bg-[#121212]">
        <h1 className="text-3xl font-bold text-white mb-6">Liste de Musiques</h1>
        <div className="space-y-4 w-full max-w-4xl">
          {trackList.map((track, index) => (
            <MusicCard
              key={index}
              track={track}
              index={index}
              playlist={trackList}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
