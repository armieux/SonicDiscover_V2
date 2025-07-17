import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import {cookies} from "next/headers";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET() {
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
    // Récupérer les dernières écoutes de l'utilisateur (limité aux 3 dernières)
    // Grouper par track pour éviter les doublons et prendre la dernière écoute de chaque track
    const recentListenings = await prisma.statistics.findMany({
      where: {
        userid: userId,
      },
      orderBy: {
        listeningdate: 'desc',
      },
      take: 20, // Prendre plus pour pouvoir filtrer les doublons
      include: {
        tracks: true,
      },
    });

    // Filtrer pour ne garder que les 3 dernières écoutes uniques (pas de doublons de tracks)
    const uniqueListenings = [];
    const seenTrackIds = new Set();
    
    for (const listening of recentListenings) {
      if (!seenTrackIds.has(listening.trackid) && uniqueListenings.length < 3) {
        uniqueListenings.push(listening);
        seenTrackIds.add(listening.trackid);
      }
    }

    // Si aucune écoute récente n'a été trouvée
    if (uniqueListenings.length === 0) {
      return NextResponse.json({
        message: 'Aucune écoute récente trouvée',
        playlists: []
      });
    }

    // Analyser les humeurs des morceaux écoutés récemment
    const moodCounts: Record<string, number> = {};

    uniqueListenings.forEach((listening) => {
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
    const recentTrackIds = uniqueListenings.map(listening => listening.trackid);

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
      })),
      // Informations de debug
      debug: {
        recentListenings: uniqueListenings.map(listening => ({
          trackName: listening.tracks.title,
          mood: listening.tracks.mood,
          listeningDate: listening.listeningdate
        })),
        moodCounts,
        totalUniqueListenings: uniqueListenings.length
      }
    });

  } catch (error) {
    console.error('Erreur lors de la génération de la playlist dynamique:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération de la playlist' },
      { status: 500 }
    );
  }
}
