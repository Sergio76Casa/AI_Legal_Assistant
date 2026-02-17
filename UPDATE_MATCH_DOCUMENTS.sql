CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_user_id text DEFAULT NULL,
  p_tenant_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id bigint,
  content text,
  metadata jsonb,
  similarity float,
  title text,
  tenant_id uuid,
  user_id text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.content,
    kb.metadata,
    1 - (kb.embedding <=> query_embedding) as similarity,
    kb.title,
    kb.tenant_id,
    kb.user_id
  FROM knowledge_base kb
  WHERE 1 - (kb.embedding <=> query_embedding) > match_threshold
  AND (
    -- 1. Nivel Privado: Documentos del propio usuario
    (p_user_id IS NOT NULL AND kb.user_id = p_user_id)
    OR
    -- 2. Nivel Organización: Documentos de la empresa (sin usuario asignado)
    (p_tenant_id IS NOT NULL AND kb.tenant_id = p_tenant_id AND kb.user_id IS NULL)
    OR
    -- 3. Nivel Global: Documentos generales (sin tenant ni usuario)
    -- Asumiendo que '00000000-0000-0000-0000-000000000000' o NULL es global
    (kb.tenant_id IS NULL OR kb.tenant_id = '00000000-0000-0000-0000-000000000000') 
     AND kb.user_id IS NULL
  )
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
