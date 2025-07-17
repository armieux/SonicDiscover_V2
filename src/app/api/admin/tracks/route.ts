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
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function GET(request: NextRequest) {
  try {
    await verifyAdminToken(request);

    const tracks = await prisma.tracks.findMany({
      select: {
        id: true,
        title: true,
        genre: true,
        mood: true,
        uploaddate: true,
        audiofile: true,
        trackpicture: true,
        playcount: true,
        likecount: true,
        dislikecount: true,
        duration: true,
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
        uploaddate: 'desc'
      }
    });

    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return NextResponse.json(
      { error: 'Unauthorized or server error' },
      { status: 401 }
    );
  }
}
