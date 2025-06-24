import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface SmartPlaylistRequest {
  name: string;
  criteria: {
    genres?: string[];
    moods?: string[];
    bpmRange?: { min: number; max: number };
    minRating?: number;
    excludeHeard?: boolean;
    includeFollowedArtists?: boolean;
    maxTracks?: number;
  };
}

export async function POST(request: Request) {
  try {
    const { name, criteria }: SmartPlaylistRequest = await request.json();
    
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

    // Build WHERE clause based on criteria
    const whereConditions: Record<string, unknown> = {};
    const orConditions: Record<string, unknown>[] = [];

    // Genre filtering
    if (criteria.genres && criteria.genres.length > 0) {
      orConditions.push({
        genre: {
          in: criteria.genres
        }
      });
    }

    // Mood filtering
    if (criteria.moods && criteria.moods.length > 0) {
      orConditions.push({
        mood: {
          in: criteria.moods
        }
      });
    }

    // BPM range filtering
    if (criteria.bpmRange) {
      whereConditions.bpm = {
        gte: criteria.bpmRange.min,
        lte: criteria.bpmRange.max
      };
    }

    // Rating filtering
    if (criteria.minRating) {
      whereConditions.averagerating = {
        gte: criteria.minRating
      };
    }

    // Exclude already heard tracks
    if (criteria.excludeHeard) {
      const heardTracks = await prisma.statistics.findMany({
        where: { 
          userid: userId,
          listencount: { gt: 2 } // Tracks listened to more than 2 times
        },
        select: { trackid: true }
      });

      if (heardTracks.length > 0) {
        whereConditions.id = {
          notIn: heardTracks.map(s => s.trackid)
        };
      }
    }

    // Include followed artists
    if (criteria.includeFollowedArtists) {
      const followedUsers = await prisma.follows.findMany({
        where: { followinguserid: userId },
        select: { followeduserid: true }
      });

      if (followedUsers.length > 0) {
        orConditions.push({
          trackartists: {
            some: {
              artistid: {
                in: followedUsers.map(f => f.followeduserid)
              }
            }
          }
        });
      }
    }

    // Combine conditions
    if (orConditions.length > 0) {
      whereConditions.OR = orConditions;
    }

    // Find matching tracks
    const matchingTracks = await prisma.tracks.findMany({
      where: whereConditions,
      include: {
        trackartists: {
          include: {
            users: {
              select: {
                id: true,
                username: true,
                profilepicture: true
              }
            }
          }
        }
      },
      orderBy: [
        { averagerating: 'desc' },
        { likecount: 'desc' },
        { uploaddate: 'desc' }
      ],
      take: criteria.maxTracks || 50
    });

    // Create the smart playlist
    const smartPlaylist = await prisma.playlists.create({
      data: {
        name,
        description: `Playlist intelligente générée avec des critères personnalisés`,
        creatorid: userId,
      },
    });

    // Add tracks to the playlist
    if (matchingTracks.length > 0) {
      const playlistTracks = matchingTracks.map((track, index) => ({
        playlistid: smartPlaylist.id,
        trackid: track.id,
        order: index + 1
      }));

      await prisma.playlisttracks.createMany({
        data: playlistTracks
      });
    }

    return NextResponse.json({
      playlist: smartPlaylist,
      tracks: matchingTracks,
      criteria,
      message: `Playlist intelligente créée avec ${matchingTracks.length} pistes`
    });

  } catch (error) {
    console.error("Error creating smart playlist:", error);
    return NextResponse.json(
      { error: "Failed to create smart playlist" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const playlistId = url.searchParams.get('id');
    
    if (!playlistId) {
      return NextResponse.json({ error: "Playlist ID required" }, { status: 400 });
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

    // Get playlist with tracks
    const playlist = await prisma.playlists.findUnique({
      where: { id: parseInt(playlistId) },
      include: {
        playlisttracks: {
          include: {
            tracks: {
              include: {
                trackartists: {
                  include: {
                    users: {
                      select: {
                        id: true,
                        username: true,
                        profilepicture: true
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    return NextResponse.json(playlist);

  } catch (error) {
    console.error("Error fetching smart playlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch smart playlist" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
