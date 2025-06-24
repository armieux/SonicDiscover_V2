import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface UserPreferences {
  likedGenres: { [genre: string]: number };
  likedMoods: { [mood: string]: number };
  averageBpm: number;
  followedArtists: number[];
}

interface DiscoveryTrack {
  id: number;
  title: string | null;
  genre: string | null;
  mood: string | null;
  bpm: number | null;
  averagerating: number | null;
  likecount: number | null;
  uploaddate: Date | null;
  trackartists?: {
    artistid: number;
    users: {
      id: number;
      username: string | null;
      profilepicture: string | null;
    } | null;
  }[] | null;
  ratings?: {
    liked: boolean | null;
  }[] | null;
  discoveryScore: number;
}

export async function GET() {
  try {
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

    // Analyze user preferences based on their rating history
    const userPreferences = await analyzeUserPreferences(userId);
    
    // Generate discovery playlist based on preferences
    const discoveryTracks = await generateDiscoveryPlaylist(userId, userPreferences);

    return NextResponse.json({
      tracks: discoveryTracks,
      preferences: userPreferences,
      totalTracks: discoveryTracks.length
    });

  } catch (error) {
    console.error("Error generating discovery playlist:", error);
    return NextResponse.json(
      { error: "Failed to generate discovery playlist" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function analyzeUserPreferences(userId: number): Promise<UserPreferences> {
  // Get user's liked tracks
  const likedRatings = await prisma.ratings.findMany({
    where: {
      userid: userId,
      liked: true
    },
    include: {
      tracks: {
        include: {
          trackartists: true
        }
      }
    }
  });

  // Get user's listening statistics
  const listeningStats = await prisma.statistics.findMany({
    where: {
      userid: userId,
      listencount: {
        gt: 0
      }
    },
    include: {
      tracks: {
        include: {
          trackartists: true
        }
      }
    },
    orderBy: {
      listencount: 'desc'
    }
  });

  // Get followed artists
  const followedUsers = await prisma.follows.findMany({
    where: {
      followinguserid: userId
    },
    select: {
      followeduserid: true
    }
  });

  const followedArtists = followedUsers.map(f => f.followeduserid);

  // Analyze preferences
  const likedGenres: { [genre: string]: number } = {};
  const likedMoods: { [mood: string]: number } = {};
  let totalBpm = 0;
  let bpmCount = 0;

  // Analyze liked tracks
  likedRatings.forEach(rating => {
    const track = rating.tracks;
    if (track.genre) {
      likedGenres[track.genre] = (likedGenres[track.genre] || 0) + 2; // Higher weight for liked tracks
    }
    if (track.mood) {
      likedMoods[track.mood] = (likedMoods[track.mood] || 0) + 2;
    }
    if (track.bpm) {
      totalBpm += track.bpm * 2; // Higher weight for liked tracks
      bpmCount += 2;
    }
  });

  // Analyze listening history
  listeningStats.forEach(stat => {
    const track = stat.tracks;
    const weight = Math.min(stat.listencount || 1, 5); // Cap the weight to avoid skewing
    
    if (track.genre) {
      likedGenres[track.genre] = (likedGenres[track.genre] || 0) + weight;
    }
    if (track.mood) {
      likedMoods[track.mood] = (likedMoods[track.mood] || 0) + weight;
    }
    if (track.bpm) {
      totalBpm += track.bpm * weight;
      bpmCount += weight;
    }
  });

  const averageBpm = bpmCount > 0 ? Math.round(totalBpm / bpmCount) : 120;

  return {
    likedGenres,
    likedMoods,
    averageBpm,
    followedArtists
  };
}

async function generateDiscoveryPlaylist(userId: number, preferences: UserPreferences): Promise<DiscoveryTrack[]> {
  // Get tracks the user hasn't interacted with much
  const userRatedTracks = await prisma.ratings.findMany({
    where: { userid: userId },
    select: { trackid: true }
  });

  const userListenedTracks = await prisma.statistics.findMany({
    where: { 
      userid: userId,
      listencount: { gt: 3 } // Tracks listened to more than 3 times
    },
    select: { trackid: true }
  });

  const excludedTrackIds = [
    ...userRatedTracks.map(r => r.trackid),
    ...userListenedTracks.map(s => s.trackid)
  ];

  // Build scoring criteria based on preferences
  const topGenres = Object.entries(preferences.likedGenres)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([genre]) => genre);

  const topMoods = Object.entries(preferences.likedMoods)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([mood]) => mood);

  // Find potential discovery tracks
  const discoveryTracks = await prisma.tracks.findMany({
    where: {
      id: {
        notIn: excludedTrackIds
      },
      OR: [
        // Match preferred genres
        ...(topGenres.length > 0 ? [{
          genre: {
            in: topGenres
          }
        }] : []),
        // Match preferred moods
        ...(topMoods.length > 0 ? [{
          mood: {
            in: topMoods
          }
        }] : []),
        // Similar BPM range
        {
          bpm: {
            gte: preferences.averageBpm - 20,
            lte: preferences.averageBpm + 20
          }
        },
        // Tracks from followed artists
        ...(preferences.followedArtists.length > 0 ? [{
          trackartists: {
            some: {
              artistid: {
                in: preferences.followedArtists
              }
            }
          }
        }] : []),
        // High-rated tracks by other users
        {
          averagerating: {
            gte: 4.0
          }
        }
      ]
    },
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
      },
      ratings: {
        select: {
          liked: true
        }
      }
    },
    orderBy: [
      { averagerating: 'desc' },
      { likecount: 'desc' },
      { uploaddate: 'desc' }
    ],
    take: 25 // Limit to 25 tracks for the discovery playlist
  });

  // Score and sort tracks based on user preferences
  const scoredTracks = discoveryTracks.map(track => {
    let score = 0;

    // Genre matching
    if (track.genre && preferences.likedGenres[track.genre]) {
      score += preferences.likedGenres[track.genre] * 3;
    }

    // Mood matching
    if (track.mood && preferences.likedMoods[track.mood]) {
      score += preferences.likedMoods[track.mood] * 3;
    }

    // BPM similarity
    if (track.bpm) {
      const bpmDiff = Math.abs(track.bpm - preferences.averageBpm);
      score += Math.max(0, 20 - bpmDiff); // Closer BPM = higher score
    }

    // Followed artist bonus
    const hasFollowedArtist = track.trackartists?.some(ta => 
      preferences.followedArtists.includes(ta.artistid)
    );
    if (hasFollowedArtist) {
      score += 15;
    }

    // High rating bonus
    if (track.averagerating && track.averagerating >= 4.0) {
      score += track.averagerating * 2;
    }

    // Popularity bonus (but not too much to avoid mainstream bias)
    if (track.likecount && track.likecount > 0) {
      score += Math.min(track.likecount / 10, 5);
    }

    return { ...track, discoveryScore: score };
  });

  // Sort by discovery score and return top tracks
  return scoredTracks
    .sort((a, b) => b.discoveryScore - a.discoveryScore)
    .slice(0, 20);
}

export async function POST(request: Request) {
  try {
    const { name, trackIds } = await request.json();
    
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

    // Create a new playlist from discovery tracks
    const newPlaylist = await prisma.playlists.create({
      data: {
        name: name || `Découverte ${new Date().toLocaleDateString('fr-FR')}`,
        description: "Playlist générée automatiquement basée sur vos goûts musicaux",
        creatorid: userId,
      },
    });

    // Add tracks to the playlist
    if (trackIds && trackIds.length > 0) {
      const playlistTracks = trackIds.map((trackId: number, index: number) => ({
        playlistid: newPlaylist.id,
        trackid: trackId,
        order: index + 1
      }));

      await prisma.playlisttracks.createMany({
        data: playlistTracks
      });
    }

    return NextResponse.json({
      playlist: newPlaylist,
      message: "Playlist de découverte créée avec succès"
    });

  } catch (error) {
    console.error("Error creating discovery playlist:", error);
    return NextResponse.json(
      { error: "Failed to create discovery playlist" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
