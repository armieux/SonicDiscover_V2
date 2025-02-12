import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const { trackId } = await request.json();
  
    await prisma.playlisttracks.create({
      data: {
        playlistid: parseInt(params.id, 10),
        trackid: trackId,
        order: 0,
      },
    });
  
    return NextResponse.json({ success: true });
  }
  