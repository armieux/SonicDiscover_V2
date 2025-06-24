import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trackId = parseInt(id);
    
    if (isNaN(trackId)) {
      return NextResponse.json({ error: "Invalid track ID" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const rawToken = cookieStore.get("token")?.value || "";

    let userId: number | null = null;
    if (rawToken) {
      const secret = process.env.JWT_SECRET || "default_secret";
      const decoded = jwt.verify(rawToken, secret) as jwt.JwtPayload;
      userId = decoded.userId;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if track exists
    const track = await prisma.tracks.findUnique({
      where: { id: trackId }
    });

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    // Find existing statistic record or create new one
    const existingStats = await prisma.statistics.findFirst({
      where: {
        trackid: trackId,
        userid: userId
      }
    });

    if (existingStats) {
      // Update existing record
      await prisma.statistics.update({
        where: { id: existingStats.id },
        data: {
          listencount: (existingStats.listencount || 0) + 1,
          listeningdate: new Date()
        }
      });
    } else {
      // Create new record
      await prisma.statistics.create({
        data: {
          trackid: trackId,
          userid: userId,
          listencount: 1,
          listeningdate: new Date()
        }
      });
    }

    // Update track play count
    await prisma.tracks.update({
      where: { id: trackId },
      data: {
        playcount: (track.playcount || 0) + 1
      }
    });

    return NextResponse.json({ 
      message: "Listen recorded successfully",
      trackId,
      userId
    });

  } catch (error) {
    console.error("Error recording listen:", error);
    return NextResponse.json(
      { error: "Failed to record listen" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
