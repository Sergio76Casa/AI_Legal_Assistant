import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export function useChat() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async (content: string) => {
        try {
            setLoading(true);
            const newMessages = [...messages, { role: 'user', content }];
            setMessages(newMessages);

            // 1. Verificar Paywall / Contador (Simplificado)
            // En una implementación real, esto llamaría a una Edge Function

            // 2. Simular respuesta de IA (Integración real con Gemini vía Edge Function)
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: content,
                    userId: user?.id // Enviar ID de usuario autenticado
                }),
            });

            const data = await response.json();
            setMessages([...newMessages, { role: 'assistant', content: data.answer }]);
        } catch (error) {
            console.error("Error in chat:", error);
            setMessages([...messages, { role: 'user', content }, { role: 'assistant', content: "Lo siento, hubo un error al procesar tu consulta." }]);
        } finally {
            setLoading(false);
        }
    };

    return { messages, sendMessage, loading };
}
