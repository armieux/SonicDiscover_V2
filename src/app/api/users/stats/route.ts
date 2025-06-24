import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface TopGenre {
  genre: string;
  count: bigint;
  total_listens: bigint;
}

interface FavoriteArtist {
  id: bigint;
  username: string;
  profilepicture: string | null;
  total_listens: bigint;
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

    // Get user's music statistics
    const [
      totalListens,
      uniqueTracksListened,
      likedTracks,
      createdPlaylists,
      followingCount,
      followersCount,
      topGenres,
      recentActivity
    ] = await Promise.all([
      // Total listens
      prisma.statistics.aggregate({
        where: { userid: userId },
        _sum: { listencount: true }
      }),

      // Unique tracks listened to
      prisma.statistics.count({
        where: { 
          userid: userId,
          listencount: { gt: 0 }
        }
      }),

      // Liked tracks count
      prisma.ratings.count({
        where: { 
          userid: userId,
          liked: true 
        }
      }),

      // Created playlists count
      prisma.playlists.count({
        where: { creatorid: userId }
      }),

      // Following count
      prisma.follows.count({
        where: { followinguserid: userId }
      }),

      // Followers count
      prisma.follows.count({
        where: { followeduserid: userId }
      }),

      // Top genres based on listening history
      prisma.$queryRaw`
        SELECT t.genre, COUNT(*) as count, SUM(s.listencount) as total_listens
        FROM statistics s
        JOIN tracks t ON s.trackid = t.id
        WHERE s.userid = ${userId} AND t.genre IS NOT NULL
        GROUP BY t.genre
        ORDER BY total_listens DESC
        LIMIT 5
      `,

      // Recent activity (last 30 days)
      prisma.statistics.findMany({
        where: {
          userid: userId,
          listeningdate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
          }
        },
        include: {
          tracks: {
            select: {
              id: true,
              title: true,
              genre: true,
              trackartists: {
                include: {
                  users: {
                    select: {
                      username: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          listeningdate: 'desc'
        },
        take: 10
      })
    ]);

    // Calculate listening streak (consecutive days with activity)
    const listeningDates = await prisma.$queryRaw<{date: Date}[]>`
      SELECT DISTINCT DATE(listeningdate) as date
      FROM statistics
      WHERE userid = ${userId} AND listencount > 0
      ORDER BY date DESC
      LIMIT 30
    `;

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < listeningDates.length; i++) {
      const date = new Date(listeningDates[i].date);
      date.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      
      if (date.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Get favorite artists (most listened to)
    const favoriteArtists = await prisma.$queryRaw`
      SELECT u.id, u.username, u.profilepicture, SUM(s.listencount) as total_listens
      FROM statistics s
      JOIN tracks t ON s.trackid = t.id
      JOIN trackartists ta ON t.id = ta.trackid
      JOIN users u ON ta.artistid = u.id
      WHERE s.userid = ${userId}
      GROUP BY u.id, u.username, u.profilepicture
      ORDER BY total_listens DESC
      LIMIT 5
    `;

    // Convert BigInt values to regular numbers for JSON serialization
    const processedTopGenres = (topGenres as TopGenre[]).map(genre => ({
      genre: genre.genre,
      count: Number(genre.count),
      total_listens: Number(genre.total_listens)
    }));

    const processedFavoriteArtists = (favoriteArtists as FavoriteArtist[]).map(artist => ({
      id: Number(artist.id),
      username: artist.username,
      profilepicture: artist.profilepicture,
      total_listens: Number(artist.total_listens)
    }));

    // Calculate music diversity score (based on genre variety)
    const genreCount = processedTopGenres.length;
    const diversityScore = Math.min(genreCount * 20, 100); // Max 100 for 5+ genres

    const stats = {
      listening: {
        totalListens: totalListens._sum.listencount || 0,
        uniqueTracks: uniqueTracksListened,
        likedTracks,
        currentStreak,
        diversityScore
      },
      social: {
        createdPlaylists,
        following: followingCount,
        followers: followersCount
      },
      preferences: {
        topGenres: processedTopGenres,
        favoriteArtists: processedFavoriteArtists
      },
      activity: {
        recent: recentActivity
      }
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
