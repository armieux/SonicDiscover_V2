// app/api/tracks/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

/**
 * GET /api/tracks/[id]
 * Fetch a single track by its ID.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Fetch the track by ID using Prisma
    const track = await prisma.tracks.findUnique({
      where: {
        id: parseInt(id, 10), // Convert the ID to an integer
      },
    });

    if (!track) {
      // Track not found
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // Return the single track
    return NextResponse.json(track);
  } catch (error) {
    console.error('Error fetching track:', error);
    return NextResponse.json(
      { error: 'Failed to fetch track' },
      { status: 500 }
    );
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
}

// PATCH /api/tracks/:id
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();

  try {
    // Update the track using Prisma
    const updatedTrack = await prisma.tracks.update({
      where: { id: parseInt(id, 10) }, // Convert ID to integer
      data: body, // Use the body as the data object
    });

    // Return the updated track
    return NextResponse.json({ success: true, track: updatedTrack });
  } catch (error) {
    console.error('Error updating track:', error);

    // Handle "not found" errors specifically
    // if (error.code === 'P2025') {
    //   return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    // }

    return NextResponse.json({ error: 'Failed to update track' }, { status: 500 });
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
}
  
// DELETE /api/tracks/:id
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // 1. Find the track to delete, so we can get the audioFile path
    const trackToDelete = await prisma.tracks.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!trackToDelete) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // 2. Delete the track in the database
    const deletedTrack = await prisma.tracks.delete({
      where: { id: parseInt(id, 10) },
    });

    // 3. Check if there is an associated audio file and remove it from the filesystem
    //    'deletedTrack.audiofile' should contain something like '/uploads/filename.mp3'
    if (deletedTrack.audiofile) {
      const audioFilePath = path.join(process.cwd(), 'public', deletedTrack.audiofile);

      // 4. Remove the file from the disk if it exists
      if (fs.existsSync(audioFilePath)) {
        fs.unlinkSync(audioFilePath);
      }
    }

    // 5. Return a success response
    return NextResponse.json({ success: true, track: deletedTrack });
  } catch (error) {
    console.error('Error deleting track:', error);

    return NextResponse.json(
      { error: 'Failed to delete track' },
      { status: 500 }
    );
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
}
  