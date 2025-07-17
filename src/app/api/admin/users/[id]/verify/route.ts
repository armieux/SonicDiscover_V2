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
    const { verified } = await request.json();

    // Vérifier que l'utilisateur existe
    const userExists = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!userExists) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (verified) {
      // Créer ou trouver le badge "vérifié"
      let verifiedBadge = await prisma.badges.findFirst({
        where: { name: 'Vérifié' }
      });

      if (!verifiedBadge) {
        verifiedBadge = await prisma.badges.create({
          data: {
            name: 'Vérifié',
            description: 'Compte vérifié par les administrateurs',
            badgeicon: '✓',
            criteria: 'Vérification manuelle par un administrateur'
          }
        });
      }

      // Ajouter le badge à l'utilisateur (s'il ne l'a pas déjà)
      const existingBadge = await prisma.userbadges.findUnique({
        where: {
          userid_badgeid: {
            userid: userId,
            badgeid: verifiedBadge.id
          }
        }
      });

      if (!existingBadge) {
        await prisma.userbadges.create({
          data: {
            userid: userId,
            badgeid: verifiedBadge.id
          }
        });
      }
    } else {
      // Retirer le badge vérifié
      const verifiedBadge = await prisma.badges.findFirst({
        where: { name: 'Vérifié' }
      });

      if (verifiedBadge) {
        await prisma.userbadges.deleteMany({
          where: {
            userid: userId,
            badgeid: verifiedBadge.id
          }
        });
      }
    }

    return NextResponse.json({ 
      message: verified ? 'Badge vérifié ajouté' : 'Badge vérifié retiré' 
    });
  } catch (error) {
    console.error('Error updating verification status:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification du statut de vérification' },
      { status: 500 }
    );
  }
}
