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
    const commentId = parseInt(id);

    // Vérifier que le commentaire existe
    const commentToDelete = await prisma.comments.findUnique({
      where: { id: commentId }
    });

    if (!commentToDelete) {
      return NextResponse.json(
        { error: 'Commentaire non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer le commentaire
    await prisma.comments.delete({
      where: { id: commentId }
    });

    return NextResponse.json({ message: 'Commentaire supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
