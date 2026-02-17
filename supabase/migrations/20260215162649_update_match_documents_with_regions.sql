-- Migración: Actualizar match_documents para incluir leyes globales por región
-- Fecha: 2026-02-15
-- Descripción: Modifica la función match_documents para buscar en documentos privados del usuario Y leyes globales de su región

CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id bigint,
  content text,
  title text,
  similarity float
)
LANGUAGE plpgsql
AS $$
DECLARE
  user_country varchar(2);
BEGIN
  -- Obtener el país del usuario desde su perfil
  IF p_user_id IS NOT NULL THEN
    SELECT country INTO user_country 
    FROM profiles 
    WHERE id = p_user_id;
    
    -- Si no tiene país en el perfil, usar ES por defecto
    IF user_country IS NULL THEN
      user_country := 'ES';
    END IF;
  ELSE
    user_country := 'ES';
  END IF;

  -- Buscar en:
  -- 1. Documentos privados del usuario (user_id = p_user_id)
  -- 2. Leyes globales de su región (user_id IS NULL AND country = user_country)
  RETURN QUERY
  SELECT
    kb.id,
    kb.content,
    kb.title,
    1 - (kb.embedding <=> query_embedding) as similarity
  FROM knowledge_base kb
  LEFT JOIN documents d ON kb.metadata->>'source' = d.url
  WHERE 
    (kb.user_id = p_user_id OR (d.user_id IS NULL AND d.country = user_country))
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
