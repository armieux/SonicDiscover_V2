import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json();

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

    const newPlaylist = await prisma.playlists.create({
      data: {
        name,
        description,
        creatorid: userId,
      },
    });

    return NextResponse.json(newPlaylist);
  } catch (error) {
    console.error("Error creating playlist:", error);
    return NextResponse.json({ error: "Failed to create playlist" }, { status: 500 });
  }
}
