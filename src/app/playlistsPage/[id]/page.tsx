import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import Layout from "@/app/components/Layout";
import { RemoveFromPlaylistButton } from "@/app/components/RemoveFromPlaylistButton/RemoveFromPlaylistButton";

const prisma = new PrismaClient();

interface PlaylistPageProps {
  params: { id: string };
}

export default async function PlaylistPage(context: PlaylistPageProps) {
  const awaitedParams = await context.params;
  // Get Playlist ID
  const playlistId = parseInt(awaitedParams.id, 10);
  if (isNaN(playlistId)) {
    return <div>Invalid Playlist ID</div>;
  }

  // Identify current logged-in user from cookies
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("token")?.value || "";

  let currentUserId: number | null = null;
  if (rawToken) {
    try {
      const secret = process.env.JWT_SECRET || "default_secret";
      const decoded = jwt.verify(rawToken, secret) as jwt.JwtPayload;
      currentUserId = decoded.userId;
    } catch (error) {
      console.error("Invalid token", error);
    }
  }

  // Fetch playlist details from database
  const playlist = await prisma.playlists.findUnique({
    where: { id: playlistId },
    include: {
      users: true, // Get creator info
      playlisttracks: {
        include: { tracks: true }, // Get tracks inside the playlist
      },
    },
  });

  if (!playlist) {
    return <div>Playlist not found</div>;
  }

  const isOwner = currentUserId === playlist.creatorid;

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
            {playlist.playlisttracks.length > 0 ? (
              <ul className="text-white">
                {playlist.playlisttracks.map(({ tracks }) => (
                  <li key={tracks.id} className="flex items-center justify-between p-2 bg-[#2c2b38] rounded-lg mb-2">
                    <div className="flex items-center space-x-3">
                      <img src={tracks.trackpicture || "https://placehold.co/50"} alt={tracks.title} className="w-12 h-12 rounded-md" />
                      <div>
                        <p className="text-lg">{tracks.title}</p>
                        <p className="text-gray-400 text-sm">{tracks.genre}</p>
                      </div>
                    </div>
                    
                    {/* Remove Button (Only for Owner) */}
                    {isOwner && (
                      <RemoveFromPlaylistButton playlistId={playlistId} trackId={tracks.id} />
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No tracks in this playlist yet.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
