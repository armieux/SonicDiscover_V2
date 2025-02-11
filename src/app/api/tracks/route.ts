import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

// Initialize Prisma Client
const prisma = new PrismaClient();

// GET /api/tracks
export async function GET() {
  try {
    // Fetch tracks from the database using Prisma
    const tracks = await prisma.tracks.findMany({
      orderBy: {
        id: 'desc', // Order tracks by ID in descending order
      },
      include: {
        trackartists: {
          include: {
            users: true
          }
        }
      }
    });

    // Return JSON with a 200 status
    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    );
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
}
