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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdminToken(request);

    const { id } = await params;
    const trackId = parseInt(id);

    // Vérifier que la musique existe
    const trackToDelete = await prisma.tracks.findUnique({
      where: { id: trackId }
    });

    if (!trackToDelete) {
      return NextResponse.json(
        { error: 'Musique non trouvée' },
        { status: 404 }
      );
    }

    // Supprimer la musique (cascade défini dans le schema)
    await prisma.tracks.delete({
      where: { id: trackId }
    });

    return NextResponse.json({ message: 'Musique supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting track:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
