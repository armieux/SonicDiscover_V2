import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import { getAuthSession } from '@/lib/auth';
import {cookies} from "next/headers";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
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

  try {
    // Récupérer les dernières écoutes de l'utilisateur (limité aux 10 dernières)
    const recentListenings = await prisma.statistics.findMany({
      where: {
        userid: userId,
      },
      orderBy: {
        listeningdate: 'desc',
      },
      take: 10,
      include: {
        tracks: true,
      },
    });

    // Si aucune écoute récente n'a été trouvée
    if (recentListenings.length === 0) {
      return NextResponse.json({
        message: 'Aucune écoute récente trouvée',
        playlists: []
      });
    }

    // Analyser les humeurs des morceaux écoutés récemment
    const moodCounts: Record<string, number> = {};

    recentListenings.forEach((listening) => {
      const mood = listening.tracks.mood;
      if (mood) {
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      }
    });

    // Trouver l'humeur dominante (si disponible)
    let dominantMood: string | null = null;
    let maxCount = 0;

    for (const [mood, count] of Object.entries(moodCounts)) {
      if (count > maxCount) {
        dominantMood = mood;
        maxCount = count;
      }
    }

    // Si aucune humeur dominante n'a été trouvée
    if (!dominantMood) {
      return NextResponse.json({
        message: 'Impossible de déterminer une humeur dominante',
        playlists: []
      });
    }

    // Trouver des morceaux correspondant à l'humeur dominante (excluant ceux déjà écoutés récemment)
    const recentTrackIds = recentListenings.map(listening => listening.trackid);

    const moodTracks = await prisma.tracks.findMany({
      where: {
        mood: dominantMood,
        id: {
          notIn: recentTrackIds
        }
      },
      take: 15,
      include: {
        trackartists: {
          include: {
            users: true
          }
        }
      }
    });

    // Créer la playlist dynamique
    return NextResponse.json({
      dominantMood,
      playlistName: `Playlist ${dominantMood}`,
      tracks: moodTracks.map(track => ({
        ...track,
        artists: track.trackartists.map(artist => ({
          id: artist.users.id,
          name: artist.users.username,
          role: artist.role
        }))
      }))
    });

  } catch (error) {
    console.error('Erreur lors de la génération de la playlist dynamique:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération de la playlist' },
      { status: 500 }
    );
  }
}
