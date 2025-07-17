import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret');

async function verifyAdminToken(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    throw new Error('No token found');
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);
    const user = await prisma.users.findUnique({
      where: { id: payload.userId as number }
    });

    if (!user || user.role !== 'admin') {
      throw new Error('Not authorized');
    }

    return user;
  } catch {
    throw new Error('Invalid token');
  }
}

export async function GET(request: NextRequest) {
  try {
    await verifyAdminToken(request);

    // Date du début du mois actuel
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Statistiques des utilisateurs
    const totalUsers = await prisma.users.count();
    const newUsersThisMonth = await prisma.users.count({
      where: {
        joindate: {
          gte: startOfMonth
        }
      }
    });
    const artistsCount = await prisma.users.count({
      where: { role: 'artist' }
    });
    
    // Compter les utilisateurs vérifiés (avec badge "Vérifié")
    const verifiedBadge = await prisma.badges.findFirst({
      where: { name: 'Vérifié' }
    });
    const verifiedUsersCount = verifiedBadge 
      ? await prisma.userbadges.count({
          where: { badgeid: verifiedBadge.id }
        })
      : 0;

    // Statistiques des musiques
    const totalTracks = await prisma.tracks.count();
    const newTracksThisMonth = await prisma.tracks.count({
      where: {
        uploaddate: {
          gte: startOfMonth
        }
      }
    });
    
    const totalPlays = await prisma.tracks.aggregate({
      _sum: {
        playcount: true
      }
    });
    
    const totalLikes = await prisma.tracks.aggregate({
      _sum: {
        likecount: true
      }
    });

    // Statistiques des commentaires
    const totalComments = await prisma.comments.count();
    const newCommentsThisMonth = await prisma.comments.count({
      where: {
        commentdate: {
          gte: startOfMonth
        }
      }
    });
    const commentsWithTimecode = await prisma.comments.count({
      where: {
        timecode: {
          not: null
        }
      }
    });

    // Top musiques
    const topTracks = await prisma.tracks.findMany({
      select: {
        id: true,
        title: true,
        playcount: true,
        likecount: true,
        trackartists: {
          select: {
            users: {
              select: {
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        playcount: 'desc'
      },
      take: 10
    });

    // Top utilisateurs
    const topUsers = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        followerscount: true,
        role: true
      },
      orderBy: {
        followerscount: 'desc'
      },
      take: 10
    });

    // Activité récente (simulée pour l'exemple)
    const recentActivity = [
      {
        type: 'user_register',
        description: `${newUsersThisMonth} nouveaux utilisateurs ce mois`,
        date: new Date().toISOString()
      },
      {
        type: 'track_upload',
        description: `${newTracksThisMonth} nouvelles musiques uploadées ce mois`,
        date: new Date().toISOString()
      },
      {
        type: 'comment_posted',
        description: `${newCommentsThisMonth} nouveaux commentaires ce mois`,
        date: new Date().toISOString()
      }
    ];

    const stats = {
      users: {
        total: totalUsers,
        new_this_month: newUsersThisMonth,
        artists: artistsCount,
        verified: verifiedUsersCount
      },
      tracks: {
        total: totalTracks,
        total_plays: totalPlays._sum.playcount || 0,
        total_likes: totalLikes._sum.likecount || 0,
        new_this_month: newTracksThisMonth
      },
      comments: {
        total: totalComments,
        new_this_month: newCommentsThisMonth,
        with_timecode: commentsWithTimecode
      },
      top_tracks: topTracks,
      top_users: topUsers,
      recent_activity: recentActivity
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Unauthorized or server error' },
      { status: 401 }
    );
  }
}
