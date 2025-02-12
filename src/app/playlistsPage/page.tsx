import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import Layout from "@/app/components/Layout";
import CreatePlaylistForm from "../components/CreatePlaylistForm/CreatePlaylistForm";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function PlaylistsPage() {
  // Get the logged-in user from cookies
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

  if (!currentUserId) {
    return <div>Please log in to view your playlists.</div>;
  }

  // Fetch user playlists
  const playlists = await prisma.playlists.findMany({
    where: { creatorid: currentUserId },
    include: {
      playlisttracks: {
        include: { tracks: true },
      },
    },
  });

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#353445] p-4">
        <div className="w-full max-w-2xl bg-[#282733] p-8 rounded-lg shadow-lg">
          <h2 className="text-4xl text-white mb-6">Your Playlists</h2>

          {/* Create New Playlist Form */}
          <CreatePlaylistForm />

          {/* Display Playlists */}
          {playlists.length > 0 ? (
            <ul className="text-white">
              {playlists.map((playlist) => (
                <li key={playlist.id} className="mb-4 p-4 bg-[#3a3a4a] rounded-lg">
                  <Link href={`/playlistsPage/${playlist.id}`} className="flex items-center space-x-3">
                    <img src={playlist.playlistpicture || "https://placehold.co/50"} alt={playlist.name} className="w-12 h-12 rounded-md" />
                    <div>
                      <h3 className="text-2xl">{playlist.name}</h3>
                      <p className="text-sm text-gray-300">{playlist.description}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-300">You have no playlists yet.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
