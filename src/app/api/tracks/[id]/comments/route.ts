import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authService from '@/app/services/authService';

const prisma = new PrismaClient();

// GET - Récupérer tous les commentaires d'un track
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trackId = parseInt(id);
    
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

    // Transformation pour correspondre à l'interface
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      userId: comment.userid,
      trackId: comment.trackid,
      content: comment.content,
      commentDate: comment.commentdate,
      timecode: comment.timecode,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await authService.getCurrentUserFromRequest(request);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Vous devez être connecté pour commenter' }, { status: 401 });
    }

    const { id } = await params;
    const trackId = parseInt(id);
    
    if (isNaN(trackId)) {
      return NextResponse.json({ error: 'ID du track invalide' }, { status: 400 });
    }

    const body = await request.json();
    const { content, timecode } = body;

    console.log('Données reçues:', { content, timecode, trackId }); // Debug

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Le contenu du commentaire est requis' }, { status: 400 });
    }

    if (content.length > 280) {
      return NextResponse.json({ error: 'Le commentaire ne peut pas dépasser 280 caractères' }, { status: 400 });
    }

    // Valider le timecode si fourni
    if (timecode !== null && timecode !== undefined && (isNaN(timecode) || timecode < 0)) {
      return NextResponse.json({ error: 'Timecode invalide' }, { status: 400 });
    }

    // Créer le commentaire SANS timecode temporairement
    // Une fois la migration appliquée, décommentez la ligne avec timecode
    const comment = await prisma.comments.create({
      data: {
        userid: currentUser.id,
        trackid: trackId,
        content: content.trim(),
        timecode: timecode !== null && timecode !== undefined ? parseFloat(timecode) : null, // À décommenter après migration
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

    console.log('Commentaire créé:', comment); // Debug

    const formattedComment = {
      id: comment.id,
      userId: comment.userid,
      trackId: comment.trackid,
      content: comment.content,
      commentDate: comment.commentdate,
      timecode: timecode || null, // Utiliser le timecode reçu pour l'instant
      user: {
        id: comment.users.id,
        username: comment.users.username,
        profilepicture: comment.users.profilepicture,
      },
    };

    return NextResponse.json(formattedComment, { status: 201 });
  } catch (error) {
    console.log('Erreur lors de la création du commentaire:', error?.toString() || 'Erreur inconnue');
    
    // Gestion spécifique des erreurs Prisma
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('column "timecode"') || errorMessage.includes('does not exist')) {
        return NextResponse.json({ 
          error: 'La colonne timecode n\'existe pas. Exécutez: npx prisma db push' 
        }, { status: 500 });
      }
      if (errorMessage.includes('Foreign key constraint')) {
        return NextResponse.json({ error: 'Utilisateur ou track introuvable' }, { status: 400 });
      }
    }
    
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création du commentaire' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
