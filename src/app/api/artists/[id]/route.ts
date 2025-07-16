import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

// GET /api/artists/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artistId = parseInt(params.id, 10);
    
    if (isNaN(artistId)) {
      return NextResponse.json(
        { error: 'Invalid artist ID' },
        { status: 400 }
      );
    }

    // Récupérer les données de l'artiste
    const artist = await prisma.users.findUnique({
      where: { id: artistId },
      include: {
        trackartists: {
          where: { role: 'ARTIST' },
          include: {
            tracks: {
              include: {
                trackartists: {
                  include: {
                    users: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!artist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    // Calculer les statistiques
    const tracks = artist.trackartists.map(ta => ta.tracks);
    const stats = {
      totalTracks: tracks.length,
      totalPlays: tracks.reduce((sum, track) => sum + track.playcount, 0),
      totalLikes: tracks.reduce((sum, track) => sum + track.likecount, 0),
      totalDislikes: tracks.reduce((sum, track) => sum + track.dislikecount, 0),
      averageRating: tracks.length > 0 
        ? tracks.reduce((sum, track) => sum + track.averagerating, 0) / tracks.length 
        : 0
    };

    const response = {
      artist: {
        id: artist.id,
        username: artist.username,
        profilepicture: artist.profilepicture,
        followerscount: artist.followerscount,
        followingcount: artist.followingcount,
        joinDate: artist.joinDate
      },
      tracks: tracks.map(track => ({
        ...track,
        artistname: track.trackartists?.find(ta => ta.role === 'ARTIST')?.users?.username || 'Unknown Artist',
        artistid: track.trackartists?.find(ta => ta.role === 'ARTIST')?.users?.id || 0
      })),
      stats
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching artist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artist data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
