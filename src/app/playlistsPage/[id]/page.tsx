// import { cookies } from "next/headers";
// import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import PageLayout from "@/app/components/PageLayout";
import MusicCard from "@/app/components/MusicCard/MusicCard";
import { ExtendedTrack } from "@/app/musicListPage/page";
import Image from 'next/image';

const prisma = new PrismaClient();

interface PlaylistPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const { id } = await params;
  const playlistId = parseInt(id, 10);
  if (isNaN(playlistId)) {
    return <div>Invalid Playlist ID</div>;
  }

  // Identify current logged-in user from cookies
  // const cookieStore = await cookies();
  // const rawToken = cookieStore.get("token")?.value || "";

  // let currentUserId: number | null = null;
  // if (rawToken) {
  //   try {
  //     const secret = process.env.JWT_SECRET || "default_secret";
  //     const decoded = jwt.verify(rawToken, secret) as jwt.JwtPayload;
  //     currentUserId = decoded.userId;
  //   } catch (error) {
  //     console.error("Invalid token", error);
  //   }
  // }

  // Fetch playlist details from database
  const playlist = await prisma.playlists.findUnique({
    where: { id: playlistId },
    include: {
      users: true, // Get creator info
      playlisttracks: {
        include: {
          tracks: {
            include: {
              trackartists: {
                select: { artistid: true, trackid: true, role: true, users: true, tracks: true }
              },
            },
          },
        },
      },
    },
  });

  console.log(playlist?.playlisttracks);

  if (!playlist) {
    return <div>Playlist non trouvée</div>;
  }

  // const isOwner = currentUserId === playlist.creatorid;

  // Function to parse track duration into "minutes:seconds"
  function parseDuration(seconds: number | null | undefined): string {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes}:${remaining.toString().padStart(2, "0")}`;
  }

  // Convert tracks to ExtendedTrack format
  const trackList: ExtendedTrack[] = playlist.playlisttracks.map(({ tracks }) => {
    const mainArtist = tracks.trackartists?.find((a) => a.role === "ARTIST");

    // Fix nested trackartists.tracks fields to ensure all are non-nullable
    const fixedTrackArtists = tracks.trackartists?.map((ta) => ({
      ...ta,
      tracks: {
        ...ta.tracks,
        trackpicture: ta.tracks.trackpicture || "https://placehold.co/400",
        genre: ta.tracks.genre || "Unknown Genre",
        bpm: ta.tracks.bpm != null ? ta.tracks.bpm : 0,
        mood: ta.tracks.mood || "",
        uploaddate: ta.tracks.uploaddate || new Date(0),
        audiofile: ta.tracks.audiofile || "",
        playcount: ta.tracks.playcount != null ? ta.tracks.playcount : 0,
        likecount: ta.tracks.likecount != null ? ta.tracks.likecount : 0,
        dislikecount: ta.tracks.dislikecount != null ? ta.tracks.dislikecount : 0,
        averagerating: ta.tracks.averagerating != null ? ta.tracks.averagerating : 0,
        duration: ta.tracks.duration != null ? ta.tracks.duration : 0,
        title: ta.tracks.title || "",
        id: ta.tracks.id != null ? ta.tracks.id : 0,
      },
    }));

    return {
      ...tracks,
      genre: tracks.genre || "Unknown Genre",
      artistname: mainArtist?.users?.username || "Unknown Artist",
      artistid: mainArtist?.users?.id || 0,
      parsedduration: parseDuration(tracks.duration),
      trackpicture: tracks.trackpicture || "https://placehold.co/400",
      trackartists: fixedTrackArtists, // Use the fixed array
      bpm: tracks.bpm != null ? tracks.bpm : 0,
      mood: tracks.mood || "",
      uploaddate: tracks.uploaddate || new Date(0),
      audiofile: tracks.audiofile || "",
      playcount: tracks.playcount != null ? tracks.playcount : 0,
      likecount: tracks.likecount != null ? tracks.likecount : 0,
      dislikecount: tracks.dislikecount != null ? tracks.dislikecount : 0,
      averagerating: tracks.averagerating != null ? tracks.averagerating : 0,
      duration: tracks.duration != null ? tracks.duration : 0,
      title: tracks.title || "",
      id: tracks.id != null ? tracks.id : 0,
    };
  });

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#353445] p-4">
        <div className="w-full max-w-4xl bg-[#282733] p-8 rounded-lg shadow-lg">
          {/* Playlist Header */}
          <div className="flex items-center space-x-4 mb-6">
            <Image
              src={playlist.playlistpicture || "/default-artist.svg"}
              alt={playlist.name}
              width={144}
              height={144}
              className="w-36 h-36 rounded-md shadow-md object-cover"
              unoptimized
            />
            <div>
              <h2 className="text-4xl text-white">{playlist.name}</h2>
              <p className="text-gray-300">{playlist.description}</p>
              <p className="text-gray-400">Créé par {playlist.users.username}</p>
            </div>
          </div>

          {/* Tracks List */}
          <div className="bg-[#3a3a4a] p-4 rounded-lg">
            <h3 className="text-2xl text-white mb-2">Titres</h3>
            {trackList.length > 0 ? (
              <div className="space-y-4">
                {trackList.map((track, index) => (
                  <MusicCard
                    key={track.id}
                    track={track}
                    index={index}
                    playlist={trackList}
                    inPlaylist={true} // Enable remove button
                    playlistId={playlistId}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Aucun titre dans la playlist</p>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
