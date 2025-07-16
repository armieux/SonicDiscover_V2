import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: Promise<{ trackId: string }> }) {
    try {
        const { trackId } = await params;
        
        // Récupérer les IDs des playlists qui contiennent déjà cette musique
        const playlistsWithTrack = await prisma.playlisttracks.findMany({
            where: {
                trackid: parseInt(trackId, 10),
            },
            select: {
                playlistid: true,
            },
        });
        
        const playlistIds = playlistsWithTrack.map(pt => pt.playlistid);
        
        return NextResponse.json(playlistIds);
        
    } catch (error) {
        console.error("Error fetching playlists containing track:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des playlists" }, 
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
