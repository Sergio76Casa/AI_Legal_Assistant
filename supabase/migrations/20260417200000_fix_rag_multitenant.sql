-- Migración: Corregir dimensiones de vectores y añadir aislamiento Multi-tenant
-- Fecha: 2026-04-17
-- Problema: El chat falla (Error 500) por desajuste de dimensiones (768 vs 3072) y falta de p_tenant_id.

-- 1. Limpiar datos antiguos (ya no son compatibles con el nuevo modelo de 3072 dimensiones)
TRUNCATE TABLE knowledge_base;

-- 2a. Eliminar cualquier índice ivfflat existente sobre la columna embedding.
--     ivfflat tiene un límite de 2000 dimensiones; gemini-embedding-001 genera 3072.
--     Postgres auto-nombra los índices anónimos como <tabla>_<columna>_idx.
DROP INDEX IF EXISTS knowledge_base_embedding_idx;

-- 2b. Fallback: eliminar por nombre alternativo que Postgres puede haber asignado
DO $$
DECLARE
    idx TEXT;
BEGIN
    SELECT indexname INTO idx
    FROM pg_indexes
    WHERE tablename = 'knowledge_base'
      AND indexdef ILIKE '%ivfflat%';
    IF idx IS NOT NULL THEN
        EXECUTE 'DROP INDEX IF EXISTS ' || quote_ident(idx);
    END IF;
END $$;

-- 2c. Actualizar dimensiones del vector en la tabla
ALTER TABLE knowledge_base
ALTER COLUMN embedding TYPE vector(3072);

-- 3. Redefinir la función de búsqueda (RAG) con soporte Multi-tenant
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(3072),
  match_threshold float,
  match_count int,
  p_tenant_id uuid, -- Parámetro obligatorio para el Silo de Hierro
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
    kb.title,
    1 - (kb.embedding <=> query_embedding) as similarity,
    kb.metadata
  FROM knowledge_base kb
  WHERE 
    -- Aislamiento estricto por Tenant
    kb.tenant_id = p_tenant_id
    -- Solo documentos específicos del usuario O documentos globales del sistema (user_id null)
    AND (kb.user_id = p_user_id OR kb.user_id IS NULL)
    -- Umbral de similitud
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 4. Re-crear el índice para búsquedas rápidas (HNSW para 3072 dimensiones)
-- Nota: HNSW es mucho mejor que IVFFlat para dimensiones altas como 3072
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding 
ON knowledge_base 
USING hnsw (embedding vector_cosine_ops);
