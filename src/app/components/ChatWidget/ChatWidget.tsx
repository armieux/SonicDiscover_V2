"use client";
import React, { useState, useRef, useEffect } from "react";
import { FcMusic } from "react-icons/fc";
import { PiRobotDuotone } from "react-icons/pi";
import { FiSend, FiX } from "react-icons/fi";

import './ChatWidget.css';
import ReactMarkdown from "react-markdown";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState("");
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Prompt initial
    const initialPrompt = `Bonjour ! Je suis votre assistant musical intelligent. Comment puis-je vous aider aujourd'hui ?`;
    
    // Message de bienvenue
    const welcomeMessage = null;

    // Suggestions initiales
    const suggestions = [
        "Recommande-moi de la musique",
        "Explique-moi les genres musicaux",
        "Comment créer une playlist ?",
        "Analyse mes goûts musicaux"
    ];

    // Ouvre la modal
    const openModal = () => {
        setIsOpen(true);
        if (!hasOpenedOnce) {
            setHasOpenedOnce(true);
            sendMessage(initialPrompt, true);
        }
    };

    /**
     * Envoie le prompt vers NOTRE route "/api/groq",
     * qui se charge ensuite de contacter Groq en streaming
     */
    const sendMessage = async (text: string, isInitial = false) => {
        if (!text.trim()) return;

        // Ajoute le message utilisateur
        if (!isInitial) {
            setMessages((prev) => [...prev, { role: "user", content: text }]);
            setUserInput("");
        }

        setIsLoading(true);

        try {
            // Appel à notre route, pas directement à Groq
            const response = await fetch("/api/groq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            if (!response.body) {
                throw new Error("La réponse de l'API interne ne contient pas de flux.");
            }

            // Ajout d'un nouveau message assistant vide
            // (qu'on remplira via le streaming)
            const assistantMessage: Message = { role: "assistant", content: "" };

            if (isInitial && welcomeMessage) {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: welcomeMessage },
                    assistantMessage,
                ]);
            } else {
                setMessages((prev) => [...prev, assistantMessage]);
            }

            // Lecture du flux (chunk par chunk)
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;

                if (value) {
                    // On décode le chunk en string
                    const chunkValue = decoder.decode(value, { stream: true });

                    // Chaque chunk peut contenir une ou plusieurs lignes `data: {...}`
                    const lines = chunkValue.split("\n");

                    for (let line of lines) {
                        line = line.trim();
                        // On ne s'intéresse qu'aux lignes commençant par "data: "
                        if (line.startsWith("data: ")) {
                            const jsonStr = line.substring("data: ".length).trim();

                            // L'API peut envoyer une ligne de contrôle "data: [DONE]" quand la génération est terminée
                            if (jsonStr === "[DONE]") {
                                // Vous pouvez traiter la fin de génération ici
                                break;
                            }

                            // Sinon, on parse le JSON
                            try {
                                const json = JSON.parse(jsonStr);

                                // Récupérer le texte s'il y en a (delta.content)
                                // Parfois delta.role = "assistant" pour le 1er chunk
                                const delta = json.choices?.[0]?.delta;
                                if (delta?.content) {
                                    const chunkText = delta.content;
                                    // Ici on concatène dans le dernier message 'assistant'
                                    setMessages((prevMessages) => {
                                        const lastIndex = prevMessages.length - 1;
                                        const lastMsg = prevMessages[lastIndex];

                                        if (lastMsg && lastMsg.role === "assistant") {
                                            return [
                                                ...prevMessages.slice(0, lastIndex),
                                                {
                                                    ...lastMsg,
                                                    content: lastMsg.content + chunkText,
                                                },
                                            ];
                                        } else {
                                            // Si pas de message assistant en cours,
                                            // on en crée un nouveau
                                            return [
                                                ...prevMessages,
                                                { role: "assistant", content: chunkText },
                                            ];
                                        }
                                    });
                                }
                            } catch (err) {
                                console.info("Erreur de parsing JSON SSE:", err, line);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Désolé, une erreur s'est produite. Veuillez réessayer." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Gère la soumission (input)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(userInput);
    };

    // Gère les suggestions
    const handleSuggestionClick = (suggestion: string) => {
        sendMessage(suggestion);
    };

    // Scroll auto
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
            {/* Bouton flottant moderne */}
            <button className="chatButton" onClick={openModal}>
                <PiRobotDuotone className="text-2xl" />
                <FcMusic className="text-xl" />
                <span className="hidden sm:inline">Assistant IA</span>
            </button>

            {/* Modal du chat */}
            {isOpen && (
                <div className="chatModal mt-20" onClick={() => setIsOpen(false)}>
                    <div className="chatModalContent" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="chatModalTitle">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#F2A365] to-[#D9BF77] rounded-xl flex items-center justify-center">
                                    <PiRobotDuotone className="text-xl text-[#1C1C2E]" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Assistant Musical IA</h3>
                                </div>
                            </div>
                            <button className="closeButton" onClick={() => setIsOpen(false)}>
                                <FiX />
                            </button>
                        </div>

                        {/* Zone de chat */}
                        <div className="chatContent" ref={chatContainerRef}>
                            {messages.length === 0 && (
                                <div className="welcomeMessage">
                                    <h3>🎵 Bienvenue dans votre assistant musical !</h3>
                                    <p>Je suis là pour vous aider avec tout ce qui concerne la musique sur Sonic Discover.</p>

                                    <div className="suggestionChips">
                                        {suggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                className="suggestionChip"
                                                onClick={() => handleSuggestionClick(suggestion)}
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, i) => {
                                const isUser = msg.role === "user";
                                return (
                                    <div
                                        key={i}
                                        className={`chatMessage ${isUser ? 'user' : 'assistant'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {!isUser && (
                                                <div className="w-8 h-8 bg-gradient-to-br from-[#3E5C76] to-[#F2A365] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                                    <PiRobotDuotone className="text-white text-sm" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                {isUser && (
                                                    <div className="text-xs opacity-70 mb-1">Vous</div>
                                                )}
                                                <div className="prose prose-sm prose-invert max-w-none">
                                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                </div>
                                            </div>
                                            {isUser && (
                                                <div className="w-8 h-8 bg-gradient-to-br from-[#F2A365] to-[#D9BF77] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                                    <span className="text-[#1C1C2E] text-sm font-bold">U</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {isLoading && (
                                <div className="chatMessage assistant">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-[#3E5C76] to-[#F2A365] rounded-lg flex items-center justify-center">
                                            <PiRobotDuotone className="text-white text-sm" />
                                        </div>
                                        <div className="loadingDots">
                                            <div className="loadingDot"></div>
                                            <div className="loadingDot"></div>
                                            <div className="loadingDot"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Zone de saisie */}
                        <div className="chatInputContainer">
                            <form onSubmit={handleSubmit} className="flex gap-3 w-full">
                                <input
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    className="chatInput"
                                    placeholder="Posez votre question musicale..."
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    className="chatSendButton"
                                    disabled={isLoading || !userInput.trim()}
                                >
                                    <FiSend />
                                    <span className="hidden sm:inline">Envoyer</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
