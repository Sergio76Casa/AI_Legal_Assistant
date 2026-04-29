import { useEffect } from 'react';
import { X, Bot, MessageSquare } from 'lucide-react';
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

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={toggleDrawer}
                className={cn(
                    'fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95',
                    isOpen
                        ? 'bg-slate-800 text-slate-300 rotate-90 border border-white/10'
                        : 'bg-primary text-slate-900 shadow-primary/30'
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
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
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
                        className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-slate-900/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col border-l border-white/10"
                    >
                        {/* Chat Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/15 rounded-lg border border-primary/20">
                                    <Bot className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg text-white">{t('nav.brand_assistant')}</h3>
                                    <p className="text-xs text-primary font-medium">{t('chat.status_verified')}</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleDrawer}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
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
        </>
    );
}
