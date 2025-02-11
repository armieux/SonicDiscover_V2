// app/music-list/page.tsx

import React from "react";
import MusicCard from "../components/MusicCard/MusicCard";
import { Track } from "../interfaces/Track";
import Layout from "../components/Layout";

// Extend your Track interface to add fields not stored in DB (artist, duration)
interface ExtendedTrack extends Track {
  artist: string;
  duration: string;
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
  const trackList: ExtendedTrack[] = data.map((track: Track) => ({
    ...track,
    // Provide defaults for missing fields
    artist: "Unknown Artist",
    duration: "0:00",
    trackpicture: track.trackpicture || "https://placehold.co/400",
  }));

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Liste de Musiques</h1>
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
    </Layout>
  );
}
