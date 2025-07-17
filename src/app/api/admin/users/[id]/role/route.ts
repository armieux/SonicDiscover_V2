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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdminToken(request);

    const { id } = await params;
    const userId = parseInt(id);
    const { role } = await request.json();

    if (!['user', 'artist', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const userToUpdate = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!userToUpdate) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Empêcher la modification du rôle du dernier admin
    if (userToUpdate.role === 'admin' && role !== 'admin') {
      const adminCount = await prisma.users.count({
        where: { role: 'admin' }
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Impossible de modifier le rôle du dernier administrateur' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le rôle
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        joindate: true,
        followerscount: true,
        followingcount: true,
        profilepicture: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification du rôle' },
      { status: 500 }
    );
  }
}
