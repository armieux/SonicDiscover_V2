import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const trackId = parseInt(id, 10);

    if (isNaN(trackId)) {
      return NextResponse.json({ error: "Invalid track ID" }, { status: 400 });
    }

    // Fetch the track
    const track = await prisma.tracks.findUnique({
      where: { id: trackId },
    });

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    // Update playcount
    const updatedTrack = await prisma.tracks.update({
      where: { id: trackId },
      data: {
        playcount: (track.playcount || 0) + 1, // Ensure it increments correctly
      },
    });

    return NextResponse.json(updatedTrack);
  } catch (err) {
    console.error("Error updating playcount", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
