// app/music-list/page.tsx

import React from "react";
import MusicCard from "../components/MusicCard/MusicCard";
import { Track } from "../interfaces/Track";
import PageLayout from "../components/PageLayout";

// Extend your Track interface to add fields not stored in DB (artist, duration)
export interface ExtendedTrack extends Track {
  artistname: string;
  artistid: number;
  parsedduration: string;
  trackpicture: string;
}

export default async function MusicListPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/tracks`, {
    method: "GET",
    credentials: "include",
    // next: { revalidate: 0 }, // Optional: Turn off caching/revalidation if you want fresh data every request.
  });

  if (!res.ok) {
    throw new Error("Failed to fetch tracks.");
  }

  const data = await res.json();

  // Build an array of ExtendedTrack objects from the API data
  function parseDuration(seconds: number | null | undefined): string {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes}:${remaining.toString().padStart(2, "0")}`;
  }

  const trackList: ExtendedTrack[] = data.map((track: Track) => {
    const mainArtist = track.trackartists?.find((a) => a.role === "ARTIST");
    return {
      ...track,
      artistname: mainArtist?.users?.username || "Unknown Artist",
      artistid: mainArtist?.users?.id || 0,
      parsedduration: parseDuration(track.duration),
      trackpicture: track.trackpicture || "https://placehold.co/400",
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
