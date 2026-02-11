import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useChat() {
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async (content: string, userId?: string) => {
        try {
            setLoading(true);
            const newMessages = [...messages, { role: 'user', content }];
            setMessages(newMessages);

            // 1. Verificar Paywall / Contador (Simplificado)
            // En una implementación real, esto llamaría a una Edge Function

            // 2. Simular respuesta de IA (Integración real con Gemini vía Edge Function)
            // Por ahora simulamos la llamada al endpoint de backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: content, userId }),
            });

            const data = await response.json();
            setMessages([...newMessages, { role: 'assistant', content: data.answer }]);
        } catch (error) {
            console.error("Error in chat:", error);
        } finally {
            setLoading(false);
        }
    };

    return { messages, sendMessage, loading };
}
