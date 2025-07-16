import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { trackId } = await request.json();
        const { id } = await params;
        
        const playlistId = parseInt(id, 10);
        
        // Vérifier si la musique existe déjà dans la playlist
        const existingTrack = await prisma.playlisttracks.findUnique({
            where: {
                playlistid_trackid: {
                    playlistid: playlistId,
                    trackid: trackId,
                },
            },
        });
        
        if (existingTrack) {
            return NextResponse.json(
                { 
                    success: false, 
                    message: "Cette musique est déjà dans la playlist" 
                }, 
                { status: 400 }
            );
        }
        
        // Ajouter la musique à la playlist
        await prisma.playlisttracks.create({
            data: {
                playlistid: playlistId,
                trackid: trackId,
                order: 0,
            },
        });
        
        return NextResponse.json({ success: true });
        
    } catch (error) {
        console.error("Error adding track to playlist:", error);
        return NextResponse.json(
            { 
                success: false, 
                message: "Erreur lors de l'ajout de la musique à la playlist" 
            }, 
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
