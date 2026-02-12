"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, MessageCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useChat } from "@/context/ChatContext";
import { supabase } from "@/lib/supabase";
import TeaserResponse from "./TeaserResponse";
import UpgradeModal from "./UpgradeModal";
import AuthModal from "./AuthModal";

type Message = {
    role: "user" | "assistant";
    content: string;
    isTeaser?: boolean;
};

export default function ChatDrawer() {
    const { isOpen, setIsOpen, initialQuery, setInitialQuery, user, profile, refreshProfile } = useChat();
    const t = useTranslations('ChatDrawer');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Modals
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial Welcome Message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                { role: "assistant", content: t('welcomeMessage') }
            ]);
        }
    }, [t, messages.length]);

    const handleSend = useCallback(async (messageContent: string) => {
        const query = messageContent.trim();
        if (!query || isLoading) return;

        // Freemium Check (Client-side pre-check for better UX, but server enforces it)
        if (user && profile) {
            if (profile.subscription_tier === 'free' && profile.query_counter >= 3) {
                setShowUpgradeModal(true);
                return;
            }
        }

        const userMessage: Message = { role: "user", content: query };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ message: query }),
            });

            const data = await response.json();

            if (response.status === 403 && data.code === "LIMIT_REACHED") {
                setShowUpgradeModal(true);
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: "Límite de consultas gratuitas alcanzado." }
                ]);
            } else if (data.response) {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: data.response,
                        isTeaser: data.isTeaser
                    },
                ]);
                if (user) refreshProfile();
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: `Error: ${data.error || "Lo siento, hubo un error procesando tu consulta."}` },
                ]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Lo siento, no pude conectar con el servidor." },
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, user, profile, refreshProfile]);

    // Handle Search from Hero
    useEffect(() => {
        if (isOpen && initialQuery) {
            handleSend(initialQuery);
            setInitialQuery("");
        }
    }, [isOpen, initialQuery, handleSend, setInitialQuery]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    return (
        <>
            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

            {/* Trigger Button - Hidden when open */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 bg-brand-green text-white p-4 rounded-full shadow-lg hover:bg-opacity-90 hover:scale-105 transition-all z-50"
                    >
                        <MessageCircle className="w-6 h-6" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Drawer Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        />

                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white/90 backdrop-blur-xl shadow-2xl z-50 border-l border-white/20 flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white/50">
                                <div>
                                    <h2 className="font-serif text-xl font-bold text-brand-green">{t('title')}</h2>
                                    <p className="text-xs text-gray-500">{t('subtitle')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* User Status / Login Button */}
                                    {!user ? (
                                        <button
                                            onClick={() => setShowAuthModal(true)}
                                            className="text-xs font-medium text-brand-gold hover:text-brand-green transition-colors"
                                        >
                                            Login
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-400">
                                            {profile?.subscription_tier === 'premium' ? '👑 Pro' : `Free (${profile?.query_counter || 0}/3)`}
                                        </span>
                                    )}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
                            >
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`rounded-2xl shadow-sm max-w-[85%] ${msg.role === 'user'
                                                ? 'bg-brand-green text-white rounded-tr-none p-4'
                                                : 'bg-gray-100 text-gray-800 rounded-tl-none p-0 overflow-hidden'
                                                // Removed padding for assistant to let Teaser handle it or inner div
                                                }`}
                                        >
                                            {msg.role === 'assistant' ? (
                                                <div className="p-4">
                                                    {msg.isTeaser ? (
                                                        <TeaserResponse
                                                            content={msg.content}
                                                            onRegister={() => setShowAuthModal(true)}
                                                        />
                                                    ) : (
                                                        msg.content
                                                    )}
                                                </div>
                                            ) : (
                                                msg.content
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-brand-gold" />
                                            <span className="text-xs text-gray-500 italic">Analizando leyes...</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-gray-100 bg-white/50">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                                    className="flex gap-2"
                                >
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={t('inputPlaceholder')}
                                        disabled={isLoading}
                                        className="flex-1 bg-gray-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-green/20 outline-none transition-all placeholder-gray-400 disabled:opacity-50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading || !input.trim()}
                                        className="bg-brand-green text-white p-3 rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                                <p className="text-center text-[10px] text-gray-400 mt-2">
                                    {t('disclaimer')}
                                </p>
                                <button
                                    onClick={() => setShowUpgradeModal(true)}
                                    className="w-full text-xs font-bold text-red-600 bg-red-100 py-2 rounded mt-2 hover:bg-red-200 transition-colors"
                                >
                                    [ TEST UPGRADE MODAL ]
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence >
        </>
    );
}
