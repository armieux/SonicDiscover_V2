"use client";
import React, { useState, useRef, useEffect } from "react";
import { FcAssistant, FcMusic } from "react-icons/fc";
import './ChatWidget.css';
import ReactMarkdown from "react-markdown";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const ChatWidget: React.FC = () => {
    // État pour l’ouverture/fermeture de la modal
    const [isOpen, setIsOpen] = useState(false);

    // Pour savoir si on a déjà ouvert la modal une fois
    const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    // Liste des messages
    const [messages, setMessages] = useState<Message[]>([]);

    // Contenu de l’input utilisateur
    const [userInput, setUserInput] = useState("");

    // On va attacher un ref à la zone de chat pour scroller automatiquement
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Prompt initial à envoyer la première fois
    const initialPrompt = `
        Tu es un assistant de recommandation musicale pour un publique Francais.  
        Nous avons la liste de chansons suivante :
        
        1) Titre : «Bohemian Rhapsody», Artiste : Queen, Type : rock
        2) Titre : «Stairway to Heaven», Artiste : Led Zeppelin, Type : rock
        3) Titre : «Shape of You», Artiste : Ed Sheeran, Type : pop
        4) Titre : «Like a Rolling Stone», Artiste : Bob Dylan, Type : folk
        
        **Règles** :
        1. Salue l’utilisateur en français et demande-lui quels critères de musique il recherche.  
           - Exemple de critères : style (rock, pop, folk…), artiste, époque, humeur, popularité, etc.  
        2. Quand l’utilisateur précise ses critères, compare-les aux informations disponibles dans la liste ci-dessus.  
        3. Retourne les chansons qui correspondent le mieux à ces critères.  
           - Par exemple, si l’utilisateur veut de la musique «rock», affiche toutes les chansons de type «rock».  
           - S’il demande un artiste précis, une époque (ex. années 70), ou une ambiance particulière (ex. chanson «dynamique»), et que tu as assez d’infos pour filtrer, fais-le.  
        4. Si aucune chanson ne correspond, réponds poliment que tu n’as pas de recommandation pour le moment.  
        5. Arrête ta réponse après avoir donné la ou les recommandations, sans relancer la conversation.
        
        À la fin de ta réponse, stoppe-toi.
    `;

    // Message d'accueil à afficher après la première réponse du modèle
    const welcomeMessage = null ;

    // Fonction d'ouverture de la modal
    const openModal = () => {
        setIsOpen(true);

        // Si c'est la première ouverture, on envoie le prompt initial
        if (!hasOpenedOnce) {
            setHasOpenedOnce(true);
            sendMessage(initialPrompt, true);
        }
    };

    // Fonction pour envoyer un message à Ollama
    // Le paramètre "isInitial" nous permet de savoir si on doit
    // ajouter le message de bienvenue après la réponse.
    const sendMessage = async (text: string, isInitial = false) => {
        if (!text.trim()) return; // évite les messages vides

        // Ajoute le message de l’utilisateur dans la liste
        const newMessage: Message = { role: "user", content: text };
        if (!isInitial) {
            setMessages((prev) => [...prev, newMessage]);
        }

        // Réinitialise l’input si ce n’est pas le message initial
        if (!isInitial) {
            setUserInput("");
        }

        try {
            setIsLoading(true);
            // Envoi de la requête POST vers Ollama (ex: /api/generate)
            const response = await fetch("http://localhost:30000/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama3.1:8b",
                    prompt: text,
                    stream: false
                }),
            });

            if (!response.ok) {
                throw new Error(`Erreur du serveur: ${response.status}`);
            }

            const data = await response.json();
            setIsLoading(false);

            // data.response devrait contenir la réponse texte
            const assistantResponse: Message = {
                role: "assistant",
                content: data.response || "[Réponse vide]",
            };

            // Mise à jour des messages pour afficher la réponse
            setMessages((prev) => {
                const updated = [...prev, assistantResponse];
                // Si on vient d'envoyer le prompt initial, on ajoute ensuite le message de bienvenue
                if (isInitial) {
                    const welcomeMsg: Message = {
                        role: "assistant",
                        content: welcomeMessage ?? "",
                    };
                    return isInitial && welcomeMsg.content.length > 0 ? [welcomeMsg] : [...updated];
                }
                return updated;
            });

        } catch (error) {
            console.error(error);
            // On affiche un message d’erreur dans le chat
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Oops, une erreur est survenue en parlant à Ollama.",
                },
            ]);
        }
    };

    // Gestion de la soumission du formulaire
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(userInput);
    };

    // Hook pour scroller en bas à chaque fois que messages ou isOpen change
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages, isOpen]);

    return (
        <>
            {/* Bouton flottant en bas à droite */}
            <button className="chatButton" onClick={openModal}>
                <FcAssistant style={{ fontSize: "2em" }} />
                <FcMusic style={{ fontSize: "2em" }} />
            </button>

            {/* Modal */}
            {isOpen && (
                <div
                    className="chatModal"
                    onClick={() => setIsOpen(false)} // Ferme la modal si on clique sur le “voile” sombre
                >
                    {/* Contenu de la modal */}
                    <div
                        className="chatModalContent"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Entête (Titre) */}
                        <div className="chatModalTitle">
                            <span>Chat Assistant</span>
                            {/* Bouton de fermeture (optionnel) */}
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#fff",
                                    fontSize: "1.2rem",
                                    cursor: "pointer",
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Zone de chat */}
                        <div
                            ref={chatContainerRef}
                            style={{
                                flex: 1,
                                overflowY: "auto",
                                padding: "16px",
                                backgroundColor: "#f9f9f9",
                            }}
                        >
                            {messages.map((msg, i) => {
                                const isUser = msg.role === "user";
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            display: "flex",
                                            justifyContent: isUser ? "flex-end" : "flex-start",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                backgroundColor: isUser ? "#007bff" : "#e0e0e0",
                                                color: isUser ? "#fff" : "#000",
                                                borderRadius: "12px",
                                                padding: "8px 12px",
                                                maxWidth: "70%",
                                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                            }}
                                        >
                                            <strong>{isUser ? "Vous" : "Ollama"}: </strong>
                                            <span><ReactMarkdown>{msg.content}</ReactMarkdown></span>
                                        </div>
                                    </div>
                                );
                            })}
                            {isLoading && (
                                <div
                                    style={{
                                        marginLeft: "8px",
                                        width: "90%",
                                        textAlign: "center",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    {/* Spinner Div */}
                                    <div
                                        style={{
                                            width: "24px",
                                            height: "24px",
                                            border: "4px solid #f3f3f3",
                                            borderTop: "4px solid #3498db",
                                            borderRadius: "50%",
                                            animation: "spin 1s linear infinite",
                                        }}
                                    />
                                </div>
                            )}

                        </div>

                        {/* Formulaire d’envoi */}
                        <form
                            onSubmit={handleSubmit}
                            style={{
                                display: "flex",
                                borderTop: "1px solid #ddd",
                                padding: "8px",
                                backgroundColor: "#fff",
                            }}
                        >
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                style={{
                                    flex: 1,
                                    marginRight: "8px",
                                    borderRadius: "4px",
                                    border: "1px solid #ccc",
                                    padding: "8px",
                                }}
                                placeholder="Écrivez votre message..."
                            />
                            <button
                                type="submit"
                                style={{
                                    backgroundColor: "#007bff",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "8px 16px",
                                    cursor: "pointer",
                                }}
                            >
                                Envoyer
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
