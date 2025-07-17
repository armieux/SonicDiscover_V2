import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import authService from "@/app/services/authService"; // Ensure authentication

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const playlistId = parseInt(id, 10);
    const { trackId } = await request.json();

    if (isNaN(playlistId) || isNaN(trackId)) {
      return NextResponse.json({ error: "Invalid playlist or track ID" }, { status: 400 });
    }

    // Authenticate the user
    const user = await authService.getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the playlist exists and if the user is the owner
    const playlist = await prisma.playlists.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    if (playlist.creatorid !== user.id) {
      return NextResponse.json({ error: "You are not authorized to modify this playlist" }, { status: 403 });
    }

    // Remove track from playlist
    await prisma.playlisttracks.deleteMany({
      where: {
        playlistid: playlistId,
        trackid: trackId,
      },
    });

    return NextResponse.json({ message: "Track removed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error removing track from playlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
