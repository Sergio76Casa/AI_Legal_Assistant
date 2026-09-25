import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Bot, MessageSquare, Trash2, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../lib/ChatContext';
import { useTranslation } from 'react-i18next';
import { useChatLogic } from '../hooks/useChatLogic';
import { ChatMessageList } from './Chat/ChatMessageList';
import { ChatInput } from './Chat/ChatInput';
import { UpgradeModal } from './UpgradeModal';

export function ChatDrawer() {
    const { t } = useTranslation();
    const { isOpen, setIsOpen, query, setQuery } = useChat();
    const chat = useChatLogic({ query, setQuery });

    const toggleDrawer = () => setIsOpen(!isOpen);

    useEffect(() => {
        chat.scrollToBottom();
    }, [chat.messages, isOpen]);

    return createPortal(
        <>
            {/* Floating Button (Always visible on bottom right of screen/viewport) */}
            <button
                onClick={toggleDrawer}
                style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
                className={cn(
                    'fixed right-5 sm:right-6 z-[9999] p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center',
                    isOpen
                        ? 'bg-slate-800 text-slate-300 rotate-90 border border-white/10 hidden md:flex'
                        : 'bg-primary text-slate-900 shadow-primary/40 shadow-lg'
                )}
                aria-label="Abrir asistente de IA"
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
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000]"
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
                        className="fixed inset-y-0 right-0 h-screen max-h-screen w-full md:w-[450px] bg-slate-900/95 backdrop-blur-xl shadow-2xl z-[10001] flex flex-col border-l border-white/10 overflow-hidden"
                    >
                        {/* Chat Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/50 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/15 rounded-lg border border-primary/20">
                                    <Bot className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg text-white">{t('nav.brand_assistant')}</h3>
                                    <p className="text-xs text-primary font-medium">{t('chat.status_verified')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {chat.messages.length > 1 && (
                                    <button
                                        onClick={chat.handleClearHistory}
                                        disabled={chat.isClearing}
                                        className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-full transition-colors text-slate-400 disabled:opacity-50"
                                        title="Vaciar historial de chat"
                                    >
                                        {chat.isClearing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                    </button>
                                )}
                                <button
                                    onClick={toggleDrawer}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <ChatMessageList
                            messages={chat.messages}
                            isTyping={chat.isTyping}
                            messagesEndRef={chat.messagesEndRef}
                        />

                        <ChatInput
                            value={chat.inputValue}
                            onChange={chat.setInputValue}
                            onSubmit={chat.handleSendMessage}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <UpgradeModal
                isOpen={chat.showUpgradeModal}
                onClose={() => chat.setShowUpgradeModal(false)}
                limitType="chat_query"
            />
        </>,
        document.body
    );
}
