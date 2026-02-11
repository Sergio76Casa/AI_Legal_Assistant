'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send } from 'lucide-react';
import { useChat } from '@/hooks/useChat';

export default function ChatWidget() {
    const [chatOpen, setChatOpen] = useState(false);
    const { messages, sendMessage, loading } = useChat();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleSend = async () => {
        if (!input.trim()) return;
        const msg = input;
        setInput('');
        await sendMessage(msg);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="fixed bottom-8 right-8 z-[100]">
            <AnimatePresence>
                {chatOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-16 right-0 w-[350px] h-[450px] bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 font-bold flex justify-between items-center">
                            <span className="text-white">Asistente HalalLegal</span>
                            <button onClick={() => setChatOpen(false)} className="text-xs opacity-70 hover:opacity-100 text-white">Cerrar</button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            <div className="bg-white/5 p-3 rounded-xl text-sm text-gray-200">Salam Alaikom. Soy tu asesor legal inteligente. ¿En qué puedo ayudarte hoy?</div>
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-200'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/10 p-3 rounded-xl text-sm text-gray-400 animate-pulse">Escribiendo...</div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t border-white/5 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Escribe tu duda..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-purple-500 text-white"
                            />
                            <button onClick={handleSend} disabled={loading} className="bg-purple-600 p-2 rounded-full hover:bg-purple-500 transition-colors">
                                <Send className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setChatOpen(!chatOpen)}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
            >
                <MessageSquare className="w-7 h-7 text-white" />
            </button>
        </div>
    );
}
