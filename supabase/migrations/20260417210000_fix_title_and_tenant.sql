-- Migración: Añadir columna title a knowledge_base y corregir tenant_id de usuarios
-- Fecha: 2026-04-17

-- 1. Añadir columna title a knowledge_base (faltaba según el esquema original)
ALTER TABLE public.knowledge_base
ADD COLUMN IF NOT EXISTS title text;

-- 2. Añadir columna tenant_id a knowledge_base (para aislamiento multi-tenant)
ALTER TABLE public.knowledge_base
ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000000';

-- 3. Corregir usuarios existentes que tienen tenant_id NULL
-- (usuarios creados antes de añadir la columna tenant_id)
UPDATE public.profiles
SET tenant_id = '00000000-0000-0000-0000-000000000000'
WHERE tenant_id IS NULL;

-- 4. Recrear match_documents con las dimensiones correctas (768) y columna title real
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_tenant_id uuid,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id bigint,
  content text,
  title text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.content,
    COALESCE(kb.title, kb.metadata->>'source', 'Documento') as title,
    1 - (kb.embedding <=> query_embedding) as similarity,
    kb.metadata
  FROM knowledge_base kb
  WHERE 
    kb.tenant_id = p_tenant_id
    AND (kb.user_id = p_user_id OR kb.user_id IS NULL)
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
