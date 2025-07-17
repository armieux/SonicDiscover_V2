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
    const userId = parseInt(id);

    // Vérifier que l'utilisateur existe
    const userToDelete = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Empêcher la suppression du dernier admin
    if (userToDelete.role === 'admin') {
      const adminCount = await prisma.users.count({
        where: { role: 'admin' }
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Impossible de supprimer le dernier administrateur' },
          { status: 400 }
        );
      }
    }

    // Supprimer l'utilisateur (cascade défini dans le schema)
    await prisma.users.delete({
      where: { id: userId }
    });

    return NextResponse.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
