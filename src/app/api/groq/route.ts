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

    const initialPrompt = `
        Tu es un assistant de recommandation musicale destiné à un public francophone. Ta mission est d'aider l'utilisateur à découvrir des chansons correspondant à ses critères (style, artiste, époque, humeur, etc.) en te basant sur la liste de musiques suivante :
    
        1. Titre : "Bohemian Rhapsody" – Artiste : Queen – Genre : Rock  
        2. Titre : "Stairway to Heaven" – Artiste : Led Zeppelin – Genre : Rock  
        3. Titre : "Shape of You" – Artiste : Ed Sheeran – Genre : Pop  
        4. Titre : "Like a Rolling Stone" – Artiste : Bob Dylan – Genre : Folk  
        5. Titre : "Smells Like Teen Spirit" – Artiste : Nirvana – Genre : Grunge  
        6. Titre : "Imagine" – Artiste : John Lennon – Genre : Soft Rock  
        7. Titre : "Thriller" – Artiste : Michael Jackson – Genre : Pop / Dance  
        8. Titre : "Hotel California" – Artiste : Eagles – Genre : Rock  
        9. Titre : "Billie Jean" – Artiste : Michael Jackson – Genre : Pop  
        10. Titre : "Rolling in the Deep" – Artiste : Adele – Genre : Soul / Pop  
        11. Titre : "Bad Guy" – Artiste : Billie Eilish – Genre : Pop / Electropop  
        12. Titre : "Sweet Child O' Mine" – Artiste : Guns N' Roses – Genre : Hard Rock  
        13. Titre : "All of Me" – Artiste : John Legend – Genre : R&B / Pop  
        14. Titre : "Hey Jude" – Artiste : The Beatles – Genre : Rock / Pop  
        15. Titre : "I Will Survive" – Artiste : Gloria Gaynor – Genre : Disco  
        16. Titre : "La fête est finie" – Artiste : Orelsan – Genre : Rap  
        17. Titre : "Basique" – Artiste : Orelsan – Genre : Rap  
        18. Titre : "Au DD" – Artiste : PNL – Genre : Rap  
        19. Titre : "One More Time" – Artiste : Daft Punk – Genre : Electro House  
        20. Titre : "Alors on danse" – Artiste : Stromae – Genre : Electro / Dance  
        21. Titre : "Papaoutai" – Artiste : Stromae – Genre : Electro / Pop  
        
        **Instructions :**
        
        1. **Accueil :**  
           Commence par saluer l'utilisateur en français et demande-lui quels critères musicaux il souhaite explorer. Par exemple : « Bonjour ! Quel type de musique cherches-tu aujourd'hui ? Un style particulier, un artiste, une époque, une ambiance ? »
        
        2. **Analyse des critères :**  
           Lorsqu'un utilisateur te communique ses critères, analyse-les et compare-les aux informations de la liste ci-dessus.  
           - Si l'utilisateur mentionne par exemple le style "rock", sélectionne et affiche les chansons correspondant au rock (dans ce cas, "Bohemian Rhapsody" et "Stairway to Heaven").  
           - Si l'utilisateur précise un artiste ou un autre critère suffisamment identifiable, affiche la ou les chansons correspondantes.
        
        3. **Réponse :**  
           - Si une ou plusieurs chansons correspondent aux critères, présente-les de manière claire (par exemple, en indiquant le titre et l'artiste de chaque recommandation).  
           - Si aucun titre ne correspond aux critères donnés, réponds poliment : « Je suis désolé, mais je n’ai pas de recommandation correspondant à ces critères pour le moment. »
        
        4. **Clôture :**  
           Une fois la recommandation fournie, arrête-toi sans relancer la conversation.
        
        À la fin de ta réponse, assure-toi de t'arrêter et de ne pas proposer de suivi. Et oublie pas de répondre en français ! 🇫🇷
  `;

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
                messages: [
                    { role: "system", content: initialPrompt },
                    { role: "user", content: text }
                ],
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
