-- Migración: Versión canónica final de match_documents
-- Fecha: 2026-04-22
-- Corre después de 20260421071200_tenant_law_settings.sql para garantizar
-- que la definición final incluye: documentos globales, documentos del tenant,
-- y respeta los toggles de tenant_law_settings.

DROP FUNCTION IF EXISTS match_documents(vector, float, int, uuid, uuid);
DROP FUNCTION IF EXISTS match_documents(vector(3072), float, int, uuid, uuid);
DROP FUNCTION IF EXISTS match_documents;

CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(3072),
    match_threshold float,
    match_count int,
    p_user_id uuid DEFAULT NULL,
    p_tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'
)
RETURNS TABLE (id bigint, content text, title text, similarity float, metadata jsonb)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT kb.id, kb.content,
        COALESCE(kb.title, kb.metadata->>'source', 'Documento') AS title,
        1 - (kb.embedding <=> query_embedding) AS similarity,
        kb.metadata
    FROM knowledge_base kb
    WHERE
        1 - (kb.embedding <=> query_embedding) > match_threshold
        AND (
            -- Capa 1: Documentos globales del superadmin, respetando toggles
            (
                kb.tenant_id = '00000000-0000-0000-0000-000000000000'
                AND NOT EXISTS (
                    SELECT 1 FROM tenant_law_settings tls
                    WHERE tls.tenant_id = '00000000-0000-0000-0000-000000000000'
                      AND tls.document_id = kb.metadata->>'source'
                      AND tls.is_enabled = false
                )
                AND NOT EXISTS (
                    SELECT 1 FROM tenant_law_settings tls
                    WHERE tls.tenant_id = p_tenant_id
                      AND tls.document_id = kb.metadata->>'source'
                      AND tls.is_enabled = false
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
