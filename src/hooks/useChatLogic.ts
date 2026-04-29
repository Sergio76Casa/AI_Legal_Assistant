import { useState, useEffect, useRef, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { useUsageLimits } from '../lib/useUsageLimits';

export interface Source {
    title: string;
    similarity: number;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: Source[];
}

interface UseChatLogicParams {
    query: string;
    setQuery: (q: string) => void;
}

export const useChatLogic = ({ query, setQuery }: UseChatLogicParams) => {
    const { t, i18n } = useTranslation();
    const [user, setUser] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: t('chat.welcome_msg') }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (query) {
            setInputValue(query);
            setQuery('');
        }
    }, [query, setQuery]);

    const { canPerformAction, incrementUsage } = useUsageLimits(user?.id || null, 'chat_query');

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        if (!canPerformAction) {
            setShowUpgradeModal(true);
            return;
        }

        const newMessage: Message = { id: Date.now().toString(), role: 'user', content: inputValue };

        // Excluye el mensaje de bienvenida (id='1') y limita a últimos 8 (4 intercambios)
        const historyToSend = messages
            .filter(m => m.id !== '1' && m.content.trim())
            .slice(-8)
            .map(m => ({ id: m.id, role: m.role, content: m.content }));

        setMessages(prev => [...prev, newMessage]);
        const userQuery = inputValue;
        setInputValue('');

        try {
            setIsTyping(true);
            const { data, error } = await supabase.functions.invoke('chat', {
                body: { query: userQuery, lang: i18n.language, user_id: user?.id, history: historyToSend }
            });
            setIsTyping(false);
            if (error) throw error;

            const fullResponse = data.answer || t('hero.subtitle');
            const sources: Source[] = data.sources || [];
            const assistantMsgId = Date.now().toString();

            setMessages(prev => [...prev, {
                id: assistantMsgId,
                role: 'assistant',
                content: '',
                sources: sources.filter(s => s.similarity > 0)
            }]);

            if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

            let currentContent = '';
            const words = fullResponse.split(' ');
            let wordIndex = 0;

            typingIntervalRef.current = setInterval(() => {
                if (wordIndex < words.length) {
                    currentContent += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
                    setMessages(prev => prev.map(msg =>
                        msg.id === assistantMsgId ? { ...msg, content: currentContent } : msg
                    ));
                    wordIndex++;
                } else {
                    clearInterval(typingIntervalRef.current!);
                    typingIntervalRef.current = null;
                }
            }, 80);

            await incrementUsage();
        } catch (error: any) {
            console.error('Error al contactar con el asistente:', error);
            let errorMessage = t('chat.error_fallback');
            if (error.context?.message) errorMessage = error.context.message;
            else if (error.message) errorMessage = error.message;
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: t('chat.error_prefix', { message: errorMessage })
            }]);
        }
    };

    return {
        messages,
        inputValue,
        setInputValue,
        isTyping,
        showUpgradeModal,
        setShowUpgradeModal,
        messagesEndRef,
        scrollToBottom,
        handleSendMessage,
    };
};
