// import { cookies } from "next/headers";
// import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import Layout from "@/app/components/Layout";
import MusicCard from "@/app/components/MusicCard/MusicCard";
import { ExtendedTrack } from "@/app/musicListPage/page";

const prisma = new PrismaClient();

interface PlaylistPageProps {
  params: { id: string };
}

export default async function PlaylistPage(context: PlaylistPageProps) {
  const awaitedParams = await context.params;
  const playlistId = parseInt(awaitedParams.id, 10);
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
                include: { 
                  users: true 
                },
              },
            },
          },
        },
      },
    },
  });

  console.log(playlist?.playlisttracks);

  if (!playlist) {
    return <div>Playlist not found</div>;
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

    return {
      ...tracks,
      artistname: mainArtist?.users?.username || "Unknown Artist",
      artistid: mainArtist?.users?.id || 0,
      parsedduration: parseDuration(tracks.duration),
      trackpicture: tracks.trackpicture || "https://placehold.co/400",
    };
  });

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#353445] p-4">
        <div className="w-full max-w-4xl bg-[#282733] p-8 rounded-lg shadow-lg">
          {/* Playlist Header */}
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={playlist.playlistpicture || "https://placehold.co/150"}
              alt={playlist.name}
              className="w-36 h-36 rounded-md shadow-md"
            />
            <div>
              <h2 className="text-4xl text-white">{playlist.name}</h2>
              <p className="text-gray-300">{playlist.description}</p>
              <p className="text-gray-400">Created by {playlist.users.username}</p>
            </div>
          </div>

          {/* Tracks List */}
          <div className="bg-[#3a3a4a] p-4 rounded-lg">
            <h3 className="text-2xl text-white mb-2">Tracks</h3>
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
              <p className="text-gray-400">No tracks in this playlist yet.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
