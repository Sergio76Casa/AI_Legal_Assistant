import { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { useUsageLimits } from '../lib/useUsageLimits';
import logger from '../lib/logger';

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
    const [isClearing, setIsClearing] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Carga de usuario y sesión
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
        return () => subscription.unsubscribe();
    }, []);

    // Cargar historial persistido desde Supabase cuando se detecta usuario
    const loadChatHistory = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: true })
                .limit(50);

            if (error) {
                logger.error('Error cargando historial de chat:', error);
                return;
            }

            if (data && data.length > 0) {
                const loadedMessages: Message[] = data.map((msg: any) => ({
                    id: msg.id,
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content,
                    sources: msg.sources || []
                }));
                setMessages([
                    { id: '1', role: 'assistant', content: t('chat.welcome_msg') },
                    ...loadedMessages
                ]);
            }
        } catch (err) {
            logger.error('Excepción al recuperar chat history:', err);
        }
    }, [t]);

    useEffect(() => {
        if (user?.id) {
            loadChatHistory(user.id);
        }
    }, [user?.id, loadChatHistory]);

    useEffect(() => {
        if (query) {
            setInputValue(query);
            setQuery('');
        }
    }, [query, setQuery]);

    const { canPerformAction, incrementUsage } = useUsageLimits(user?.id || null, 'chat_query');

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Guardar mensaje en Supabase
    const saveMessageToDB = async (role: 'user' | 'assistant', content: string, sources: Source[] = []) => {
        if (!user?.id) return;
        try {
            const { error } = await supabase
                .from('chat_messages')
                .insert({
                    user_id: user.id,
                    role,
                    content,
                    sources
                });
            if (error) {
                logger.error('Error persistiendo mensaje en DB:', error);
            }
        } catch (err) {
            logger.error('Error en saveMessageToDB:', err);
        }
    };

    // Vaciar historial del usuario
    const handleClearHistory = async () => {
        if (!user?.id || isClearing) return;
        setIsClearing(true);
        try {
            const { error } = await supabase
                .from('chat_messages')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;

            setMessages([
                { id: '1', role: 'assistant', content: t('chat.welcome_msg') }
            ]);
        } catch (err: any) {
            logger.error('Error al limpiar historial:', err);
        } finally {
            setIsClearing(false);
        }
    };

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        if (!canPerformAction) {
            setShowUpgradeModal(true);
            return;
        }

        const userQuery = inputValue.trim();
        const newMessage: Message = { id: Date.now().toString(), role: 'user', content: userQuery };

        // Excluye mensaje inicial '1' y limita historial enviado a Gemini
        const historyToSend = messages
            .filter(m => m.id !== '1' && m.content.trim())
            .slice(-8)
            .map(m => ({ id: m.id, role: m.role, content: m.content }));

        setMessages(prev => [...prev, newMessage]);
        setInputValue('');

        // Persistir mensaje del usuario en DB
        saveMessageToDB('user', userQuery);

        try {
            setIsTyping(true);
            const { data, error } = await supabase.functions.invoke('chat', {
                body: { query: userQuery, lang: i18n.language, user_id: user?.id, history: historyToSend }
            });
            setIsTyping(false);
            if (error) throw error;

            const fullResponse = data.answer || t('hero.subtitle');
            const sources: Source[] = (data.sources || []).filter((s: Source) => s.similarity > 0);
            const assistantMsgId = Date.now().toString();

            setMessages(prev => [...prev, {
                id: assistantMsgId,
                role: 'assistant',
                content: '',
                sources
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

                    // Persistir respuesta final completa de la IA en DB
                    saveMessageToDB('assistant', fullResponse, sources);
                }
            }, 60);

            await incrementUsage();
        } catch (error: any) {
            logger.error('Error al contactar con el asistente:', error);
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
        isClearing,
        showUpgradeModal,
        setShowUpgradeModal,
        messagesEndRef,
        scrollToBottom,
        handleSendMessage,
        handleClearHistory,
    };
};
