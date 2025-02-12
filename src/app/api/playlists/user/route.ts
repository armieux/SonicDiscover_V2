import authService from '@/app/services/authService';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

// Initialize Prisma Client
const prisma = new PrismaClient();

// GET /api/playlists
export async function GET(
    request: Request
) {
    const currentUser = await authService.getCurrentUserFromRequest(request);

    if (!currentUser) {
        return NextResponse.json(
            { error: 'Not authorized' },
            { status: 401 }
        );
    }
    
    try {
      // Fetch tracks from the database using Prisma
      const playlists = await prisma.playlists.findMany({
          where: {
              creatorid: currentUser.id,
          },
          orderBy: {
              id: 'desc',
          }
      });

      // Return JSON with a 200 status
      return NextResponse.json(playlists);
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      return NextResponse.json(
        { error: 'Failed to fetch playlists' },
        { status: 500 }
      );
    } finally {
      // Disconnect Prisma client
      await prisma.$disconnect();
    }
}
