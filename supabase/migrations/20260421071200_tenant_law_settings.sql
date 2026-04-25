-- Migración: Visibilidad de Fragmentos + Control de Leyes por Tenant
-- Objetivo: Añadir toggles granulares de leyes globales y actualizar búsqueda RAG

-- 1. Tabla para controlar qué leyes globales están activadas por tenant
CREATE TABLE IF NOT EXISTS public.tenant_law_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid NOT NULL,
    document_id text NOT NULL,   -- URL/path o identificador del documento
    is_enabled boolean NOT NULL DEFAULT true,
    updated_at timestamptz DEFAULT now(),
    UNIQUE (tenant_id, document_id)
);

-- RLS: Solo el admin del tenant o superadmin pueden gestionar sus ajustes
ALTER TABLE public.tenant_law_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant admin manages own law settings" ON public.tenant_law_settings;
CREATE POLICY "Tenant admin manages own law settings"
    ON public.tenant_law_settings FOR ALL
    USING (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
        OR
        (SELECT role FROM auth.users WHERE id = auth.uid()) = 'service_role'
    );

-- 2. Función `match_documents` actualizada
DROP FUNCTION IF EXISTS match_documents(vector, float, int, uuid, uuid);
DROP FUNCTION IF EXISTS match_documents(vector(768), float, int, uuid, uuid);
DROP FUNCTION IF EXISTS match_documents(vector(3072), float, int, uuid, uuid);
DROP FUNCTION IF EXISTS match_documents;

CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(3072),
    match_threshold float,
    match_count int,
    p_user_id uuid DEFAULT NULL,
    p_tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'
) RETURNS TABLE (id bigint, content text, title text, similarity float, metadata jsonb)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT kb.id, kb.content,
        COALESCE(kb.title, kb.metadata->>'source', 'Documento') as title,
        1 - (kb.embedding <=> query_embedding) as similarity,
        kb.metadata
    FROM knowledge_base kb
    WHERE 
        1 - (kb.embedding <=> query_embedding) > match_threshold
        AND (
            -- Capa 1: Documentos globales del superadmin
            (
                kb.tenant_id = '00000000-0000-0000-0000-000000000000'
                -- Excluir las desactivadas a nivel global (por el superadmin)
                AND NOT EXISTS (
                    SELECT 1 FROM tenant_law_settings tls_global
                    WHERE tls_global.tenant_id = '00000000-0000-0000-0000-000000000000'
                    AND tls_global.document_id = kb.metadata->>'source'
                    AND tls_global.is_enabled = false
                )
                -- Excluir las desactivadas por este tenant particular
                AND NOT EXISTS (
                    SELECT 1 FROM tenant_law_settings tls_tenant
                    WHERE tls_tenant.tenant_id = p_tenant_id
                    AND tls_tenant.document_id = kb.metadata->>'source'
                    AND tls_tenant.is_enabled = false
                )
            )
            OR
            -- Capa 2: Documentos propios del tenant
            (
                kb.tenant_id = p_tenant_id
                AND (kb.user_id = p_user_id OR kb.user_id IS NULL)
            )
        )
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;
