import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useChat } from '../lib/ChatContext';
import { useTranslation } from 'react-i18next';
import { useUsageLimits } from '../lib/useUsageLimits';
import { UpgradeModal } from './UpgradeModal';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export function ChatDrawer() {
    const { t, i18n } = useTranslation();
    const { isOpen, setIsOpen, query, setQuery } = useChat();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: t('chat.welcome_msg')
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [user, setUser] = useState<any>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Auto-scroll al final cuando hay nuevos mensajes o se abre el chat
    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Obtener usuario actual y escuchar cambios
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        // Carga inicial
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Hook de límites de uso
    const { canPerformAction, incrementUsage } = useUsageLimits(
        user?.id || null,
        'chat_query'
    );

    const toggleDrawer = () => setIsOpen(!isOpen);

    // Efecto para manejar búsquedas desde el exterior
    useEffect(() => {
        if (query) {
            setInputValue(query);
            setQuery(''); // Limpiar para no repetir
        }
    }, [query, setQuery]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // Verificar límites antes de enviar
        if (!canPerformAction) {
            setShowUpgradeModal(true);
            return;
        }

        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue
        };

        setMessages(prev => [...prev, newMessage]);
        const userQuery = inputValue;
        setInputValue('');

        // Llamada real a la Edge Function
        try {
            setIsTyping(true);

            const { data, error } = await supabase.functions.invoke('chat', {
                body: {
                    query: userQuery,
                    lang: i18n.language,
                    user_id: user?.id
                }
            });

            setIsTyping(false);
            if (error) throw error;

            const fullResponse = data.answer || t('hero.subtitle');
            const assistantMsgId = Date.now().toString();

            // Mensaje vacío inicial para el efecto máquina de escribir
            setMessages(prev => [...prev, {
                id: assistantMsgId,
                role: 'assistant',
                content: ''
            }]);

            // Efecto Máquina de Escribir (Typewriter)
            let currentContent = '';
            const words = fullResponse.split(' ');
            let wordIndex = 0;

            const typingInterval = setInterval(() => {
                if (wordIndex < words.length) {
                    currentContent += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
                    setMessages((prev: Message[]) => prev.map((msg: Message) =>
                        msg.id === assistantMsgId ? { ...msg, content: currentContent } : msg
                    ));
                    wordIndex++;
                } else {
                    clearInterval(typingInterval);
                }
            }, 100); // Ajustado de 60ms a 100ms para una lectura pausada

            // Incrementar contador de uso después de respuesta exitosa
            await incrementUsage();

        } catch (error: any) {
            console.error('Error al contactar con el asistente:', error);

            // Intentar extraer el mensaje de error detallado
            let errorMessage = t('chat.error_fallback'); // Fallback por defecto

            if (error.context?.message) {
                errorMessage = error.context.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setIsTyping(false);
            setMessages((prev: Message[]) => prev.concat({
                id: Date.now().toString(),
                role: 'assistant',
                content: t('chat.error_prefix', { message: errorMessage })
            }));
        }
    };

    return (
        <>
            {/* Botón Flotante para abrir Chat */}
            <button
                onClick={toggleDrawer}
                className={cn(
                    "fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95",
                    isOpen ? "bg-white text-gray-800 rotate-90" : "bg-primary text-white"
                )}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </button>

            {/* Overlay Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleDrawer}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    />
                )}
            </AnimatePresence>

            {/* Drawer Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col border-l border-white/20"
                    >
                        {/* Header del Chat */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <Bot className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg text-gray-900">{t('nav.brand_assistant')}</h3>
                                    <p className="text-xs text-emerald-600 font-medium">{t('chat.status_verified')}</p>
                                </div>
                            </div>
                            <button onClick={toggleDrawer} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Area de Mensajes */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex w-full",
                                        msg.role === 'user' ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div className={cn(
                                        "max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm",
                                        msg.role === 'user'
                                            ? "bg-primary text-white rounded-tr-none"
                                            : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
                                    <div className="bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <form onSubmit={handleSendMessage} className="relative flex items-center">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={t('hero.search_placeholder')}
                                    className="w-full py-4 pl-6 pr-14 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-gray-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="absolute right-2 p-2 bg-primary text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-800 transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                            <p className="text-center text-[10px] text-gray-400 mt-3">
                                {t('chat.disclaimer')}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de Upgrade */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                limitType="chat_query"
            />
        </>
    );
}
