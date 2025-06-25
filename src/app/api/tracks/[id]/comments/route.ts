// Version temporaire sans timecode - pour tester avant la migration
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authService from '@/app/services/authService';

const prisma = new PrismaClient();

// GET - Récupérer tous les commentaires d'un track
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trackId = parseInt(params.id);
    
    if (isNaN(trackId)) {
      return NextResponse.json({ error: 'ID du track invalide' }, { status: 400 });
    }

    const comments = await prisma.comments.findMany({
      where: { trackid: trackId },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            profilepicture: true,
          },
        },
      },
      orderBy: { commentdate: 'desc' },
    });

    // Transformation pour correspondre à l'interface (sans timecode pour l'instant)
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      userId: comment.userid,
      trackId: comment.trackid,
      content: comment.content,
      commentDate: comment.commentdate,
      timecode: null, // Temporaire
      user: {
        id: comment.users.id,
        username: comment.users.username,
        profilepicture: comment.users.profilepicture,
      },
    }));

    return NextResponse.json(formattedComments);
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des commentaires' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Créer un nouveau commentaire
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await authService.getCurrentUserFromRequest(request);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Vous devez être connecté pour commenter' }, { status: 401 });
    }

    const trackId = parseInt(params.id);
    
    if (isNaN(trackId)) {
      return NextResponse.json({ error: 'ID du track invalide' }, { status: 400 });
    }

    const body = await request.json();
    const { content } = body; // Ignore timecode pour l'instant

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Le contenu du commentaire est requis' }, { status: 400 });
    }

    if (content.length > 280) {
      return NextResponse.json({ error: 'Le commentaire ne peut pas dépasser 280 caractères' }, { status: 400 });
    }

    // Créer le commentaire sans timecode
    const comment = await prisma.comments.create({
      data: {
        userid: currentUser.id,
        trackid: trackId,
        content: content.trim(),
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            profilepicture: true,
          },
        },
      },
    });

    const formattedComment = {
      id: comment.id,
      userId: comment.userid,
      trackId: comment.trackid,
      content: comment.content,
      commentDate: comment.commentdate,
      timecode: null, // Temporaire
      user: {
        id: comment.users.id,
        username: comment.users.username,
        profilepicture: comment.users.profilepicture,
      },
    };

    return NextResponse.json(formattedComment, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création du commentaire' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
