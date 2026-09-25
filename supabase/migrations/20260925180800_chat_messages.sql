-- ============================================================================
-- Migración: Persistencia del Historial de Chat IA (chat_messages)
-- Descripción: Tabla para almacenar mensajes del chat con aislamiento RLS por usuario y tenant.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para recuperar conversaciones ordenadas rápidamente
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created 
    ON public.chat_messages(user_id, created_at ASC);

-- Habilitar Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad RLS
DROP POLICY IF EXISTS "Users can view own chat messages" ON public.chat_messages;
CREATE POLICY "Users can view own chat messages" 
    ON public.chat_messages FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own chat messages" ON public.chat_messages;
CREATE POLICY "Users can insert own chat messages" 
    ON public.chat_messages FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own chat messages" ON public.chat_messages;
CREATE POLICY "Users can delete own chat messages" 
    ON public.chat_messages FOR DELETE 
    USING (auth.uid() = user_id);
