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
    const [isOpen, setIsOpen] = useState(false);
    const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState("");
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Prompt initial
    const initialPrompt = `
        Bonjour !
  `;
    // Optionnel
    const welcomeMessage = null;

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
            let assistantMessage: Message = { role: "assistant", content: "" };

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

                                // Récupérer le texte s’il y en a (delta.content)
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
                { role: "assistant", content: "Erreur lors de l'appel à l'API interne." },
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
            <button className="chatButton" onClick={openModal}>
                <FcAssistant style={{ fontSize: "2em" }} />
                <FcMusic style={{ fontSize: "2em" }} />
            </button>

            {isOpen && (
                <div className="chatModal" onClick={() => setIsOpen(false)}>
                    <div className="chatModalContent" onClick={(e) => e.stopPropagation()}>
                        <div className="chatModalTitle">
                            <span>Chat Assistant</span>
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
                                                maxWidth: "90%",
                                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                            }}
                                        >
                                            <strong>{isUser ? "Vous" : "Assistant"}: </strong>
                                            <span>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </span>
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
