// src/app/api/tracks/hype-train/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        // Récupérer les morceaux ajoutés dans les 7 derniers jours,
        // calculer le ratio like/dislike (en évitant la division par zéro)
        console.log("GET /api/tracks/hype-train");
        const tracks = await prisma.$queryRaw<
            Array<{
                id: number;
                title: string;
                track_picture: string | null;
                genre: string | null;
                bpm: number | null;
                mood: string | null;
                upload_date: Date;
                audio_file: string;
                play_count: number;
                like_count: number;
                dislike_count: number;
                average_rating: number;
            }>
        >`
            SELECT
                *,
                CASE
                    WHEN dislikecount = 0 THEN likecount
                    ELSE likecount / NULLIF(dislikecount, 0)
                    END AS averagerating
            FROM tracks
            WHERE uploaddate > now() - interval '7 days' 
            OR (SELECT COUNT(*) FROM tracks WHERE uploaddate > now() - interval '7 days') = 0
            ORDER BY playcount DESC
                LIMIT 10;
        `;

        // On s'assure de toujours renvoyer un objet JSON
        return NextResponse.json({ tracks: tracks ?? [] });
    } catch (error) {
        console.error(error.stack);
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
}
