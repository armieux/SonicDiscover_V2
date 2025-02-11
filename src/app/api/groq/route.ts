// app/api/groq/route.ts

import { NextRequest } from "next/server";

/**
 * Fonction utilitaire qui lit le readable stream depuis Groq
 * et l'écrit directement dans un writable stream.
 * Ici on ne fait aucun parsing SSE, on fait juste un "pass-through".
 */
async function pump(readable: ReadableStream, writable: WritableStream) {
    const reader = readable.getReader();
    const writer = writable.getWriter();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
                // Convertit le chunk binaire en texte
                const textChunk = decoder.decode(value);
                // On peut éventuellement filtrer, parser ou "formatter" ici.
                // Mais pour un simple pass-through, on réencode tel quel :
                await writer.write(encoder.encode(textChunk));
            }
        }
    } finally {
        // On ferme toujours le writer
        writer.close();
        reader.releaseLock();
    }
}

export async function POST(req: NextRequest) {
    try {
        // Récupère les infos envoyées par le front
        const { text } = await req.json();

        // Appelez ici votre clé via process.env ou tout autre moyen
        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
            return new Response("Clé GROQ_API_KEY manquante dans .env", { status: 500 });
        }

        // Exemple d'appel à Groq
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${groqApiKey}`,
            },
            body: JSON.stringify({
                messages: [{ role: "user", content: text }],
                model: "llama-3.3-70b-versatile",
                stream: true,
            }),
        });

        // Vérifie que Groq renvoie bien un body stream
        if (!groqResponse.body) {
            return new Response("Pas de flux renvoyé par Groq.", { status: 500 });
        }

        // On crée un TransformStream pour “pumper” les data
        const { readable, writable } = new TransformStream();

        // Démarre le pump asynchrone
        pump(groqResponse.body, writable);

        // On renvoie le readable tel quel au client
        // Notez le "no-cache" et "Transfer-Encoding: chunked"
        return new Response(readable, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache, no-transform",
                "Transfer-Encoding": "chunked",
            },
        });
    } catch (err: any) {
        console.error("Erreur route /api/groq :", err);
        return new Response(
            "Erreur interne lors de l'appel à Groq.",
            { status: 500 }
        );
    }
}
